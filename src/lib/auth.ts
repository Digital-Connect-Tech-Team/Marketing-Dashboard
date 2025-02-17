import NextAuth from 'next-auth';
import authConfig from './auth.config';
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}
export const { auth, handlers, signOut, signIn } = NextAuth(authConfig);
