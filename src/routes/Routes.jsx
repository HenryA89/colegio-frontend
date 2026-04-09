import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Perfil from "../pages/Perfil";
import { lazy } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import AuthLayout from "../layouts/AuthLayout";

// Lazy loading para componentes pesados
const Quiz = lazy(() => import("../pages/estudiante/Quiz"));
const Evaluaciones = lazy(() => import("../pages/estudiante/Evaluaciones"));
const Calificaciones = lazy(() => import("../pages/estudiante/Calificaciones"));
const Clases = lazy(() => import("../pages/profesor/Clases"));
const EstudiantesClases = lazy(
  () => import("../pages/profesor/EstudiantesClases"),
);
const EvaluacionesClase = lazy(
  () => import("../pages/profesor/EvaluacionesClase"),
);
const Actividades = lazy(() => import("../pages/profesor/Actividades"));
const Asistencias = lazy(() => import("../pages/profesor/Asistencias"));
const ActividadesEstudiante = lazy(
  () => import("../pages/estudiante/Actividades"),
);
const AsistenciaEstudiante = lazy(
  () => import("../pages/estudiante/Asistencia"),
);
const Usuarios = lazy(() => import("../pages/admin/Usuarios"));
const Materias = lazy(() => import("../pages/admin/Materias"));
const Reportes = lazy(() => import("../pages/admin/Reportes"));

export const routes = [
  // 🔓 Públicas
  {
    path: "/",
    element: (
      <AuthLayout>
        <Login />
      </AuthLayout>
    ),
    isPrivate: false,
  },
  {
    path: "/login",
    element: (
      <AuthLayout>
        <Login />
      </AuthLayout>
    ),
    isPrivate: false,
  },
  {
    path: "/register",
    element: (
      <AuthLayout>
        <Register />
      </AuthLayout>
    ),
    isPrivate: false,
  },

  // 🔐 Generales (logueados)
  {
    path: "/dashboard",
    element: <Dashboard />,
    isPrivate: true,
    roles: ["estudiante", "profesor", "admin"],
  },
  {
    path: "/perfil",
    element: <Perfil />,
    isPrivate: true,
    roles: ["estudiante", "profesor", "admin"],
  },

  // 🎓 Estudiantes
  {
    path: "/estudiante/actividades",
    element: <ActividadesEstudiante />,
    isPrivate: true,
    roles: ["estudiante"],
  },
  {
    path: "/estudiante/asistencia",
    element: <AsistenciaEstudiante />,
    isPrivate: true,
    roles: ["estudiante"],
  },
  {
    path: "/estudiante/Evaluaciones",
    element: <Evaluaciones />,
    isPrivate: true,
    roles: ["estudiante"],
  },
  {
    path: "/estudiante/quiz",
    element: <Quiz />,
    isPrivate: true,
    roles: ["estudiante"],
  },
  {
    path: "/estudiante/Calificaciones",
    element: <Calificaciones />,
    isPrivate: true,
    roles: ["estudiante"],
  },

  // 👨‍🏫 Profesores
  {
    path: "/profesor/Clases",
    element: <Clases />,
    isPrivate: true,
    roles: ["profesor"],
  },
  {
    path: "/profesor/EvaluacionesClase",
    element: <EvaluacionesClase />,
    isPrivate: true,
    roles: ["profesor"],
  },
  {
    path: "/profesor/EstudiantesClases",
    element: <EstudiantesClases />,
    isPrivate: true,
    roles: ["profesor"],
  },
  {
    path: "/profesor/Actividades",
    element: <Actividades />,
    isPrivate: true,
    roles: ["profesor"],
  },
  {
    path: "/profesor/Asistencias",
    element: <Asistencias />,
    isPrivate: true,
    roles: ["profesor"],
  },

  // Admin
  {
    path: "/admin/Materias",
    element: <Materias />,
    isPrivate: true,
    roles: ["admin"],
  },
  {
    path: "/admin/usuarios",
    element: <Usuarios />,
    isPrivate: true,
    roles: ["admin"],
  },
  {
    path: "/admin/Reportes",
    element: <Reportes />,
    isPrivate: true,
    roles: ["admin"],
  },
];
