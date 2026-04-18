import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
  hashPassword,
  comparePassword,
  generateSessionToken,
  createSession,
  destroySession,
  getSession,
  getAuthUser,
  requireAuth,
  logAudit,
  getClientIp,
  getCookieName,
  getSessionCookieOptions,
  AuthError,
} from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  name: z.string().min(1, 'Nama wajib diisi'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

// POST /api/admin/auth/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action as string | undefined;

    if (action === 'register') {
      // Register new user
      const data = registerSchema.parse(body);
      const existing = await db.user.findUnique({ where: { email: data.email } });
      if (existing) {
        return NextResponse.json(
          { error: 'Email sudah terdaftar' },
          { status: 409 },
        );
      }

      const hashedPassword = await hashPassword(data.password);
      const user = await db.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashedPassword,
          role: 'viewer',
        },
      });

      return NextResponse.json({
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        message: 'Registrasi berhasil',
      }, { status: 201 });
    }

    // Login
    const data = loginSchema.parse(body);
    const user = await db.user.findUnique({ where: { email: data.email } });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 },
      );
    }

    const isValid = await comparePassword(data.password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 },
      );
    }

    const token = generateSessionToken();
    createSession(token, user.id, user.email, user.role);

    await logAudit(user.id, 'login', 'user', user.id, null, getClientIp(request));

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
    });

    response.cookies.set(getCookieName(), token, getSessionCookieOptions());
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: error.errors },
        { status: 400 },
      );
    }
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// GET /api/admin/auth/me
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// DELETE /api/admin/auth/logout
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await request.cookies;
    const token = cookieStore.get(getCookieName())?.value;

    if (token) {
      const session = getSession(token);
      if (session) {
        await logAudit(session.userId, 'logout', 'user', session.userId, null, getClientIp(request));
      }
      destroySession(token);
    }

    const response = NextResponse.json({ message: 'Berhasil logout' });
    response.cookies.set(getCookieName(), '', { ...getSessionCookieOptions(), maxAge: 0 });
    return response;
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
