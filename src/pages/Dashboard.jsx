import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth";

// Componentes separados por rol
function ProfesorDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Link
        to="/profesor/Clases"
        className="p-6 shadow-lg border-2 border-transparent bg-linear-to-br from-blue-50 to-purple-50 hover:border-blue-300 hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-2xl group"
      >
        <div className="flex items-center space-x-4">
          <div className="p-4 text-3xl text-white bg-linear-to-br from-blue-400 to-blue-600 rounded-xl">
            📘
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 transition-colors group-hover:text-blue-600">
              Material de Clases
            </h3>
            <p className="text-sm text-gray-600">
              Gestiona tus materiales educativos
            </p>
          </div>
        </div>
      </Link>
      <Link
        to="/profesor/Evaluaciones"
        className="p-6 shadow-lg border-2 border-indigo-200 bg-linear-to-br from-indigo-100 to-purple-100 hover:border-indigo-400 hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-2xl group"
      >
        <div className="flex items-center space-x-4">
          <div className="p-4 text-3xl text-white bg-linear-to-br from-purple-400 to-indigo-600 rounded-xl">
            🤖
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 transition-colors group-hover:text-purple-600">
              Evaluaciones IA
            </h3>
            <p className="text-sm text-gray-600">
              Crea evaluaciones con inteligencia artificial
            </p>
          </div>
        </div>
      </Link>
      <Link
        to="/profesor/Actividades"
        className="p-6 shadow-lg border-2 border-pink-200 bg-linear-to-br from-pink-100 to-purple-100 hover:border-pink-400 hover:shadow-xl hover:scale-105 hover:rotate-1 transition-all duration-300 rounded-2xl group"
      >
        <div className="flex items-center space-x-4">
          <div className="p-4 text-3xl text-white bg-linear-to-br from-pink-400 to-purple-600 rounded-xl">
            🎯
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 transition-colors group-hover:text-pink-600">
              Actividades IA
            </h3>
            <p className="text-sm text-gray-600">
              Genera actividades dinámicas y divertidas
            </p>
          </div>
        </div>
      </Link>
      <Link
        to="/profesor/Asistencias"
        className="p-6 shadow-lg border-2 border-green-200 bg-linear-to-br from-green-100 to-blue-100 hover:border-green-400 hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-2xl group"
      >
        <div className="flex items-center space-x-4">
          <div className="p-4 text-3xl text-white bg-linear-to-br from-green-400 to-teal-600 rounded-xl">
            📋
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 transition-colors group-hover:text-green-600">
              Asistencia
            </h3>
            <p className="text-sm text-gray-600">
              Controla la asistencia de estudiantes
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}

function EstudianteDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Link
        to="/estudiante/Calificaciones"
        className="p-6 shadow-lg border-2 border-transparent bg-linear-to-br from-blue-50 to-purple-50 hover:border-blue-300 hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-2xl group"
      >
        <div className="flex items-center space-x-4">
          <div className="p-4 text-3xl text-white bg-linear-to-br from-blue-400 to-indigo-600 rounded-xl">
            📊
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 transition-colors group-hover:text-blue-600">
              Calificaciones
            </h3>
            <p className="text-sm text-gray-600">
              Revisa tu progreso académico
            </p>
          </div>
        </div>
      </Link>
      <Link
        to="/estudiante/Actividades"
        className="p-6 shadow-lg border-2 border-pink-200 bg-linear-to-br from-pink-100 to-purple-100 hover:border-pink-400 hover:shadow-xl hover:scale-105 hover:rotate-1 transition-all duration-300 rounded-2xl group"
      >
        <div className="flex items-center space-x-4">
          <div className="p-4 text-3xl text-white bg-linear-to-br from-pink-400 to-purple-600 rounded-xl">
            🎮
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 transition-colors group-hover:text-pink-600">
              Actividades
            </h3>
            <p className="text-sm text-gray-600">¡Juega y aprende!</p>
          </div>
        </div>
      </Link>
      <Link
        to="/estudiante/Evaluaciones"
        className="p-6 shadow-lg border-2 border-green-200 bg-linear-to-br from-green-100 to-blue-100 hover:border-green-400 hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-2xl group"
      >
        <div className="flex items-center space-x-4">
          <div className="p-4 text-3xl text-white bg-linear-to-br from-green-400 to-teal-600 rounded-xl">
            🧠
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 transition-colors group-hover:text-green-600">
              Evaluaciones
            </h3>
            <p className="text-sm text-gray-600">Demuestra lo que sabes</p>
          </div>
        </div>
      </Link>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Link
        to="/admin/usuarios"
        className="p-6 shadow-lg border-2 border-transparent bg-linear-to-br from-blue-50 to-purple-50 hover:border-blue-300 hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-2xl group"
      >
        <div className="flex items-center space-x-4">
          <div className="p-4 text-3xl text-white bg-linear-to-br from-blue-400 to-indigo-600 rounded-xl">
            👥
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 transition-colors group-hover:text-blue-600">
              Usuarios
            </h3>
            <p className="text-sm text-gray-600">
              Administra profesores y estudiantes
            </p>
          </div>
        </div>
      </Link>
      <Link
        to="/admin/Materias"
        className="p-6 shadow-lg border-2 border-indigo-200 bg-linear-to-br from-indigo-100 to-purple-100 hover:border-indigo-400 hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-2xl group"
      >
        <div className="flex items-center space-x-4">
          <div className="p-4 text-3xl text-white bg-linear-to-br from-purple-400 to-pink-600 rounded-xl">
            📚
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 transition-colors group-hover:text-purple-600">
              Materias
            </h3>
            <p className="text-sm text-gray-600">
              Organiza el currículo académico
            </p>
          </div>
        </div>
      </Link>
      <Link
        to="/admin/Reportes"
        className="p-6 shadow-lg border-2 border-green-200 bg-linear-to-br from-green-100 to-blue-100 hover:border-green-400 hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-2xl group"
      >
        <div className="flex items-center space-x-4">
          <div className="p-4 text-3xl text-white bg-linear-to-br from-green-400 to-teal-600 rounded-xl">
            📊
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 transition-colors group-hover:text-green-600">
              Reportes
            </h3>
            <p className="text-sm text-gray-600">Estadísticas y métricas</p>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const { usuario, loading } = useAuth();

  if (loading) {
    return <p className="p-6 text-gray-500">Cargando sesión...</p>;
  }

  if (!usuario) {
    return <p className="p-6 text-red-500">No hay sesión activa</p>;
  }

  const rolName = usuario.rol
    ? usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)
    : "Invitado";

  return (
    <div className="min-h-screen p-6 bg-linear-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-8 text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-purple-600 to-pink-600">
          🎓 Dashboard - {rolName}
        </h2>

        {usuario.rol === "profesor" && <ProfesorDashboard />}
        {usuario.rol === "estudiante" && <EstudianteDashboard />}
        {usuario.rol === "admin" && <AdminDashboard />}

        {!usuario.rol && (
          <p className="text-gray-500">No hay rol definido (modo invitado).</p>
        )}
      </div>
    </div>
  );
}
