import React, { useState, useEffect } from "react";
import {
  diagnosticarConexionDB,
  ejecutarDiagnosticoAutomatico,
} from "../utils/dbDiagnostics";
import {
  probarConexionRender,
  pruebaRapidaRender,
  mostrarEstadoConexion,
} from "../utils/renderConnectionTest";

export default function DatabaseDiagnostics() {
  const [diagnosticos, setDiagnosticos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRun, setAutoRun] = useState(true);

  useEffect(() => {
    if (autoRun) {
      ejecutarDiagnosticoCompleto();
    }
  }, [autoRun]);

  const ejecutarDiagnosticoCompleto = async () => {
    setLoading(true);
    try {
      const resultados = await ejecutarDiagnosticoAutomatico();
      setDiagnosticos(resultados);
    } catch (error) {
      console.error("Error en diagnóstico:", error);
      setDiagnosticos({
        exito: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const ejecutarDiagnosticoRender = async () => {
    setLoading(true);
    try {
      const resultados = await probarConexionRender();
      setDiagnosticos(resultados);
    } catch (error) {
      console.error("Error en diagnóstico Render:", error);
      setDiagnosticos({
        exito: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const ejecutarPruebaRapida = async () => {
    setLoading(true);
    try {
      const resultado = await pruebaRapidaRender();
      setDiagnosticos({
        exito: resultado.exito,
        timestamp: new Date().toISOString(),
        pruebas: [
          {
            nombre: "Prueba Rápida Render",
            endpoint: "/health",
            estado: resultado.exito ? "✅ Éxito" : "❌ Error",
            tiempo: resultado.tiempo,
            status: resultado.status,
            error: resultado.error,
          },
        ],
        backend: "https://colegio-backend-ia.onrender.com",
        resumen: {
          exitosas: resultado.exito ? 1 : 0,
          totales: 1,
          porcentaje: resultado.exito ? 100 : 0,
        },
      });
    } catch (error) {
      console.error("Error en prueba rápida:", error);
      setDiagnosticos({
        exito: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const mostrarEstado = () => {
    const estado = mostrarEstadoConexion();
    console.log("Estado de conexión:", estado);
    setDiagnosticos({
      exito: true,
      timestamp: new Date().toISOString(),
      pruebas: [
        {
          nombre: "Estado Conexión",
          estado: "✅ Verificado",
          config: estado,
        },
      ],
      backend: estado.baseURL,
      resumen: {
        exitosas: 1,
        totales: 1,
        porcentaje: 100,
      },
    });
  };

  const ejecutarDiagnosticoManual = async () => {
    setLoading(true);
    try {
      const resultados = await diagnosticarConexionDB();
      setDiagnosticos(resultados);
    } catch (error) {
      console.error("Error en diagnóstico manual:", error);
      setDiagnosticos({
        exito: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const limpiarResultados = () => {
    setDiagnosticos(null);
  };

  const getStatusColor = (exito) => {
    return exito ? "text-green-600" : "text-red-600";
  };

  const getStatusIcon = (exito) => {
    return exito ? "✅" : "❌";
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto">
        <div className="educational-card p-8 rounded-3xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl text-white text-4xl">
                🗄️
              </div>
              <div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Diagnóstico de Base de Datos Render
                </h2>
                <p className="text-sm text-gray-600">
                  Verifica la conexión entre frontend y backend en Render.com
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={ejecutarDiagnosticoCompleto}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg disabled:opacity-50"
              >
                {loading ? "🔄 Diagnosticando..." : "🔍 Diagnóstico General"}
              </button>
              <button
                onClick={ejecutarDiagnosticoRender}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg disabled:opacity-50"
              >
                {loading ? "🔄 Probando..." : "🚀 Probar Render"}
              </button>
              <button
                onClick={ejecutarPruebaRapida}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg disabled:opacity-50"
              >
                {loading ? "🔄 Probando..." : "⚡ Prueba Rápida"}
              </button>
              <button
                onClick={mostrarEstado}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg"
              >
                📋 Estado Conexión
              </button>
              <button
                onClick={limpiarResultados}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                🗑️ Limpiar
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Ejecutando diagnóstico...</p>
            </div>
          )}

          {/* Resultados */}
          {diagnosticos && !loading && (
            <div className="space-y-6">
              {/* Resumen General */}
              <div
                className={`p-6 rounded-xl border-2 ${
                  diagnosticos.exito
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">
                      {getStatusIcon(diagnosticos.exito)}
                    </span>
                    <div>
                      <h3
                        className={`text-xl font-bold ${getStatusColor(diagnosticos.exito)}`}
                      >
                        {diagnosticos.exito
                          ? "Conexión Exitosa"
                          : "Hay Problemas"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {diagnosticos.exito
                          ? "Todos los endpoints están funcionando correctamente"
                          : "Se detectaron problemas en la conexión"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {diagnosticos.timestamp &&
                        new Date(diagnosticos.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estadísticas */}
              {diagnosticos.totalPruebas !== undefined && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {diagnosticos.totalPruebas}
                    </div>
                    <div className="text-sm text-gray-600">
                      Pruebas Realizadas
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {diagnosticos.totalPruebas -
                        (diagnosticos.totalErrores || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Exitosas</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {diagnosticos.totalErrores || 0}
                    </div>
                    <div className="text-sm text-gray-600">Errores</div>
                  </div>
                </div>
              )}

              {/* Detalles de Pruebas */}
              {diagnosticos.pruebas && diagnosticos.pruebas.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
                    <h3 className="text-lg font-semibold">
                      Detalles de Pruebas
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {diagnosticos.pruebas.map((prueba, index) => (
                      <div key={index} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{prueba.estado}</span>
                              <span className="font-medium text-gray-900">
                                {prueba.nombre}
                              </span>
                            </div>
                            {prueba.endpoint && (
                              <p className="text-sm text-gray-600 mt-1">
                                Endpoint:{" "}
                                <code className="bg-gray-100 px-2 py-1 rounded">
                                  {prueba.endpoint}
                                </code>
                              </p>
                            )}
                            {prueba.mensaje && (
                              <p className="text-sm text-gray-600 mt-1">
                                {prueba.mensaje}
                              </p>
                            )}
                          </div>
                          {prueba.timestamp && (
                            <div className="text-right">
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  prueba.timestamp,
                                ).toLocaleTimeString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errores */}
              {diagnosticos.errores && diagnosticos.errores.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-4">
                    <h3 className="text-lg font-semibold">
                      Errores Detectados
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {diagnosticos.errores.map((error, index) => (
                      <div key={index} className="p-4 bg-red-50">
                        <div className="flex items-start space-x-2">
                          <span className="text-red-600 mt-1">❌</span>
                          <div className="flex-1">
                            <div className="font-medium text-red-900">
                              {error.prueba}
                            </div>
                            <div className="text-sm text-red-700 mt-1">
                              {error.error}
                            </div>
                            {error.codigo && (
                              <div className="text-sm text-red-600 mt-1">
                                Código HTTP:{" "}
                                <span className="font-mono bg-red-100 px-2 py-1 rounded">
                                  {error.codigo}
                                </span>
                              </div>
                            )}
                            {error.endpoint && (
                              <div className="text-sm text-red-600 mt-1">
                                Endpoint:{" "}
                                <code className="font-mono bg-red-100 px-2 py-1 rounded">
                                  {error.endpoint}
                                </code>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Configuración */}
              {diagnosticos.pruebas &&
                diagnosticos.pruebas.find(
                  (p) => p.nombre === "Configuración API",
                ) && (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-600 to-gray-800 text-white p-4">
                      <h3 className="text-lg font-semibold">
                        Configuración Actual
                      </h3>
                    </div>
                    <div className="p-4">
                      {diagnosticos.pruebas.find(
                        (p) => p.nombre === "Configuración API",
                      ).config && (
                        <div className="space-y-3">
                          <div>
                            <span className="font-medium text-gray-700">
                              Base URL:
                            </span>
                            <code className="ml-2 bg-gray-100 px-3 py-1 rounded text-sm">
                              {
                                diagnosticos.pruebas.find(
                                  (p) => p.nombre === "Configuración API",
                                ).config.baseURL
                              }
                            </code>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Headers:
                            </span>
                            <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                              {JSON.stringify(
                                diagnosticos.pruebas.find(
                                  (p) => p.nombre === "Configuración API",
                                ).config.headers,
                                null,
                                2,
                              )}
                            </pre>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Token:
                            </span>
                            <span
                              className={`ml-2 px-3 py-1 rounded text-sm ${
                                diagnosticos.pruebas.find(
                                  (p) => p.nombre === "Configuración API",
                                ).config.tieneToken
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {diagnosticos.pruebas.find(
                                (p) => p.nombre === "Configuración API",
                              ).config.tieneToken
                                ? "✅ Presente"
                                : "❌ Ausente"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Instrucciones */}
          <div className="mt-8 p-6 bg-blue-50 rounded-xl">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              🔧 Recomendaciones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-700 mb-2">
                  Si hay errores:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Verifica que el backend esté corriendo</li>
                  <li>Confirma la URL del servidor</li>
                  <li>Revisa los endpoints en el backend</li>
                  <li>Verifica la configuración CORS</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-700 mb-2">
                  Si todo funciona:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>La conexión a la BD es correcta</li>
                  <li>Los endpoints están activos</li>
                  <li>La autenticación funciona</li>
                  <li>La aplicación está lista para producción</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
