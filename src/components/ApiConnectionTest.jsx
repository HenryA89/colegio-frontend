import React, { useState } from "react";
import { useAuth } from "../hooks/UseAuth";
import api from "../services/api";

const ApiConnectionTest = () => {
  const { usuario } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const testApiConnection = async () => {
    setLoading(true);
    setTestResults([]);

    const results = [];

    // Verificar configuración
    results.push({
      test: "Configuración de API",
      status:
        api.defaults.baseURL === "http://localhost:3000/api/v1"
          ? "success"
          : "error",
      message:
        api.defaults.baseURL === "http://localhost:3000/api/v1"
          ? "URL correcta"
          : "URL incorrecta",
    });

    // Probar login
    if (loginData.email && loginData.password) {
      try {
        const response = await api.post("/login", loginData);
        results.push({
          test: "Login",
          status: "success",
          message: `Login exitoso: ${response.data.message || "OK"}`,
        });
      } catch (error) {
        results.push({
          test: "Login",
          status: "error",
          message: `Error: ${error.response?.data?.error || error.message}`,
        });
      }
    }

    // Probar endpoints con token
    if (usuario?.token) {
      try {
        const response = await api.get("/dashboard");
        results.push({
          test: "Dashboard",
          status: "success",
          message: "Dashboard accesible",
        });
      } catch (error) {
        results.push({
          test: "Dashboard",
          status: "error",
          message: `Error: ${error.response?.data?.error || error.message}`,
        });
      }
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-xl">
      <h2 className="mb-4 text-2xl font-bold text-blue-600">
        🔧 Pruebas de Conexión API
      </h2>

      <div className="mb-6 space-y-4">
        <div>
          <label className="block mb-2 text-sm font-medium">
            Email para prueba:
          </label>
          <input
            type="email"
            value={loginData.email}
            onChange={(e) =>
              setLoginData({ ...loginData, email: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="admin@admin.com"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium">Contraseña:</label>
          <input
            type="password"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="admin123"
          />
        </div>
      </div>

      <button
        onClick={testApiConnection}
        disabled={loading}
        className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Probando..." : "Probar Conexión"}
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
        <h4 className="font-semibold text-blue-800">Estado actual:</h4>
        <p className="text-blue-700">URL Base: {api.defaults.baseURL}</p>
        <p className="text-blue-700">
          Usuario logueado: {usuario ? "Sí" : "No"}
        </p>
        <p className="text-blue-700">
          Token: {usuario?.token ? "Presente" : "No presente"}
        </p>
      </div>
    </div>
  );
};

export default ApiConnectionTest;
