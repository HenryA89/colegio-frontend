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
import { useMaterial } from "../../context/MaterialContext";
import {
  fetchClases,
  subirMaterial,
  crearClase,
} from "../../services/profesorServices/clasesService";

export default function Clases() {
  const { usuario } = useAuth();
  const { seleccionarMaterial } = useMaterial();
  const navigate = useNavigate();
  const [clases, setClases] = useState([]);
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState("");
  const [pdf, setPdf] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingClases, setLoadingClases] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ materia: "", grupo: "", horario: "" });

  // Estados para la creación de clase con texto
  const [nombreClase, setNombreClase] = useState("");
  const [mensajeTexto, setMensajeTexto] = useState("");
  const [errorTexto, setErrorTexto] = useState("");

  const handleFileChange = (e) => {
    setPdf(e.target.files[0]);
  };

  const handleCrearClaseConTexto = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensajeTexto("");
    setErrorTexto("");

    try {
      // Validar que se tenga nombre de clase y contenido
      if (!nombreClase.trim()) {
        setErrorTexto("Debes ingresar un nombre para la clase.");
        return;
      }

      if (!texto.trim()) {
        setErrorTexto("Debes escribir el contenido de la clase.");
        return;
      }

      console.log("✍️ Creando clase con texto:");
      console.log("  - nombreClase:", nombreClase);
      console.log("  - contenido:", texto.substring(0, 100) + "...");

      // Crear clase con el texto como contenido
      const nuevaClase = {
        nombre: nombreClase,
        materia: nombreClase,
        contenido: texto,
        descripcion: texto,
        tipo: "texto",
      };

      await crearClase(nuevaClase, usuario?.token);

      setMensajeTexto("¡Clase creada correctamente!");
      // Limpiar formulario
      setNombreClase("");
      setTexto("");

      // Clase creada exitosamente - sin redirección automática
      console.log(
        "✅ Clase creada correctamente - usuario puede navegar manualmente",
      );
    } catch (err) {
      console.error("Error:", err);
      setErrorTexto(`Error al crear la clase: ${err.message}`);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");
    setError("");

    try {
      console.log("📤 Iniciando subida de material");

      // Validar que se tenga un archivo PDF (único requisito)
      if (!pdf) {
        console.error("❌ No se proporcionó archivo PDF");
        setError("Debes seleccionar un archivo PDF para subir.");
        return;
      }

      console.log("📋 Enviando material:");
      console.log("  - pdf:", pdf.name);
      console.log("  - pdf tamaño:", pdf.size);
      console.log("  - pdf tipo:", pdf.type);

      // Obtener materia seleccionada para contexto (opcional)
      const materiaSeleccionada = JSON.parse(
        localStorage.getItem("materiaSeleccionada"),
      );
      console.log(
        "📚 Materia contexto:",
        materiaSeleccionada?.nombre || "Sin materia",
      );

      // Enviar archivo sin requerir clase específica
      const resultado = await subirMaterial({
        file: pdf,
        titulo: `Material - ${materiaSeleccionada?.nombre || "General"} - ${new Date().toLocaleDateString("es-ES")}`,
      });

      // Capturar y almacenar el material_clase_id usando el contexto
      if (resultado?.data?.material_id) {
        const materialData = {
          material_id: resultado.data.material_id,
          titulo: resultado.data.titulo || "Material sin título",
          archivo: resultado.data.archivo || pdf.name,
        };

        seleccionarMaterial(materialData);
        console.log("🎯 Material seleccionado en contexto:", materialData);

        // Notificar a todos los estudiantes que se subió un nuevo material
        window.dispatchEvent(
          new CustomEvent("materialSubido", {
            detail: materialData,
          }),
        );
      }

      setMensaje("¡Material subido correctamente!");
      // Limpiar formulario
      setTexto("");
      setPdf(null);
      setTitulo("");

      // Material subido exitosamente - con ID guardado para QuizAi
      console.log("✅ Material subido correctamente - ID guardado para QuizAi");
    } catch (err) {
      console.error("Error:", err);
      setError(`Error al subir el material: ${err.message}`);
    }
    setLoading(false);
  };

  // Cargar clases usando el servicio
  const cargarClases = async () => {
    try {
      console.log("=== CARGANDO CLASES EN COMPONENTE ===");
      console.log("Usuario actual:", usuario);

      // Obtener materia seleccionada desde localStorage
      const materiaSeleccionada = JSON.parse(
        localStorage.getItem("materiaSeleccionada"),
      );
      console.log("📚 Materia seleccionada:", materiaSeleccionada);

      if (!materiaSeleccionada) {
        console.warn(
          "⚠️ No hay materia seleccionada, cargando todas las clases",
        );
        const clasesData = await fetchClases(usuario?.token);
        setClases(clasesData || []);
      } else {
        console.log(
          "📖 Cargando clases para la materia:",
          materiaSeleccionada.nombre,
        );

        // Aquí deberíamos llamar a un servicio que obtenga clases por materia_id
        // Por ahora, usamos fetchClases como fallback
        const clasesData = await fetchClases(usuario?.token);

        // Filtrar clases por materia_id
        const clasesDeMateria = clasesData.filter(
          (clase) =>
            clase.materia_id === materiaSeleccionada.id ||
            clase.materia === materiaSeleccionada.nombre ||
            clase.nombre === materiaSeleccionada.nombre,
        );

        console.log("✅ Clases filtradas por materia:", clasesDeMateria.length);
        setClases(clasesDeMateria);
      }

      console.log("📋 Clases establecidas en el estado:", clases.length);
    } catch (error) {
      console.error("❌ Error cargando clases:", error);
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
        {/* Sección de subir material PDF */}
        <div className="mb-8 p-8 rounded-3xl shadow-2xl border-2 border-transparent bg-linear-to-br from-blue-50 to-indigo-50 hover:border-blue-300 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2 animate-bounce">�</div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
              Subir Material PDF
            </h2>
            <p className="text-gray-600">
              Sube el material de la clase en formato PDF.
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
              {pdf && (
                <div className="mt-2 text-sm text-green-600 flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  {pdf.name}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center space-x-2"
              disabled={loading || !pdf}
            >
              <Upload className="w-4 h-4" />
              <span>{loading ? "Subiendo..." : "Subir PDF"}</span>
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

        {/* Sección de crear clase con texto */}
        <div className="mb-8 p-8 rounded-3xl shadow-2xl border-2 border-transparent bg-linear-to-br from-green-50 to-emerald-50 hover:border-green-300 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2 animate-bounce">✍️</div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-green-600 to-emerald-600">
              Crear Clase con Texto
            </h2>
            <p className="text-gray-600">
              Crea una nueva clase escribiendo el contenido manualmente.
            </p>
          </div>
          <form onSubmit={handleCrearClaseConTexto} className="space-y-6">
            <div>
              <label className="flex mb-2 font-medium text-gray-700 items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Nombre de la Clase
              </label>
              <input
                type="text"
                value={nombreClase}
                onChange={(e) => setNombreClase(e.target.value)}
                placeholder="Ej: Matemáticas Avanzadas, Historia Universal..."
                className="block w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-400 transition-all"
              />
            </div>
            <div>
              <label className="flex mb-2 font-medium text-gray-700 items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Contenido de la clase
              </label>
              <textarea
                className="w-full p-4 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-400 transition-all"
                rows={8}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escribe el contenido de la clase aquí..."
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:bg-green-400 transition-colors flex items-center justify-center space-x-2"
              disabled={loading || !nombreClase || !texto}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loading ? "Creando..." : "Crear Clase"}</span>
            </button>
            {mensajeTexto && (
              <div className="p-4 mt-4 text-green-700 bg-green-100 border border-green-400 rounded-lg">
                {mensajeTexto}
              </div>
            )}
            {errorTexto && (
              <div className="p-4 mt-4 text-red-700 bg-red-100 border border-red-400 rounded-lg">
                {errorTexto}
              </div>
            )}
          </form>
        </div>

        {/* Encabezado de clases */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">
              📖 Mis Clases
            </h1>
            {JSON.parse(localStorage.getItem("materiaSeleccionada")) && (
              <p className="text-gray-600 mt-2">
                Materia:{" "}
                <span className="font-semibold text-purple-600">
                  {JSON.parse(localStorage.getItem("materiaSeleccionada"))
                    .nombre || "Sin nombre"}
                </span>
              </p>
            )}
          </div>
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
            {/* Info de estado */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-bold text-blue-800 mb-2">� Información:</h4>
              <div className="text-sm text-blue-700">
                <p>
                  • Puedes subir materiales PDF sin necesidad de tener clases
                  creadas
                </p>
                <p>
                  • Las clases se mostrarán si existen, pero no son requeridas
                  para subir material
                </p>
                <p>
                  • Estado:{" "}
                  {loadingClases
                    ? "Cargando clases..."
                    : `Clases disponibles: ${clases?.length || 0}`}
                </p>
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
                        onClick={() => {
                          // Guardar clase seleccionada en localStorage
                          localStorage.setItem(
                            "claseSeleccionada",
                            JSON.stringify(clase),
                          );
                          navigate(
                            `/profesor/acciones-clase/${clase.id || clase._id}`,
                          );
                        }}
                        className="flex-1 px-3 py-2 text-green-600 border-2 border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all flex items-center justify-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">Gestionar</span>
                      </button>
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
