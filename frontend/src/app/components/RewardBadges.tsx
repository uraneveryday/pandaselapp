import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

interface Badge {
  id: string;
  emoji: string;
  name: string;
  unlocked: boolean;
}

interface RewardBadgesProps {
  badges: Badge[];
}

export function RewardBadges({ badges }: RewardBadgesProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <h3 className="mb-4">{t("components.rewardBadges.title")}</h3>
      <div className="grid grid-cols-4 gap-3">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.id}
            className={`aspect-square rounded-2xl flex flex-col items-center justify-center ${
              badge.unlocked
                ? "bg-gradient-to-br from-[#B9F6CA] to-[#A8D8FF]"
                : "bg-muted opacity-50"
            }`}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: index * 0.1,
            }}
            whileHover={badge.unlocked ? { scale: 1.1, rotate: 5 } : {}}
          >
            <span className="text-2xl mb-1">{badge.emoji}</span>
            <span className="text-xs text-center px-1">{badge.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
