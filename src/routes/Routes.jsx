import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
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
    element: (
      <DashboardLayout>
        <Dashboard />
      </DashboardLayout>
    ),
    isPrivate: true,
    roles: ["estudiante", "profesor", "admin"],
  },
  {
    path: "/profile",
    element: (
      <DashboardLayout>
        <Profile />
      </DashboardLayout>
    ),
    isPrivate: true,
    roles: ["estudiante", "profesor", "admin"],
  },

  // 🎓 Estudiantes
  {
    path: "/estudiante/actividades",
    element: (
      <DashboardLayout>
        <ActividadesEstudiante />
      </DashboardLayout>
    ),
    isPrivate: true,
    roles: ["estudiante"],
  },
  {
    path: "/estudiante/asistencia",
    element: (
      <DashboardLayout>
        <AsistenciaEstudiante />
      </DashboardLayout>
    ),
    isPrivate: true,
    roles: ["estudiante"],
  },
  {
    path: "/estudiante/Evaluaciones",
    element: (
      <DashboardLayout>
        <Evaluaciones />
      </DashboardLayout>
    ),
    isPrivate: true,
    roles: ["estudiante"],
  },
  {
    path: "/estudiante/quiz",
    element: (
      <DashboardLayout>
        <Quiz />
      </DashboardLayout>
    ),
    isPrivate: true,
    roles: ["estudiante"],
  },
  {
    path: "/estudiante/Calificaciones",
    element: (
      <DashboardLayout>
        <Calificaciones />
      </DashboardLayout>
    ),
    isPrivate: true,
    roles: ["estudiante"],
  },

  // 👨‍🏫 Profesores
  {
    path: "/profesor/Clases",
    element: (
      <DashboardLayout>
        <Clases />
      </DashboardLayout>
    ),
    isPrivate: true,
    roles: ["profesor"],
  },
  {
    path: "/profesor/EvaluacionesClase",
    element: (
      <DashboardLayout>
        <EvaluacionesClase />
      </DashboardLayout>
    ),
    isPrivate: true,
    roles: ["profesor"],
  },
  {
    path: "/profesor/EstudiantesClases",
    element: (
      <DashboardLayout>
        <EstudiantesClases />
      </DashboardLayout>
    ),
    isPrivate: true,
    roles: ["profesor"],
  },
  {
    path: "/profesor/Actividades",
    element: (
      <DashboardLayout>
        <Actividades />
      </DashboardLayout>
    ),
    isPrivate: true,
    roles: ["profesor"],
  },
  {
    path: "/profesor/Asistencias",
    element: (
      <DashboardLayout>
        <Asistencias />
      </DashboardLayout>
    ),
    isPrivate: true,
    roles: ["profesor"],
  },
  {
    path: "/profesor/Evaluaciones",
    element: (
      <DashboardLayout>
        <EvaluacionesProfesor />
      </DashboardLayout>
    ),
    isPrivate: true,
    roles: ["profesor"],
  },

  // Admin
  {
    path: "/admin/Materias",
    element: (
      <DashboardLayout>
        <Materias />
      </DashboardLayout>
    ),
    isPrivate: true,
    roles: ["admin"],
  },
  {
    path: "/admin/usuarios",
    element: (
      <DashboardLayout>
        <Usuarios />
      </DashboardLayout>
    ),
    isPrivate: true,
    roles: ["admin"],
  },
  {
    path: "/admin/Reportes",
    element: (
      <DashboardLayout>
        <Reportes />
      </DashboardLayout>
    ),
    isPrivate: true,
    roles: ["admin"],
  },
];
