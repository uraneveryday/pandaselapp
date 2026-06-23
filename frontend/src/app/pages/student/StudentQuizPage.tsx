import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";

interface QuizDetailResponse {
    quizId: bigint;
    type: "OX" | "CHOOSE";
    questionText: string;
    options: string[];
    questImagePath: string;
}

export const StudentQuizPage = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [quizzes, setQuizzes] = useState<QuizDetailResponse[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // 학생이 선택한 답안을 저장하는 상태 { 0: 2, 1: 0 ... (문제인덱스: 선택한답안인덱스) }
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
    const [dontKnowAnswers, setDontKnowAnswers] = useState<{ [key: number]: boolean }>({});
    const [startTime, setStartTime] = useState<string>("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuizzes = async () => {
            // ⭐️ 문제 진입 시점의 시간을 기록
            setStartTime(new Date().toISOString());

            const token = localStorage.getItem("jwt_token");

            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/api/student/tasks/${taskId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setQuizzes(data);
                } else {
                    alert(t("student.quiz.alerts.loadFailed"));
                    navigate("/student/my-page");
                }
            } catch (error) {
                console.error("Quiz loading error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuizzes();
    }, [taskId, navigate, t]);

    // 답안 선택 핸들러
    const handleSelectAnswer = (answerIndex: number) => {
        setUserAnswers((prev) => ({
            ...prev,
            [currentIndex]: answerIndex,
        }));
        setDontKnowAnswers((prev) => {
            const next = { ...prev };
            delete next[currentIndex];
            return next;
        });
    };

    const handleDontKnow = () => {
        setDontKnowAnswers((prev) => ({ ...prev, [currentIndex]: true }));
        setUserAnswers((prev) => {
            const next = { ...prev };
            delete next[currentIndex];
            return next;
        });
    };

    // 최종 제출 핸들러
    const handleSubmit = async () => {
        const answeredCount = quizzes.filter((_, index) =>
            userAnswers[index] !== undefined || dontKnowAnswers[index],
        ).length;
        if (answeredCount < quizzes.length) {
            const confirmSubmit = window.confirm(
                t("student.quiz.alerts.unansweredConfirm")
            );

            if (!confirmSubmit) return;
        }

        setIsSubmitting(true);
        const token = localStorage.getItem("jwt_token");

        // ⭐️ 백엔드 TaskSubmitRequestDto 구조와 완벽히 일치하도록 조립
        const submitData = {
            startTime: startTime,
            endTime: new Date().toISOString(),
            answers: quizzes.map((quiz, index) => ({
                quizId: quiz.quizId, // ⭐️ 백엔드 DTO 필드명과 일치시킴!
                submittedAnswer: dontKnowAnswers[index]
                    ? null
                    : String(userAnswers[index] ?? ""),
                dontKnow: Boolean(dontKnowAnswers[index]),
            })),
        };

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/student/tasks/${taskId}/submit`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(submitData),
                }
            );

            if (response.ok) {
                alert(t("student.quiz.alerts.submitSuccess"));
                navigate("/student/my-page");
                window.location.reload();
            } else {
                // 중복 제출 시 에러 팝업 표시
                alert(t("student.quiz.alerts.submitError"));
            }
        } catch (error) {
            console.error("Submit error:", error);
            alert(t("student.quiz.alerts.serverError"));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen font-bold text-gray-500">
                {t("student.quiz.loading")}
            </div>
        );
    }

    if (quizzes.length === 0) {
        return (
            <div className="max-w-3xl mx-auto p-6 mt-10 text-center">
                <h2 className="text-2xl font-bold text-gray-800">
                    {t("student.quiz.emptyTitle")}
                </h2>

                <button
                    onClick={() => navigate("/student/my-page")}
                    className="mt-4 text-blue-600 font-bold hover:underline"
                >
                    {t("student.quiz.backToMyPage")}
                </button>
            </div>
        );
    }

    const currentQuiz = quizzes[currentIndex];
    const isLastQuestion = currentIndex === quizzes.length - 1;

    return (
        <div className="max-w-3xl mx-auto p-6 mt-6">
            {/* 상단 네비게이션 & 진행률 */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate("/student/my-page")}
                    className="flex items-center text-gray-500 hover:text-gray-800 font-bold transition"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    {t("student.quiz.exit")}
                </button>

                <div className="text-sm font-bold text-gray-400">
                    <span className="text-blue-600 text-lg">{currentIndex + 1}</span> / {quizzes.length}
                </div>
            </div>

            {/* 진행 바 */}
            <div className="w-full bg-gray-200 h-2 rounded-full mb-8 overflow-hidden">
                <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / quizzes.length) * 100}%` }}
                />
            </div>

            {/* 문제 카드 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 min-h-[400px] flex flex-col">
                <div className="mb-6 flex gap-3 items-start">
                    <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-700 font-black text-xl rounded-xl">
                        Q{currentIndex + 1}
                    </span>

                    <h2 className="text-2xl font-bold text-gray-800 leading-relaxed pt-1">
                        {currentQuiz.questionText}
                    </h2>
                </div>

                {/* 이미지 영역 (있을 경우만) */}
                {currentQuiz.questImagePath && (
                    <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
                        <img
                            src={currentQuiz.questImagePath}
                            alt={t("student.quiz.questionImageAlt")}
                            className="w-full max-h-64 object-contain bg-gray-50"
                        />
                    </div>
                )}

                {/* 보기 선택 영역 */}
                <div className="flex-1 mt-auto">
                    {currentQuiz.type === "CHOOSE" ? (
                        <div className="grid grid-cols-1 gap-3">
                            {currentQuiz.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectAnswer(idx)}
                                    className={`p-4 text-left rounded-xl border-2 font-bold transition-all ${
                                        userAnswers[currentIndex] === idx
                                            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700"
                                    }`}
                                >
                                    <span className="mr-3 text-gray-400">{idx + 1}.</span> {opt}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex gap-6 justify-center">
                            <button
                                onClick={() => handleSelectAnswer(0)} // 0을 O로 간주
                                className={`w-32 h-32 rounded-2xl border-4 text-6xl font-black transition-all ${
                                    userAnswers[currentIndex] === 0
                                        ? "border-blue-500 bg-blue-50 text-blue-600 shadow-lg scale-105"
                                        : "border-gray-200 hover:border-gray-300 text-gray-400"
                                }`}
                            >
                                O
                            </button>

                            <button
                                onClick={() => handleSelectAnswer(1)} // 1을 X로 간주
                                className={`w-32 h-32 rounded-2xl border-4 text-6xl font-black transition-all ${
                                    userAnswers[currentIndex] === 1
                                        ? "border-red-500 bg-red-50 text-red-600 shadow-lg scale-105"
                                        : "border-gray-200 hover:border-gray-300 text-gray-400"
                                }`}
                            >
                                X
                            </button>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleDontKnow}
                        className={`mt-5 w-full rounded-xl border-2 px-4 py-3 font-bold transition-all ${
                            dontKnowAnswers[currentIndex]
                                ? "border-amber-500 bg-amber-50 text-amber-700 shadow-md"
                                : "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-400"
                        }`}
                    >
                        {t("student.quiz.dontKnow")}
                    </button>
                </div>
            </div>

            {/* 하단 이동 버튼 */}
            <div className="flex justify-between items-center mt-8">
                <button
                    onClick={() => setCurrentIndex((prev) => prev - 1)}
                    disabled={currentIndex === 0}
                    className={`flex items-center px-6 py-3 rounded-xl font-bold transition-colors ${
                        currentIndex === 0
                            ? "text-gray-300 cursor-not-allowed"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                    <ChevronLeft size={20} className="mr-1" />
                    {t("student.quiz.previous")}
                </button>

                {isLastQuestion ? (
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`flex items-center px-8 py-3 rounded-xl font-extrabold text-white transition-all shadow-md ${
                            isSubmitting
                                ? "bg-gray-400"
                                : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                        }`}
                    >
                        {isSubmitting
                            ? t("student.quiz.submitting")
                            : t("student.quiz.finalSubmit")}
                        <CheckCircle size={20} className="ml-2" />
                    </button>
                ) : (
                    <button
                        onClick={() => setCurrentIndex((prev) => prev + 1)}
                        className="flex items-center px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-95"
                    >
                        {t("student.quiz.next")}
                        <ChevronRight size={20} className="ml-1" />
                    </button>
                )}
            </div>
        </div>
    );
};
