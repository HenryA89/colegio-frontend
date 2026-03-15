import React, { useState } from 'react';
import { TablePDFGenerator } from '../components/PDFGenerator';

export default function TablaEjemplo() {
  const [tablaData, setTablaData] = useState({
    title: "Reporte de Estudiantes",
    subtitle: "Listado completo de estudiantes del curso",
    headers: ["Nombre", "Edad", "Curso", "Promedio", "Estado"],
    rows: [
      ["Juan Pérez", "15", "10° A", "85.5", "Aprobado"],
      ["María García", "16", "10° A", "92.3", "Aprobado"],
      ["Carlos López", "15", "10° B", "68.7", "Reprobado"],
      ["Ana Martínez", "16", "10° B", "78.9", "Aprobado"],
      ["Pedro Rodríguez", "15", "10° A", "95.2", "Aprobado"],
      ["Laura Sánchez", "16", "10° B", "88.4", "Aprobado"],
      ["Diego Fernández", "15", "10° A", "72.1", "Aprobado"],
      ["Sofía Torres", "16", "10° B", "91.7", "Aprobado"],
    ],
    footer: "Total de 8 estudiantes registrados"
  });

  const [customOptions, setCustomOptions] = useState({
    columnStyles: {
      0: { cellWidth: 60 }, // Nombre
      1: { cellWidth: 20, halign: "center" }, // Edad
      2: { cellWidth: 30, halign: "center" }, // Curso
      3: { cellWidth: 30, halign: "center" }, // Promedio
      4: { cellWidth: 40, halign: "center" }, // Estado
    },
    headStyles: {
      fillColor: [59, 130, 246], // Azul
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Gris muy claro
    },
  });

  const handleAddRow = () => {
    const nuevoEstudiante = [
      "Nuevo Estudiante",
      "15",
      "10° C",
      (Math.random() * 40 + 60).toFixed(1),
      Math.random() > 0.3 ? "Aprobado" : "Reprobado"
    ];
    
    setTablaData(prev => ({
      ...prev,
      rows: [...prev.rows, nuevoEstudiante]
    }));
  };

  const handleRemoveRow = (index) => {
    setTablaData(prev => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== index),
      footer: `Total de ${prev.rows.length - 1} estudiantes registrados`
    }));
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        <div className="educational-card p-8 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-green-400 to-blue-600 rounded-xl text-white text-4xl">
                📊
              </div>
              <div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                  Ejemplo de Tablas PDF
                </h2>
                <p className="text-sm text-gray-600">
                  Demostración de jspdf-autotable con tablas personalizadas
                </p>
              </div>
            </div>
            <TablePDFGenerator 
              tableData={tablaData} 
              options={customOptions}
              filename={`tabla-estudiantes-${new Date().toISOString().split('T')[0]}.pdf`}
              className="bg-green-600 hover:bg-green-700"
            />
          </div>

          <div className="mb-6">
            <div className="flex gap-4 mb-4">
              <button
                onClick={handleAddRow}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Agregar Fila
              </button>
              <div className="text-sm text-gray-600 flex items-center">
                Total de estudiantes: {tablaData.rows.length}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
              <thead className="bg-blue-600 text-white">
                <tr>
                  {tablaData.headers.map((header, index) => (
                    <th key={index} className="px-4 py-3 text-left font-semibold">
                      {header}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {tablaData.rows.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex} 
                    className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3 border-b border-gray-200">
                        {cell}
                      </td>
                    ))}
                    <td className="px-4 py-3 border-b border-gray-200 text-center">
                      <button
                        onClick={() => handleRemoveRow(rowIndex)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Características de la Tabla PDF:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Encabezado con fondo azul y texto blanco</li>
              <li>Filas alternadas con colores diferentes</li>
              <li>Bordes y espaciado profesional</li>
              <li>Alineación personalizada por columna</li>
              <li>Estadísticas automáticas de calificaciones</li>
              <li>Pie de página con información adicional</li>
            </ul>
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Configuración de Autotable:</h3>
            <pre className="text-xs bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
{`// Opciones de configuración
{
  theme: "grid",
  headStyles: {
    fillColor: [59, 130, 246], // Azul
    textColor: 255,
    fontStyle: "bold",
    halign: "center"
  },
  alternateRowStyles: {
    fillColor: [248, 250, 252] // Gris claro
  },
  columnStyles: {
    0: { cellWidth: 60 },    // Nombre
    1: { cellWidth: 20 },    // Edad
    2: { cellWidth: 30 },    // Curso
    3: { cellWidth: 30 },    // Promedio
    4: { cellWidth: 40 }     // Estado
  }
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
