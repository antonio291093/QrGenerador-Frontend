import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const cookieStore = await cookies(); // ← Usa await aquí
  const token = cookieStore.get('token');

  if (token) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
  return null;
}
