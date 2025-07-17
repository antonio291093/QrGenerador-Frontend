'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import React, { useState} from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;  

const LoginClient: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();    

  useEffect(() => {
    fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include',
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        // Si hay sesión activa, redirige al dashboard
        if (data.user) {
          router.replace('/dashboard'); // reemplaza para no dejar /login en el historial
        }
      })
      .catch(() => {
        // Si no hay sesión, permanece en login
        // No hagas nada, deja el formulario
      });
  }, [router]);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {         
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Importante para cookies
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || 'Error de autenticación');
      return;
    }

    // Opcional: guardar email en localStorage solo si te hace falta para UX
    localStorage.setItem('email', data.user.email);

    // Ahora, verifica la sesión realmente activa con /me
    const meRes = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });

    if (meRes.ok) {
      const meData = await meRes.json();      
      if (meData.user.mustChangePassword) {        
        router.push('/change-password');
      } else {        
        router.push('/dashboard');
      }
    } else {
      setMessage("La sesión no pudo establecerse correctamente");
    }

  } catch {
    setMessage('Error de conexión con el servidor');
  }
};
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h2>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-6 p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Entrar
        </button>
        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
      </form>
    </div>
  );
};

export default LoginClient;
