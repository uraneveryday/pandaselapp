import { motion } from "motion/react";
import { Trophy, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RankingPreviewProps {
  topRegion: string;
  topScore: number;
}

export function RankingPreview({ topRegion, topScore }: RankingPreviewProps) {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate("/ranking")}
      className="w-full bg-gradient-to-br from-[#FF9ECD] to-[#D4A5FF] rounded-3xl p-6 shadow-lg text-white overflow-hidden relative"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute top-0 right-0 opacity-10">
        <Trophy className="w-32 h-32" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-6 h-6 text-[#FFE4B5]" />
          <h3 className="text-white">지역별 랭킹</h3>
        </div>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-3">
          <p className="text-sm mb-2 text-white/80">현재 1위 지역</p>
          <motion.div
            className="flex items-center justify-between"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div>
              <h2 className="text-white mb-1">🏆 {topRegion}</h2>
              <p className="text-sm text-white/80">{topScore.toLocaleString()}점</p>
            </div>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </motion.div>
          </motion.div>
        </div>
        
        <p className="text-sm text-white/90 text-center">
          우리 지역도 1등을 해봐요! 자세히 보기 →
        </p>
      </div>
    </motion.button>
  );
}
