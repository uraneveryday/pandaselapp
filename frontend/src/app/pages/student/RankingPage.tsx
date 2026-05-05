import { motion } from "motion/react";
import { Trophy, ArrowLeft, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RegionRanking {
  rank: number;
  region: string;
  score: number;
  trend: "up" | "down" | "same";
}

const rankings: RegionRanking[] = [
  { rank: 1, region: "서울특별시", score: 45820, trend: "up" },
  { rank: 2, region: "경기도", score: 42150, trend: "same" },
  { rank: 3, region: "부산광역시", score: 38940, trend: "up" },
  { rank: 4, region: "인천광역시", score: 35670, trend: "down" },
  { rank: 5, region: "대구광역시", score: 33200, trend: "up" },
  { rank: 6, region: "광주광역시", score: 31450, trend: "same" },
  { rank: 7, region: "대전광역시", score: 29800, trend: "up" },
  { rank: 8, region: "울산광역시", score: 27650, trend: "down" },
  { rank: 9, region: "세종특별자치시", score: 25900, trend: "up" },
  { rank: 10, region: "강원도", score: 24100, trend: "same" },
];

export function RankingPage() {
  const navigate = useNavigate();

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-[#FFD700] to-[#FFA500]";
      case 2:
        return "from-[#C0C0C0] to-[#A8A8A8]";
      case 3:
        return "from-[#CD7F32] to-[#B87333]";
      default:
        return "from-[#E0E0E0] to-[#BDBDBD]";
    }
  };

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `${rank}`;
    }
  };

  return (
    <div className="min-h-screen pb-8">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h2>지역별 랭킹</h2>
        </div>

        {/* Top 3 Podium */}
        <div className="bg-gradient-to-br from-[#FF9ECD] to-[#D4A5FF] rounded-3xl p-6 shadow-lg">
          <div className="text-center mb-6">
            <Trophy className="w-12 h-12 mx-auto mb-2 text-[#FFE4B5]" />
            <h3 className="text-white mb-1">명예의 전당</h3>
            <p className="text-sm text-white/80">최고의 학습 지역</p>
          </div>

          <div className="flex items-end justify-center gap-2">
            {/* 2nd Place */}
            <motion.div
              className="flex-1 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div
                className={`bg-gradient-to-br ${getMedalColor(
                  2
                )} rounded-2xl p-4 mb-2 relative`}
              >
                <div className="text-3xl mb-2">🥈</div>
                <p className="text-xs text-white/80 mb-1">2위</p>
                <p className="text-sm font-medium text-white">경기도</p>
                <p className="text-xs text-white/80 mt-1">
                  {rankings[1].score.toLocaleString()}점
                </p>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs">
                  ➡️
                </div>
              </div>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              className="flex-1 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div
                className={`bg-gradient-to-br ${getMedalColor(
                  1
                )} rounded-2xl p-4 mb-2 relative`}
                style={{ marginTop: "-1rem" }}
              >
                <motion.div
                  className="text-4xl mb-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  🥇
                </motion.div>
                <p className="text-xs text-white/80 mb-1">1위</p>
                <p className="text-sm font-medium text-white">서울특별시</p>
                <p className="text-xs text-white/80 mt-1">
                  {rankings[0].score.toLocaleString()}점
                </p>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs">
                  📈
                </div>
              </div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              className="flex-1 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div
                className={`bg-gradient-to-br ${getMedalColor(
                  3
                )} rounded-2xl p-4 mb-2 relative`}
              >
                <div className="text-3xl mb-2">🥉</div>
                <p className="text-xs text-white/80 mb-1">3위</p>
                <p className="text-sm font-medium text-white">부산광역시</p>
                <p className="text-xs text-white/80 mt-1">
                  {rankings[2].score.toLocaleString()}점
                </p>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs">
                  📈
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Full Rankings List */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="mb-4">전체 순위</h3>
          <div className="space-y-3">
            {rankings.map((item, index) => (
              <motion.div
                key={item.rank}
                className={`flex items-center gap-4 p-4 rounded-2xl ${
                  item.rank <= 3
                    ? "bg-gradient-to-r from-[#FFE4B5]/30 to-[#FFCBA4]/30"
                    : "bg-muted/50"
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
                    item.rank <= 3
                      ? `bg-gradient-to-br ${getMedalColor(item.rank)} text-white`
                      : "bg-white text-foreground"
                  }`}
                >
                  {getMedalEmoji(item.rank)}
                </div>

                <div className="flex-1">
                  <p className="font-medium">{item.region}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.score.toLocaleString()}점
                  </p>
                </div>

                <div className="text-right">
                  {item.trend === "up" && (
                    <motion.div
                      className="flex items-center gap-1 text-[#4CAF50]"
                      animate={{ y: [-2, 0, -2] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs">상승</span>
                    </motion.div>
                  )}
                  {item.trend === "down" && (
                    <div className="flex items-center gap-1 text-[#FC8181]">
                      <TrendingUp className="w-4 h-4 rotate-180" />
                      <span className="text-xs">하락</span>
                    </div>
                  )}
                  {item.trend === "same" && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <span className="text-xs">유지</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-[#A8D8FF] to-[#B9F6CA] rounded-2xl p-4 text-center">
          <p className="text-sm text-foreground">
            📊 순위는 매일 자정에 업데이트됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
