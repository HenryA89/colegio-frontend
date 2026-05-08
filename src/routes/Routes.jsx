import { lazy } from "react";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Perfil from "../pages/Perfil";
import AuthLayout from "../layouts/AuthLayout";

// Lazy loading para modulos privados
const Quiz = lazy(() => import("../pages/estudiante/Quiz"));
const Evaluaciones = lazy(() => import("../pages/estudiante/Evaluaciones"));
const Calificaciones = lazy(() => import("../pages/estudiante/Calificaciones"));
const ActividadesEstudiante = lazy(
  () => import("../pages/estudiante/Actividades"),
);
const AsistenciaEstudiante = lazy(
  () => import("../pages/estudiante/Asistencia"),
);

const Clases = lazy(() => import("../pages/profesor/Clases"));
const SeleccionMateria = lazy(
  () => import("../pages/profesor/SeleccionMateria"),
);
const EstudiantesClases = lazy(
  () => import("../pages/profesor/EstudiantesClases"),
);
const EvaluacionesClase = lazy(
  () => import("../pages/profesor/EvaluacionesClase"),
);
const Actividades = lazy(() => import("../pages/profesor/Actividades"));
const Asistencias = lazy(() => import("../pages/profesor/Asistencias"));
const QuizAi = lazy(() => import("../pages/profesor/QuizAi"));
const AccionesClase = lazy(() => import("../pages/profesor/AccionesClase"));

const Usuarios = lazy(() => import("../pages/admin/Usuarios"));
const Materias = lazy(() => import("../pages/admin/Materias"));
const Reportes = lazy(() => import("../pages/admin/Reportes"));

export const routes = [
  // Publicas
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

  // Generales (logueados)
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

  // Estudiantes
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
    path: "/estudiante/evaluaciones",
    element: <Evaluaciones />,
    isPrivate: true,
    roles: ["estudiante"],
  },
  {
    path: "/estudiante/evaluaciones/:id",
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
    path: "/estudiante/calificaciones",
    element: <Calificaciones />,
    isPrivate: true,
    roles: ["estudiante"],
  },

  // Profesores
  {
    path: "/profesor/seleccionmateria",
    element: <SeleccionMateria />,
    isPrivate: true,
    roles: ["profesor"],
  },
  {
    path: "/profesor/clases",
    element: <Clases />,
    isPrivate: true,
    roles: ["profesor"],
  },
  {
    path: "/profesor/evaluaciones-clase",
    element: <EvaluacionesClase />,
    isPrivate: true,
    roles: ["profesor"],
  },
  {
    path: "/profesor/evaluaciones-clase/:id",
    element: <EvaluacionesClase />,
    isPrivate: true,
    roles: ["profesor"],
  },
  {
    path: "/profesor/acciones-clase/:id",
    element: <AccionesClase />,
    isPrivate: true,
    roles: ["profesor"],
  },
  {
    path: "/profesor/quiz-ai",
    element: <QuizAi />,
    isPrivate: true,
    roles: ["profesor"],
  },
  {
    path: "/profesor/quiz-ai/:quizId",
    element: <QuizAi />,
    isPrivate: true,
    roles: ["profesor"],
  },
  {
    path: "/profesor/estudiantes-clases",
    element: <EstudiantesClases />,
    isPrivate: true,
    roles: ["profesor"],
  },
  {
    path: "/profesor/estudiantes-clases/:id",
    element: <EstudiantesClases />,
    isPrivate: true,
    roles: ["profesor"],
  },
  {
    path: "/profesor/actividades",
    element: <Actividades />,
    isPrivate: true,
    roles: ["profesor"],
  },
  {
    path: "/profesor/asistencias",
    element: <Asistencias />,
    isPrivate: true,
    roles: ["profesor"],
  },

  // Admin
  {
    path: "/admin/materias",
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
    path: "/admin/reportes",
    element: <Reportes />,
    isPrivate: true,
    roles: ["admin"],
  },
];
