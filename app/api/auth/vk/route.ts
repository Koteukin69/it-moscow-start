import {NextRequest, NextResponse} from "next/server";
import {
  generateState,
  generatePKCE,
  getVKAuthorizationURL,
  setOAuthStateCookie,
  type OAuthMode,
} from "@/lib/oauth";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const mode = (req.nextUrl.searchParams.get("mode") || "login") as OAuthMode;
  if (mode !== "login" && mode !== "link") {
    return NextResponse.json({error: "Invalid mode"}, {status: 400});
  }

  const state = generateState();
  const {codeVerifier, codeChallenge} = generatePKCE();
  const challenge = await codeChallenge;

  const url = getVKAuthorizationURL(state, challenge);
  const response = NextResponse.redirect(url);
  await setOAuthStateCookie(response, {state, mode, codeVerifier});

  return response;
}
