import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
    AlertCircle,
    BarChart3,
    Clock3,
    HelpCircle,
    MousePointerClick,
    RefreshCw,
    Target,
    Trophy,
} from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    ReferenceLine,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
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

interface AnswerChoice {
    answerValue: string;
    answerLabel: string;
    selectionCount: number;
    selectionRate: number;
    correct: boolean;
    mostCommonWrong: boolean;
}

interface QuizLearningAnalysis {
    quizId: number;
    quizNum: number;
    questionText: string;
    totalAttempts: number;
    correctCount: number;
    wrongCount: number;
    dontKnowCount: number;
    correctRate: number;
    wrongRate: number;
    dontKnowRate: number;
    answerChoices: AnswerChoice[];
}

interface StudentPoint {
    studentId: number;
    studentName: string;
    takesTime: number;
    taskScore: number;
    quadrant: Quadrant;
}

type Quadrant = "FAST_HIGH_SCORE" | "SLOW_HIGH_SCORE" | "FAST_LOW_SCORE" | "SLOW_LOW_SCORE";

interface TimeScoreAnalysis {
    completedStudents: number;
    medianTime: number;
    medianScore: number;
    quadrants: { quadrant: Quadrant; studentCount: number }[];
    students: StudentPoint[];
}

interface LearningAnalyticsResponse {
    taskId: number;
    quizzes: QuizLearningAnalysis[];
    timeScore: TimeScoreAnalysis;
}

const QUADRANT_COLORS: Record<Quadrant, string> = {
    FAST_HIGH_SCORE: "#16a34a",
    SLOW_HIGH_SCORE: "#2563eb",
    FAST_LOW_SCORE: "#f97316",
    SLOW_LOW_SCORE: "#dc2626",
};

function formatTime(seconds: number) {
    const value = Math.max(0, Math.round(seconds));
    const minutes = Math.floor(value / 60);
    const remainder = value % 60;
    return minutes > 0 ? `${minutes}m ${remainder}s` : `${remainder}s`;
}

export function TaskAnalyticsTab({ taskId, token, completionRate, quizCount }: TaskAnalyticsTabProps) {
    const { t } = useTranslation();
    const [analysisData, setAnalysisData] = useState<LearningAnalyticsResponse | null>(null);
    const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async () => {
        if (!taskId) return;
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/teacher/tasks/${taskId}/analytics/learning-overview`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            if (!response.ok) {
                throw new Error(t("teacher.taskAnalytics.errors.apiFailed", { status: response.status }));
            }
            const data: LearningAnalyticsResponse = await response.json();
            setAnalysisData(data);
            setSelectedQuizId((previous) => previous ?? data.quizzes[0]?.quizId ?? null);
        } catch (error) {
            console.error("학습 분석 로딩 오류:", error);
            setErrorMessage(t("teacher.taskAnalytics.errors.loadFailed"));
        } finally {
            setIsLoading(false);
        }
    }, [taskId, token, t]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const selectedQuiz = useMemo(
        () => analysisData?.quizzes.find((quiz) => quiz.quizId === selectedQuizId) ?? analysisData?.quizzes[0] ?? null,
        [analysisData, selectedQuizId],
    );

    const itemChartData = useMemo(() => analysisData?.quizzes.map((quiz) => ({
        ...quiz,
        quizLabel: t("teacher.taskAnalytics.quizLabel", { quizNum: quiz.quizNum }),
    })) ?? [], [analysisData, t]);

    const highestWrongQuiz = useMemo(() => analysisData?.quizzes
        .filter((quiz) => quiz.totalAttempts > 0)
        .reduce<QuizLearningAnalysis | null>((highest, quiz) =>
            !highest || quiz.wrongRate > highest.wrongRate ? quiz : highest, null) ?? null,
    [analysisData]);

    const highestDontKnowQuiz = useMemo(() => analysisData?.quizzes
        .filter((quiz) => quiz.totalAttempts > 0)
        .reduce<QuizLearningAnalysis | null>((highest, quiz) =>
            !highest || quiz.dontKnowRate > highest.dontKnowRate ? quiz : highest, null) ?? null,
    [analysisData]);

    const answerChoiceData = selectedQuiz?.answerChoices.map((choice) => ({
        ...choice,
        answerLabel: choice.answerLabel,
    })) ?? [];
    const commonWrongChoice = selectedQuiz?.answerChoices.find((choice) => choice.mostCommonWrong) ?? null;
    const timeScore = analysisData?.timeScore;

    return (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                        <BarChart3 size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-950">{t("teacher.taskAnalytics.title")}</h2>
                        <p className="text-sm font-semibold text-slate-400">{t("teacher.taskAnalytics.description")}</p>
                    </div>
                </div>
                <button type="button" onClick={fetchAnalytics} disabled={isLoading}
                    className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60">
                    <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                    {t("teacher.taskAnalytics.refresh")}
                </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                <SummaryCard label={t("teacher.taskAnalytics.submissionRate")} value={`${completionRate}%`} icon={<Target size={18} />} />
                <SummaryCard label={t("teacher.taskAnalytics.quizCount.label")} value={t("teacher.taskAnalytics.quizCount.value", { count: quizCount })} icon={<BarChart3 size={18} />} />
                <SummaryCard label={t("teacher.taskAnalytics.highestWrong.label")}
                    value={highestWrongQuiz ? `${highestWrongQuiz.wrongRate}%` : "-"}
                    description={highestWrongQuiz ? t("teacher.taskAnalytics.highestWrong.detail", { quizNum: highestWrongQuiz.quizNum }) : undefined}
                    icon={<Trophy size={18} />} />
                <SummaryCard label={t("teacher.taskAnalytics.highestDontKnow.label")}
                    value={highestDontKnowQuiz ? `${highestDontKnowQuiz.dontKnowRate}%` : "-"}
                    description={highestDontKnowQuiz ? t("teacher.taskAnalytics.highestDontKnow.detail", { quizNum: highestDontKnowQuiz.quizNum }) : undefined}
                    icon={<HelpCircle size={18} />} />
            </div>

            {isLoading && <LoadingState label={t("teacher.taskAnalytics.loading")} />}
            {!isLoading && errorMessage && <ErrorState message={errorMessage} retry={fetchAnalytics} retryLabel={t("teacher.taskAnalytics.retry")} />}

            {!isLoading && !errorMessage && analysisData && (
                <div className="mt-6 space-y-6">
                    <ChartPanel title={t("teacher.taskAnalytics.itemChart.title")} description={t("teacher.taskAnalytics.itemChart.description")}>
                        {itemChartData.length === 0 ? <EmptyState /> : (
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={itemChartData} onClick={(state: { activePayload?: { payload?: QuizLearningAnalysis }[] }) => {
                                        const quiz = state.activePayload?.[0]?.payload;
                                        if (quiz) setSelectedQuizId(quiz.quizId);
                                    }}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                        <XAxis dataKey="quizLabel" tickLine={false} axisLine={false} />
                                        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                        <Tooltip formatter={(value, name) => [`${value}%`, t(`teacher.taskAnalytics.legend.${String(name)}`)]} />
                                        <Legend formatter={(value) => t(`teacher.taskAnalytics.legend.${value}`)} />
                                        <Bar dataKey="correctRate" stackId="responses" fill="#22c55e" name="correctRate" />
                                        <Bar dataKey="wrongRate" stackId="responses" fill="#ef4444" name="wrongRate" />
                                        <Bar dataKey="dontKnowRate" stackId="responses" fill="#f59e0b" name="dontKnowRate" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                        <div className="mt-4 flex flex-wrap gap-2">
                            {analysisData.quizzes.map((quiz) => (
                                <button key={quiz.quizId} type="button" onClick={() => setSelectedQuizId(quiz.quizId)}
                                    className={`rounded-xl border px-3 py-2 text-xs font-extrabold transition-colors ${selectedQuiz?.quizId === quiz.quizId ? "border-purple-500 bg-purple-50 text-purple-700" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
                                    {t("teacher.taskAnalytics.quizLabel", { quizNum: quiz.quizNum })}
                                </button>
                            ))}
                        </div>
                        <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-slate-400"><MousePointerClick size={13} />{t("teacher.taskAnalytics.itemChart.clickHint")}</p>
                    </ChartPanel>

                    {selectedQuiz && (
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                            <ChartPanel title={t("teacher.taskAnalytics.answerChart.title", { quizNum: selectedQuiz.quizNum })} description={selectedQuiz.questionText}>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={answerChoiceData} layout="vertical" margin={{ left: 12, right: 24 }}>
                                            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                                            <XAxis type="number" allowDecimals={false} />
                                            <YAxis dataKey="answerLabel" type="category" width={160} tick={{ fontSize: 12 }} />
                                            <Tooltip formatter={(value) => [value, t("teacher.taskAnalytics.answerChart.count")]} />
                                            <Bar dataKey="selectionCount" radius={[0, 8, 8, 0]}>
                                                {answerChoiceData.map((choice) => <Cell key={choice.answerValue} fill={choice.correct ? "#22c55e" : choice.mostCommonWrong ? "#ef4444" : "#94a3b8"} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </ChartPanel>
                            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                                <p className="text-sm font-black text-slate-800">{t("teacher.taskAnalytics.interpretation.title")}</p>
                                <div className="mt-4 space-y-3 text-sm font-semibold text-slate-600">
                                    <p>{t("teacher.taskAnalytics.interpretation.counts", { correct: selectedQuiz.correctCount, wrong: selectedQuiz.wrongCount, dontKnow: selectedQuiz.dontKnowCount })}</p>
                                    {commonWrongChoice ? <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-red-700"><p className="text-xs font-black">{t("teacher.taskAnalytics.interpretation.commonWrong")}</p><p className="mt-1 font-bold">{commonWrongChoice.answerLabel} · {commonWrongChoice.selectionCount}{t("teacher.taskAnalytics.people")}</p></div> : <p className="text-slate-400">{t("teacher.taskAnalytics.interpretation.noWrong")}</p>}
                                    {selectedQuiz.dontKnowRate > selectedQuiz.wrongRate && <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3 text-amber-700">{t("teacher.taskAnalytics.interpretation.dontKnowDominant")}</div>}
                                </div>
                            </div>
                        </div>
                    )}

                    <ChartPanel title={t("teacher.taskAnalytics.timeScore.title")} description={t("teacher.taskAnalytics.timeScore.description")}>
                        {!timeScore || timeScore.students.length === 0 ? <EmptyState /> : <>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <Metric label={t("teacher.taskAnalytics.timeScore.completed")} value={`${timeScore.completedStudents}${t("teacher.taskAnalytics.people")}`} />
                                <Metric label={t("teacher.taskAnalytics.timeScore.medianTime")} value={formatTime(timeScore.medianTime)} />
                                <Metric label={t("teacher.taskAnalytics.timeScore.medianScore")} value={`${timeScore.medianScore}${t("teacher.taskAnalytics.points")}`} />
                            </div>
                            <div className="mt-5 h-96 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 12, right: 20, bottom: 12, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" dataKey="takesTime" name={t("teacher.taskAnalytics.timeScore.xAxis")} tickFormatter={formatTime} />
                                        <YAxis type="number" dataKey="taskScore" name={t("teacher.taskAnalytics.timeScore.yAxis")} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                                        <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(value, name) => [name === "takesTime" ? formatTime(Number(value)) : `${value}%`, name === "takesTime" ? t("teacher.taskAnalytics.timeScore.xAxis") : t("teacher.taskAnalytics.timeScore.yAxis")]} labelFormatter={() => ""} />
                                        <ReferenceLine x={timeScore.medianTime} stroke="#64748b" strokeDasharray="4 4" />
                                        <ReferenceLine y={timeScore.medianScore} stroke="#64748b" strokeDasharray="4 4" />
                                        {(Object.keys(QUADRANT_COLORS) as Quadrant[]).map((quadrant) => <Scatter key={quadrant} name={t(`teacher.taskAnalytics.quadrants.${quadrant}`)} data={timeScore.students.filter((student) => student.quadrant === quadrant)} fill={QUADRANT_COLORS[quadrant]} />)}
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                                {timeScore.quadrants.map((item) => <div key={item.quadrant} className="rounded-xl border border-slate-200 bg-white p-3"><span className="flex items-center gap-2 text-xs font-bold text-slate-500"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: QUADRANT_COLORS[item.quadrant] }} />{t(`teacher.taskAnalytics.quadrants.${item.quadrant}`)}</span><strong className="mt-2 block text-xl text-slate-900">{item.studentCount}{t("teacher.taskAnalytics.people")}</strong></div>)}
                            </div>
                        </>}
                    </ChartPanel>
                </div>
            )}
        </section>
    );
}

function SummaryCard({ label, value, description, icon }: { label: string; value: string; description?: string; icon: ReactNode }) {
    return <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5"><div className="flex items-center justify-between text-slate-400"><p className="text-xs font-extrabold uppercase tracking-wide">{label}</p>{icon}</div><p className="mt-2 text-2xl font-black text-slate-950">{value}</p>{description && <p className="mt-2 text-xs font-semibold text-slate-500">{description}</p>}</div>;
}

function Metric({ label, value }: { label: string; value: string }) {
    return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-400">{label}</p><p className="mt-1 text-lg font-black text-slate-900">{value}</p></div>;
}

function ChartPanel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
    return <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"><h3 className="text-base font-black text-slate-800">{title}</h3><p className="mt-1 text-sm font-semibold text-slate-400">{description}</p><div className="mt-4">{children}</div></div>;
}

function LoadingState({ label }: { label: string }) {
    return <div className="flex h-72 items-center justify-center"><div className="flex flex-col items-center gap-3"><div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-purple-600" /><p className="text-sm font-semibold text-slate-500">{label}</p></div></div>;
}

function ErrorState({ message, retry, retryLabel }: { message: string; retry: () => void; retryLabel: string }) {
    return <div className="mt-6 flex h-72 items-center justify-center rounded-2xl bg-slate-50"><div className="text-center"><AlertCircle className="mx-auto text-red-400" size={32} /><p className="mt-3 text-sm font-bold text-slate-600">{message}</p><button type="button" onClick={retry} className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white">{retryLabel}</button></div></div>;
}

function EmptyState() {
    const { t } = useTranslation();
    return <div className="flex h-60 items-center justify-center rounded-2xl bg-white text-center"><div><Clock3 className="mx-auto text-slate-300" size={36} /><p className="mt-3 text-sm font-bold text-slate-600">{t("teacher.taskAnalytics.emptyTitle")}</p><p className="mt-1 text-xs font-semibold text-slate-400">{t("teacher.taskAnalytics.emptyDescription")}</p></div></div>;
}
