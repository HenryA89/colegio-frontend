import { useState, useEffect } from "react";
import Card from "../../components/iu/Card";
import Button from "../../components/iu/Button";
import { PlusCircle, Users, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from "../../components/iu/Dialog";
import Input from "../../components/iu/Input";
import { useAuth } from "../../hooks/UseAuth";
import {
  fetchClases,
  subirClase,
  crearClase,
} from "../../services/profesorServices/clasesService";

export default function Clases() {
  const { usuario } = useAuth(); // Traemos el usuario completo
  const [clases, setClases] = useState([]);
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState("");
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(false);
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
      setError("Error al subir la clase. Intenta nuevamente.");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-xl">
      <h2 className="mb-4 text-2xl font-bold text-blue-600">
        📘 Subir Material de Clase
      </h2>
      <p className="mb-6 text-gray-600">
        Sube el material de la clase del día en PDF o escríbelo manualmente.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Subir PDF
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Subir clase manual
          </label>
          <textarea
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={5}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe el contenido de la clase aquí..."
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
          disabled={loading || (!pdf && !texto)}
        >
          {loading ? "Subiendo..." : "Subir Clase"}
        </button>
        {mensaje && (
          <div className="p-2 mt-2 text-green-700 bg-green-100 rounded">
            {mensaje}
          </div>
        )}
        {error && (
          <div className="p-2 mt-2 text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}
      </form>
    </div>
  );

  // Cargar clases usando el servicio
  const cargarClases = async () => {
    try {
      const clasesData = await fetchClases(usuario?.token);
      setClases(clasesData);
    } catch (error) {
      setError("Error cargando clases");
    }
  };

  useEffect(() => {
    cargarClases();
    // eslint-disable-next-line
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
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">📖 Mis Clases</h1>
        <Button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Nueva Clase
        </Button>
      </div>

      {/* Listado de clases */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {clases.map((clase) => (
          <Card key={clase.id} className="shadow-md rounded-xl">
            <CardContent className="p-4 space-y-2">
              <h2 className="text-lg font-semibold text-neutral-800">
                {clase.materia}
              </h2>
              <p className="text-sm text-neutral-600">Grupo: {clase.grupo}</p>
              <p className="text-sm text-neutral-600">
                Horario: {clase.horario}
              </p>

              {/* Acciones */}
              <div className="flex gap-3 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    (window.location.href = `/clases/${clase.id}/estudiantes`)
                  }
                  className="flex items-center gap-1"
                >
                  <Users className="w-4 h-4" />
                  Estudiantes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    (window.location.href = `/clases/${clase.id}/evaluaciones`)
                  }
                  className="flex items-center gap-1"
                >
                  <FileText className="w-4 h-4" />
                  Evaluaciones
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Si no hay clases */}
      {clases.length === 0 && (
        <p className="text-center text-neutral-500">
          No tienes clases asignadas todavía.
        </p>
      )}

      {/* 🔹 Modal para crear clase */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Clase</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Materia"
              name="materia"
              value={form.materia}
              onChange={handleChange}
            />
            <Input
              placeholder="Grupo"
              name="grupo"
              value={form.grupo}
              onChange={handleChange}
            />
            <Input
              placeholder="Horario (ej. Lunes 8:00 - 10:00)"
              name="horario"
              value={form.horario}
              onChange={handleChange}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleCrearClase}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
