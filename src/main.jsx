import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // 👈 importa Tailwind
import "./components/styles/components.css"; // 👈 estilos personalizados
import "./components/styles/animation.css"; // 👈 animaciones personalizadas

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
