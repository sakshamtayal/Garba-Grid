// next-auth.d.ts — augment built-in NextAuth session types
import type { DefaultSession, DefaultJWT } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      isAdmin: boolean;
      profilePicture?: string;
      college: string;
      gender: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    username: string;
    isAdmin: boolean;
    profilePicture?: string;
    college: string;
    gender: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    username: string;
    isAdmin: boolean;
    profilePicture?: string;
    college: string;
    gender: string;
  }
}
