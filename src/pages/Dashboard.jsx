import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth";

// Componentes separados por rol
function ProfesorDashboard() {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-6">👨‍🏫</div>
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600 mb-4">
        Bienvenido Profesor
      </h2>
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
        Para comenzar, por favor selecciona una de tus materias asignadas para
        acceder a todas las herramientas de gestión.
      </p>

      <div className="max-w-md mx-auto space-y-4">
        <Link
          to="/profesor/seleccionmateria"
          className="block w-full p-6 shadow-lg border-2 border-transparent bg-linear-to-br from-purple-50 to-pink-50 hover:border-purple-300 hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-2xl group"
        >
          <div className="flex items-center justify-center space-x-4">
            <div className="p-4 text-3xl text-white bg-linear-to-br from-purple-400 to-pink-600 rounded-xl">
              📚
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-gray-800 transition-colors group-hover:text-purple-600">
                Seleccionar Materia
              </h3>
              <p className="text-sm text-gray-600">
                Elige una materia para gestionar sus actividades
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/profesor/quiz-ai"
          className="block w-full p-6 shadow-lg border-2 border-transparent bg-linear-to-br from-indigo-50 to-purple-50 hover:border-indigo-300 hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-2xl group"
        >
          <div className="flex items-center justify-center space-x-4">
            <div className="p-4 text-3xl text-white bg-linear-to-br from-indigo-400 to-purple-600 rounded-xl">
              🤖
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-gray-800 transition-colors group-hover:text-indigo-600">
                Quiz con IA
              </h3>
              <p className="text-sm text-gray-600">
                Genera quizzes automáticos con inteligencia artificial
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
        <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
          <div className="text-2xl mb-3">🎯</div>
          <h4 className="font-semibold text-gray-800 mb-2">
            Gestión Centralizada
          </h4>
          <p className="text-sm text-gray-600">
            Accede a todas las herramientas desde una interfaz unificada por
            materia
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
          <div className="text-2xl mb-3">🤖</div>
          <h4 className="font-semibold text-gray-800 mb-2">Herramientas IA</h4>
          <p className="text-sm text-gray-600">
            Quiz, actividades y evaluaciones generadas con inteligencia
            artificial
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
          <div className="text-2xl mb-3">�</div>
          <h4 className="font-semibold text-gray-800 mb-2">Seguimiento</h4>
          <p className="text-sm text-gray-600">
            Controla asistencia, calificaciones y progreso de tus estudiantes
          </p>
        </div>
      </div>
    </div>
  );
}

function EstudianteDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Link
        to="/estudiante/calificaciones"
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
        to="/estudiante/actividades"
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
        to="/estudiante/evaluaciones"
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
        to="/admin/materias"
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
        to="/admin/reportes"
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
