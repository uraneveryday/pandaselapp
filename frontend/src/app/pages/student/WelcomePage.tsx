import { motion } from "motion/react";
import { BookOpen, TrendingUp, Users, ArrowRight } from "lucide-react";
import { RankingPreview } from "../../components/RankingPreview";
import { useNavigate } from "react-router-dom";

export function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-8">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Hero Section */}
        <motion.div
          className="bg-gradient-to-br from-[#FFE4B5] via-[#FFCBA4] to-[#FF9ECD] rounded-3xl p-8 text-center shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            🎓
          </motion.div>
          <h1 className="mb-2 text-foreground">즐거운 학습 여행</h1>
          <p className="text-muted-foreground">
            매일 조금씩, 재미있게 공부해요!
          </p>
        </motion.div>
{/*
          시작하기
*/}
          <motion.button
              onClick={() => navigate("my-page")}
              className="w-full bg-gradient-to-r from-[#FF9ECD] to-[#D4A5FF] text-white p-6 rounded-3xl shadow-lg flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
          >
              <span className="text-lg">학습 시작하기</span>
              <ArrowRight className="w-6 h-6" />
          </motion.button>
       {/*  Ranking Preview
        <RankingPreview topRegion="서울특별시" topScore={45820} />

         Quick Stats
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            className="bg-white rounded-2xl p-4 shadow-sm text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-[#FF9ECD] to-[#D4A5FF] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl mb-1">6</p>
            <p className="text-xs text-muted-foreground">학습 과목</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-4 shadow-sm text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-[#A8D8FF] to-[#B9F6CA] flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl mb-1">1.2K</p>
            <p className="text-xs text-muted-foreground">참여 학생</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-4 shadow-sm text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-[#FFE4B5] to-[#FFCBA4] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl mb-1">95%</p>
            <p className="text-xs text-muted-foreground">만족도</p>
          </motion.div>
        </div>

         Features
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="mb-4">어떤 것을 배울 수 있나요?</h3>
          <div className="space-y-3">
            {[
              { emoji: "📖", title: "한글 배우기", desc: "재미있는 글자 놀이" },
              { emoji: "🔢", title: "수학 놀이", desc: "숫자와 친구되기" },
              { emoji: "🎨", title: "미술 시간", desc: "색칠하고 그리기" },
              { emoji: "🎵", title: "음악 교실", desc: "노래하고 춤추기" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="text-3xl">{feature.emoji}</div>
                <div className="flex-1">
                  <p className="font-medium">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>*/}

        {/* CTA Button */}

      </div>
    </div>
  );
}
