import { NextRequest, NextResponse } from 'next/server';
import {
  getUserByCredentials,
  getOrCreateUser,
  recordActivityLog,
} from '../../../src/db/repository.ts';
import { adminAuth } from '../../../src/lib/firebase-admin.ts';

const loginAttempts = new Map<string, { count: number; lockUntil: number }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, identifier, password, idToken } = body;

    if (mode === 'firebase_google') {
      if (!idToken) {
        return NextResponse.json({ error: 'Token Google tidak ditemukan.' }, { status: 400 });
      }
      const decoded = await adminAuth.verifyIdToken(idToken);
      const user = await getOrCreateUser(
        decoded.uid,
        decoded.email || `${decoded.uid}@student.ac.id`,
        decoded.name
      );

      await recordActivityLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'LOGIN_GOOGLE_SSO',
        module: 'Autentikasi',
        description: `Login berhasil menggunakan Google OAuth (${user.email}).`,
      });

      return NextResponse.json({
        user,
        token: idToken,
      });
    }

    // Standard credential or demo account login with throttle protection
    const key = (identifier || 'unknown').toLowerCase();
    const now = Date.now();
    const throttle = loginAttempts.get(key);
    if (throttle && throttle.lockUntil > now) {
      const waitSec = Math.ceil((throttle.lockUntil - now) / 1000);
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan login gagal. Silakan tunggu ${waitSec} detik (Throttle Protection aktif).`,
        },
        { status: 429 }
      );
    }

    const user = await getUserByCredentials(identifier || '');
    if (!user || !user.isActive || user.deletedAt) {
      const prev = loginAttempts.get(key)?.count || 0;
      const nextCount = prev + 1;
      loginAttempts.set(key, {
        count: nextCount,
        lockUntil: nextCount >= 5 ? now + 30_000 : 0,
      });
      return NextResponse.json(
        { error: 'Kredensial tidak valid atau akun telah dinonaktifkan.' },
        { status: 401 }
      );
    }

    // Verify password for manual login (accepts 'password123', 'inventra2026', or demo quick switch)
    if (mode === 'credentials' && password !== 'password123' && password !== 'inventra2026' && password !== 'demo') {
      const prev = loginAttempts.get(key)?.count || 0;
      const nextCount = prev + 1;
      loginAttempts.set(key, {
        count: nextCount,
        lockUntil: nextCount >= 5 ? now + 30_000 : 0,
      });
      return NextResponse.json(
        { error: 'Kata sandi salah. Gunakan "password123" untuk akun demo.' },
        { status: 401 }
      );
    }

    loginAttempts.delete(key);

    await recordActivityLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN_SESSION',
      module: 'Autentikasi',
      description: `Pengguna ${user.name} (${user.role.toUpperCase()}) masuk ke sesi aplikasi.`,
    });

    return NextResponse.json({
      user,
      token: `demo:${user.uid}`,
    });
  } catch (error: unknown) {
    console.error('Authentication route error:', error);
    const message = error instanceof Error ? error.message : 'Gagal memproses autentikasi.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
