# Documentación - jsPDF en Estud_IA

## 📋 Descripción General

Se ha integrado la librería **jsPDF** para generar documentos PDF directamente desde la aplicación web. Esta funcionalidad permite a usuarios (estudiantes y profesores) exportar reportes, certificados y documentos importantes en formato PDF.

## 📦 Dependencias Instaladas

```json
{
  "jspdf": "^4.2.0",
  "html2canvas": "^1.4.1"
}
```

## 🗂️ Estructura de Archivos

```
src/
├── services/
│   └── pdfService.js          # Servicio principal para generación de PDFs
├── components/
│   └── PDFGenerator.jsx       # Componente React para facilitar el uso
└── pages/
    ├── estudiante/
    │   └── Calificaciones.jsx # Ejemplo de implementación
    └── profesor/
        └── Certificados.jsx   # Ejemplo de certificados
```

## 🛠️ Servicios Disponibles

### 1. `pdfService.generateGradesPDF(data, filename)`

Genera reportes de calificaciones con formato profesional.

**Parámetros:**
- `data`: Objeto con información del estudiante y calificaciones
- `filename`: Nombre del archivo PDF

**Ejemplo:**
```javascript
const gradesData = {
  studentName: "Juan Pérez",
  course: "Matemáticas Avanzadas",
  period: "Marzo 2026",
  grades: [
    { subject: "Álgebra", grade: 95, status: "Aprobado" },
    { subject: "Geometría", grade: 88, status: "Aprobado" }
  ]
};
```

### 2. `pdfService.generateCertificatePDF(data, filename)`

Crea certificados de aprobación con diseño profesional.

**Parámetros:**
- `data`: Objeto con información del certificado
- `filename`: Nombre del archivo PDF

**Ejemplo:**
```javascript
const certificateData = {
  studentName: "María García",
  course: "React Avanzado",
  instructor: "Dr. Carlos López",
  performance: "sobresaliente"
};
```

### 3. `pdfService.generateAttendancePDF(data, filename)`

Genera reportes de asistencia con estadísticas y gráficos.

**Parámetros:**
- `data`: Objeto con datos de asistencia
- `filename`: Nombre del archivo PDF

**Ejemplo:**
```javascript
const attendanceData = {
  studentName: "Pedro Martínez",
  month: "Marzo",
  year: "2026",
  totalClasses: 20,
  attended: 18,
  absent: 2,
  attendancePercentage: 90
};
```

### 4. `pdfService.generatePDFFromElement(elementId, filename, options)`

Convierte un elemento HTML a PDF.

**Parámetros:**
- `elementId`: ID del elemento DOM a convertir
- `filename`: Nombre del archivo PDF
- `options`: Opciones adicionales de configuración

### 5. `pdfService.generateCustomPDF(htmlContent, filename, options)`

Genera PDF desde contenido HTML personalizado.

## 🎯 Componentes React

### `PDFGenerator` (Componente Principal)

Componente reutilizable que facilita la generación de PDFs.

**Props:**
- `type`: Tipo de PDF ('element', 'grades', 'certificate', 'attendance', 'custom')
- `data`: Datos para el PDF
- `elementId`: ID del elemento (para type='element')
- `filename`: Nombre del archivo
- `onGenerate`: Callback al generar PDF
- `className`: Clases CSS adicionales
- `children`: Contenido personalizado del botón

**Ejemplo:**
```jsx
<PDFGenerator
  type="grades"
  data={gradesData}
  filename="calificaciones.pdf"
  onGenerate={(result) => console.log(result)}
>
  <span>📄 Descargar PDF</span>
</PDFGenerator>
```

### Componentes Especializados

- `GradesPDFGenerator`: Para reportes de calificaciones
- `CertificatePDFGenerator`: Para certificados
- `AttendancePDFGenerator`: Para reportes de asistencia
- `ElementPDFGenerator`: Para convertir elementos HTML

## 🔧 Implementación en Componentes

### Paso 1: Importar el componente

```javascript
import { GradesPDFGenerator } from '../components/PDFGenerator';
```

### Paso 2: Preparar los datos

```javascript
const handleGeneratePDF = () => {
  return {
    studentName: usuario?.nombre || 'Estudiante',
    course: 'Curso Actual',
    period: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }),
    grades: materias.map(mat => ({
      subject: mat.nombre,
      grade: mat.promedio,
      status: mat.promedio >= 70 ? 'Aprobado' : 'Reprobado'
    }))
  };
};
```

### Paso 3: Usar el componente

```jsx
<GradesPDFGenerator 
  gradesData={handleGeneratePDF()} 
  filename={`calificaciones-${usuario?.nombre}-${new Date().toISOString().split('T')[0]}.pdf`}
/>
```

## 🎨 Características del PDF

### Diseño Profesional
- Encabezado con título y logo
- Información del estudiante/institución
- Tablas organizadas con datos
- Pie de página con fecha de generación

### Formato A4
- Orientación portrait
- Unidades en milímetros
- Compresión activada

### Estilos
- Fuentes Helvetica (compatible con PDF)
- Colores corporativos
- Bordes y sombras sutiles
- Gráficos simples (barras de progreso)

## 🌐 Soporte Multiidioma

Los PDFs se generan en español por defecto, pero el servicio es fácilmente adaptable a otros idiomas modificando las etiquetas de texto en el servicio.

## 🔐 Seguridad

- Validación de datos antes de generar PDF
- Manejo de errores con mensajes descriptivos
- Sanitización de contenido HTML
- Límites de tamaño para evitar problemas de memoria

## 📱 Compatibilidad

- **Navegadores modernos**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Desktop, Tablet, Mobile
- **Sistemas operativos**: Windows, macOS, Linux, iOS, Android

## 🚀 Optimizaciones

- **Carga asíncrona**: No bloquea la interfaz
- **Compresión**: Archivos PDF optimizados
- **Caching**: Reutiliza configuración
- **Lazy loading**: Carga solo cuando se usa

## 🐛 Solución de Problemas

### Errores Comunes

1. **"Element not found"**
   - Verificar que el `elementId` exista en el DOM
   - Usar `useEffect` para asegurar que el elemento esté montado

2. **"PDF generation failed"**
   - Revisar los datos de entrada
   - Verificar conexión a internet (para html2canvas)

3. **"File too large"**
   - Optimizar imágenes antes de generar PDF
   - Reducir la cantidad de datos

### Tips de Rendimiento

- Usar `debounce` para evitar múltiples generaciones
- Limitar el tamaño de los elementos HTML
- Comprimir imágenes antes de incluirlas

## 📈 Métricas de Uso

El servicio incluye callbacks para tracking:

```javascript
<PDFGenerator
  onGenerate={(result) => {
    if (result.success) {
      // Track successful PDF generation
      analytics.track('pdf_generated', { type: 'grades' });
    } else {
      // Track errors
      analytics.track('pdf_error', { error: result.error });
    }
  }}
/>
```

## 🔮 Futuras Mejoras

- [ ] Plantillas personalizables
- [ ] Firma digital
- [ ] Marca de agua
- [ ] Exportación a otros formatos (Excel, Word)
- [ ] Generación masiva de PDFs
- [ ] Integración con almacenamiento en la nube

## 📞 Soporte

Para problemas o sugerencias sobre la funcionalidad PDF, contactar al equipo de desarrollo o revisar la documentación oficial de [jsPDF](https://github.com/parallax/jsPDF).
