import { useState, useEffect } from "react";
import { fetchClases } from "../profesorServices/clasesService";
import { 
  inscribirEstudiantesAutomaticamente, 
  fetchEstudiantesPorClase,
  inscribirEstudiante,
  eliminarEstudianteDeClase
} from "../profesorServices/estudiantesClasesService";
import { fetchUsuarios } from "../adminServices/usuariosService";
import { Users, UserPlus, UserMinus, BookOpen, GraduationCap, AlertCircle, CheckCircle } from "lucide-react";

export default function GestionInscripciones() {
  const [clases, setClases] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [claseSeleccionada, setClaseSeleccionada] = useState(null);
  const [estudiantesClase, setEstudiantesClase] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mostrarModalInscribir, setMostrarModalInscribir] = useState(false);
  const [mostrarModalAuto, setMostrarModalAuto] = useState(false);
  const [estudiantesDisponibles, setEstudiantesDisponibles] = useState([]);
  const [nuevoEstudiante, setNuevoEstudiante] = useState({
    nombre: "",
    email: "",
    grado: ""
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      const [clasesData, estudiantesData] = await Promise.all([
        fetchClases(),
        fetchUsuarios(localStorage.getItem("token"))
      ]);
      
      setClases(clasesData);
      // Filtrar solo estudiantes
      const estudiantesFiltrados = Array.isArray(estudiantesData) 
        ? estudiantesData.filter(u => u.rol === "estudiante")
        : (estudiantesData?.usuarios?.filter(u => u.rol === "estudiante") || []);
      setEstudiantes(estudiantesFiltrados);
    } catch (error) {
      console.error("Error cargando datos iniciales:", error);
      setError("Error al cargar datos iniciales");
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarClase = async (clase) => {
    try {
      setLoading(true);
      setClaseSeleccionada(clase);
      await cargarEstudiantesDeClase(clase.id);
    } catch (error) {
      console.error("Error seleccionando clase:", error);
      setError("Error al seleccionar la clase");
    } finally {
      setLoading(false);
    }
  };

  const cargarEstudiantesDeClase = async (claseId) => {
    try {
      const estudiantesData = await fetchEstudiantesPorClase(claseId);
      setEstudiantesClase(Array.isArray(estudiantesData) ? estudiantesData : []);
    } catch (error) {
      console.error("Error cargando estudiantes de la clase:", error);
      setEstudiantesClase([]);
    }
  };

  const handleInscripcionAutomatica = async () => {
    if (!claseSeleccionada) return;

    try {
      setLoading(true);
      const resultado = await inscribirEstudiantesAutomaticamente(
        claseSeleccionada.id,
        claseSeleccionada.curso || claseSeleccionada.grado
      );

      setSuccess(`✅ ${resultado.mensaje || "Estudiantes inscritos automáticamente"}`);
      setMostrarModalAuto(false);
      await cargarEstudiantesDeClase(claseSeleccionada.id);
      
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      setError(`Error en inscripción automática: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInscribirEstudiante = async () => {
    if (!claseSeleccionada || !nuevoEstudiante.nombre || !nuevoEstudiante.email) {
      setError("Por favor completa todos los campos");
      return;
    }

    try {
      setLoading(true);
      await inscribirEstudiante(claseSeleccionada.id, nuevoEstudiante);
      
      setSuccess("✅ Estudiante inscrito correctamente");
      setMostrarModalInscribir(false);
      setNuevoEstudiante({ nombre: "", email: "", grado: "" });
      await cargarEstudiantesDeClase(claseSeleccionada.id);
      
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      setError(`Error inscribiendo estudiante: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarEstudiante = async (estudianteId) => {
    if (!window.confirm("¿Estás seguro de eliminar este estudiante de la clase?")) return;

    try {
      setLoading(true);
      await eliminarEstudianteDeClase(claseSeleccionada.id, estudianteId);
      
      setSuccess("✅ Estudiante eliminado de la clase");
      await cargarEstudiantesDeClase(claseSeleccionada.id);
      
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      setError(`Error eliminando estudiante: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstudiantesDisponibles = async () => {
    if (!claseSeleccionada) return;

    try {
      setLoading(true);
      const grado = claseSeleccionada.curso || claseSeleccionada.grado;
      
      // Filtrar estudiantes del grado que no están inscritos
      const disponibles = estudiantes.filter(est => 
        est.grado === grado && 
        !estudiantesClase.some(inscrito => inscrito.id === est.id)
      );
      
      setEstudiantesDisponibles(disponibles);
    } catch (error) {
      console.error("Error cargando estudiantes disponibles:", error);
      setError("Error al cargar estudiantes disponibles");
    } finally {
      setLoading(false);
    }
  };

  const handleInscribirVariosEstudiantes = async (estudiantesSeleccionados) => {
    if (!claseSeleccionada || estudiantesSeleccionados.length === 0) return;

    try {
      setLoading(true);
      const inscripciones = estudiantesSeleccionados.map(estudiante =>
        inscribirEstudiante(claseSeleccionada.id, {
          nombre: estudiante.nombre,
          email: estudiante.email,
          grado: estudiante.grado
        })
      );

      await Promise.all(inscripciones);

      setSuccess(`✅ ${estudiantesSeleccionados.length} estudiantes inscritos correctamente`);
      setMostrarModalAuto(false);
      setEstudiantesDisponibles([]);
      await cargarEstudiantesDeClase(claseSeleccionada.id);
      
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      setError(`Error inscribiendo estudiantes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && clases.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-linear-to-br from-purple-50 via-pink-50 to-rose-50">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🎓</div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600">
            Gestión de Inscripciones
          </h1>
          <p className="text-gray-600 mt-2">
            Administra las inscripciones de estudiantes en todas las clases
          </p>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Clases */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Clases Disponibles
              </h2>
              
              <div className="space-y-2">
                {clases.map((clase) => (
                  <div
                    key={clase.id}
                    onClick={() => handleSeleccionarClase(clase)}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      claseSeleccionada?.id === clase.id
                        ? "bg-purple-100 border-2 border-purple-400"
                        : "bg-gray-50 border-2 border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="font-semibold text-gray-800">{clase.materia}</div>
                    <div className="text-sm text-gray-600">
                      {clase.curso || clase.grado} - {clase.grupo || "Grupo A"}
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      {estudiantesClase.filter(e => e.clase_id === clase.id).length} estudiantes
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detalles y Acciones */}
          <div className="lg:col-span-2">
            {claseSeleccionada ? (
              <div className="space-y-6">
                {/* Información de la Clase */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    {claseSeleccionada.materia}
                  </h2>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="text-blue-600 text-sm font-medium mb-1">Curso</div>
                      <div className="text-gray-800 font-semibold">
                        {claseSeleccionada.curso || claseSeleccionada.grado}
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="text-green-600 text-sm font-medium mb-1">Grupo</div>
                      <div className="text-gray-800 font-semibold">
                        {claseSeleccionada.grupo || "Grupo A"}
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                      <div className="text-purple-600 text-sm font-medium mb-1">Inscritos</div>
                      <div className="text-gray-800 font-semibold">
                        {estudiantesClase.length} estudiantes
                      </div>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setMostrarModalInscribir(true)}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Inscribir Estudiante
                    </button>
                    <button
                      onClick={() => {
                        setMostrarModalAuto(true);
                        cargarEstudiantesDisponibles();
                      }}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Inscripción Masiva
                    </button>
                  </div>
                </div>

                {/* Lista de Estudiantes Inscritos */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Estudiantes Inscritos ({estudiantesClase.length})
                  </h3>
                  
                  {estudiantesClase.length > 0 ? (
                    <div className="space-y-2">
                      {estudiantesClase.map((estudiante) => (
                        <div
                          key={estudiante.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                        >
                          <div>
                            <div className="font-semibold text-gray-800">{estudiante.nombre}</div>
                            <div className="text-sm text-gray-600">{estudiante.email}</div>
                          </div>
                          <button
                            onClick={() => handleEliminarEstudiante(estudiante.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>No hay estudiantes inscritos en esta clase</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 border-2 border-purple-200 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Selecciona una Clase
                </h3>
                <p className="text-gray-600">
                  Elige una clase para ver y gestionar sus estudiantes inscritos
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Inscribir Estudiante Individual */}
        {mostrarModalInscribir && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Inscribir Nuevo Estudiante
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={nuevoEstudiante.nombre}
                    onChange={(e) => setNuevoEstudiante({...nuevoEstudiante, nombre: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400"
                    placeholder="Nombre del estudiante"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={nuevoEstudiante.email}
                    onChange={(e) => setNuevoEstudiante({...nuevoEstudiante, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400"
                    placeholder="email@ejemplo.com"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Grado
                  </label>
                  <input
                    type="text"
                    value={nuevoEstudiante.grado}
                    onChange={(e) => setNuevoEstudiante({...nuevoEstudiante, grado: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400"
                    placeholder="10°"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setMostrarModalInscribir(false);
                    setNuevoEstudiante({ nombre: "", email: "", grado: "" });
                  }}
                  className="flex-1 px-4 py-3 text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleInscribirEstudiante}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? "Inscribiendo..." : "Inscribir"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Inscripción Masiva */}
        {mostrarModalAuto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Inscripción Masiva de Estudiantes
              </h3>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">
                  📋 ¿Qué hará esta función?
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✅ Inscribirá automáticamente todos los estudiantes del grado correspondiente</li>
                  <li>✅ Evita la inscripción manual individual</li>
                  <li>✅ Sincroniza los estudiantes creados por el administrador</li>
                  <li>⚠️ Los estudiantes ya inscritos no se duplicarán</li>
                </ul>
              </div>

              {/* Estudiantes Disponibles */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Estudiantes disponibles para inscribir: {estudiantesDisponibles.length}
                </h4>
                
                {estudiantesDisponibles.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {estudiantesDisponibles.map((estudiante) => (
                      <div key={estudiante.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                          <div className="font-semibold text-gray-800">{estudiante.nombre}</div>
                          <div className="text-sm text-gray-600">{estudiante.email}</div>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {estudiante.grado}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No hay estudiantes disponibles para inscribir
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setMostrarModalAuto(false);
                    setEstudiantesDisponibles([]);
                  }}
                  className="flex-1 px-4 py-3 text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleInscripcionAutomatica}
                  disabled={loading || estudiantesDisponibles.length === 0}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? "Procesando..." : `Inscribir ${estudiantesDisponibles.length} estudiantes`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
