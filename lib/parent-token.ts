import {SignJWT, jwtVerify} from 'jose';

export const PARENT_TOKEN_COOKIE = 'parent-token';
export const PARENT_TOKEN_MAX_AGE = 60 * 60 * 24; // 24 hours

const jwtSecret = process.env.JWT_SECRET;
const isProd = process.env.NODE_ENV === 'production';

const SECRET_KEY = new TextEncoder().encode(
  jwtSecret || 'dev-secret-key-for-local-development-only'
);

export interface ParentTokenPayload {
  sessionId: string;
  type: 'parent';
}

export const PARENT_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  maxAge: PARENT_TOKEN_MAX_AGE,
};

export async function createParentToken(sessionId: string): Promise<string> {
  return await new SignJWT({sessionId, type: 'parent'})
    .setProtectedHeader({alg: 'HS256'})
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);
}

export async function verifyParentToken(token: string): Promise<ParentTokenPayload | null> {
  try {
    const {payload} = await jwtVerify(token, SECRET_KEY);
    if (payload.type !== 'parent' || typeof payload.sessionId !== 'string') return null;
    return {sessionId: payload.sessionId, type: 'parent'};
  } catch {
    return null;
  }
}
