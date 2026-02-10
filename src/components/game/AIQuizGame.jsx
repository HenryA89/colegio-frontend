import React, { useState, useEffect } from "react";
import {
  Brain,
  Sparkles,
  Target,
  Clock,
  Star,
  Trophy,
  Zap,
  CheckCircle,
  X,
} from "lucide-react";

const AIQuizGame = ({ quiz, onComplete, onNext }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleAnswer(null);
    }
  }, [timeLeft, isAnswered]);

  const handleAnswer = (answerIndex) => {
    if (isAnswered) return;

    setIsAnswered(true);
    setSelectedAnswer(answerIndex);

    const isCorrect =
      answerIndex === quiz.questions[currentQuestion].correctAnswer;

    if (isCorrect) {
      setScore(score + 10);
      setStreak(streak + 1);
      if (streak >= 3) {
        setLevel(level + 1);
        setStreak(0);
      }
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      setShowResult(true);
    }, 1000);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowResult(false);
      setTimeLeft(30);
    } else {
      onComplete(score);
    }
  };

  const getScoreColor = () => {
    if (score >= 80) return "from-green-400 to-emerald-500";
    if (score >= 60) return "from-yellow-400 to-orange-500";
    return "from-red-400 to-pink-500";
  };

  const getStreakColor = () => {
    if (streak >= 3) return "from-purple-400 to-pink-500";
    if (streak >= 2) return "from-blue-400 to-indigo-500";
    return "from-gray-400 to-gray-500";
  };

  const question = quiz.questions[currentQuestion];

  return (
    <div className="ai-card p-8 rounded-3xl shadow-2xl max-w-2xl mx-auto">
      {/* Header con estadísticas */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white rounded-full shadow-lg">
            <Brain className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Quiz IA</h2>
            <p className="text-sm text-gray-600">
              Pregunta {currentQuestion + 1} de {quiz.questions.length}
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <div className={`score-badge bg-gradient-to-r ${getScoreColor()}`}>
            <Trophy className="w-4 h-4 inline mr-1" />
            {score}
          </div>
          <div className={`level-badge bg-gradient-to-r ${getStreakColor()}`}>
            <Zap className="w-4 h-4 inline mr-1" />
            {streak}x
          </div>
          <div className="level-badge bg-gradient-to-r from-purple-500 to-pink-500">
            <Star className="w-4 h-4 inline mr-1" />
            {level}
          </div>
        </div>
      </div>

      {/* Temporizador */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Tiempo restante
          </span>
          <span
            className={`text-lg font-bold ${
              timeLeft <= 10 ? "text-red-500" : "text-blue-500"
            }`}
          >
            {timeLeft}s
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-1000 ease-out ${
              timeLeft <= 10
                ? "bg-gradient-to-r from-red-500 to-pink-500"
                : "bg-gradient-to-r from-blue-500 to-indigo-500"
            }`}
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          />
        </div>
      </div>

      {/* Pregunta */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 leading-relaxed">
          {question.question}
        </h3>

        {/* Opciones de respuesta */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.correctAnswer;
            const isWrong = isSelected && !isCorrect;

            let buttonClass =
              "w-full p-4 text-left rounded-xl border-2 transition-all duration-300 ";

            if (showResult) {
              if (isCorrect) {
                buttonClass +=
                  "border-green-400 bg-green-50 text-green-800 shadow-lg";
              } else if (isWrong) {
                buttonClass +=
                  "border-red-400 bg-red-50 text-red-800 shadow-lg";
              } else {
                buttonClass += "border-gray-200 bg-gray-50 text-gray-600";
              }
            } else {
              buttonClass += isSelected
                ? "border-blue-400 bg-blue-50 text-blue-800 shadow-lg transform scale-105"
                : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:scale-102";
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={isAnswered}
                className={buttonClass}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      showResult && isCorrect
                        ? "border-green-500 bg-green-500"
                        : showResult && isWrong
                        ? "border-red-500 bg-red-500"
                        : isSelected
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {showResult && isCorrect && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                    {showResult && isWrong && (
                      <X className="w-4 h-4 text-white" />
                    )}
                    {!showResult && isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resultado */}
      {showResult && (
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <div className="text-center">
            {selectedAnswer === question.correctAnswer ? (
              <div className="text-green-600">
                <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                <h4 className="text-xl font-bold">¡Correcto!</h4>
                <p className="text-sm">+10 puntos</p>
              </div>
            ) : (
              <div className="text-red-600">
                <X className="w-12 h-12 mx-auto mb-2" />
                <h4 className="text-xl font-bold">Incorrecto</h4>
                <p className="text-sm">
                  La respuesta correcta era:{" "}
                  {question.options[question.correctAnswer]}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botón siguiente */}
      {showResult && (
        <button
          onClick={handleNext}
          className="btn-ai w-full flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>
            {currentQuestion < quiz.questions.length - 1
              ? "Siguiente Pregunta"
              : "Finalizar Quiz"}
          </span>
        </button>
      )}

      {/* Efectos visuales */}
      {streak >= 3 && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="particle"
            style={{ left: "10%", top: "20%", background: "#f093fb" }}
          />
          <div
            className="particle"
            style={{ left: "90%", top: "30%", background: "#667eea" }}
          />
          <div
            className="particle"
            style={{ left: "50%", top: "10%", background: "#764ba2" }}
          />
        </div>
      )}
    </div>
  );
};

export default AIQuizGame;
