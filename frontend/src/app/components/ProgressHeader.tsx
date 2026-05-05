import { Star, Award } from "lucide-react";
import { motion } from "motion/react";

interface ProgressHeaderProps {
  userName: string;
  totalStars: number;
  streak: number;
}

export function ProgressHeader({ userName, totalStars, streak }: ProgressHeaderProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="mb-1">안녕, {userName}!</h2>
          <p className="text-sm text-muted-foreground">오늘도 함께 공부해요</p>
        </div>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF9ECD] to-[#D4A5FF] flex items-center justify-center">
          <span className="text-2xl">🎓</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          className="bg-gradient-to-br from-[#FFE4B5] to-[#FFCBA4] rounded-2xl p-4"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-[#FF9ECD] fill-[#FF9ECD]" />
            <span className="text-sm text-muted-foreground">별점</span>
          </div>
          <p className="text-2xl">{totalStars}</p>
        </motion.div>
        
        <motion.div
          className="bg-gradient-to-br from-[#A8D8FF] to-[#D4A5FF] rounded-2xl p-4"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-[#FF9ECD]" />
            <span className="text-sm text-white">연속학습</span>
          </div>
          <p className="text-2xl text-white">{streak}일</p>
        </motion.div>
      </div>
    </div>
  );
}
