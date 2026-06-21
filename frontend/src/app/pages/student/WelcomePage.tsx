import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function WelcomePage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

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

                    <h1 className="mb-2 text-foreground">Panda trip!!#@</h1>

                    <p className="text-muted-foreground">
                        {t("student.welcome.subtitle")}
                    </p>
                </motion.div>

                <motion.button
                    onClick={() => navigate("my-page")}
                    className="w-full bg-gradient-to-r from-[#FF9ECD] to-[#D4A5FF] text-white p-6 rounded-3xl shadow-lg flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <span className="text-lg">
                        {t("student.welcome.startLearning")}
                    </span>
                    <ArrowRight className="w-6 h-6" />
                </motion.button>
            </div>
        </div>
    );
}
