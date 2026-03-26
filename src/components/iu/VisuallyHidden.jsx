import React from "react";

/**
 * Componente para ocultar visualmente elementos pero mantenerlos accesibles para lectores de pantalla
 * Usa técnicas estándar de accesibilidad WCAG
 */
export function VisuallyHidden({ children, ...props }) {
  return (
    <span
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0',
      }}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Componente para ocultar elementos pero mantenerlos enfocables
 */
export function VisuallyHiddenFocusable({ children, ...props }) {
  return (
    <span
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0',
      }}
      tabIndex={0}
      {...props}
    >
      {children}
    </span>
  );
}
