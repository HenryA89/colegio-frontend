import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "jspdf-autotable";

/**
 * Servicio para generar PDFs con jsPDF
 * Proporciona métodos para diferentes tipos de documentos PDF
 */

class PDFService {
  constructor() {
    // Configuración por defecto para PDFs
    this.defaultOptions = {
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    };
  }

  /**
   * Generar PDF a partir de contenido HTML
   * @param {string} elementId - ID del elemento HTML a convertir
   * @param {string} filename - Nombre del archivo PDF
   * @param {Object} options - Opciones adicionales
   */
  async generatePDFFromElement(
    elementId,
    filename = "documento.pdf",
    options = {},
  ) {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Elemento con ID "${elementId}" no encontrado`);
      }

      // Configurar opciones
      const pdfOptions = { ...this.defaultOptions, ...options };

      // Generar canvas del elemento
      const canvas = await html2canvas(element, {
        scale: 2, // Mayor calidad
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        ...pdfOptions.canvasOptions,
      });

      // Obtener dimensiones
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF(pdfOptions);

      // Calcular dimensiones para el PDF
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Agregar imagen al PDF
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Guardar PDF
      pdf.save(filename);

      return { success: true, message: "PDF generado exitosamente" };
    } catch (error) {
      console.error("Error al generar PDF:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generar PDF para reportes de calificaciones usando autotable
   * @param {Object} data - Datos del estudiante y calificaciones
   * @param {string} filename - Nombre del archivo
   */
  generateGradesPDF(data, filename = "calificaciones.pdf") {
    try {
      const pdf = new jsPDF(this.defaultOptions);

      // Configuración de fuentes y estilos
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(16);

      // Título
      pdf.text("Reporte de Calificaciones", 105, 20, { align: "center" });

      // Información del estudiante
      pdf.setFontSize(12);
      pdf.text(`Estudiante: ${data.studentName || "N/A"}`, 20, 40);
      pdf.text(`Curso: ${data.course || "N/A"}`, 20, 50);
      pdf.text(`Periodo: ${data.period || "N/A"}`, 20, 60);

      // Fecha de generación
      pdf.setFontSize(10);
      pdf.text(`Generado: ${new Date().toLocaleString("es-ES")}`, 20, 70);

      // Preparar datos para la tabla
      const tableData = [];
      if (data.grades && Array.isArray(data.grades)) {
        data.grades.forEach((grade) => {
          tableData.push([
            grade.subject || "N/A",
            grade.grade?.toString() || "N/A",
            grade.status || "N/A",
          ]);
        });
      }

      // Configuración de la tabla con autotable
      pdf.autoTable({
        head: [["Materia", "Nota", "Estado"]],
        body: tableData,
        startY: 85,
        theme: "grid",
        styles: {
          font: "helvetica",
          fontSize: 10,
          cellPadding: 5,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [59, 130, 246], // Azul
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
          textColor: [50, 50, 50],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // Gris muy claro
        },
        columnStyles: {
          0: { cellWidth: 80 }, // Materia
          1: { cellWidth: 30, halign: "center" }, // Nota
          2: { cellWidth: 50, halign: "center" }, // Estado
        },
        margin: { top: 10, left: 20, right: 20, bottom: 30 },
      });

      // Calcular estadísticas
      if (data.grades && Array.isArray(data.grades)) {
        const totalGrades = data.grades.length;
        const passedGrades = data.grades.filter((g) => g.grade >= 70).length;
        const averageGrade =
          data.grades.reduce((sum, g) => sum + (g.grade || 0), 0) / totalGrades;

        // Sección de estadísticas
        const finalY = pdf.lastAutoTable.finalY || 85;
        pdf.setFontSize(11);
        pdf.text("Resumen Estadístico:", 20, finalY + 15);

        pdf.setFontSize(10);
        pdf.text(`Total de materias: ${totalGrades}`, 20, finalY + 25);
        pdf.text(`Materias aprobadas: ${passedGrades}`, 20, finalY + 32);
        pdf.text(
          `Promedio general: ${averageGrade.toFixed(2)}`,
          20,
          finalY + 39,
        );
        pdf.text(
          `Tasa de aprobación: ${((passedGrades / totalGrades) * 100).toFixed(1)}%`,
          20,
          finalY + 46,
        );
      }

      // Pie de página
      pdf.setFontSize(8);
      pdf.text("Generado por Estud_IA - Plataforma Educativa", 105, 280, {
        align: "center",
      });

      // Guardar PDF
      pdf.save(filename);

      return { success: true, message: "Reporte de calificaciones generado" };
    } catch (error) {
      console.error("Error al generar PDF de calificaciones:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generar PDF para reportes de asistencia
   * @param {Object} data - Datos de asistencia
   * @param {string} filename - Nombre del archivo
   */
  generateAttendancePDF(data, filename = "asistencia.pdf") {
    try {
      const pdf = new jsPDF(this.defaultOptions);

      // Título
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("Reporte de Asistencia", 105, 20, { align: "center" });

      // Información general
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.text(`Estudiante: ${data.studentName || "N/A"}`, 20, 40);
      pdf.text(`Mes: ${data.month || "N/A"}`, 20, 50);
      pdf.text(`Año: ${data.year || "N/A"}`, 20, 60);

      // Estadísticas
      pdf.setFontSize(11);
      pdf.text(`Total de clases: ${data.totalClasses || 0}`, 20, 80);
      pdf.text(`Asistencias: ${data.attended || 0}`, 20, 90);
      pdf.text(`Inasistencias: ${data.absent || 0}`, 20, 100);
      pdf.text(
        `Porcentaje de asistencia: ${data.attendancePercentage || 0}%`,
        20,
        110,
      );

      // Gráfico simple de asistencia
      const chartX = 20;
      const chartY = 130;
      const chartWidth = 170;
      const chartHeight = 50;

      // Fondo del gráfico
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(chartX, chartY, chartWidth, chartHeight);

      // Barra de asistencia
      const attendanceWidth = (data.attendancePercentage / 100) * chartWidth;
      pdf.setFillColor(76, 175, 80); // Verde
      pdf.rect(chartX, chartY, attendanceWidth, chartHeight, "F");

      // Etiqueta del gráfico
      pdf.setFontSize(10);
      pdf.text(
        `${data.attendancePercentage || 0}% de asistencia`,
        chartX + chartWidth / 2,
        chartY + chartHeight + 10,
        { align: "center" },
      );

      // Pie de página
      pdf.setFontSize(8);
      pdf.text("Generado por Estud_IA - Plataforma Educativa", 105, 280, {
        align: "center",
      });

      // Guardar PDF
      pdf.save(filename);

      return { success: true, message: "Reporte de asistencia generado" };
    } catch (error) {
      console.error("Error al generar PDF de asistencia:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generar PDF con tabla personalizada usando autotable
   * @param {Object} data - Datos de la tabla
   * @param {string} filename - Nombre del archivo
   * @param {Object} options - Opciones de configuración
   */
  generateTablePDF(data, filename = "tabla.pdf", options = {}) {
    try {
      const pdf = new jsPDF(this.defaultOptions);

      // Configuración por defecto para la tabla
      const defaultTableOptions = {
        title: "Reporte de Datos",
        headers: [],
        rows: [],
        startY: 40,
        theme: "grid",
        styles: {
          font: "helvetica",
          fontSize: 10,
          cellPadding: 5,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [59, 130, 246], // Azul
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
          textColor: [50, 50, 50],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // Gris muy claro
        },
        margin: { top: 10, left: 20, right: 20, bottom: 30 },
      };

      // Combinar opciones por defecto con las proporcionadas
      const tableOptions = { ...defaultTableOptions, ...options };

      // Título del documento
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text(data.title || tableOptions.title, 105, 20, { align: "center" });

      // Información adicional
      if (data.subtitle) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        pdf.text(data.subtitle, 105, 30, { align: "center" });
      }

      // Fecha de generación
      pdf.setFontSize(8);
      pdf.text(`Generado: ${new Date().toLocaleString("es-ES")}`, 105, 35, {
        align: "center",
      });

      // Generar tabla con autotable
      pdf.autoTable({
        head: data.headers || tableOptions.headers,
        body: data.rows || tableOptions.rows,
        startY: data.startY || tableOptions.startY,
        theme: tableOptions.theme,
        styles: tableOptions.styles,
        headStyles: tableOptions.headStyles,
        bodyStyles: tableOptions.bodyStyles,
        alternateRowStyles: tableOptions.alternateRowStyles,
        columnStyles: data.columnStyles || tableOptions.columnStyles,
        margin: tableOptions.margin,
      });

      // Pie de página
      if (data.footer) {
        const finalY = pdf.lastAutoTable.finalY || 40;
        pdf.setFontSize(10);
        pdf.text(data.footer, 105, finalY + 20, { align: "center" });
      }

      // Marca de agua
      pdf.setFontSize(8);
      pdf.text("Generado por Estud_IA - Plataforma Educativa", 105, 280, {
        align: "center",
      });

      // Guardar PDF
      pdf.save(filename);

      return { success: true, message: "Tabla PDF generada exitosamente" };
    } catch (error) {
      console.error("Error al generar PDF de tabla:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generar PDF personalizado con contenido HTML
   * @param {string} htmlContent - Contenido HTML
   * @param {string} filename - Nombre del archivo
   * @param {Object} options - Opciones adicionales
   */
  async generateCustomPDF(
    htmlContent,
    filename = "documento.pdf",
    options = {},
  ) {
    try {
      // Crear un elemento temporal
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "-9999px";
      tempDiv.style.width = "210mm"; // Ancho A4
      tempDiv.style.padding = "20mm";
      tempDiv.style.backgroundColor = "white";
      tempDiv.style.fontFamily = "Arial, sans-serif";

      document.body.appendChild(tempDiv);

      // Generar PDF
      const result = await this.generatePDFFromElement(
        tempDiv.id,
        filename,
        options,
      );

      // Limpiar elemento temporal
      document.body.removeChild(tempDiv);

      return result;
    } catch (error) {
      console.error("Error al generar PDF personalizado:", error);
      return { success: false, error: error.message };
    }
  }
}

// Exportar instancia única del servicio
export const pdfService = new PDFService();
export default pdfService;
