import { motion } from "motion/react";
import { Trophy, ArrowLeft, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type RegionKey =
    | "seoul"
    | "gyeonggi"
    | "busan"
    | "incheon"
    | "daegu"
    | "gwangju"
    | "daejeon"
    | "ulsan"
    | "sejong"
    | "gangwon";

interface RegionRanking {
    rank: number;
    regionKey: RegionKey;
    score: number;
    trend: "up" | "down" | "same";
}

const rankings: RegionRanking[] = [
    { rank: 1, regionKey: "seoul", score: 45820, trend: "up" },
    { rank: 2, regionKey: "gyeonggi", score: 42150, trend: "same" },
    { rank: 3, regionKey: "busan", score: 38940, trend: "up" },
    { rank: 4, regionKey: "incheon", score: 35670, trend: "down" },
    { rank: 5, regionKey: "daegu", score: 33200, trend: "up" },
    { rank: 6, regionKey: "gwangju", score: 31450, trend: "same" },
    { rank: 7, regionKey: "daejeon", score: 29800, trend: "up" },
    { rank: 8, regionKey: "ulsan", score: 27650, trend: "down" },
    { rank: 9, regionKey: "sejong", score: 25900, trend: "up" },
    { rank: 10, regionKey: "gangwon", score: 24100, trend: "same" },
];

export function RankingPage() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const currentLanguage = i18n.resolvedLanguage || i18n.language || "zh-CN";
    const numberLocale = currentLanguage.startsWith("ko") ? "ko-KR" : "zh-CN";

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

    const getRegionName = (regionKey: RegionKey) => {
        return t(`student.ranking.regions.${regionKey}`);
    };

    const formatScore = (score: number) => {
        return t("student.ranking.score", {
            score: score.toLocaleString(numberLocale),
        });
    };

    const topSecond = rankings[1];
    const topFirst = rankings[0];
    const topThird = rankings[2];

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

                    <h2>{t("student.ranking.title")}</h2>
                </div>

                {/* Top 3 Podium */}
                <div className="bg-gradient-to-br from-[#FF9ECD] to-[#D4A5FF] rounded-3xl p-6 shadow-lg">
                    <div className="text-center mb-6">
                        <Trophy className="w-12 h-12 mx-auto mb-2 text-[#FFE4B5]" />
                        <h3 className="text-white mb-1">
                            {t("student.ranking.hallOfFame")}
                        </h3>
                        <p className="text-sm text-white/80">
                            {t("student.ranking.bestRegion")}
                        </p>
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
                                    topSecond.rank
                                )} rounded-2xl p-4 mb-2 relative`}
                            >
                                <div className="text-3xl mb-2">🥈</div>
                                <p className="text-xs text-white/80 mb-1">
                                    {t("student.ranking.rankLabel", {
                                        rank: topSecond.rank,
                                    })}
                                </p>
                                <p className="text-sm font-medium text-white">
                                    {getRegionName(topSecond.regionKey)}
                                </p>
                                <p className="text-xs text-white/80 mt-1">
                                    {formatScore(topSecond.score)}
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
                                    topFirst.rank
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
                                <p className="text-xs text-white/80 mb-1">
                                    {t("student.ranking.rankLabel", {
                                        rank: topFirst.rank,
                                    })}
                                </p>
                                <p className="text-sm font-medium text-white">
                                    {getRegionName(topFirst.regionKey)}
                                </p>
                                <p className="text-xs text-white/80 mt-1">
                                    {formatScore(topFirst.score)}
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
                                    topThird.rank
                                )} rounded-2xl p-4 mb-2 relative`}
                            >
                                <div className="text-3xl mb-2">🥉</div>
                                <p className="text-xs text-white/80 mb-1">
                                    {t("student.ranking.rankLabel", {
                                        rank: topThird.rank,
                                    })}
                                </p>
                                <p className="text-sm font-medium text-white">
                                    {getRegionName(topThird.regionKey)}
                                </p>
                                <p className="text-xs text-white/80 mt-1">
                                    {formatScore(topThird.score)}
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
                    <h3 className="mb-4">{t("student.ranking.overallRank")}</h3>

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
                                    <p className="font-medium">
                                        {getRegionName(item.regionKey)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatScore(item.score)}
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
                                            <span className="text-xs">
                                                {t("student.ranking.trend.up")}
                                            </span>
                                        </motion.div>
                                    )}

                                    {item.trend === "down" && (
                                        <div className="flex items-center gap-1 text-[#FC8181]">
                                            <TrendingUp className="w-4 h-4 rotate-180" />
                                            <span className="text-xs">
                                                {t("student.ranking.trend.down")}
                                            </span>
                                        </div>
                                    )}

                                    {item.trend === "same" && (
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <span className="text-xs">
                                                {t("student.ranking.trend.same")}
                                            </span>
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
                        {t("student.ranking.updateNotice")}
                    </p>
                </div>
            </div>
        </div>
    );
}
