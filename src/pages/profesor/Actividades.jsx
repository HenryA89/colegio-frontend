import { useState } from "react";
import Button from "../../components/iu/Button";
import Input from "../../components/iu/Input";
import api from "../../services/api";

export default function ActividadesProfesor() {
  const [enunciado, setEnunciado] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actividadGuardada, setActividadGuardada] = useState(false);

  const guardarActividad = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/crear-actividad-manual", {
        enunciado,
      });
      setActividadGuardada(true);
    } catch (err) {
      setError("No se pudo guardar la actividad. Intenta nuevamente.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl p-6 mx-auto">
      <h2 className="mb-4 text-2xl font-bold text-blue-700">
        📝 Crear Actividad Manual
      </h2>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">
          Enunciado de la actividad
        </label>
        <Input
          as="textarea"
          className="w-full p-3 border rounded-lg"
          rows={4}
          value={enunciado}
          onChange={(e) => setEnunciado(e.target.value)}
          placeholder="Describe el objetivo o contexto de la actividad"
        />
      </div>
      <Button
        onClick={guardarActividad}
        className="w-full py-2 text-white bg-blue-600"
        disabled={loading || !enunciado.trim()}
      >
        {loading ? "Guardando..." : "Guardar Actividad"}
      </Button>
      {actividadGuardada && (
        <div className="p-2 mt-4 text-green-700 bg-green-100 rounded">
          ¡Actividad guardada y enviada a los estudiantes!
        </div>
      )}
      {error && (
        <div className="p-2 mt-4 text-red-700 bg-red-100 rounded">{error}</div>
      )}
    </div>
  );
}
