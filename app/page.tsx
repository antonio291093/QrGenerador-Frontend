import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata = {
  title: "Generador de Códigos QR",
  description:
    "Genera códigos QR personalizados para compartir enlaces, promociones y más con nuestro generador sencillo y rápido.",
  keywords: [
    "generador QR",
    "código QR",
    "QR personalizado",    
    "herramienta QR",
    "promociones QR"
  ],
  openGraph: {
    title: "Generador de Códigos QR",
    description: "Crea códigos QR personalizados de forma fácil y rápida.",
    url: "https://qr-generador-frontend.vercel.app/login",
    siteName: "qr-generador-frontend.vercel.app",
    images: [
      {
        url: "https://res.cloudinary.com/dfpubv5hp/image/upload/v1753993023/qrgenerador_trwz4k.png", // Cambia por la imagen real
        width: 1200,
        height: 630,
        alt: "Generador de Códigos QR SinColoresFC.mx",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Generador de Códigos QR",
    description: "Crea y descarga tus códigos QR personalizados gratis.",
    images: [
      "https://res.cloudinary.com/dfpubv5hp/image/upload/v1753993023/qrgenerador_trwz4k.png",
    ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
};

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
