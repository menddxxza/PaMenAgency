import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { authConfig } from '@/auth.config';
import { db } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Correo', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credenciales) {
        const email =
          typeof credenciales?.email === 'string' ? credenciales.email.trim().toLowerCase() : '';
        const password = typeof credenciales?.password === 'string' ? credenciales.password : '';
        if (!email || !password) return null;

        const sql = db();
        const [usuario] = await sql<{ id: string; email: string; password_hash: string; nombre: string | null }[]>`
          select id, email, password_hash, nombre from users where email = ${email}
        `;
        if (!usuario) return null;

        const valido = await bcrypt.compare(password, usuario.password_hash);
        if (!valido) return null;

        return { id: usuario.id, email: usuario.email, name: usuario.nombre ?? undefined };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
