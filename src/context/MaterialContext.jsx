import { createContext, useContext, useState } from "react";

// Crear el contexto
const MaterialContext = createContext();

// Hook personalizado para usar el contexto
export const useMaterial = () => {
  const context = useContext(MaterialContext);
  if (!context) {
    throw new Error("useMaterial debe usarse dentro de un MaterialProvider");
  }
  return context;
};

// Proveedor del contexto
export const MaterialProvider = ({ children }) => {
  const [materialSeleccionado, setMaterialSeleccionado] = useState(null);

  // Función para establecer el material seleccionado
  const seleccionarMaterial = (material) => {
    setMaterialSeleccionado(material);
  };

  // Función para limpiar el material seleccionado
  const limpiarMaterial = () => {
    setMaterialSeleccionado(null);
  };

  // Obtener el material_id
  const getMaterialId = () => {
    return materialSeleccionado?.material_id || null;
  };

  // Obtener el título del material
  const getMaterialTitulo = () => {
    return materialSeleccionado?.titulo || "Material sin título";
  };

  // Verificar si hay material seleccionado
  const hayMaterialSeleccionado = () => {
    return materialSeleccionado !== null;
  };

  const value = {
    materialSeleccionado,
    seleccionarMaterial,
    limpiarMaterial,
    getMaterialId,
    getMaterialTitulo,
    hayMaterialSeleccionado,
    // Función para notificar cuando se sube un material
    notificarMaterialSubido: () => {
      // Disparar evento personalizado para que los componentes escuchen
      window.dispatchEvent(
        new CustomEvent("materialSubido", {
          detail: materialSeleccionado,
        }),
      );
    },
  };

  return (
    <MaterialContext.Provider value={value}>
      {children}
    </MaterialContext.Provider>
  );
};

export default MaterialContext;
