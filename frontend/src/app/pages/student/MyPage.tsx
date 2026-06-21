import { useEffect } from "react";
import { ArrowLeft, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { StampTracker } from "../../components/StampTracker";
import { useHomework } from "../../context/HomeworkContext";

// 개별 과제 카드
const TaskCard = ({
                      task,
                      onStart,
                  }: {
    task: any;
    onStart: (id: number) => void;
}) => {
    const { t } = useTranslation();

    const isDateExpired = task.dDay !== undefined && task.dDay < 0;
    const isCompleted = task.completed;

    return (
        <div
            className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
                isCompleted
                    ? "border-green-200 bg-green-50"
                    : "border-blue-100 bg-white"
            }`}
        >
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                        {task.category}
                    </span>

                    {!isCompleted && task.dDayText && (
                        <span
                            className={`text-xs font-bold px-2 py-1 rounded-full ${
                                isDateExpired || task.dDay === 0
                                    ? "bg-red-100 text-red-600"
                                    : "bg-orange-100 text-orange-600"
                            }`}
                        >
                            {task.dDayText}
                        </span>
                    )}

                    {isCompleted && (
                        <span className="text-xs font-bold px-2 py-1 bg-green-200 text-green-700 rounded-full">
                            {t("student.myPage.task.complete")}
                        </span>
                    )}
                </div>

                <h4 className="font-bold text-gray-800">
                    {task.taskName}
                </h4>

                <p className="text-sm text-gray-500">
                    {task.description}
                </p>
            </div>

            {!isCompleted && (
                <motion.button
                    whileHover={!isDateExpired ? { scale: 1.05 } : {}}
                    whileTap={!isDateExpired ? { scale: 0.95 } : {}}
                    onClick={() => {
                        if (isDateExpired) {
                            alert(t("student.myPage.task.expiredAlert"));
                        } else {
                            onStart(task.id);
                        }
                    }}
                    className={`ml-4 flex items-center gap-1 px-4 py-2 rounded-full font-medium text-sm shadow-sm transition-all ${
                        isDateExpired
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-blue-500 text-white"
                    }`}
                >
                    {isDateExpired ? (
                        <>{t("student.myPage.task.expired")}</>
                    ) : (
                        <>
                            <PlayCircle className="w-4 h-4" />
                            {t("student.myPage.task.start")}
                        </>
                    )}
                </motion.button>
            )}
        </div>
    );
};

export function MyPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { tasks, isLoading, hasNoClassroom } = useHomework();

    const handleStartTask = (taskId: number) => {
        navigate(`/student/task/${taskId}/quizzes`);
    };

    useEffect(() => {
        const token = localStorage.getItem("jwt_token");

        if (!token) {
            alert(t("student.myPage.errors.normalLoginRequired"));
            navigate("/login", { replace: true });
        }
    }, [navigate, t]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 font-bold">
                    {t("student.myPage.loading")}
                </p>
            </div>
        );
    }

    if (hasNoClassroom) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center space-y-4">
                    <div className="text-4xl">🏫</div>

                    <h2 className="text-xl font-bold text-gray-800">
                        {t("student.myPage.noClassroomTitle")}
                    </h2>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate("/")}
                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full font-medium"
                    >
                        {t("student.myPage.goHome")}
                    </motion.button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-8">
            <div className="max-w-md mx-auto p-4 space-y-6">
                <div className="flex items-center gap-3">
                    <motion.button
                        onClick={() => navigate("/")}
                        className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </motion.button>

                    <h2 className="text-xl font-bold">
                        {t("student.myPage.myLearning")}
                    </h2>
                </div>

                <StampTracker />

                <div>
                    <h3 className="mb-4 px-2 font-bold text-lg">
                        {t("student.myPage.todayHomework")}
                    </h3>

                    {tasks.length === 0 ? (
                        <div className="bg-white p-6 rounded-2xl shadow-sm text-center border-2 border-dashed border-gray-200">
                            <span className="text-3xl mb-2 block">🎉</span>

                            <p className="text-gray-600 font-medium">
                                {t("student.myPage.noHomework")}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tasks.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onStart={handleStartTask}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}