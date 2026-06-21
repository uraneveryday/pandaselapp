import { CheckCircle, Clock } from "lucide-react";
import { useHomework } from "../context/HomeworkContext";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";

export function HomeworkList() {
    const { t } = useTranslation();

    // 1. homeworks -> tasks로 변경
    // 🚨 completeHomework는 아직 Context에 없으므로 일단 제거하거나 아래처럼 별도로 임시 구성해야 합니다.
    const { tasks } = useHomework();

    // 2. tasks 배열을 기준으로 필터링
    const incomplete = tasks.filter(t => !t.completed);
    const completed = tasks.filter(t => t.completed);

    // 숙제 시작 버튼 클릭 시 동작할 임시 함수 (추후 API 연동 필요)
    const handleStartHomework = (taskId: number) => {
        console.log("Start homework:", taskId);
    };

    if (tasks.length === 0) return null;

    return (
        <div className="bg-[#FFF4E5] rounded-2xl p-4 shadow-sm border border-[#FFE0B2] mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFD54F] rounded-full opacity-20 -mr-6 -mt-6" />

            <div className="flex items-center gap-2 mb-3">
                <h3 className="font-bold text-gray-800 text-lg m-0">{t("components.homeworkList.title")}</h3>
                {incomplete.length > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            {t("components.homeworkList.remaining", { count: incomplete.length })}
          </span>
                )}
            </div>

            <div className="space-y-3 relative z-10">
                <AnimatePresence>
                    {incomplete.map((hw) => (
                        <motion.div
                            key={hw.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-xl p-3 shadow-sm border border-orange-100"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    {/* 3. title -> taskName으로 변경 */}
                                    <h4 className="font-bold text-[#FF8A65] text-base m-0">{hw.taskName}</h4>
                                    <p className="text-gray-600 text-sm mt-1 mb-2">{hw.description}</p>
                                    <div className="flex items-center gap-1 text-xs text-orange-400 font-medium">
                                        <Clock className="w-3.5 h-3.5" />
                                        {/* 4. dueDate -> dDayText 적용 (방금 만든 디데이 기능) */}
                                        <span>{t("components.homeworkList.due", { dDayText: hw.dDayText })}</span>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleStartHomework(hw.id)} // id를 넘겨주도록 수정
                                    className="bg-[#FFAB91] hover:bg-[#FF8A65] text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-colors"
                                >
                                    {t("components.homeworkList.start")}
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {completed.map((hw) => (
                    <div key={hw.id} className="bg-white/60 rounded-xl p-3 border border-gray-100 flex items-center gap-3 opacity-60">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <div>
                            {/* 여기도 title -> taskName으로 변경 */}
                            <h4 className="font-bold text-gray-500 text-sm m-0 line-through">{hw.taskName}</h4>
                            <p className="text-gray-400 text-xs mt-0.5">{t("components.homeworkList.completedDesc")}</p>
                        </div>
                    </div>
                ))}

                {incomplete.length === 0 && (
                    <div className="bg-white rounded-xl p-4 text-center border border-green-100">
                        <p className="text-green-600 font-bold">{t("components.homeworkList.allDone")}</p>
                    </div>
                )}
            </div>
        </div>
    );
}