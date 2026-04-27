import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';
import { checkPermission } from './permission';
import { unauthorized, forbidden } from './api-response';

export async function getUserId(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('x-token') || req.cookies.get('token')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.userId || null;
}

export async function withAuth(
  req: NextRequest,
  handler: (userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  return handler(userId);
}

export async function withPermission(
  req: NextRequest,
  permissionCode: string,
  handler: (userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();

  const hasPermission = await checkPermission(userId, permissionCode);
  if (!hasPermission) return forbidden();

  return handler(userId);
}
