import {NextRequest, NextResponse} from "next/server";
import {
  generateState,
  getYandexAuthorizationURL,
  setOAuthStateCookie,
  type OAuthMode,
} from "@/lib/oauth";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const mode = (req.nextUrl.searchParams.get("mode") || "login") as OAuthMode;
  if (mode !== "login" && mode !== "link") {
    return NextResponse.json({error: "Invalid mode"}, {status: 400});
  }

  const state = generateState();
  const url = getYandexAuthorizationURL(state);
  const response = NextResponse.redirect(url);
  await setOAuthStateCookie(response, {state, mode});

  return response;
}
