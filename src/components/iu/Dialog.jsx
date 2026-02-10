export function DialogHeader({ children }) {
  return <div className="pb-2 mb-4 border-b">{children}</div>;
}

export function DialogFooter({ children }) {
  return <div className="flex justify-end gap-2 mt-4">{children}</div>;
}
import React from "react";

export function Dialog({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 min-w-[300px] max-w-[90vw]">
        {children}
        <button
          className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

export function DialogTitle({ children }) {
  return <h2 className="mb-2 text-xl font-bold">{children}</h2>;
}

export function DialogContent({ children }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogActions({ children }) {
  return <div className="flex justify-end gap-2">{children}</div>;
}
