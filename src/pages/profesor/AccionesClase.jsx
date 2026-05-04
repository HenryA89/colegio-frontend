import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Brain,
  Target,
  CheckSquare,
  TrendingUp,
  Users,
  ArrowLeft,
  FileText,
  Clock,
  BarChart3,
  Settings,
} from "lucide-react";

export default function AccionesClase() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clase, setClase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarClaseSeleccionada();
  }, [id]);

  const cargarClaseSeleccionada = () => {
    try {
      const claseGuardada = localStorage.getItem("claseSeleccionada");
      if (claseGuardada) {
        const claseData = JSON.parse(claseGuardada);
        // Verificar que el ID coincida
        if (claseData.id === id) {
          setClase(claseData);
        } else {
          // Si no coincide, redirigir a selección
          navigate("/profesor/seleccionmateria");
        }
      } else {
        // Si no hay clase guardada, redirigir a selección
        navigate("/profesor/seleccionmateria");
      }
    } catch (error) {
      console.error("Error cargando clase:", error);
      navigate("/profesor/seleccionmateria");
    } finally {
      setLoading(false);
    }
  };

  const acciones = [
    {
      id: "material",
      titulo: "Material de Clases",
      descripcion: "Sube y gestiona tus materiales educativos",
      icono: FileText,
      color: "from-blue-400 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      hoverColor: "hover:border-blue-400",
      ruta: `/profesor/clases?id=${id}`,
    },
    {
      id: "quiz-ia",
      titulo: "Quiz IA",
      descripcion: "Crea quizzes inteligentes con inteligencia artificial",
      icono: Brain,
      color: "from-purple-400 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
      hoverColor: "hover:border-purple-400",
      ruta: `/profesor/quizAi/${id}`,
    },
    {
      id: "actividades",
      titulo: "Actividades IA",
      descripcion: "Genera actividades dinámicas y divertidas",
      icono: Target,
      color: "from-pink-400 to-pink-600",
      bgColor: "from-pink-50 to-pink-100",
      borderColor: "border-pink-200",
      hoverColor: "hover:border-pink-400",
      ruta: `/profesor/actividades/${id}`,
    },
    {
      id: "asistencia",
      titulo: "Asistencia",
      descripcion: "Controla la asistencia de estudiantes",
      icono: CheckSquare,
      color: "from-green-400 to-green-600",
      bgColor: "from-green-50 to-green-100",
      borderColor: "border-green-200",
      hoverColor: "hover:border-green-400",
      ruta: `/profesor/asistencias/${id}`,
    },
    {
      id: "evaluaciones",
      titulo: "Evaluaciones IA",
      descripcion: "Crea evaluaciones con inteligencia artificial",
      icono: TrendingUp,
      color: "from-red-400 to-red-600",
      bgColor: "from-red-50 to-red-100",
      borderColor: "border-red-200",
      hoverColor: "hover:border-red-400",
      ruta: `/profesor/evaluacionesClase/${id}`,
    },
    {
      id: "estudiantes",
      titulo: "Estudiantes",
      descripcion: "Visualiza la lista de estudiantes de la clase",
      icono: Users,
      color: "from-indigo-400 to-indigo-600",
      bgColor: "from-indigo-50 to-indigo-100",
      borderColor: "border-indigo-200",
      hoverColor: "hover:border-indigo-400",
      ruta: `/profesor/estudiantesClases/${id}`,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de la clase...</p>
        </div>
      </div>
    );
  }

  if (!clase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">
            No se encontró la información de la clase
          </p>
          <button
            onClick={() => navigate("/profesor/seleccionar-materia")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Seleccionar Materia
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-linear-to-br from-purple-50 via-pink-50 to-rose-50">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado con información de la clase */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/profesor/seleccionar-materia")}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a seleccionar materia
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {clase.materia}
                </h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {clase.curso || "10°"}
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {clase.grupo || "Grupo A"}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {clase.salon || "Aula 101"}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Profesor:</div>
                <div className="font-semibold text-gray-800">
                  {clase.profesor_nombre || "Profesor asignado"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de acciones */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {acciones.map((accion) => {
            const Icono = accion.icono;
            return (
              <div
                key={accion.id}
                onClick={() => navigate(accion.ruta)}
                className={`bg-linear-to-br ${accion.bgColor} rounded-2xl shadow-lg border-2 ${accion.borderColor} ${accion.hoverColor} hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-4 text-3xl text-white bg-linear-to-br ${accion.color} rounded-xl`}
                    >
                      <Icono className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-medium text-gray-600 bg-white px-3 py-1 rounded-full">
                      {accion.id === "material" && "📄"}
                      {accion.id === "quiz-ia" && "🤖"}
                      {accion.id === "actividades" && "🎯"}
                      {accion.id === "asistencia" && "📋"}
                      {accion.id === "evaluaciones" && "📊"}
                      {accion.id === "estudiantes" && "👥"}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                    {accion.titulo}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4">
                    {accion.descripcion}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">
                      Gestionar →
                    </span>
                    <BarChart3 className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Información de la Clase
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-blue-600 text-sm font-medium mb-1">
                Materia
              </div>
              <div className="text-gray-800 font-semibold">{clase.materia}</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-green-600 text-sm font-medium mb-1">
                Curso
              </div>
              <div className="text-gray-800 font-semibold">
                {clase.curso || "10°"}
              </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-purple-600 text-sm font-medium mb-1">
                Grupo
              </div>
              <div className="text-gray-800 font-semibold">
                {clase.grupo || "Grupo A"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
