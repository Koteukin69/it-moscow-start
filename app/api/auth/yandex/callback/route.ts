import {NextRequest, NextResponse} from "next/server";
import {
  getOAuthStateCookie,
  clearOAuthStateCookie,
  exchangeYandexCode,
  getYandexUserInfo,
} from "@/lib/oauth";
import {createToken, verifyToken, AUTH_COOKIE_OPTIONS} from "@/lib/auth";
import {usersCollection} from "@/lib/db/collections";
import {ObjectId} from "mongodb";
import type {JWTPayload} from "@/lib/types";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");

    if (!code || !state) {
      return NextResponse.redirect(new URL("/applicant", req.url));
    }

    const oauthState = await getOAuthStateCookie(req);
    if (!oauthState || oauthState.state !== state) {
      return NextResponse.redirect(new URL("/applicant", req.url));
    }

    const tokens = await exchangeYandexCode(code);
    const yandexUser = await getYandexUserInfo(tokens.access_token);
    const providerUserId = String(yandexUser.id);
    const collection = await usersCollection;

    if (oauthState.mode === "link") {
      const authToken = req.cookies.get("auth-token")?.value;
      const payload = authToken ? await verifyToken(authToken) : null;
      if (!payload) {
        return NextResponse.redirect(new URL("/applicant", req.url));
      }

      const existing = await collection.findOne({
        "oauthProviders.provider": "yandex",
        "oauthProviders.providerUserId": providerUserId,
      });

      if (existing && existing._id.toString() !== payload.userId) {
        const response = NextResponse.redirect(new URL("/profile?error=yandex_already_linked", req.url));
        clearOAuthStateCookie(response);
        return response;
      }

      if (!existing) {
        await collection.updateOne(
          {_id: new ObjectId(payload.userId)},
          {
            $push: {
              oauthProviders: {
                provider: "yandex" as const,
                providerUserId,
                phone: yandexUser.phone,
                linkedAt: new Date(),
              },
            },
          },
        );
      }

      const newToken = await createToken({
        userId: payload.userId,
        name: payload.name,
        hasPhone: payload.hasPhone || !!yandexUser.phone,
      } satisfies JWTPayload);

      const response = NextResponse.redirect(new URL("/profile", req.url));
      response.cookies.set("auth-token", newToken, AUTH_COOKIE_OPTIONS);
      clearOAuthStateCookie(response);
      return response;
    }

    const existingUser = await collection.findOne({
      "oauthProviders.provider": "yandex",
      "oauthProviders.providerUserId": providerUserId,
    });

    if (existingUser) {
      const token = await createToken({
        userId: existingUser._id.toString(),
        name: existingUser.name,
        hasPhone: existingUser.oauthProviders?.some((p: {phone?: string}) => !!p.phone) ?? false,
      } satisfies JWTPayload);

      const response = NextResponse.redirect(new URL("/applicant", req.url));
      response.cookies.set("auth-token", token, AUTH_COOKIE_OPTIONS);
      clearOAuthStateCookie(response);
      return response;
    }

    const name = [yandexUser.firstName, yandexUser.lastName].filter(Boolean).join(" ") || "Пользователь";
    const insertResult = await collection.insertOne({
      name,
      coins: 0,
      oauthProviders: [
        {
          provider: "yandex" as const,
          providerUserId,
          phone: yandexUser.phone,
          linkedAt: new Date(),
        },
      ],
    });

    const token = await createToken({
      userId: insertResult.insertedId.toString(),
      name,
      hasPhone: !!yandexUser.phone,
    } satisfies JWTPayload);

    const response = NextResponse.redirect(new URL("/applicant", req.url));
    response.cookies.set("auth-token", token, AUTH_COOKIE_OPTIONS);
    clearOAuthStateCookie(response);
    return response;
  } catch (error) {
    console.error("Yandex callback error:", error);
    return NextResponse.redirect(new URL("/applicant", req.url));
  }
}
