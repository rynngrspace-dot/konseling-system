import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username/NIS", type: "text", placeholder: "NIS atau Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Masukkan username dan password!");
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
          include: {
            siswa: true,
            guruBk: true,
          }
        });

        if (!user) {
          throw new Error("Username tidak ditemukan!");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Password salah!");
        }

        let name = "Pengguna";
        let identifier = user.username;

        if (user.role === "SISWA" && user.siswa) {
          name = user.siswa.nama;
          identifier = user.siswa.nis;
        } else if (user.role === "GURU_BK" && user.guruBk) {
          name = user.guruBk.nama;
          identifier = user.guruBk.nip;
        }

        return {
          id: user.id,
          username: user.username,
          role: user.role,
          name,
          identifier,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.name = user.name;
        token.identifier = user.identifier;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          username: token.username as string,
          role: token.role as string,
          name: token.name as string,
          identifier: token.identifier as string,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "supersecretkey123", // Gunakan fallback hanya untuk development
};
