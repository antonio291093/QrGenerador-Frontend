'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import React from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const LoginClient: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include',
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (data.user) {
          router.replace('/dashboard');
        }
      })
      .catch(() => {
        // No hacer nada si no hay sesión
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Error de autenticación',
        });
        return;
      }

      localStorage.setItem('email', data.user.email);

      const meRes = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (meRes.ok) {
        const meData = await meRes.json();

        Swal.fire({
          icon: 'success',
          title: 'Bienvenido',
          text: `Has iniciado sesión como ${meData.user.email}`,
          timer: 1500,
          showConfirmButton: false,
        });

        setTimeout(() => {
          if (meData.user.mustChangePassword) {
            router.push('/change-password');
          } else {
            router.push('/dashboard');
          }
        }, 1500);
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Sesión no válida',
          text: 'La sesión no pudo establecerse correctamente',
        });
      }
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor',
      });
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
      </form>
    </div>
  );
};

export default LoginClient;
