import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    AlertCircle,
    BarChart3,
    RefreshCw,
    Trophy,
} from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface TaskAnalyticsTabProps {
    taskId?: string;
    token: string | null;
    completionRate: number;
    quizCount: number;
}

interface QuizWrongRateResponse {
    quizId: number;
    quizNum: number;
    questionText: string;
    totalAttempts: number;
    wrongCount: number;
    wrongRate: number;
}

interface TaskQuizWrongRateAnalysisResponse {
    taskId: number;
    hardestQuiz: QuizWrongRateResponse | null;
    quizzes: QuizWrongRateResponse[];
}

export function TaskAnalyticsTab({
                                     taskId,
                                     token,
                                     completionRate,
                                     quizCount,
                                 }: TaskAnalyticsTabProps) {
    const { t } = useTranslation();

    const [analysisData, setAnalysisData] =
        useState<TaskQuizWrongRateAnalysisResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async () => {
        if (!taskId) return;

        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/teacher/tasks/${taskId}/analytics/quiz-wrong-rates`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(t("teacher.taskAnalytics.errors.apiFailed", { status: response.status }));
            }

            const data: TaskQuizWrongRateAnalysisResponse = await response.json();
            setAnalysisData(data);
        } catch (error) {
            console.error("오답률 분석 로딩 오류:", error);
            setErrorMessage(t("teacher.taskAnalytics.errors.loadFailed"));
        } finally {
            setIsLoading(false);
        }
    }, [taskId, token, t]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const chartData = useMemo(() => {
        return (
            analysisData?.quizzes.map((quiz) => ({
                quizLabel: t("teacher.taskAnalytics.chart.quizLabel", { quizNum: quiz.quizNum }),
                quizNum: quiz.quizNum,
                wrongRate: quiz.wrongRate,
                wrongCount: quiz.wrongCount,
                totalAttempts: quiz.totalAttempts,
                questionText: quiz.questionText,
            })) ?? []
        );
    }, [analysisData, t]);

    const hardestQuiz = analysisData?.hardestQuiz ?? null;

    return (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                        <BarChart3 size={22} />
                    </div>

                    <div>
                        <h2 className="text-xl font-black text-slate-950">
                            {t("teacher.taskAnalytics.title")}
                        </h2>
                        <p className="text-sm font-semibold text-slate-400">
                            {t("teacher.taskAnalytics.description")}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={fetchAnalytics}
                    disabled={isLoading}
                    className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <RefreshCw
                        size={14}
                        className={isLoading ? "animate-spin" : ""}
                    />
                    {t("teacher.taskAnalytics.refresh")}
                </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <AnalyticsPreviewCard
                    label={t("teacher.taskAnalytics.currentSubmissionRate.label")}
                    value={`${completionRate}%`}
                    description={t("teacher.taskAnalytics.currentSubmissionRate.description")}
                />

                <AnalyticsPreviewCard
                    label={t("teacher.taskAnalytics.quizCount.label")}
                    value={t("teacher.taskAnalytics.quizCount.value", { count: quizCount })}
                    description={t("teacher.taskAnalytics.quizCount.description")}
                />

                <AnalyticsPreviewCard
                    label={t("teacher.taskAnalytics.highestWrongRate.label")}
                    value={
                        hardestQuiz
                            ? `${hardestQuiz.wrongRate}%`
                            : isLoading
                                ? t("teacher.taskAnalytics.highestWrongRate.calculating")
                                : "-"
                    }
                    description={
                        hardestQuiz
                            ? t("teacher.taskAnalytics.highestWrongRate.summary", {
                                  quizNum: hardestQuiz.quizNum,
                                  wrongCount: hardestQuiz.wrongCount,
                                  totalAttempts: hardestQuiz.totalAttempts,
                              })
                            : t("teacher.taskAnalytics.highestWrongRate.empty")
                    }
                />
            </div>

            {hardestQuiz && (
                <div className="mt-6 rounded-[1.5rem] border border-red-100 bg-red-50 p-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-red-500">
                            <Trophy size={20} />
                        </div>

                        <div>
                            <p className="text-sm font-black text-red-600">
                                {t("teacher.taskAnalytics.hardestQuiz.title")}
                            </p>

                            <p className="mt-1 text-lg font-black text-slate-950">
                                {t("teacher.taskAnalytics.hardestQuiz.summary", {
                                    quizNum: hardestQuiz.quizNum,
                                    wrongRate: hardestQuiz.wrongRate,
                                })}
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-500">
                                {t("teacher.taskAnalytics.hardestQuiz.detail", {
                                    totalAttempts: hardestQuiz.totalAttempts,
                                    wrongCount: hardestQuiz.wrongCount,
                                })}
                            </p>

                            {hardestQuiz.questionText && (
                                <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-600">
                                    {hardestQuiz.questionText}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h3 className="text-base font-black text-slate-800">
                            {t("teacher.taskAnalytics.chart.title")}
                        </h3>
                        <p className="text-sm font-semibold text-slate-400">
                            {t("teacher.taskAnalytics.chart.description")}
                        </p>
                    </div>

                    <span className="text-xs font-bold text-slate-400">
                        {t("teacher.taskAnalytics.chart.unit")}
                    </span>
                </div>

                {isLoading && (
                    <div className="flex h-72 items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-9 w-9 rounded-full border-4 border-slate-200 border-t-purple-600 animate-spin" />
                            <p className="text-sm font-semibold text-slate-500">
                                {t("teacher.taskAnalytics.chart.loading")}
                            </p>
                        </div>
                    </div>
                )}

                {!isLoading && errorMessage && (
                    <div className="flex h-72 items-center justify-center rounded-2xl bg-white">
                        <div className="text-center">
                            <AlertCircle
                                className="mx-auto text-red-400"
                                size={32}
                            />
                            <p className="mt-3 text-sm font-bold text-slate-600">
                                {errorMessage}
                            </p>
                            <button
                                type="button"
                                onClick={fetchAnalytics}
                                className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-purple-600"
                            >
                                {t("teacher.taskAnalytics.retry")}
                            </button>
                        </div>
                    </div>
                )}

                {!isLoading && !errorMessage && chartData.length === 0 && (
                    <div className="flex h-72 items-center justify-center rounded-2xl bg-white">
                        <div className="text-center">
                            <BarChart3
                                className="mx-auto text-slate-300"
                                size={36}
                            />
                            <p className="mt-3 text-sm font-bold text-slate-600">
                                {t("teacher.taskAnalytics.chart.emptyTitle")}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-400">
                                {t("teacher.taskAnalytics.chart.emptyDescription")}
                            </p>
                        </div>
                    </div>
                )}

                {!isLoading && !errorMessage && chartData.length > 0 && (
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid
                                    vertical={false}
                                    strokeDasharray="3 3"
                                />

                                <XAxis
                                    dataKey="quizLabel"
                                    tickLine={false}
                                    axisLine={false}
                                />

                                <YAxis
                                    domain={[0, 100]}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}%`}
                                />

                                <Tooltip
                                    formatter={(value, name, props) => {
                                        if (name === "wrongRate") {
                                            return [`${value}%`, t("teacher.taskAnalytics.chart.wrongRate")];
                                        }

                                        return [value, name];
                                    }}
                                    labelFormatter={(label) => t("teacher.taskAnalytics.chart.tooltipLabel", { label })}
                                    contentStyle={{
                                        borderRadius: "16px",
                                        border: "1px solid #e2e8f0",
                                        boxShadow:
                                            "0 10px 30px rgba(15, 23, 42, 0.08)",
                                    }}
                                />

                                <Bar
                                    dataKey="wrongRate"
                                    name="wrongRate"
                                    radius={[10, 10, 0, 0]}
                                    fill="#9333ea"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </section>
    );
}

function AnalyticsPreviewCard({
                                  label,
                                  value,
                                  description,
                              }: {
    label: string;
    value: string;
    description: string;
}) {
    return (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-2xl font-black text-slate-950">
                {value}
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
                {description}
            </p>
        </div>
    );
}