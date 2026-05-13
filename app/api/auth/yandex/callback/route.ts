import { NextRequest, NextResponse } from "next/server";
import {
  getOAuthStateCookie,
  clearOAuthStateCookie,
  exchangeYandexCode,
  getYandexUserInfo,
  extractReturnUrl,
  getSiteUrl,
} from "@/lib/oauth";
import { createToken, verifyToken, AUTH_COOKIE_OPTIONS } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import type { JWTPayload } from "@/lib/types";

type OAuthProvider = {
  provider: string;
  providerUserId: string;
  phone?: string;
  login?: string;
  gender?: "male" | "female";
  linkedAt: string;
};

function findProvider(providers: OAuthProvider[], provider: string, providerUserId: string) {
  return providers.find(p => p.provider === provider && p.providerUserId === providerUserId);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");

    if (!code || !state) {
      return NextResponse.redirect(new URL("/applicant", getSiteUrl()));
    }

    const { returnUrl: embeddedReturnUrl } = extractReturnUrl(state);
    const oauthState = await getOAuthStateCookie(req);
    if (!oauthState || oauthState.state !== state) {
      return NextResponse.redirect(new URL(embeddedReturnUrl ?? "/applicant", getSiteUrl()));
    }

    const tokens = await exchangeYandexCode(code);
    const yandexUser = await getYandexUserInfo(tokens.access_token);
    const providerUserId = String(yandexUser.id);

    if (oauthState.mode === "link") {
      const authToken = req.cookies.get("auth-token")?.value;
      const payload = authToken ? await verifyToken(authToken) : null;
      if (!payload) {
        return NextResponse.redirect(new URL("/applicant", getSiteUrl()));
      }

      const allUsers = await prisma.user.findMany({ select: { id: true, oauthProviders: true } });
      const existing = allUsers.find(u =>
        findProvider(u.oauthProviders as OAuthProvider[], "yandex", providerUserId),
      );

      if (existing && existing.id !== payload.userId) {
        const response = NextResponse.redirect(new URL("/profile?error=yandex_already_linked", getSiteUrl()));
        clearOAuthStateCookie(response);
        return response;
      }

      if (!existing) {
        const user = await prisma.user.findUnique({ where: { id: payload.userId } });
        if (user) {
          const providers = (user.oauthProviders as OAuthProvider[]) ?? [];
          providers.push({
            provider: "yandex",
            providerUserId,
            phone: yandexUser.phone,
            login: yandexUser.login,
            gender: yandexUser.gender,
            linkedAt: new Date().toISOString(),
          });
          await prisma.user.update({
            where: { id: payload.userId },
            data: {
              oauthProviders: providers,
              ...(yandexUser.avatar ? { avatar: yandexUser.avatar } : {}),
            },
          });
        }
      }

      const newToken = await createToken({
        userId: payload.userId,
        name: payload.name,
        hasPhone: payload.hasPhone || !!yandexUser.phone,
      } satisfies JWTPayload);

      const response = NextResponse.redirect(new URL("/profile", getSiteUrl()));
      response.cookies.set("auth-token", newToken, AUTH_COOKIE_OPTIONS);
      clearOAuthStateCookie(response);
      return response;
    }

    const allUsers = await prisma.user.findMany({ select: { id: true, name: true, oauthProviders: true } });
    const existingUser = allUsers.find(u =>
      findProvider(u.oauthProviders as OAuthProvider[], "yandex", providerUserId),
    );

    const loginRedirect = embeddedReturnUrl ?? oauthState.returnUrl ?? "/applicant";

    if (existingUser) {
      const providers = (existingUser.oauthProviders as OAuthProvider[]) ?? [];
      const updatedProviders = providers.map(p =>
        p.provider === "yandex" && p.providerUserId === providerUserId
          ? { ...p, phone: yandexUser.phone, login: yandexUser.login, gender: yandexUser.gender }
          : p,
      );

      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          oauthProviders: updatedProviders,
          ...(yandexUser.avatar ? { avatar: yandexUser.avatar } : {}),
        },
      });

      const token = await createToken({
        userId: existingUser.id,
        name: existingUser.name,
        hasPhone: updatedProviders.some(p => !!p.phone),
      } satisfies JWTPayload);

      const response = NextResponse.redirect(new URL(loginRedirect, getSiteUrl()));
      response.cookies.set("auth-token", token, AUTH_COOKIE_OPTIONS);
      clearOAuthStateCookie(response);
      return response;
    }

    const name = [yandexUser.firstName, yandexUser.lastName].filter(Boolean).join(" ") || "Пользователь";
    const newUser = await prisma.user.create({
      data: {
        name,
        coins: 0,
        ...(yandexUser.avatar ? { avatar: yandexUser.avatar } : {}),
        oauthProviders: [{
          provider: "yandex",
          providerUserId,
          phone: yandexUser.phone,
          login: yandexUser.login,
          gender: yandexUser.gender,
          linkedAt: new Date().toISOString(),
        }],
      },
    });

    const token = await createToken({
      userId: newUser.id,
      name,
      hasPhone: !!yandexUser.phone,
    } satisfies JWTPayload);

    const response = NextResponse.redirect(new URL(loginRedirect, getSiteUrl()));
    response.cookies.set("auth-token", token, AUTH_COOKIE_OPTIONS);
    clearOAuthStateCookie(response);
    return response;
  } catch (error) {
    console.error("Yandex callback error:", error);
    return NextResponse.redirect(new URL("/applicant", getSiteUrl()));
  }
}
