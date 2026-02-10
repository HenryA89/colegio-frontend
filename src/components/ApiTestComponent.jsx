import React, { useState } from "react";
import {
  testApiConnection,
  testEndpoints,
  verifyConfiguration,
} from "../utils/apiTest";

const ApiTestComponent = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);

    const results = [];

    // Verificar configuración
    results.push({
      test: "Configuración de API",
      status: verifyConfiguration() ? "success" : "error",
      message: verifyConfiguration()
        ? "Configuración correcta"
        : "Configuración incorrecta",
    });

    // Probar conexión básica
    try {
      const connectionOk = await testApiConnection();
      results.push({
        test: "Conexión con API",
        status: connectionOk ? "success" : "error",
        message: connectionOk ? "Conexión exitosa" : "Error de conexión",
      });
    } catch (error) {
      results.push({
        test: "Conexión con API",
        status: "error",
        message: `Error: ${error.message}`,
      });
    }

    // Probar endpoints
    try {
      await testEndpoints();
      results.push({
        test: "Endpoints disponibles",
        status: "success",
        message: "Endpoints verificados (revisar consola para detalles)",
      });
    } catch (error) {
      results.push({
        test: "Endpoints disponibles",
        status: "error",
        message: `Error: ${error.message}`,
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-xl">
      <h2 className="mb-4 text-2xl font-bold text-blue-600">
        🔧 Pruebas de Conexión API
      </h2>
      <p className="mb-6 text-gray-600">
        Verifica que la conexión con la API esté funcionando correctamente.
      </p>

      <button
        onClick={runTests}
        disabled={loading}
        className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Ejecutando pruebas..." : "Ejecutar Pruebas"}
      </button>

      {testResults.length > 0 && (
        <div className="mt-6 space-y-2">
          <h3 className="text-lg font-semibold">Resultados:</h3>
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                result.status === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold">{result.test}:</span>
                <span>{result.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800">Información de la API:</h4>
        <p className="text-blue-700">URL Base: http://localhost:3000/api/v1</p>
        <p className="text-blue-700">
          Estado: {loading ? "Probando..." : "Listo para pruebas"}
        </p>
      </div>
    </div>
  );
};

export default ApiTestComponent;
