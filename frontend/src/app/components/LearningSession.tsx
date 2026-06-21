import { useState } from "react";
import { X, Check, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { useTranslation } from "react-i18next";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface LearningSessionProps {
  title: string;
  color: string;
  questions: Question[];
  onClose: () => void;
  onComplete: (score: number) => void;
}

export function LearningSession({
  title,
  color,
  questions,
  onClose,
  onComplete,
}: LearningSessionProps) {
  const { t } = useTranslation();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswer = (index: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(index);
    setShowFeedback(true);
    
    if (index === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: [color, "#FFE4B5", "#B9F6CA"],
      });
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      onComplete(Math.round((score / questions.length) * 100));
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto overflow-x-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="sticky top-0 bg-white p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h3>{title}</h3>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {t("components.learningSession.questionCounter", { current: currentQuestion + 1, total: questions.length })}
          </p>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p className="mb-6">{questions[currentQuestion].question}</p>

              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === questions[currentQuestion].correctAnswer;
                  const showCorrect = showFeedback && isCorrect;
                  const showWrong = showFeedback && isSelected && !isCorrect;

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={showFeedback}
                      className={`w-full p-4 rounded-2xl text-left transition-all ${
                        showCorrect
                          ? "bg-[#B9F6CA] border-2 border-[#4CAF50]"
                          : showWrong
                          ? "bg-[#FFCDD2] border-2 border-[#FC8181]"
                          : isSelected
                          ? "bg-muted border-2 border-border"
                          : "bg-white border-2 border-border hover:border-muted-foreground"
                      }`}
                      whileHover={!showFeedback ? { scale: 1.02 } : {}}
                      whileTap={!showFeedback ? { scale: 0.98 } : {}}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {showCorrect && <Check className="w-5 h-5 text-[#4CAF50]" />}
                        {showWrong && <X className="w-5 h-5 text-[#FC8181]" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {showFeedback && (
                <motion.button
                  onClick={handleNext}
                  className="w-full mt-6 p-4 rounded-2xl text-white flex items-center justify-center gap-2"
                  style={{ backgroundColor: color }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {currentQuestion < questions.length - 1 ? t("components.learningSession.nextQuestion") : t("components.learningSession.complete")}
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
