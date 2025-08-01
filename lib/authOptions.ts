import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

interface GoogleProfile {
  sub: string;
  name: string;
  email: string;
  picture: string;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      if (!profile?.email) throw new Error("No email found in profile");

      const googleProfile = profile as GoogleProfile;

      await prisma.user.upsert({
        where: { email: googleProfile.email },
        create: {
          email: googleProfile.email,
          name: googleProfile.name,
          image: googleProfile.picture,
        },
        update: {
          name: googleProfile.name,
          image: googleProfile.picture,
        },
      });

      return true;
    },

    async jwt({ token, profile }) {
      if (profile?.email) {
        const user = await prisma.user.findUnique({
          where: { email: profile.email },
        });
        if (user) token.id = user.id;
      }
      return token;
    },

    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<Session> {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
