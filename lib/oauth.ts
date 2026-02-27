import {NextRequest, NextResponse} from "next/server";
import {EncryptJWT, jwtDecrypt} from "jose";
import {createHash} from "crypto";

const OAUTH_SECRET = createHash("sha256")
  .update(process.env.JWT_SECRET || "dev-secret-key-for-local-development-only")
  .digest();

function getSiteUrl(): string {
  return (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

function getVKConfig() {
  return {
    clientId: process.env.VK_CLIENT_ID!,
    clientSecret: process.env.VK_CLIENT_SECRET!,
    redirectUri: `${getSiteUrl()}/api/auth/vk/callback`,
  };
}

function getYandexConfig() {
  return {
    clientId: process.env.YANDEX_CLIENT_ID!,
    clientSecret: process.env.YANDEX_CLIENT_SECRET!,
    redirectUri: `${getSiteUrl()}/api/auth/yandex/callback`,
  };
}

export type OAuthMode = "login" | "link";

interface OAuthState {
  state: string;
  mode: OAuthMode;
  codeVerifier?: string;
}

function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

function base64url(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(plain));
}

export function generatePKCE(): { codeVerifier: string; codeChallenge: Promise<string> } {
  const codeVerifier = randomHex(32);
  const codeChallenge = sha256(codeVerifier).then(base64url);
  return {codeVerifier, codeChallenge};
}

export async function setOAuthStateCookie(
  response: NextResponse,
  params: OAuthState,
): Promise<void> {
  const jwt = await new EncryptJWT({...params})
    .setProtectedHeader({alg: "dir", enc: "A256GCM"})
    .setIssuedAt()
    .setExpirationTime("10m")
    .encrypt(OAUTH_SECRET);

  response.cookies.set("oauth-state", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
}

export async function getOAuthStateCookie(
  request: NextRequest,
): Promise<OAuthState | null> {
  const cookie = request.cookies.get("oauth-state")?.value;
  if (!cookie) return null;
  try {
    const {payload} = await jwtDecrypt(cookie, OAUTH_SECRET);
    return payload as unknown as OAuthState;
  } catch {
    return null;
  }
}

export function clearOAuthStateCookie(response: NextResponse): void {
  response.cookies.set("oauth-state", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export function getVKAuthorizationURL(state: string, codeChallenge: string): string {
  const { clientId, redirectUri } = getVKConfig();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    scope: "vkid.personal_info phone",
  });
  return `https://id.vk.com/authorize?${params}`;
}

export async function exchangeVKCode(
  code: string,
  codeVerifier: string,
  deviceId: string,
): Promise<{access_token: string; user_id: number}> {
  const { clientId, clientSecret, redirectUri } = getVKConfig();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
    code_verifier: codeVerifier,
    device_id: deviceId,
  });

  const res = await fetch("https://id.vk.com/oauth2/auth", {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body,
  });

  const data = await res.json();
  if (data.error) throw new Error(`VK token error: ${data.error_description || data.error}`);
  return {access_token: data.access_token, user_id: data.user_id};
}

export async function getVKUserInfo(accessToken: string): Promise<{
  id: number;
  firstName: string;
  lastName: string;
  phone?: string;
}> {
  const { clientId } = getVKConfig();
  const body = new URLSearchParams({
    access_token: accessToken,
    client_id: clientId,
  });

  const res = await fetch("https://id.vk.com/oauth2/user_info", {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body,
  });

  const data = await res.json();
  if (data.error) throw new Error(`VK user_info error: ${data.error}`);

  return {
    id: data.user.user_id,
    firstName: data.user.first_name || "",
    lastName: data.user.last_name || "",
    phone: data.user.phone || undefined,
  };
}

export function getYandexAuthorizationURL(state: string): string {
  const { clientId, redirectUri } = getYandexConfig();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    force_confirm: "yes",
  });
  return `https://oauth.yandex.ru/authorize?${params}`;
}

export async function exchangeYandexCode(code: string): Promise<{access_token: string}> {
  const { clientId, clientSecret } = getYandexConfig();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch("https://oauth.yandex.ru/token", {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body,
  });

  const data = await res.json();
  if (data.error) throw new Error(`Yandex token error: ${data.error_description || data.error}`);
  return {access_token: data.access_token};
}

export async function getYandexUserInfo(accessToken: string): Promise<{
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
}> {
  const res = await fetch("https://login.yandex.ru/info?format=json", {
    headers: {Authorization: `OAuth ${accessToken}`},
  });

  const data = await res.json();
  if (data.error) throw new Error(`Yandex user_info error: ${data.error}`);

  return {
    id: data.id,
    firstName: data.first_name || "",
    lastName: data.last_name || "",
    phone: data.default_phone?.number || undefined,
  };
}

export function generateState(): string {
  return randomHex(16);
}
