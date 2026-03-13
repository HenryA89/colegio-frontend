import React, { useState } from 'react';
import { useAuth } from '../hooks/UseAuth';
import { CertificatePDFGenerator } from '../components/PDFGenerator';

export default function Certificados() {
  const { usuario } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [instructor, setInstructor] = useState('');
  const [performance, setPerformance] = useState('sobresaliente');

  const handleGenerateCertificate = () => {
    const certificateData = {
      studentName: usuario?.nombre || 'Estudiante',
      course: selectedCourse || 'Curso de Ejemplo',
      instructor: instructor || 'Instructor Principal',
      performance: performance,
      date: new Date().toLocaleDateString('es-ES')
    };

    return certificateData;
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="max-w-4xl mx-auto">
        <div className="ai-card p-8 rounded-3xl shadow-2xl">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl text-white text-4xl">
              🏆
            </div>
            <div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Generador de Certificados
              </h2>
              <p className="text-sm text-gray-600">
                Crea certificados de aprobación personalizados
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Curso
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                placeholder="Ej: Matemáticas Avanzadas"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Instructor
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                placeholder="Ej: Dr. Juan Pérez"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desempeño
              </label>
              <select
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
                value={performance}
                onChange={(e) => setPerformance(e.target.value)}
              >
                <option value="sobresaliente">Sobresaliente</option>
                <option value="excelente">Excelente</option>
                <option value="bueno">Bueno</option>
                <option value="satisfactorio">Satisfactorio</option>
              </select>
            </div>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">Vista Previa del Certificado</h3>
            <div className="bg-white p-6 rounded-lg shadow-inner">
              <div className="text-center mb-6">
                <h4 className="text-2xl font-bold text-gray-800 mb-2">CERTIFICADO DE APROBACIÓN</h4>
                <div className="w-32 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto"></div>
              </div>
              
              <p className="text-gray-700 text-center mb-4">
                Por medio de este certificado se hace constar que <strong>{usuario?.nombre || 'el estudiante'}</strong> 
                ha completado satisfactoriamente el curso <strong>{selectedCourse || 'Curso de Ejemplo'}</strong> 
                con un desempeño <strong>{performance}</strong>.
              </p>
              
              <div className="flex justify-between items-end mt-8">
                <div className="text-center">
                  <div className="w-32 border-t-2 border-gray-400"></div>
                  <p className="text-sm text-gray-600 mt-2">Firma del Instructor</p>
                  <p className="text-xs text-gray-500">{instructor || 'Instructor Principal'}</p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 border-2 border-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-xs text-gray-500">SELLO</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <CertificatePDFGenerator 
              certificateData={handleGenerateCertificate()} 
              filename={`certificado-${selectedCourse || 'curso'}-${usuario?.nombre || 'estudiante'}-${new Date().toISOString().split('T')[0]}.pdf`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
