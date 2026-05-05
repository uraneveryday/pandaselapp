import { motion } from "motion/react";
import { Trophy, Star, Home } from "lucide-react";
import { useEffect } from "react";
import confetti from "canvas-confetti";

interface CompletionModalProps {
  score: number;
  onClose: () => void;
}

export function CompletionModal({ score, onClose }: CompletionModalProps) {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-3xl p-8 max-w-sm w-full text-center"
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
      >
        <motion.div
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#FFE4B5] to-[#FFCBA4] flex items-center justify-center"
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Trophy className="w-12 h-12 text-[#FF9ECD]" />
        </motion.div>

        <h2 className="mb-2">잘했어요!</h2>
        <p className="text-muted-foreground mb-6">학습을 완료했어요</p>

        <div className="bg-gradient-to-br from-[#FF9ECD] to-[#D4A5FF] rounded-2xl p-6 mb-6">
          <p className="text-white text-sm mb-2">점수</p>
          <div className="flex items-center justify-center gap-2">
            <motion.p
              className="text-5xl text-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
            >
              {score}
            </motion.p>
            <span className="text-2xl text-white">점</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 mb-6">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <Star
                className={`w-8 h-8 ${
                  score >= (i + 1) * 33
                    ? "text-[#FFE4B5] fill-[#FFE4B5]"
                    : "text-muted"
                }`}
              />
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={onClose}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#FF9ECD] to-[#D4A5FF] text-white flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Home className="w-5 h-5" />
          홈으로 돌아가기
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
