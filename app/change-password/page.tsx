'use client';

import React, { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;  

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      setMessage('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 8) {
      setMessage('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    const token = localStorage.getItem('token');    
    const response = await fetch(`${API_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ newPassword }),
    });

    const data = await response.json();
    if (response.ok) {
      setMessage('Contraseña cambiada correctamente. Redirigiendo...');
      // Redirige al dashboard o login
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } else {
      setMessage(data.message || 'Error al cambiar la contraseña');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Cambia tu contraseña</h2>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Confirma la nueva contraseña"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          className="w-full mb-6 p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Cambiar contraseña
        </button>
        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
      </form>
    </div>
  );
}
