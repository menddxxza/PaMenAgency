'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/auth/auth-card';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/providers/toast-provider';

export default function SignupPage() {
  const router = useRouter();
  const { push } = useToast();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    setLoading(false);

    if (error) {
      push(error.message, 'error');
      return;
    }

    push('Cuenta creada. Revisa tu email para confirmar tu cuenta.', 'success');
    router.push('/login');
  }

  return (
    <AuthCard
      title="Crea tu cuenta"
      subtitle="5 búsquedas gratis al mes, sin tarjeta."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Nombre</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            minLength={8}
            required
          />
        </div>
        <Button type="submit" className="w-full" loading={loading}>
          Crear cuenta
        </Button>

        <p className="text-center text-xs text-muted">
          Al registrarte aceptas los{' '}
          <Link href="/legal/terminos" className="underline underline-offset-2 hover:text-fg">
            Términos
          </Link>{' '}
          y la{' '}
          <Link href="/legal/privacidad" className="underline underline-offset-2 hover:text-fg">
            Política de privacidad
          </Link>
          .
        </p>
      </form>
    </AuthCard>
  );
}
