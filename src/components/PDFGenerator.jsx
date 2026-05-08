import React, { useState } from "react";
import { pdfService } from "../services/pdfService";

/**
 * Componente para generar PDFs con diferentes opciones
 * Proporciona una interfaz unificada para generar documentos PDF
 */
export default function PDFGenerator({
  type = "element",
  data = {},
  elementId = null,
  filename = "documento.pdf",
  onGenerate = null,
  className = "",
  children,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGeneratePDF = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let result;

      switch (type) {
        case "grades":
          result = pdfService.generateGradesPDF(data, filename);
          break;

        case "attendance":
          result = pdfService.generateAttendancePDF(data, filename);
          break;

        case "custom":
          result = await pdfService.generateCustomPDF(
            data.htmlContent,
            filename,
            data.options,
          );
          break;

        case "table":
          result = pdfService.generateTablePDF(
            data.tableData,
            filename,
            data.options,
          );
          break;

        case "element":
        default:
          if (!elementId) {
            throw new Error(
              "Se requiere elementId para generar PDF desde elemento",
            );
          }
          result = await pdfService.generatePDFFromElement(
            elementId,
            filename,
            data.options,
          );
          break;
      }

      if (result.success) {
        if (onGenerate) {
          onGenerate(result);
        }
        // Mostrar notificación de éxito
        showNotification("PDF generado exitosamente", "success");
      } else {
        throw new Error(result.error || "Error al generar PDF");
      }
    } catch (err) {
      setError(err.message);
      showNotification("Error al generar PDF: " + err.message, "error");
      if (onGenerate) {
        onGenerate({ success: false, error: err.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type = "info") => {
    // Crear notificación simple (puedes reemplazar con tu sistema de notificaciones)
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === "success"
        ? "bg-green-500 text-white"
        : type === "error"
          ? "bg-red-500 text-white"
          : "bg-blue-500 text-white"
    }`;
    notification.textContent = message;
    notification.style.zIndex = "9999";

    document.body.appendChild(notification);

    // Remover notificación después de 3 segundos
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  return (
    <div className={`pdf-generator ${className}`}>
      {children ? (
        // Si hay children, renderizar el botón con el contenido personalizado
        <button
          onClick={handleGeneratePDF}
          disabled={isLoading}
          className={`
            flex items-center gap-2 px-4 py-2 
            ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } 
            rounded-lg font-medium transition-colors duration-200 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          `}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8 8 8 0 018 8z"
                />
              </svg>
              <span>Generando...</span>
            </>
          ) : (
            children
          )}
        </button>
      ) : (
        // Botón por defecto
        <button
          onClick={handleGeneratePDF}
          disabled={isLoading}
          className={`
            flex items-center gap-2 px-4 py-2 
            ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } 
            rounded-lg font-medium transition-colors duration-200 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          `}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3 3m3-3l3 3m2 8H7a2 2 0 01-2-2v-5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {isLoading ? "Generando..." : "Generar PDF"}
        </button>
      )}

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Componente específico para generar PDF de calificaciones
 */
export function GradesPDFGenerator({
  gradesData,
  filename = "calificaciones.pdf",
}) {
  return (
    <PDFGenerator
      type="grades"
      data={gradesData}
      filename={filename}
      className="w-full"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Descargar Reporte de Calificaciones
    </PDFGenerator>
  );
}

/**
 * Componente específico para generar reportes de asistencia
 */
export function AttendancePDFGenerator({
  attendanceData,
  filename = "asistencia.pdf",
}) {
  return (
    <PDFGenerator
      type="attendance"
      data={attendanceData}
      filename={filename}
      className="w-full"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      Descargar Reporte de Asistencia
    </PDFGenerator>
  );
}

/**
 * Componente para generar PDF desde elemento HTML
 */
export function ElementPDFGenerator({
  elementId,
  filename = "documento.pdf",
  className = "",
}) {
  return (
    <PDFGenerator
      type="element"
      elementId={elementId}
      filename={filename}
      className={className}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3 3m3-3l3 3m2 8H7a2 2 0 01-2-2v-5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Exportar a PDF
    </PDFGenerator>
  );
}
