import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

const SESSION_COOKIE_NAME = 'knbmp_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// In-memory session store (simple approach for SQLite)
const sessions = new Map<string, { userId: string; email: string; role: string; expiresAt: number }>();

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateSessionToken(): string {
  return uuidv4();
}

export function createSession(token: string, userId: string, email: string, role: string) {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  sessions.set(token, { userId, email, role, expiresAt });

  // Cleanup expired sessions periodically
  cleanupExpiredSessions();
}

export function getSession(token: string): { userId: string; email: string; role: string } | null {
  const session = sessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }

  return {
    userId: session.userId,
    email: session.email,
    role: session.role,
  };
}

export function destroySession(token: string) {
  sessions.delete(token);
}

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(token);
    }
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE,
  };
}

export function getCookieName() {
  return SESSION_COOKIE_NAME;
}

export async function getAuthUser(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = getSession(token);
  if (!session) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
    },
  });

  return user;
}

export function requireAuth(user: { id: string; email: string; role: string } | null) {
  if (!user) {
    throw new AuthError('Authentication required', 401);
  }
  if (!['super_admin', 'editor'].includes(user.role)) {
    throw new AuthError('Insufficient permissions', 403);
  }
  return user;
}

export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AuthError';
  }
}

export async function logAudit(
  userId: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  details: string | null,
  ipAddress: string | null,
) {
  try {
    await db.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details,
        ipAddress,
      },
    });
  } catch {
    // Audit logging should not break the main flow
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return '127.0.0.1';
}
