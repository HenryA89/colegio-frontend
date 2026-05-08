import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Brain,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { obtenerMaterialesPorClase } from "../../services/materialesService";

export default function GenerarQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    if (id) {
      cargarMateriales();
    }
  }, [id]);

  const cargarMateriales = async () => {
    try {
      setLoading(true);
      console.log("🔍 Cargando materiales para clase:", id);
      
      const materialesData = await obtenerMaterialesPorClase(id);
      setMateriales(materialesData || []);
      console.log("✅ Materiales cargados:", materialesData?.length || 0);
    } catch (err) {
      console.error("❌ Error cargando materiales:", err);
      setError("No se pudieron cargar los materiales de esta clase");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarQuiz = async () => {
    if (!seleccionado) {
      setError("Debes seleccionar un material para generar el quiz");
      return;
    }

    try {
      setGenerando(true);
      setError("");
      
      console.log("🤖 Generando quiz para material:", seleccionado.id);
      
      // Aquí iría la llamada al backend para generar el quiz
      // Por ahora, simulamos que se genera y redirigimos
      const response = await fetch(`/api/v1/materiales/${seleccionado.id}/generar-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error generando el quiz');
      }
      
      const data = await response.json();
      console.log("✅ Quiz generado:", data);
      
      // Redirigir al QuizAi con el ID del quiz generado
      navigate(`/profesor/quiz-ai/${data.quiz_id}`);
      
    } catch (err) {
      console.error("❌ Error generando quiz:", err);
      setError("No se pudo generar el quiz. Intenta nuevamente.");
    } finally {
      setGenerando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-purple-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Cargando materiales</h2>
          <p className="text-gray-400">Buscando contenido para generar el quiz...</p>
        </div>
      </div>
    );
  }

  if (materiales.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black flex items-center justify-center p-6">
        <div className="text-center max-w-2xl">
          <FileText className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Sin materiales disponibles</h2>
          <p className="text-gray-300 mb-8">
            No hay materiales PDF en esta clase para generar un quiz. 
            Primero sube un material y luego intenta generar el quiz.
          </p>
          <button
            onClick={() => navigate(`/profesor/clases?id=${id}`)}
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 mx-auto"
          >
            <ArrowRight className="w-5 h-5" />
            Subir Material
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center items-center gap-6 mb-6">
            <Brain className="w-16 h-16 text-purple-400 animate-pulse" />
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Generar Quiz IA
            </h1>
            <Brain className="w-16 h-16 text-pink-400 animate-pulse" />
          </div>
          <p className="text-gray-300 text-lg">
            Selecciona un material para generar un quiz inteligente
          </p>
        </div>

        {/* Lista de materiales */}
        <div className="space-y-4 mb-8">
          {materiales.map((material) => (
            <div
              key={material.id}
              onClick={() => setSeleccionado(material)}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                seleccionado?.id === material.id
                  ? "border-purple-500 bg-purple-500/20"
                  : "border-gray-600 bg-gray-800/50 hover:border-purple-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <FileText className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {material.titulo}
                    </h3>
                    <div className="flex items-center gap-4 text-gray-400 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(material.created_at).toLocaleDateString()}
                      </span>
                      <span>PDF</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {seleccionado?.id === material.id && (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  )}
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    seleccionado?.id === material.id
                      ? "border-purple-500 bg-purple-500"
                      : "border-gray-400"
                  }`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-2xl text-red-200 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Botón generar */}
        <div className="text-center">
          <button
            onClick={handleGenerarQuiz}
            disabled={!seleccionado || generando}
            className="px-12 py-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition-all text-white font-bold text-xl shadow-2xl disabled:opacity-50 disabled:scale-100 flex items-center gap-3 mx-auto"
          >
            {generando ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Generando Quiz...
              </>
            ) : (
              <>
                <Brain className="w-6 h-6" />
                Generar Quiz IA
              </>
            )}
          </button>
          
          <p className="text-gray-400 mt-4 text-sm">
            El quiz se generará automáticamente usando IA a partir del contenido del material
          </p>
        </div>
      </div>
    </div>
  );
}
