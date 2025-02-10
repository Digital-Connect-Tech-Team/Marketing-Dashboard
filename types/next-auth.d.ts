import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: User;
  }
  interface User extends DefaultUser {
    id: number;
    username?: string;
    role: Role;
    domain: Domain;
  }

  interface Role {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  }

  interface Domain {
    id: number;
    name: string;
    logo: string;
  }

  interface JWT {
    id: number;
    email: string;
    username?: string;
    role: Role;
    domain: Domain;
  }

  interface CredentialsInputs {
    email: string;
    password: string;
  }
}
