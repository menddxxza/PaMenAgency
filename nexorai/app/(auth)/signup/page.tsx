'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/auth-card';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.push('/onboarding/business');
      return;
    }

    setNotice('Cuenta creada. Revisa tu email para confirmar tu cuenta y luego inicia sesión.');
    setTimeout(() => router.push('/login'), 2500);
  }

  return (
    <AuthCard
      title="Crea tu cuenta en Revynai"
      subtitle="Analiza tu negocio y activa tu primer agente en minutos."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-medium text-brand-400 hover:underline">
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
            placeholder="tu@empresa.com"
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

        {error && <p className="text-sm text-danger">{error}</p>}
        {notice && <p className="text-sm text-success">{notice}</p>}

        <Button type="submit" className="w-full" loading={loading}>
          Crear cuenta
        </Button>

        <p className="text-center text-xs text-muted">
          Al registrarte aceptas los{' '}
          <a
            href="https://pamenagency.com/legal/terminos"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-fg"
          >
            Términos
          </a>{' '}
          y la{' '}
          <a
            href="https://pamenagency.com/legal/privacidad"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-fg"
          >
            Política de privacidad
          </a>{' '}
          de PaMenAgency.
        </p>
      </form>
    </AuthCard>
  );
}
