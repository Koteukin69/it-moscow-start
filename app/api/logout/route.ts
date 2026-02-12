import {NextResponse} from "next/server";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json(
    {success: true},
    {status: 200}
  );

  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  });

  return response;
}
