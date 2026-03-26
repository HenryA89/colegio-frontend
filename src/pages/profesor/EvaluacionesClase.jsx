import api from "../../services/api";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Card from "../../components/iu/Card";

// CardContent helper para mantener el código funcionando aunque no exista en Card.jsx
function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}
import Button from "../../components/iu/Button";
import Input from "../../components/iu/Input";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  DialogHeader,
  DialogFooter,
} from "../../components/iu/Dialog";
import { useAuth } from "../../hooks/UseAuth";

export default function EvaluacionesClase() {
  const { id } = useParams(); // id de la clase
  const { token } = useAuth();
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    fecha: "",
  });

  // 🔹 Cargar evaluaciones
  const fetchEvaluaciones = async () => {
    try {
      const res = await api.get(`/clases/${id}/evaluaciones`);
      setEvaluaciones(res.data.evaluaciones || []);
    } catch (error) {
      console.error("Error cargando evaluaciones", error);
    }
  };

  useEffect(() => {
    fetchEvaluaciones();
  }, [id]);

  // 🔹 Crear evaluación
  const handleCrearEvaluacion = async () => {
    try {
      await api.post(`/clases/${id}/evaluaciones`, { ...form });
      setOpen(false);
      setForm({ titulo: "", fecha: "" });
      fetchEvaluaciones();
    } catch (error) {
      console.error("Error creando evaluación", error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">📝 Evaluaciones</h1>
        <Button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Nueva Evaluación
        </Button>
      </div>

      <div className="grid gap-4">
        {evaluaciones.map((eva) => (
          <Card key={eva.id} className="shadow-md rounded-xl">
            <CardContent className="p-4">
              <h2 className="font-semibold text-neutral-800">{eva.titulo}</h2>
              <p className="text-sm text-neutral-600">📅 {eva.fecha}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {evaluaciones.length === 0 && (
        <p className="text-center text-neutral-500">
          No hay evaluaciones registradas para esta clase.
        </p>
      )}

      {/* 🔹 Modal crear evaluación */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Crear Nueva Evaluación"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Evaluación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Título"
              name="titulo"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />
            <Input
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleCrearEvaluacion}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
