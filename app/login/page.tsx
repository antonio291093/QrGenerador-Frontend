import { Metadata } from 'next';
import LoginClient from './LoginClient'

// Definición de metadata para SEO
export const metadata: Metadata = {
  title: 'Iniciar sesión | QrGenerador',
  description: 'Accede a tu cuenta para generar y gestionar tus códigos QR personalizados.',
};

export default function LoginPage() {
  return <LoginClient />;
}
