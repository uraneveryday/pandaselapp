import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    Award,
    BarChart3,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    Edit,
    FileText,
    ImageIcon,
    LayoutDashboard,
    ListChecks,
    Plus,
    Sparkles,
    Trash2,
    Users,
} from "lucide-react";
import { QuizEditModal } from "./QuizEditModal";
import { supabase } from "../../../utils/supabaseClient";
import { TaskAnalyticsTab } from "./TaskAnalyticsTab";

type TaskTab = "overview" | "quizzes" | "analytics";

interface QuizResponse {
    quizNum: number;
    quizName: string;
    quizId: number;
    quizImage: string;
}

export interface TaskDto {
    id: number;
    taskName: string;
    description: string;
    startDate: string;
    expiredDate: string;
    rewardStamp: number;
    isDone?: boolean;
    done?: boolean;
    className: string;
    completionRate: number;
    averageTakesTime?: number;
}

const getFileNameFromUrl = (url: string) => {
    if (!url) return null;

    const cleanUrl = url.split("?")[0];
    const fileName = cleanUrl.split("/").pop();

    return fileName ? decodeURIComponent(fileName) : null;
};

const formatTakesTime = (seconds?: number | null) => {
    if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) {
        return "-";
    }

    const rounded = Math.round(seconds);
    const minutes = Math.floor(rounded / 60);
    const remainSeconds = rounded % 60;

    if (minutes === 0) return `${remainSeconds}sec`;

    if (remainSeconds === 0) return `${minutes}min`;

    return `${minutes}min ${remainSeconds}sec`;
};

const hasAverageTakesTime = (seconds?: number | null) => {
    return seconds != null && Number.isFinite(seconds) && seconds > 0;
};

const formatDate = (dateString?: string, locale = "ko-KR") => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(date);
};

const getDaysLeftText = (
    expiredDate: string | undefined,
    t: any,
) => {
    if (!expiredDate) return t("teacher.taskDetail.deadline.none");

    const now = new Date();
    const end = new Date(expiredDate);

    if (Number.isNaN(end.getTime())) return t("teacher.taskDetail.deadline.invalid");

    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return t("teacher.taskDetail.deadline.expired");
    if (diffDays === 0) return t("teacher.taskDetail.deadline.today");
    return t("teacher.taskDetail.deadline.daysLeft", { count: diffDays });
};

const clampRate = (rate?: number) => {
    return Math.min(100, Math.max(0, rate ?? 0));
};

export function TaskDetailPage() {
    const { id: classroomId, taskId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const currentLocale = i18n.resolvedLanguage || i18n.language || "zh-CN";

    const [taskInfo, setTaskInfo] = useState<TaskDto | null>(
        location.state as TaskDto | null
    );
    const [quizList, setQuizList] = useState<QuizResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TaskTab>("quizzes");
    const [editQuizId, setEditQuizId] = useState<number | null>(null);

    const isTaskDone = taskInfo?.isDone ?? taskInfo?.done ?? false;
    const completionRate = clampRate(taskInfo?.completionRate);
    const daysLeftText = getDaysLeftText(taskInfo?.expiredDate, t);

    const token = useMemo(() => localStorage.getItem("jwt_token"), []);

    const backToTaskList = () => {
        navigate(`/teacher/classrooms/${classroomId}/task`);
    };

    const fetchQuizList = useCallback(async () => {
        if (!classroomId || !taskId) return;

        try {
            const quizRes = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/teacher/classrooms/${classroomId}/tasks/${taskId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!quizRes.ok) {
                throw new Error(t("teacher.taskDetail.errors.quizListLoadFailed", { status: quizRes.status }));
            }

            const data: QuizResponse[] = await quizRes.json();
            setQuizList(data);
        } catch (error) {
            console.error("퀴즈 목록 로딩 오류:", error);
        }
    }, [classroomId, taskId, token, t]);

    const fetchTaskDetail = useCallback(async () => {
        if (!classroomId || !taskId) return;

        setIsLoading(true);

        try {
            const taskRes = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/teacher/classrooms/${classroomId}/tasks/${taskId}/detail`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!taskRes.ok) {
                throw new Error(t("teacher.taskDetail.errors.taskDetailLoadFailed", { status: taskRes.status }));
            }

            const taskData: TaskDto = await taskRes.json();

            setTaskInfo(taskData);
            await fetchQuizList();
        } catch (error) {
            console.error("데이터 로딩 오류:", error);
        } finally {
            setIsLoading(false);
        }
    }, [classroomId, taskId, token, fetchQuizList, t]);

    useEffect(() => {
        fetchTaskDetail();
    }, [fetchTaskDetail]);

    const handleDeleteTask = async () => {
        if (!classroomId || !taskId) return;

        const confirmDelete = window.confirm(
            t("teacher.taskDetail.alerts.deleteTaskConfirm")
        );

        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/teacher/classrooms/${classroomId}/tasks/${taskId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(t("teacher.taskDetail.errors.taskDeleteFailed", { status: response.status }));
            }

            alert(t("teacher.taskDetail.alerts.deleteTaskSuccess"));
            backToTaskList();
        } catch (error) {
            console.error("Task delete error:", error);
            alert(t("teacher.taskDetail.alerts.deleteTaskFailed"));
        }
    };

    const handleDeleteQuiz = async (quizId: number, imageUrl?: string) => {
        const confirmDelete = window.confirm(t("teacher.taskDetail.alerts.deleteQuizConfirm"));

        if (!confirmDelete) return;

        if (imageUrl) {
            const fileName = getFileNameFromUrl(imageUrl);

            if (fileName) {
                try {
                    await supabase.storage.from("quiz_imeages").remove([fileName]);
                } catch (storageError) {
                    console.error("Storage image delete error:", storageError);
                }
            }
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/teacher/quizzes/${quizId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(t("teacher.taskDetail.errors.quizDeleteFailed", { status: response.status }));
            }

            alert(t("teacher.taskDetail.alerts.deleteQuizSuccess"));
            await fetchQuizList();
        } catch (error) {
            console.error("Quiz delete error:", error);
            alert(t("teacher.taskDetail.alerts.deleteQuizFailed"));
        }
    };

    if (isLoading && !taskInfo) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-slate-500">
                        {t("teacher.taskDetail.loading")}
                    </p>
                </div>
            </div>
        );
    }

    if (!taskInfo) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-6">
                <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                        <FileText className="text-slate-500" size={28} />
                    </div>

                    <h2 className="text-xl font-extrabold text-slate-900">
                        {t("teacher.taskDetail.notFoundTitle")}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        {t("teacher.taskDetail.notFoundDescription")}
                    </p>

                    <button
                        onClick={backToTaskList}
                        className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-blue-600 transition-colors"
                    >
                        {t("teacher.taskDetail.backToList")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-6xl px-5 py-6 md:px-8 md:py-8 space-y-6">
                <button
                    onClick={backToTaskList}
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
                >
                    <ArrowLeft size={18} />
                    {t("teacher.taskDetail.backToList")}
                </button>

                <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                    <div className="relative p-6 md:p-8">
                        <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-blue-50" />

                        <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-700">
                                        <BookOpen size={14} />
                                        {taskInfo.className}
                                    </span>

                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold ${
                                            isTaskDone
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-orange-50 text-orange-700"
                                        }`}
                                    >
                                        <CheckCircle2 size={14} />
                                        {isTaskDone ? t("teacher.taskDetail.status.closed") : t("teacher.taskDetail.status.open")}
                                    </span>

                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-extrabold text-slate-600">
                                        <Clock size={14} />
                                        {daysLeftText}
                                    </span>
                                </div>

                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-950">
                                        {taskInfo.taskName}
                                    </h1>

                                    <p className="mt-3 max-w-3xl text-sm md:text-base leading-7 text-slate-500 whitespace-pre-wrap">
                                        {taskInfo.description || t("teacher.taskDetail.noDescription")}
                                    </p>
                                </div>
                            </div>

                            <div className="relative flex flex-wrap gap-2 md:justify-end">
                                <button
                                    onClick={() =>
                                        navigate(
                                            `/teacher/classrooms/${classroomId}/task/${taskId}/add-quizzes`
                                        )
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-blue-600 active:scale-95 transition-all"
                                >
                                    <Plus size={18} />
                                    {t("teacher.taskDetail.quizAdd")}
                                </button>

                                <button
                                    onClick={handleDeleteTask}
                                    className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-extrabold text-red-600 hover:bg-red-100 active:scale-95 transition-all"
                                >
                                    <Trash2 size={18} />
                                    {t("teacher.taskDetail.taskDelete")}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 border-t border-slate-100 sm:grid-cols-2 xl:grid-cols-5">
                        <SummaryCard
                            icon={<Users size={20} />}
                            label={t("teacher.taskDetail.cards.submissionRate.label")}
                            value={`${completionRate}%`}
                            subText={t("teacher.taskDetail.cards.submissionRate.subText")}
                        />
                        <SummaryCard
                            icon={<Clock size={20} />}
                            label={t("teacher.taskDetail.cards.averageTakesTime.label")}
                            value={formatTakesTime(taskInfo.averageTakesTime)}
                            subText={
                                hasAverageTakesTime(taskInfo.averageTakesTime)
                                    ? t("teacher.taskDetail.cards.averageTakesTime.subText")
                                    : t("teacher.taskDetail.cards.averageTakesTime.empty")
                            }
                        />

                        <SummaryCard
                            icon={<ListChecks size={20} />}
                            label={t("teacher.taskDetail.cards.quizCount.label")}
                            value={t("teacher.taskDetail.cards.quizCount.value", { count: quizList.length })}
                            subText={t("teacher.taskDetail.cards.quizCount.subText")}
                        />

                        <SummaryCard
                            icon={<Award size={20} />}
                            label={t("teacher.taskDetail.cards.rewardStamp.label")}
                            value={t("teacher.taskDetail.cards.rewardStamp.value", { count: taskInfo.rewardStamp })}
                            subText={t("teacher.taskDetail.cards.rewardStamp.subText")}
                        />

                        <SummaryCard
                            icon={<Calendar size={20} />}
                            label={t("teacher.taskDetail.cards.deadline.label")}
                            value={formatDate(taskInfo.expiredDate, currentLocale)}
                            subText={daysLeftText}
                        />
                    </div>
                </section>

                <section className="rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-sm">
                    <div className="grid grid-cols-3 gap-2">
                        <TabButton
                            active={activeTab === "overview"}
                            icon={<LayoutDashboard size={18} />}
                            label={t("teacher.taskDetail.tabs.overview")}
                            onClick={() => setActiveTab("overview")}
                        />

                        <TabButton
                            active={activeTab === "quizzes"}
                            icon={<ListChecks size={18} />}
                            label={t("teacher.taskDetail.tabs.quizzes")}
                            onClick={() => setActiveTab("quizzes")}
                        />

                        <TabButton
                            active={activeTab === "analytics"}
                            icon={<BarChart3 size={18} />}
                            label={t("teacher.taskDetail.tabs.analytics")}
                            onClick={() => setActiveTab("analytics")}
                        />
                    </div>
                </section>

                {activeTab === "overview" && (
                    <OverviewTab
                        taskInfo={taskInfo}
                        completionRate={completionRate}
                        quizCount={quizList.length}
                        isTaskDone={isTaskDone}
                    />
                )}

                {activeTab === "quizzes" && (
                    <QuizListTab
                        classroomId={classroomId}
                        taskId={taskId}
                        quizList={quizList}
                        onEdit={(quizId) => setEditQuizId(quizId)}
                        onDelete={handleDeleteQuiz}
                    />
                )}

                {activeTab === "analytics" && (
                    <TaskAnalyticsTab
                        taskId={taskId}
                        token={token}
                        completionRate={completionRate}
                        quizCount={quizList.length}
                    />
                )}

                {editQuizId !== null && classroomId && taskId && (
                    <QuizEditModal
                        taskId={taskId}
                        quizId={editQuizId}
                        onClose={() => setEditQuizId(null)}
                        onSuccess={async () => {
                            setEditQuizId(null);
                            await fetchQuizList();
                        }}
                    />
                )}
            </div>
        </div>
    );
}

function SummaryCard({
                         icon,
                         label,
                         value,
                         subText,
                     }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    subText: string;
}) {
    return (
        <div className="border-t border-slate-100 p-5 first:border-t-0 md:border-l md:border-t-0 md:first:border-l-0">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                {icon}
            </div>

            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-2xl font-black text-slate-950">
                {value}
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-400">
                {subText}
            </p>
        </div>
    );
}

function TabButton({
                       active,
                       icon,
                       label,
                       onClick,
                   }: {
    active: boolean;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold transition-all ${
                active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
        >
            {icon}
            {label}
        </button>
    );
}

function OverviewTab({
                         taskInfo,
                         completionRate,
                         quizCount,
                         isTaskDone,
                     }: {
    taskInfo: TaskDto;
    completionRate: number;
    quizCount: number;
    isTaskDone: boolean;
}) {
    const { t, i18n } = useTranslation();
    const currentLocale = i18n.resolvedLanguage || i18n.language || "zh-CN";

    const averageTakesTimeText = formatTakesTime(taskInfo.averageTakesTime);
    const hasAverageTime = hasAverageTakesTime(taskInfo.averageTakesTime);

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <FileText size={22} />
                    </div>

                    <div>
                        <h2 className="text-xl font-black text-slate-950">
                            {t("teacher.taskDetail.overview.title")}
                        </h2>
                        <p className="text-sm font-semibold text-slate-400">
                            {t("teacher.taskDetail.overview.description")}
                        </p>
                    </div>
                </div>

                <div className="mt-6 space-y-5">
                    <InfoRow label={t("teacher.taskDetail.overview.info.taskName")} value={taskInfo.taskName} />
                    <InfoRow label={t("teacher.taskDetail.overview.info.className")} value={taskInfo.className} />
                    <InfoRow label={t("teacher.taskDetail.overview.info.startDate")} value={formatDate(taskInfo.startDate, currentLocale)} />
                    <InfoRow label={t("teacher.taskDetail.overview.info.expiredDate")} value={formatDate(taskInfo.expiredDate, currentLocale)} />
                    <InfoRow label={t("teacher.taskDetail.cards.rewardStamp.label")} value={t("teacher.taskDetail.cards.rewardStamp.value", { count: taskInfo.rewardStamp })} />

                    <InfoRow
                        label={t("teacher.taskDetail.overview.info.averageTakesTime")}
                        value={formatTakesTime(taskInfo.averageTakesTime)}
                    />

                    <InfoRow label={t("teacher.taskDetail.overview.info.status")} value={isTaskDone ? t("teacher.taskDetail.status.closed") : t("teacher.taskDetail.status.open")} />

                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                            {t("teacher.taskDetail.overview.taskDescriptionTitle")}
                        </p>

                        <div className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600 whitespace-pre-wrap">
                            {taskInfo.description || t("teacher.taskDetail.overview.noTaskDescription")}
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <Sparkles size={22} />
                    </div>

                    <div>
                        <h2 className="text-xl font-black text-slate-950">
                            {t("teacher.taskDetail.overview.progressSummaryTitle")}
                        </h2>
                        <p className="text-sm font-semibold text-slate-400">
                            {t("teacher.taskDetail.overview.progressSummaryDescription")}
                        </p>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-sm font-bold text-slate-400">
                                {t("teacher.taskDetail.overview.submissionRate")}
                            </p>
                            <p className="text-5xl font-black text-slate-950">
                                {completionRate}
                                <span className="text-2xl text-slate-400">%</span>
                            </p>
                        </div>

                        <p className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-600">
                            {t("teacher.taskDetail.overview.quizCount", { count: quizCount })}
                        </p>
                    </div>

                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-blue-600 transition-all duration-700"
                            style={{ width: `${completionRate}%` }}
                        />
                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                                    {t("teacher.taskDetail.overview.averageTakesTime.label")}
                                </p>

                                <p className="mt-1 text-3xl font-black text-slate-950">
                                    {averageTakesTimeText}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm">
                                <Clock size={21} />
                            </div>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-500">
                            {hasAverageTime
                                ? t("teacher.taskDetail.overview.averageTakesTime.description")
                                : t("teacher.taskDetail.overview.averageTakesTime.empty")}
                        </p>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-500">
                        {t("teacher.taskDetail.overview.futureAnalyticsGuide")}
                    </p>
                </div>
            </section>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-1 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="text-sm font-bold text-slate-800">
                {value || "-"}
            </p>
        </div>
    );
}

function QuizListTab({
                         classroomId,
                         taskId,
                         quizList,
                         onEdit,
                         onDelete,
                     }: {
    classroomId?: string;
    taskId?: string;
    quizList: QuizResponse[];
    onEdit: (quizId: number) => void;
    onDelete: (quizId: number, imageUrl?: string) => void;
}) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <ListChecks size={22} />
                        </div>

                        <div>
                            <h2 className="text-xl font-black text-slate-950">
                                {t("teacher.taskDetail.quizzes.title")}
                            </h2>
                            <p className="text-sm font-semibold text-slate-400">
                                {t("teacher.taskDetail.quizzes.description", { count: quizList.length })}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() =>
                        navigate(
                            `/teacher/classrooms/${classroomId}/task/${taskId}/add-quizzes`
                        )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-blue-600 active:scale-95 transition-all"
                >
                    <Plus size={18} />
                    {t("teacher.taskDetail.quizAdd")}
                </button>
            </div>

            <div className="mt-6">
                {quizList.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {quizList.map((quiz) => (
                            <QuizCard
                                key={quiz.quizId}
                                quiz={quiz}
                                onEdit={() => onEdit(quiz.quizId)}
                                onDelete={() => onDelete(quiz.quizId, quiz.quizImage)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                            <ListChecks size={26} />
                        </div>

                        <h3 className="text-lg font-black text-slate-700">
                            {t("teacher.taskDetail.quizzes.emptyTitle")}
                        </h3>

                        <p className="mt-2 text-sm font-semibold text-slate-400">
                            {t("teacher.taskDetail.quizzes.emptyDescription")}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}

function QuizCard({
                      quiz,
                      onEdit,
                      onDelete,
                  }: {
    quiz: QuizResponse;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const { t } = useTranslation();

    return (
        <article className="group rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    {quiz.quizImage ? (
                        <img
                            src={quiz.quizImage}
                            alt={t("teacher.taskDetail.quizzes.imageAlt", { quizName: quiz.quizName })}
                            className="h-20 w-20 rounded-2xl border border-slate-200 object-cover"
                        />
                    ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">
                            <ImageIcon size={24} />
                        </div>
                    )}

                    <div>
                        <div className="mb-2 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">
                            Q{quiz.quizNum}
                        </div>

                        <h3 className="text-lg font-black text-slate-900">
                            {quiz.quizName || t("teacher.taskDetail.quizzes.untitled")}
                        </h3>

                        <p className="mt-1 text-sm font-semibold text-slate-400">
                            {t("teacher.taskDetail.quizzes.questionId", { quizId: quiz.quizId })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                    <button
                        onClick={onEdit}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-extrabold text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                        <Edit size={16} />
                        {t("teacher.taskDetail.quizzes.edit")}
                    </button>

                    <button
                        onClick={onDelete}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-extrabold text-red-600 hover:bg-red-100 transition-colors"
                    >
                        <Trash2 size={16} />
                        {t("teacher.taskDetail.quizzes.delete")}
                    </button>
                </div>
            </div>
        </article>
    );
}