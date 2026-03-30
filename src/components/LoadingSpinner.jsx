import React from "react";

// Componente de loading con spinner
const LoadingSpinner = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-linear-to-br from-blue-50 to-purple-50">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animation-delay-150"></div>
      </div>
      <p className="mt-4 text-gray-600 font-medium">Cargando...</p>
      <p className="text-sm text-gray-500 mt-2">Por favor espera un momento</p>

      <style jsx>{`
        .animation-delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
