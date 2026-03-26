import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import Quiz from "../pages/estudiante/Quiz";
import Evaluaciones from "../pages/estudiante/Evaluaciones";
import Calificaciones from "../pages/estudiante/Calificaciones";
import Clases from "../pages/profesor/Clases";
import EstudiantesClases from "../pages/profesor/EstudiantesClases";
import EvaluacionesClase from "../pages/profesor/EvaluacionesClase";
import Actividades from "../pages/profesor/Actividades";
import Asistencias from "../pages/profesor/Asistencias";
import DashboardLayout from "../layouts/DashboardLayout";
import AuthLayout from "../layouts/AuthLayout";
import ActividadesEstudiante from "../pages/estudiante/Actividades";
import AsistenciaEstudiante from "../pages/estudiante/Asistencia";
import EvaluacionesProfesor from "../pages/profesor/Evaluaciones";
import Usuarios from "../pages/admin/Usuarios";
import Materias from "../pages/admin/Materias";
import Reportes from "../pages/admin/Reportes";

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

  // 🛠️ Admin
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
    path: "/admin/Usuarios",
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
