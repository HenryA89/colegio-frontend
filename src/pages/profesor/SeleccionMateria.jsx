import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchClases } from "../../services/profesorServices/clasesService";
import {
  BookOpen,
  Users,
  FileText,
  Brain,
  Target,
  CheckSquare,
  TrendingUp,
} from "lucide-react";

export default function SeleccionMateria() {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    cargarClases();
  }, []);

  const cargarClases = async () => {
    try {
      setLoading(true);
      const clasesData = await fetchClases();
      setClases(clasesData);
    } catch (error) {
      console.error("Error cargando clases:", error);
      setError("Error al cargar tus materias asignadas");
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarClase = (clase) => {
    // Guardar clase seleccionada en localStorage para uso en otras páginas
    localStorage.setItem("claseSeleccionada", JSON.stringify(clase));

    // Navegar a la página de acciones de la clase
    navigate(`/profesor/clases/${clase.id}/accionesClase`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tus materias...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600">{error}</p>
          <button
            onClick={cargarClases}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (clases.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No tienes materias asignadas
          </h2>
          <p className="text-gray-600 mb-4">
            Contacta al administrador para que te asigne materias.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-linear-to-br from-purple-50 via-pink-50 to-rose-50">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">👨‍🏫</div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600">
            Selecciona una Materia
          </h1>
          <p className="text-gray-600 mt-2">
            Elige la materia para gestionar sus actividades y estudiantes
          </p>
        </div>

        {/* Grid de Materias */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clases.map((clase) => (
            <div
              key={clase.id}
              onClick={() => handleSeleccionarClase(clase)}
              className="bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-purple-300 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              {/* Cabecera de la tarjeta */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 text-2xl text-white bg-linear-to-br from-purple-400 to-pink-600 rounded-xl">
                    📚
                  </div>
                  <span className="px-3 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
                    {clase.grupo || "Grupo A"}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                  {clase.materia}
                </h3>

                <div className="flex items-center text-sm text-gray-600 space-x-4">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {clase.curso || "10°"}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {clase.salon || "Aula 101"}
                  </span>
                </div>
              </div>

              {/* Acciones disponibles */}
              <div className="p-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Acciones disponibles:
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <FileText className="w-3 h-3 text-blue-500" />
                    <span>Material</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Brain className="w-3 h-3 text-purple-500" />
                    <span>Quiz IA</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Target className="w-3 h-3 text-green-500" />
                    <span>Actividades</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckSquare className="w-3 h-3 text-orange-500" />
                    <span>Asistencia</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <TrendingUp className="w-3 h-3 text-red-500" />
                    <span>Evaluaciones</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Users className="w-3 h-3 text-indigo-500" />
                    <span>Estudiantes</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
                <button className="w-full text-center text-sm font-medium text-purple-600 group-hover:text-purple-700 transition-colors">
                  Gestionar {clase.materia} →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Información adicional */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Selecciona una materia para acceder a todas sus herramientas de
            gestión
          </p>
        </div>
      </div>
    </div>
  );
}
