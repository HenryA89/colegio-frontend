import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Users,
  FileText,
  Upload,
  BookOpen,
  Clock,
} from "lucide-react";
import { useAuth } from "../../hooks/UseAuth";
import {
  fetchClases,
  subirClase,
  crearClase,
} from "../../services/profesorServices/clasesService";

export default function Clases() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [clases, setClases] = useState([]);
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState("");
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingClases, setLoadingClases] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ materia: "", grupo: "", horario: "" });

  const handleFileChange = (e) => {
    setPdf(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");
    setError("");
    try {
      await subirClase({ pdf, texto });
      setMensaje("¡Clase subida correctamente!");
      setTexto("");
      setPdf(null);
      cargarClases();
    } catch (err) {
      console.error("Error:", err);
      setError("Error al subir la clase. Intenta nuevamente.");
    }
    setLoading(false);
  };

  // Cargar clases usando el servicio
  const cargarClases = async () => {
    try {
      console.log("=== CARGANDO CLASES EN COMPONENTE ===");
      console.log("Usuario actual:", usuario);

      const clasesData = await fetchClases(usuario?.token);

      console.log(" Clases recibidas en componente:", clasesData);
      console.log(" Tipo de datos:", typeof clasesData);
      console.log(" Es array?:", Array.isArray(clasesData));
      console.log(" Longitud:", clasesData?.length);

      // Mostrar detalles de cada clase
      if (Array.isArray(clasesData)) {
        clasesData.forEach((clase, index) => {
          console.log(
            `  ${index + 1}. ${clase.nombre || clase.materia} - ID: ${clase.id || clase._id} - Profesor: ${clase.profesor_id || clase.profesorId}`,
          );
        });
      }

      setClases(clasesData || []);
      console.log(
        " Clases establecidas en el estado:",
        clasesData?.length || 0,
      );
    } catch (error) {
      console.error(" Error cargando clases:", error);
      setError(
        "Error cargando clases: " + (error.message || "Error desconocido"),
      );
    } finally {
      setLoadingClases(false);
    }
  };

  useEffect(() => {
    cargarClases();
  }, []);

  // Crear nueva clase usando el servicio
  const handleCrearClase = async () => {
    try {
      await crearClase(form, usuario?.token);
      setOpen(false);
      setForm({ materia: "", grupo: "", horario: "" });
      cargarClases();
    } catch (error) {
      setError("Error creando clase");
    }
  };

  // Manejo del formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen p-6 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        {/* Sección de subir material */}
        <div className="mb-8 p-8 rounded-3xl shadow-2xl border-2 border-transparent bg-linear-to-br from-blue-50 to-indigo-50 hover:border-blue-300 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2 animate-bounce">📘</div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
              Subir Material de Clase
            </h2>
            <p className="text-gray-600">
              Sube el material de la clase del día en PDF o escríbelo
              manualmente.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 font-medium text-gray-700 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Subir PDF
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="block w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Contenido de la clase
              </label>
              <textarea
                className="w-full p-4 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all"
                rows={5}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escribe el contenido de la clase aquí..."
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center space-x-2"
              disabled={loading || (!pdf && !texto)}
            >
              <Upload className="w-4 h-4" />
              <span>{loading ? "Subiendo..." : "Subir Clase"}</span>
            </button>
            {mensaje && (
              <div className="p-4 mt-4 text-green-700 bg-green-100 border border-green-400 rounded-lg">
                {mensaje}
              </div>
            )}
            {error && (
              <div className="p-4 mt-4 text-red-700 bg-red-100 border border-red-400 rounded-lg">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Encabezado de clases */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">
            📖 Mis Clases
          </h1>
          <button
            onClick={() => setOpen(true)}
            className="px-6 py-3 text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Nueva Clase</span>
          </button>
        </div>

        {/* Listado de clases */}
        {loadingClases ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-blue-600">Cargando clases...</p>
          </div>
        ) : (
          <>
            {/* Debug info */}
            <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
              <h4 className="font-bold text-yellow-800 mb-2">🔍 Debug Info:</h4>
              <div>
                Estado loadingClases: {loadingClases ? "true" : "false"}
              </div>
              <div>Cantidad de clases en estado: {clases?.length || 0}</div>
              <div>
                Clases es array: {Array.isArray(clases) ? "true" : "false"}
              </div>
              <div>
                Primera clase:{" "}
                {clases[0] ? JSON.stringify(clases[0]) : "No hay clases"}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {clases.map((clase, index) => {
                console.log(`🔄 Renderizando clase ${index + 1}:`, clase);
                return (
                  <div
                    key={clase.id || clase._id || index}
                    className="p-6 bg-white rounded-2xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          {clase.nombre || clase.materia || "Sin nombre"}
                        </h3>
                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-700">
                          {clase.grupo || clase.curso || "Sin grupo"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          {clase.horario || "Sin horario"}
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          navigate(
                            `/profesor/estudiantes-clases/${clase.id || clase._id}`,
                          )
                        }
                        className="flex-1 px-3 py-2 text-blue-600 border-2 border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center justify-center gap-2"
                      >
                        <Users className="w-4 h-4" />
                        <span className="text-sm">Estudiantes</span>
                      </button>
                      <button
                        onClick={() =>
                          navigate(
                            `/profesor/evaluaciones-clase/${clase.id || clase._id}`,
                          )
                        }
                        className="flex-1 px-3 py-2 text-purple-600 border-2 border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">Evaluaciones</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Si no hay clases */}
        {!loadingClases && clases.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 animate-bounce">📚</div>
            <p className="text-xl text-gray-600">
              No tienes clases asignadas todavía.
            </p>
          </div>
        )}

        {/* Modal para crear clase */}
        {open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Crear Nueva Clase
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Materia
                  </label>
                  <input
                    type="text"
                    name="materia"
                    value={form.materia}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all"
                    placeholder="Nombre de la materia"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Grupo
                  </label>
                  <input
                    type="text"
                    name="grupo"
                    value={form.grupo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all"
                    placeholder="Ej: 3A, 2B"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Horario
                  </label>
                  <input
                    type="text"
                    name="horario"
                    value={form.horario}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all"
                    placeholder="Ej: Lunes 8:00 - 10:00"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 px-4 py-3 text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrearClase}
                  className="flex-1 px-4 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
