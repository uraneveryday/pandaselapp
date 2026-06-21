import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

interface LearningCardProps {
  title: string;
  description: string;
  icon: LucideIcon; //여기서 타입으로 사용됨
  color: string;
  progress: number;
  onClick: () => void;
}

export function LearningCard({
  title,
  description,
  icon: Icon,
  color,
  progress,
  onClick,
}: LearningCardProps) {
  const { t } = useTranslation();

  return (
    <motion.button
      onClick={onClick}
      className="w-full p-6 rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1 text-left">
          <h3 className="mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{t("components.learningCard.progress", { progress })}</p>
        </div>
      </div>
    </motion.button>
  );
}
