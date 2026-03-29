import { useEffect, useState } from "react";
import {
  fetchCalificaciones,
  fetchPromedioGeneral,
} from "../../services/estudianteServices/calificacionesService";
import { useAuth } from "../../hooks/UseAuth";
import { GradesPDFGenerator } from "../../components/PDFGenerator";

export default function Calificaciones() {
  const { usuario } = useAuth();
  const [materias, setMaterias] = useState([]); // [{ nombre, notas: [n1, n2, ...], promedio }]
  const [promedioGeneral, setPromedioGeneral] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCalificaciones = async () => {
      setLoading(true);
      setError("");
      try {
        // Cargar calificaciones y promedio general
        const [calificaciones, promedio] = await Promise.all([
          fetchCalificaciones(),
          fetchPromedioGeneral(),
        ]);
        setMaterias(calificaciones || []);
        setPromedioGeneral(promedio);
      } catch (err) {
        setError("No se pudieron cargar tus calificaciones.");
        console.error("Error:", err);
      }
      setLoading(false);
    };
    loadCalificaciones();
  }, []);
  const [filtro, setFiltro] = useState("");
  const materiasFiltradas = filtro
    ? materias.filter((mat) =>
        mat.nombre.toLowerCase().includes(filtro.toLowerCase()),
      )
    : materias;

  // Función para generar PDF de calificaciones
  const handleGeneratePDF = () => {
    const gradesData = {
      studentName: usuario?.nombre || "Estudiante",
      course: "Curso Actual",
      period: new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
      }),
      grades: materiasFiltradas.map((mat) => ({
        subject: mat.nombre,
        grade: mat.promedio,
        status: mat.promedio >= 70 ? "Aprobado" : "Reprobado",
      })),
    };

    return gradesData;
  };

  return (
    <div className="min-h-screen p-6 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        <div className="p-8 rounded-3xl shadow-2xl border-2 border-transparent bg-linear-to-br from-blue-50 to-purple-50 hover:border-blue-300 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-linear-to-br from-blue-400 to-indigo-600 rounded-xl text-white text-4xl">
                📊
              </div>
              <div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
                  Mis Calificaciones
                </h2>
                <p className="text-sm text-gray-600">
                  Consulta tus notas y promedios por materia
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Promedio General</div>
                <div
                  className={`text-2xl font-bold ${
                    promedioGeneral >= 90
                      ? "text-green-600"
                      : promedioGeneral >= 80
                        ? "text-blue-600"
                        : promedioGeneral >= 70
                          ? "text-yellow-600"
                          : "text-red-600"
                  }`}
                >
                  {promedioGeneral.toFixed(1)}
                </div>
              </div>
              <GradesPDFGenerator
                gradesData={handleGeneratePDF()}
                filename={`calificaciones-${usuario?.nombre || "estudiante"}-${new Date().toISOString().split("T")[0]}.pdf`}
              />
            </div>
          </div>
          <div className="mb-6">
            <input
              type="text"
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all"
              placeholder="🔍 Filtrar por materia..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
          {loading && (
            <div className="text-blue-600">Cargando calificaciones...</div>
          )}
          {error && (
            <div className="p-2 mb-4 text-red-600 bg-red-100 rounded">
              {error}
            </div>
          )}
          {!loading && !error && (
            <div className="overflow-x-auto">
              {materias.length === 0 ? (
                <div className="text-center p-12 bg-linear-to-br from-blue-50 to-purple-50 rounded-2xl">
                  <div className="text-6xl mb-4 animate-bounce">📚</div>
                  <div className="text-xl text-gray-600">
                    No hay calificaciones registradas.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {materias.map((mat, idx) => (
                    <div
                      key={idx}
                      className="p-6 bg-white rounded-2xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl hover:scale-105 transition-all duration-300"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {mat.nombre}
                          </h3>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <span>📝 Notas:</span>
                            <span className="font-medium">
                              {mat.notas?.join(", ")}
                            </span>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-1">
                            Promedio
                          </div>
                          <div
                            className={`text-4xl font-bold ${
                              mat.promedio >= 90
                                ? "text-green-600"
                                : mat.promedio >= 80
                                  ? "text-blue-600"
                                  : mat.promedio >= 70
                                    ? "text-yellow-600"
                                    : "text-red-600"
                            }`}
                          >
                            {mat.promedio}
                          </div>
                          {mat.promedio >= 90 && (
                            <div className="text-xl">🏆</div>
                          )}
                          {mat.promedio >= 80 && mat.promedio < 90 && (
                            <div className="text-xl">⭐</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
