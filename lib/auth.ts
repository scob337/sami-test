import bcrypt from 'bcryptjs';
import { signJWT, getSession } from './jwt';
import { cookies } from 'next/headers';
import { findUserById } from '@/lib/db/auth-repository';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashed: string) {
  return bcrypt.compare(password, hashed);
}

export async function setAuthCookie(user: any) {
  const token = await signJWT({
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
  });

  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });

  return token;
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}

export async function getAuthenticatedUser() {
  const session = await getSession();
  if (!session || !session.id) return null;

  const user = await findUserById(Number(session.id));
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    isAdmin: user.isAdmin,
  };
}
