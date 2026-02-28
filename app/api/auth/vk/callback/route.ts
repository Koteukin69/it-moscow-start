import {NextRequest, NextResponse} from "next/server";
import {
  getOAuthStateCookie,
  clearOAuthStateCookie,
  exchangeVKCode,
  getVKUserInfo,
} from "@/lib/oauth";
import {createToken, verifyToken, AUTH_COOKIE_OPTIONS} from "@/lib/auth";
import {usersCollection} from "@/lib/db/collections";
import {ObjectId} from "mongodb";
import type {JWTPayload} from "@/lib/types";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const deviceId = req.nextUrl.searchParams.get("device_id") || "unknown";

    if (!code || !state) {
      return NextResponse.redirect(new URL("/applicant", req.url));
    }

    const oauthState = await getOAuthStateCookie(req);
    if (!oauthState || oauthState.state !== state || !oauthState.codeVerifier) {
      return NextResponse.redirect(new URL("/applicant", req.url));
    }

    const tokens = await exchangeVKCode(code, oauthState.codeVerifier, deviceId);
    const vkUser = await getVKUserInfo(tokens.access_token);
    const providerUserId = String(vkUser.id);
    const collection = await usersCollection;

    if (oauthState.mode === "link") {
      const authToken = req.cookies.get("auth-token")?.value;
      const payload = authToken ? await verifyToken(authToken) : null;
      if (!payload) {
        return NextResponse.redirect(new URL("/applicant", req.url));
      }

      const existing = await collection.findOne({
        "oauthProviders.provider": "vk",
        "oauthProviders.providerUserId": providerUserId,
      });

      if (existing && existing._id.toString() !== payload.userId) {
        const response = NextResponse.redirect(new URL("/profile?error=vk_already_linked", req.url));
        clearOAuthStateCookie(response);
        return response;
      }

      if (!existing) {
        await collection.updateOne(
          {_id: new ObjectId(payload.userId)},
          {
            $push: {
              oauthProviders: {
                provider: "vk" as const,
                providerUserId,
                phone: vkUser.phone,
                linkedAt: new Date(),
              },
            },
          },
        );
      }

      const newToken = await createToken({
        userId: payload.userId,
        name: payload.name,
        hasPhone: payload.hasPhone || !!vkUser.phone,
      } satisfies JWTPayload);

      const response = NextResponse.redirect(new URL("/profile", req.url));
      response.cookies.set("auth-token", newToken, AUTH_COOKIE_OPTIONS);
      clearOAuthStateCookie(response);
      return response;
    }

    const existingUser = await collection.findOne({
      "oauthProviders.provider": "vk",
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

    const name = [vkUser.firstName, vkUser.lastName].filter(Boolean).join(" ") || "Пользователь";
    const insertResult = await collection.insertOne({
      name,
      coins: 0,
      oauthProviders: [
        {
          provider: "vk" as const,
          providerUserId,
          phone: vkUser.phone,
          linkedAt: new Date(),
        },
      ],
    });

    const token = await createToken({
      userId: insertResult.insertedId.toString(),
      name,
      hasPhone: !!vkUser.phone,
    } satisfies JWTPayload);

    const response = NextResponse.redirect(new URL("/applicant", req.url));
    response.cookies.set("auth-token", token, AUTH_COOKIE_OPTIONS);
    clearOAuthStateCookie(response);
    return response;
  } catch (error) {
    console.error("VK callback error:", error);
    return NextResponse.redirect(new URL("/applicant", req.url));
  }
}
