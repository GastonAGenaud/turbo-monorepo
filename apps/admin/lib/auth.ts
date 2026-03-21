import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "@ggseeds/db";
import { logger } from "@ggseeds/shared";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 horas
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const user = await db.user.findUnique({ where: { email } });
        if (!user?.passwordHash) {
          return null;
        }

        // Verificar lockout
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          logger.warn({ email }, "Intento de login en cuenta bloqueada");
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);

        if (!valid) {
          // Incrementar contador de intentos fallidos
          const newCount = user.failedLoginCount + 1;
          const lockout =
            newCount >= MAX_FAILED_ATTEMPTS
              ? new Date(Date.now() + LOCKOUT_DURATION_MS)
              : null;

          await db.user.update({
            where: { id: user.id },
            data: {
              failedLoginCount: newCount,
              lockedUntil: lockout,
            },
          });

          if (lockout) {
            logger.warn(
              { email, attempts: newCount },
              "Cuenta bloqueada por demasiados intentos fallidos",
            );
          }

          return null;
        }

        // Solo admins pueden acceder al panel
        if (user.role !== "ADMIN") {
          return null;
        }

        // Login exitoso: resetear contadores
        await db.user.update({
          where: { id: user.id },
          data: {
            failedLoginCount: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        });

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
