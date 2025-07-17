import React, { useRef } from 'react';

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  accept: string;
  label: string;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ onFileSelect, accept, label }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      className="border-2 border-dashed border-gray-400 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition mb-2"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleClick}
    >
      <p className="mb-2 text-gray-600">{label}</p>
      <span className="mb-2 text-gray-400">o</span>
      <button
        type="button"
        className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
        onClick={e => {
          e.stopPropagation();
          handleClick();
        }}
      >
        Seleccionar archivo
      </button>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept={accept}
      />
    </div>
  );
};

export default FileDropZone;
