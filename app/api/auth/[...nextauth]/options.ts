import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { IUserDocument } from '@/types';

// ─── Auth Options ─────────────────────────────────────────────────────────────

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Username and password are required');
        }

        await connectDB();

        const user = (await User.findOne({
          username: credentials.username.toLowerCase().trim(),
        }).select('+password')) as (IUserDocument & { password: string }) | null;

        if (!user) {
          throw new Error('Invalid username or password');
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isValidPassword) {
          throw new Error('Invalid username or password');
        }

        return {
          id: user._id.toString(),
          username: user.username,
          name: user.name,
          email: `${user.username}@garbagrid.app`,
          image: user.profilePicture || undefined,
          isAdmin: user.isAdmin,
          profilePicture: user.profilePicture || undefined,
          college: user.college,
          gender: user.gender,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.isAdmin = user.isAdmin;
        token.profilePicture = user.profilePicture;
        token.college = user.college;
        token.gender = user.gender;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.isAdmin = token.isAdmin;
        session.user.profilePicture = token.profilePicture;
        session.user.college = token.college;
        session.user.gender = token.gender;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === 'development',
};
