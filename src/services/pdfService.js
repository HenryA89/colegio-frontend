import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Servicio para generar PDFs con jsPDF
 * Proporciona métodos para diferentes tipos de documentos PDF
 */

class PDFService {
  constructor() {
    // Configuración por defecto para PDFs
    this.defaultOptions = {
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    };
  }

  /**
   * Generar PDF a partir de contenido HTML
   * @param {string} elementId - ID del elemento HTML a convertir
   * @param {string} filename - Nombre del archivo PDF
   * @param {Object} options - Opciones adicionales
   */
  async generatePDFFromElement(elementId, filename = 'documento.pdf', options = {}) {
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
        backgroundColor: '#ffffff',
        ...pdfOptions.canvasOptions
      });

      // Obtener dimensiones
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF(pdfOptions);
      
      // Calcular dimensiones para el PDF
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Agregar imagen al PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Guardar PDF
      pdf.save(filename);
      
      return { success: true, message: 'PDF generado exitosamente' };
    } catch (error) {
      console.error('Error al generar PDF:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generar PDF para reportes de calificaciones
   * @param {Object} data - Datos del estudiante y calificaciones
   * @param {string} filename - Nombre del archivo
   */
  generateGradesPDF(data, filename = 'calificaciones.pdf') {
    try {
      const pdf = new jsPDF(this.defaultOptions);
      
      // Configuración de fuentes y estilos
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(16);
      
      // Título
      pdf.text('Reporte de Calificaciones', 105, 20, { align: 'center' });
      
      // Información del estudiante
      pdf.setFontSize(12);
      pdf.text(`Estudiante: ${data.studentName || 'N/A'}`, 20, 40);
      pdf.text(`Curso: ${data.course || 'N/A'}`, 20, 50);
      pdf.text(`Periodo: ${data.period || 'N/A'}`, 20, 60);
      
      // Fecha de generación
      pdf.setFontSize(10);
      pdf.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 20, 70);
      
      // Tabla de calificaciones
      let yPosition = 90;
      pdf.setFontSize(11);
      
      // Encabezados de tabla
      pdf.text('Materia', 20, yPosition);
      pdf.text('Nota', 100, yPosition);
      pdf.text('Estado', 140, yPosition);
      
      yPosition += 10;
      
      // Línea separadora
      pdf.line(20, yPosition, 190, yPosition);
      yPosition += 5;
      
      // Datos de calificaciones
      if (data.grades && Array.isArray(data.grades)) {
        data.grades.forEach(grade => {
          pdf.text(grade.subject || 'N/A', 20, yPosition);
          pdf.text(grade.grade?.toString() || 'N/A', 100, yPosition);
          pdf.text(grade.status || 'N/A', 140, yPosition);
          yPosition += 8;
        });
      }
      
      // Pie de página
      pdf.setFontSize(8);
      pdf.text('Generado por Estud_IA - Plataforma Educativa', 105, 280, { align: 'center' });
      
      // Guardar PDF
      pdf.save(filename);
      
      return { success: true, message: 'Reporte de calificaciones generado' };
    } catch (error) {
      console.error('Error al generar PDF de calificaciones:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generar PDF para certificados
   * @param {Object} data - Datos del certificado
   * @param {string} filename - Nombre del archivo
   */
  generateCertificatePDF(data, filename = 'certificado.pdf') {
    try {
      const pdf = new jsPDF(this.defaultOptions);
      
      // Fondo y bordes
      pdf.setDrawColor(200, 200, 200);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(10, 10, 190, 270, 5, 5, 'FD');
      
      // Título del certificado
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.text('CERTIFICADO DE', 105, 40, { align: 'center' });
      pdf.text('APROBACIÓN', 105, 50, { align: 'center' });
      
      // Contenido del certificado
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      
      const content = `Por medio de este certificado se hace constar que ${data.studentName || 'el estudiante'} 
ha completado satisfactoriamente el curso ${data.course || 'el curso'} con un desempeño 
${data.performance || 'sobresaliente'}.`;
      
      // Texto justificado
      const lines = pdf.splitTextToSize(content, 170);
      let yPosition = 80;
      lines.forEach(line => {
        pdf.text(line, 20, yPosition);
        yPosition += 7;
      });
      
      // Fecha y firma
      pdf.setFontSize(11);
      pdf.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-ES')}`, 20, 180);
      
      // Espacio para firma
      pdf.line(50, 220, 150, 220);
      pdf.text('Firma del Instructor', 105, 230, { align: 'center' });
      pdf.setFontSize(9);
      pdf.text(`${data.instructor || 'Instructor'}`, 105, 237, { align: 'center' });
      
      // Sello digital
      pdf.setDrawColor(100, 100, 100);
      pdf.circle(170, 230, 15);
      pdf.text('SELLO', 170, 235, { align: 'center' });
      
      // Guardar PDF
      pdf.save(filename);
      
      return { success: true, message: 'Certificado generado exitosamente' };
    } catch (error) {
      console.error('Error al generar certificado:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generar PDF para reportes de asistencia
   * @param {Object} data - Datos de asistencia
   * @param {string} filename - Nombre del archivo
   */
  generateAttendancePDF(data, filename = 'asistencia.pdf') {
    try {
      const pdf = new jsPDF(this.defaultOptions);
      
      // Título
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('Reporte de Asistencia', 105, 20, { align: 'center' });
      
      // Información general
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.text(`Estudiante: ${data.studentName || 'N/A'}`, 20, 40);
      pdf.text(`Mes: ${data.month || 'N/A'}`, 20, 50);
      pdf.text(`Año: ${data.year || 'N/A'}`, 20, 60);
      
      // Estadísticas
      pdf.setFontSize(11);
      pdf.text(`Total de clases: ${data.totalClasses || 0}`, 20, 80);
      pdf.text(`Asistencias: ${data.attended || 0}`, 20, 90);
      pdf.text(`Inasistencias: ${data.absent || 0}`, 20, 100);
      pdf.text(`Porcentaje de asistencia: ${data.attendancePercentage || 0}%`, 20, 110);
      
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
      pdf.rect(chartX, chartY, attendanceWidth, chartHeight, 'F');
      
      // Etiqueta del gráfico
      pdf.setFontSize(10);
      pdf.text(`${data.attendancePercentage || 0}% de asistencia`, chartX + chartWidth/2, chartY + chartHeight + 10, { align: 'center' });
      
      // Pie de página
      pdf.setFontSize(8);
      pdf.text('Generado por Estud_IA - Plataforma Educativa', 105, 280, { align: 'center' });
      
      // Guardar PDF
      pdf.save(filename);
      
      return { success: true, message: 'Reporte de asistencia generado' };
    } catch (error) {
      console.error('Error al generar PDF de asistencia:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generar PDF personalizado con contenido HTML
   * @param {string} htmlContent - Contenido HTML
   * @param {string} filename - Nombre del archivo
   * @param {Object} options - Opciones adicionales
   */
  async generateCustomPDF(htmlContent, filename = 'documento.pdf', options = {}) {
    try {
      // Crear un elemento temporal
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '210mm'; // Ancho A4
      tempDiv.style.padding = '20mm';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      
      document.body.appendChild(tempDiv);
      
      // Generar PDF
      const result = await this.generatePDFFromElement(tempDiv.id, filename, options);
      
      // Limpiar elemento temporal
      document.body.removeChild(tempDiv);
      
      return result;
    } catch (error) {
      console.error('Error al generar PDF personalizado:', error);
      return { success: false, error: error.message };
    }
  }
}

// Exportar instancia única del servicio
export const pdfService = new PDFService();
export default pdfService;
