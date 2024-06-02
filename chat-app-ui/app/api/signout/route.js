import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function GET() {
  const cookie = serialize('x-access-token', '', {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    expires: new Date(0),
  });

  const response = NextResponse.json({ message: 'Signout successful' });
  response.headers.set('Set-Cookie', cookie);

  return response;
}