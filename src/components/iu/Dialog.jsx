export function DialogHeader({ children }) {
  return <div className="pb-2 mb-4 border-b">{children}</div>;
}

export function DialogFooter({ children }) {
  return <div className="flex justify-end gap-2 mt-4">{children}</div>;
}
import React, { useEffect, useRef } from "react";

export function Dialog({ open, onClose, children }) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (open) {
      // Guardar el elemento que tenía el foco antes de abrir el diálogo
      previousFocusRef.current = document.activeElement;

      // Mover el foco al diálogo
      if (dialogRef.current) {
        dialogRef.current.focus();
      }

      // Manejar tecla Escape
      const handleEscape = (e) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEscape);

      return () => {
        document.removeEventListener("keydown", handleEscape);

        // Restaurar el foco al elemento anterior
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      onClick={(e) => {
        // Cerrar al hacer clic fuera del contenido
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-xl shadow-lg p-6 min-w-[300px] max-w-[90vw] max-h-[90vh] overflow-y-auto outline-none"
        role="document"
        tabIndex="-1"
      >
        {children}
        <button
          className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={onClose}
          aria-label="Cerrar diálogo"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

export function DialogTitle({ children }) {
  return (
    <h2
      id="dialog-title"
      className="mb-2 text-xl font-bold"
      role="heading"
      aria-level="2"
    >
      {children}
    </h2>
  );
}

export function DialogContent({ children }) {
  return (
    <div className="mb-4" role="region" aria-label="Contenido del diálogo">
      {children}
    </div>
  );
}

export function DialogActions({ children }) {
  return <div className="flex justify-end gap-2">{children}</div>;
}
