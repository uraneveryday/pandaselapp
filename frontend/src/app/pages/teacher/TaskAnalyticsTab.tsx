import { useCallback, useEffect, useMemo, useState } from "react";
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
                throw new Error(`오답률 분석 조회 실패: ${response.status}`);
            }

            const data: TaskQuizWrongRateAnalysisResponse = await response.json();
            setAnalysisData(data);
        } catch (error) {
            console.error("오답률 분석 로딩 오류:", error);
            setErrorMessage("오답률 분석 데이터를 불러오지 못했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, [taskId, token]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const chartData = useMemo(() => {
        return (
            analysisData?.quizzes.map((quiz) => ({
                quizLabel: `${quiz.quizNum}번`,
                quizNum: quiz.quizNum,
                wrongRate: quiz.wrongRate,
                wrongCount: quiz.wrongCount,
                totalAttempts: quiz.totalAttempts,
                questionText: quiz.questionText,
            })) ?? []
        );
    }, [analysisData]);

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
                            숙제 분석
                        </h2>
                        <p className="text-sm font-semibold text-slate-400">
                            문제별 오답률을 기준으로 학생들이 가장 어려워한 문항을 확인합니다.
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
                    새로고침
                </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <AnalyticsPreviewCard
                    label="현재 제출률"
                    value={`${completionRate}%`}
                    description="현재 task detail API의 completionRate 기반"
                />

                <AnalyticsPreviewCard
                    label="퀴즈 수"
                    value={`${quizCount}개`}
                    description="현재 task에 연결된 quiz list 기반"
                />

                <AnalyticsPreviewCard
                    label="최고 오답률"
                    value={
                        hardestQuiz
                            ? `${hardestQuiz.wrongRate}%`
                            : isLoading
                                ? "계산 중"
                                : "-"
                    }
                    description={
                        hardestQuiz
                            ? `${hardestQuiz.quizNum}번 문제 · ${hardestQuiz.wrongCount}/${hardestQuiz.totalAttempts}명 오답`
                            : "제출된 풀이 기록이 있으면 표시됩니다."
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
                                가장 오답률이 높은 문제
                            </p>

                            <p className="mt-1 text-lg font-black text-slate-950">
                                {hardestQuiz.quizNum}번 문제 · 오답률{" "}
                                {hardestQuiz.wrongRate}%
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-500">
                                총 {hardestQuiz.totalAttempts}명 중{" "}
                                {hardestQuiz.wrongCount}명이 틀렸습니다.
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
                            문제별 오답률
                        </h3>
                        <p className="text-sm font-semibold text-slate-400">
                            x축은 문제 번호, y축은 오답률입니다.
                        </p>
                    </div>

                    <span className="text-xs font-bold text-slate-400">
                        단위: %
                    </span>
                </div>

                {isLoading && (
                    <div className="flex h-72 items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-9 w-9 rounded-full border-4 border-slate-200 border-t-purple-600 animate-spin" />
                            <p className="text-sm font-semibold text-slate-500">
                                오답률 데이터를 불러오고 있습니다.
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
                                다시 시도
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
                                아직 분석할 풀이 기록이 없습니다.
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-400">
                                학생들이 문제를 풀고 제출하면 오답률이 표시됩니다.
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
                                            return [`${value}%`, "오답률"];
                                        }

                                        return [value, name];
                                    }}
                                    labelFormatter={(label) => `문제 ${label}`}
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