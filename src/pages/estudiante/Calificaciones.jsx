import { useEffect, useState } from "react";
import { fetchCalificaciones } from "../../services/estudianteServices/calificacionesService";
import { useAuth } from "../../hooks/UseAuth";

export default function Calificaciones() {
  const { usuario } = useAuth();
  const [materias, setMaterias] = useState([]); // [{ nombre, notas: [n1, n2, ...], promedio }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchNotas() {
      setLoading(true);
      setError("");
      try {
        // Usar el servicio de calificaciones
        const calificaciones = await fetchCalificaciones(usuario?.token);
        setMaterias(calificaciones || []);
      } catch (err) {
        setError("No se pudieron cargar tus calificaciones.");
      }
      setLoading(false);
    }
    fetchNotas();
  }, []);
  const [filtro, setFiltro] = useState("");
  const materiasFiltradas = filtro
    ? materias.filter((mat) =>
        mat.nombre.toLowerCase().includes(filtro.toLowerCase())
      )
    : materias;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        <div className="educational-card p-8 rounded-3xl shadow-2xl bounce-in">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl text-white text-4xl">
              📊
            </div>
            <div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Mis Calificaciones
              </h2>
              <p className="text-sm text-gray-600">
                Consulta tus notas y promedios por materia
              </p>
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
                <div className="text-center p-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
                  <div className="text-6xl mb-4">📚</div>
                  <div className="text-xl text-gray-600">
                    No hay calificaciones registradas.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {materias.map((mat, idx) => (
                    <div
                      key={idx}
                      className="p-6 bg-white rounded-2xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all slide-up"
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
