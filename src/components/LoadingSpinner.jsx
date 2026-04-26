import React, { useState, useEffect } from "react";

// Componente de loading con spinner mejorado y llamativo
const LoadingSpinner = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [dots, setDots] = useState("");

  const messages = [
    "Preparando tu experiencia",
    "Cargando contenido educativo",
    "Organizando tus clases",
    "Conectando con la IA",
    "Configurando tu dashboard",
    "Casi listo...",
  ];

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(messageInterval);
  }, []);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(dotsInterval);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-linear-to-br from-blue-600 via-purple-600 to-indigo-700 animate-gradient-x">
      {/* Logo animado */}
      <div className="mb-8">
        <div className="text-6xl font-bold text-white animate-bounce">
          ESTUD-IA
        </div>
        <p className="text-center text-blue-100 mt-2 text-lg">
          Aprende jugando con IA 🎓
        </p>
      </div>

      {/* Spinner principal */}
      <div className="relative mb-8">
        <div className="w-20 h-20 border-4 border-blue-300 border-t-white rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-400 rounded-full animate-spin animation-delay-150"></div>
        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-b-pink-400 rounded-full animate-spin animation-delay-300"></div>

        {/* Icono central */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-3xl animate-pulse">🎓</div>
        </div>
      </div>

      {/* Mensaje dinámico */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">
          {messages[messageIndex]}
          <span className="inline-block w-12 text-left">{dots}</span>
        </h2>
        <p className="text-blue-100 text-lg">Estamos preparando todo para ti</p>
      </div>

      {/* Barra de progreso animada */}
      <div className="w-64 h-2 bg-blue-800 rounded-full overflow-hidden mb-6">
        <div className="h-full bg-linear-to-r from-blue-400 to-purple-400 rounded-full animate-slide-right"></div>
      </div>

      {/* Elementos decorativos */}
      <div className="absolute top-10 left-10 text-4xl animate-float">📚</div>
      <div className="absolute top-20 right-20 text-3xl animate-float-delayed">
        🎯
      </div>
      <div className="absolute bottom-20 left-20 text-3xl animate-float">
        🚀
      </div>
      <div className="absolute bottom-10 right-10 text-4xl animate-float-delayed">
        💡
      </div>

      <style jsx>{`
        .animation-delay-150 {
          animation-delay: 150ms;
        }
        .animation-delay-300 {
          animation-delay: 300ms;
        }

        @keyframes slide-right {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-slide-right {
          animation: slide-right 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite;
          animation-delay: 1s;
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
