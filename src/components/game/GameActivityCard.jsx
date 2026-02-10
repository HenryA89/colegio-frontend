import React, { useState, useEffect } from "react";
import { Star, Trophy, Zap, Target, Clock, CheckCircle } from "lucide-react";

const GameActivityCard = ({ activity, onStart, onComplete }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    // Simular progreso de la actividad
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      onStart(activity);
    }, 300);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Fácil":
        return "from-green-400 to-emerald-500";
      case "Medio":
        return "from-yellow-400 to-orange-500";
      case "Difícil":
        return "from-red-400 to-pink-500";
      default:
        return "from-blue-400 to-indigo-500";
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "quiz":
        return <Target className="w-8 h-8 text-blue-600" />;
      case "ejercicio":
        return <Zap className="w-8 h-8 text-yellow-600" />;
      case "proyecto":
        return <Star className="w-8 h-8 text-purple-600" />;
      default:
        return <CheckCircle className="w-8 h-8 text-green-600" />;
    }
  };

  return (
    <div
      className={`game-card p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ${
        isAnimating ? "scale-110 rotate-2" : ""
      }`}
    >
      {/* Header con icono y título */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white rounded-full shadow-md">
            {getActivityIcon(activity.type)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {activity.title}
            </h3>
            <p className="text-sm text-gray-600">{activity.subject}</p>
          </div>
        </div>
        <div
          className={`level-badge bg-gradient-to-r ${getDifficultyColor(
            activity.difficulty
          )}`}
        >
          {activity.difficulty}
        </div>
      </div>

      {/* Descripción */}
      <p className="text-gray-700 mb-4 leading-relaxed">
        {activity.description}
      </p>

      {/* Estadísticas del juego */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="score-badge bg-gradient-to-r from-yellow-400 to-orange-500">
            <Trophy className="w-4 h-4 inline mr-1" />
            {score}
          </div>
          <p className="text-xs text-gray-600 mt-1">Puntos</p>
        </div>
        <div className="text-center">
          <div className="level-badge bg-gradient-to-r from-purple-500 to-pink-500">
            <Star className="w-4 h-4 inline mr-1" />
            {level}
          </div>
          <p className="text-xs text-gray-600 mt-1">Nivel</p>
        </div>
        <div className="text-center">
          <div className="score-badge bg-gradient-to-r from-blue-400 to-indigo-500">
            <Clock className="w-4 h-4 inline mr-1" />
            {activity.duration}
          </div>
          <p className="text-xs text-gray-600 mt-1">Minutos</p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso</span>
          <span className="text-sm font-bold text-blue-600">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="progress-bar h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex space-x-3">
        <button
          onClick={handleStart}
          className="btn-game flex-1 flex items-center justify-center space-x-2"
        >
          <Zap className="w-5 h-5" />
          <span>¡Jugar Ahora!</span>
        </button>
        {activity.completed && (
          <button
            onClick={() => onComplete(activity)}
            className="btn-success px-4 py-3 rounded-xl flex items-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Completar</span>
          </button>
        )}
      </div>

      {/* Efectos de partículas */}
      {isAnimating && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
                animationDelay: `${i * 0.1}s`,
                background: [
                  "#667eea",
                  "#764ba2",
                  "#f093fb",
                  "#4facfe",
                  "#00f2fe",
                  "#43e97b",
                ][i],
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GameActivityCard;
