'use client';

import React, { useEffect, useState } from 'react';
import FileDropZone from '../components/FileDropZone';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import jsPDF from 'jspdf';
const MySwal = withReactContent(Swal);

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Qr {
  _id: string;
  url: string;
  resourceUrl: string;
  logoUrl?: string;
  createdAt: string;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_LOGO_SIZE_MB = 2;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const ALLOWED_LOGO_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml'];

export default function DashboardPage() {
  const [qrs, setQrs] = useState<Qr[]>([]);
  const [userEmail, setUserEmail] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  // Limpia URLs de previsualización para evitar fugas de memoria
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [previewUrl, logoPreviewUrl]);

  // Obtener QR y email al montar
  useEffect(() => {
    fetch(`${API_URL}/api/qrs`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setQrs(data);
        else if (Array.isArray(data.qrs)) setQrs(data.qrs);
        else setQrs([]);
      });

    setUserEmail(localStorage.getItem('email') || '');
  }, []);

  // --- Validación y selección de archivo principal ---
  const handleFileSelect = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Solo se permiten imágenes JPG, PNG o PDFs.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert('El archivo excede el tamaño máximo de 10 MB.');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadedUrl(null);
    setQrUrl('');
  };

  // --- Validación y selección de logo ---
  const handleLogoSelect = (file: File) => {
    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      alert('Solo se permiten logos JPG, PNG o SVG.');
      return;
    }
    if (file.size > MAX_LOGO_SIZE_MB * 1024 * 1024) {
      alert('El logo excede el tamaño máximo de 2 MB.');
      return;
    }
    setSelectedLogo(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
    setUploadedLogoUrl(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    // Mostrar mensaje de carga
    MySwal.fire({
      title: 'Subiendo archivo...',
      text: 'Por favor espera unos segundos.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch(`${API_URL}/api/upload/logo`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await response.json();

      Swal.close(); // Cierra el modal de carga

      if (response.ok && data.url) {
        setUploadedUrl(data.url);
        setQrUrl(data.url);
        await MySwal.fire({
          icon: 'success',
          title: 'Archivo subido correctamente',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await MySwal.fire({
          icon: 'error',
          title: 'Error al subir el archivo',
          text: data.message || 'Ha ocurrido un problema inesperado.',
        });
      }
    } catch {
      Swal.close();
      await MySwal.fire({
        icon: 'error',
        title: 'Error de red',
        text: 'No se pudo conectar con el servidor.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleLogoUpload = async () => {
    if (!selectedLogo) return;

    // Muestra animación de "subiendo..."
    MySwal.fire({
      title: 'Subiendo logo...',
      text: 'Por favor espera unos segundos.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedLogo);

    try {
      const response = await fetch(`${API_URL}/api/upload/logo`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await response.json();

      Swal.close(); // Cierra el "loading"

      if (response.ok && data.url) {
        setUploadedLogoUrl(data.url);

        // Notificación de éxito
        await MySwal.fire({
          icon: 'success',
          title: 'Logo subido correctamente',
          timer: 1400,
          showConfirmButton: false,
        });
      } else {
        // Notificación de error de backend
        await MySwal.fire({
          icon: 'error',
          title: 'Error al subir el logo',
          text: data.message || 'Ocurrió un error inesperado.',
        });
      }
    } catch {
      Swal.close();
      // Notificación de error de red
      await MySwal.fire({
        icon: 'error',
        title: 'Error de red',
        text: 'No se pudo conectar con el servidor.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateQR = async () => {
    if (!qrUrl) {
      await MySwal.fire({
        icon: 'warning',
        title: 'Falta la URL',
        text: 'Debes ingresar o subir una URL para el QR.',
      });
      return;
    }

    try {
      // Validar URL
      new URL(qrUrl);
    } catch {
      await MySwal.fire({
        icon: 'error',
        title: 'URL inválida',
        text: 'La URL ingresada no es válida.',
      });
      return;
    }

    try {
      // Mostrar loading
      MySwal.fire({
        title: 'Generando QR...',
        text: 'Este proceso puede tardar unos segundos.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch(`${API_URL}/api/qrs`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: '',
          resourceUrl: qrUrl,
          logoUrl: uploadedLogoUrl,
        }),
      });

      const data = await response.json();

      Swal.close(); // Cierra el loading

      if (response.ok) {
        // Actualizar lista y limpiar formulario
        setQrs(prev => [...prev, data]);
        setQrUrl('');
        setUploadedUrl(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        setSelectedLogo(null);
        setUploadedLogoUrl(null);
        setLogoPreviewUrl(null);

        await MySwal.fire({
          icon: 'success',
          title: 'QR generado correctamente',
          timer: 1600,
          showConfirmButton: false,
        });
      } else {
        await MySwal.fire({
          icon: 'error',
          title: 'Error al generar el QR',
          text: data.message || 'Ha ocurrido un problema inesperado.',
        });
      }
    } catch{
      Swal.close(); // Cierra el loading si algo explota
      await MySwal.fire({
        icon: 'error',
        title: 'Error de red',
        text: 'No se pudo conectar con el servidor.',
      });
    }
  };


  const handleDelete = async (qrId: string) => {
    const result = await MySwal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el QR y los archivos asociados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      MySwal.fire({
      title: 'Eliminando QR...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

      const response = await fetch(`${API_URL}/api/qrs/${qrId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      MySwal.close();

      if (response.ok) {
        setQrs(prev => prev.filter(qr => qr._id !== qrId));
        MySwal.fire({
          icon: 'success',
          title: 'QR eliminado correctamente',
          timer: 1600,
          showConfirmButton: false,
        });
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Error al eliminar el QR',
          text: data.message || 'Ocurrió un problema inesperado',
        });
      }
    } catch {
      MySwal.close();
      MySwal.fire({
        icon: 'error',
        title: 'Error de red',
        text: 'No se pudo conectar con el servidor.',
      });
    }
  };


  // --- Logout ---
  const logout = () => {
    fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(() => {
        localStorage.removeItem('email');
        router.push('/login');
      });
  };

  const handleOpenPngInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDownloadPdf = async (url: string, id: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const reader = new FileReader();

    reader.onloadend = function () {
      const base64data = reader.result;

      if (typeof base64data === 'string') {
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const imgProps = pdf.getImageProperties(base64data);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = 80;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        const x = (pdfWidth - imgWidth) / 2;

        pdf.addImage(base64data, "PNG", x, 40, imgWidth, imgHeight);
        pdf.save(`qr_${id}.pdf`);
      } else {
        console.error("Error: El resultado no es una URL base64 válida.");
      }
    };

    reader.readAsDataURL(blob);
  };

  return (
    <div className="container mx-auto p-4 relative">
      {/* Botón de logout */}
      <button
        onClick={logout}
        className="absolute top-2 right-2 sm:top-4 sm:right-4 px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-base bg-red-600 text-white rounded hover:bg-red-700 transition z-10 shadow"
      >
        Cerrar sesión
      </button>

      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center px-2 leading-tight">
        ¡Bienvenido, {userEmail}!
      </h1>

      {/* Formulario para generar QR */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Generar nuevo QR</h2>

        {/* FileDropZone para documento principal */}
        <label className="block font-semibold mb-1">
          Documento a mostrar al escanear el QR (imagen o PDF):
        </label>
        <FileDropZone
          onFileSelect={handleFileSelect}
          accept="image/jpeg,image/png,application/pdf"
          label="Arrastra aquí tu documento o selecciónalo"
        />
        {selectedFile && (
          <div className="mt-2 text-sm text-gray-700">
            Documento seleccionado: {selectedFile.name}
          </div>
        )}
        {previewUrl && (
          <div className="mt-4">
            {selectedFile?.type.startsWith('image/') ? (
              <img src={previewUrl} alt="Previsualización" className="max-w-xs mx-auto rounded shadow" />
            ) : selectedFile?.type === 'application/pdf' ? (
              <iframe src={previewUrl} title="Previsualización PDF" className="w-full h-64 rounded shadow" />
            ) : null}
          </div>
        )}
        <button
          onClick={handleUpload}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          disabled={!selectedFile || uploading}
        >
          {uploading ? 'Subiendo...' : 'Subir archivo'}
        </button>

        {/* Input para URL manual */}
        <input
          type="text"
          className="w-full mt-2 p-2 border rounded"
          placeholder="URL para el QR (opcional si subes archivo)"
          value={qrUrl}
          onChange={e => setQrUrl(e.target.value)}
          disabled={!!uploadedUrl}
        />

        {/* FileDropZone para logo opcional */}
        <label className="block font-semibold mt-6 mb-1">
          Logo opcional para el QR (JPG, PNG, SVG):
        </label>
        <FileDropZone
          onFileSelect={handleLogoSelect}
          accept="image/jpeg,image/png,image/svg+xml"
          label="Arrastra aquí tu logo o selecciónalo"
        />
        {selectedLogo && (
          <div className="mt-2 text-sm text-gray-700">
            Logo seleccionado: {selectedLogo.name}
          </div>
        )}
        {logoPreviewUrl && (
          <div className="mt-2">
            <img src={logoPreviewUrl} alt="Logo previsualización" className="max-w-xs mx-auto rounded shadow" />
          </div>
        )}
        <div className="flex space-x-4 mt-4">
          <button
            onClick={handleLogoUpload}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            disabled={!selectedLogo || uploading}
          >
            {uploading ? 'Subiendo logo...' : 'Subir logo'}
          </button>

          <button
            onClick={handleGenerateQR}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            disabled={!qrUrl}
          >
            Generar QR
          </button>
        </div>

      </section>

      {/* Listado de QR generados */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Tus QR generados</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.isArray(qrs) && qrs.map(qr => (
            <div key={qr._id} className="border p-4 rounded shadow">
              <img src={qr.url} alt="QR" className="mb-2 w-32 h-32 object-contain mx-auto" />
              <div className="text-sm break-words mb-1">
                Recurso: <a href={qr.resourceUrl} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{qr.resourceUrl}</a>
              </div>
              <div className="text-xs text-gray-500 mb-2">
                Creado: {new Date(qr.createdAt).toLocaleString()}
              </div>
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                  onClick={() => handleOpenPngInNewTab(qr.url)}
                >
                  PNG
                </button>


                <button
                  className="px-2 py-1 bg-purple-700 text-white rounded text-xs"
                  onClick={() => handleDownloadPdf(qr.url, qr._id)}
                >
                  PDF
                </button>

                <button
                  onClick={() => handleDelete(qr._id)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
