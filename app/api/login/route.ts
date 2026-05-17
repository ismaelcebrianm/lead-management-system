import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { password } = await request.json()
  const secret = process.env.CRM_SECRET

  if (!secret || password !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('crm-auth', secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return response
}
