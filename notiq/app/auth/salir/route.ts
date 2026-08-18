import { signOut } from '@/lib/auth';

export async function POST() {
  // signOut() con redirectTo hace el redirect por su cuenta (lanza el
  // NEXT_REDIRECT que Next.js reconoce), igual que signIn() en entrar/actions.ts.
  await signOut({ redirectTo: '/' });
}
