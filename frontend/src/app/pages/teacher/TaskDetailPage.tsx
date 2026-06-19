import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
}

const getFileNameFromUrl = (url: string) => {
    if (!url) return null;

    const cleanUrl = url.split("?")[0];
    const fileName = cleanUrl.split("/").pop();

    return fileName ? decodeURIComponent(fileName) : null;
};

const formatDate = (dateString?: string) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(date);
};

const getDaysLeftText = (expiredDate?: string) => {
    if (!expiredDate) return "마감일 없음";

    const now = new Date();
    const end = new Date(expiredDate);

    if (Number.isNaN(end.getTime())) return "마감일 오류";

    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "마감 지남";
    if (diffDays === 0) return "오늘 마감";
    return `${diffDays}일 남음`;
};

const clampRate = (rate?: number) => {
    return Math.min(100, Math.max(0, rate ?? 0));
};

export function TaskDetailPage() {
    const { id: classroomId, taskId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [taskInfo, setTaskInfo] = useState<TaskDto | null>(
        location.state as TaskDto | null
    );
    const [quizList, setQuizList] = useState<QuizResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TaskTab>("quizzes");
    const [editQuizId, setEditQuizId] = useState<number | null>(null);

    const isTaskDone = taskInfo?.isDone ?? taskInfo?.done ?? false;
    const completionRate = clampRate(taskInfo?.completionRate);
    const daysLeftText = getDaysLeftText(taskInfo?.expiredDate);

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
                throw new Error(`퀴즈 목록 조회 실패: ${quizRes.status}`);
            }

            const data: QuizResponse[] = await quizRes.json();
            setQuizList(data);
        } catch (error) {
            console.error("퀴즈 목록 로딩 오류:", error);
        }
    }, [classroomId, taskId, token]);

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
                throw new Error(`숙제 상세 조회 실패: ${taskRes.status}`);
            }

            const taskData: TaskDto = await taskRes.json();

            setTaskInfo(taskData);
            await fetchQuizList();
        } catch (error) {
            console.error("데이터 로딩 오류:", error);
        } finally {
            setIsLoading(false);
        }
    }, [classroomId, taskId, token, fetchQuizList]);

    useEffect(() => {
        fetchTaskDetail();
    }, [fetchTaskDetail]);

    const handleDeleteTask = async () => {
        if (!classroomId || !taskId) return;

        const confirmDelete = window.confirm(
            "정말 이 숙제를 삭제하시겠습니까? 연결된 퀴즈도 함께 관리 대상에서 제외될 수 있습니다."
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
                throw new Error(`숙제 삭제 실패: ${response.status}`);
            }

            alert("숙제가 삭제되었습니다.");
            backToTaskList();
        } catch (error) {
            console.error("숙제 삭제 오류:", error);
            alert("숙제 삭제 중 오류가 발생했습니다.");
        }
    };

    const handleDeleteQuiz = async (quizId: number, imageUrl?: string) => {
        const confirmDelete = window.confirm("이 퀴즈를 정말 삭제하시겠습니까?");

        if (!confirmDelete) return;

        if (imageUrl) {
            const fileName = getFileNameFromUrl(imageUrl);

            if (fileName) {
                try {
                    await supabase.storage.from("quiz_imeages").remove([fileName]);
                } catch (storageError) {
                    console.error("스토리지 이미지 삭제 오류:", storageError);
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
                throw new Error(`퀴즈 삭제 실패: ${response.status}`);
            }

            alert("퀴즈가 삭제되었습니다.");
            await fetchQuizList();
        } catch (error) {
            console.error("퀴즈 삭제 오류:", error);
            alert("퀴즈 삭제 중 오류가 발생했습니다.");
        }
    };

    if (isLoading && !taskInfo) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-slate-500">
                        숙제 정보를 불러오고 있습니다.
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
                        숙제 정보를 찾을 수 없습니다.
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        삭제되었거나 접근 권한이 없는 숙제일 수 있습니다.
                    </p>

                    <button
                        onClick={backToTaskList}
                        className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-blue-600 transition-colors"
                    >
                        숙제 목록으로 돌아가기
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
                    숙제 목록으로 돌아가기
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
                                        {isTaskDone ? "마감됨" : "진행 중"}
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
                                        {taskInfo.description || "등록된 숙제 설명이 없습니다."}
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
                                    퀴즈 추가
                                </button>

                                <button
                                    onClick={handleDeleteTask}
                                    className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-extrabold text-red-600 hover:bg-red-100 active:scale-95 transition-all"
                                >
                                    <Trash2 size={18} />
                                    숙제 삭제
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 border-t border-slate-100 md:grid-cols-4">
                        <SummaryCard
                            icon={<Users size={20} />}
                            label="학생 제출률"
                            value={`${completionRate}%`}
                            subText="현재 숙제 완료 비율"
                        />

                        <SummaryCard
                            icon={<ListChecks size={20} />}
                            label="등록된 퀴즈"
                            value={`${quizList.length}개`}
                            subText="이 숙제에 포함된 문제"
                        />

                        <SummaryCard
                            icon={<Award size={20} />}
                            label="보상 도장"
                            value={`${taskInfo.rewardStamp}개`}
                            subText="완료 시 지급"
                        />

                        <SummaryCard
                            icon={<Calendar size={20} />}
                            label="마감일"
                            value={formatDate(taskInfo.expiredDate)}
                            subText={daysLeftText}
                        />
                    </div>
                </section>

                <section className="rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-sm">
                    <div className="grid grid-cols-3 gap-2">
                        <TabButton
                            active={activeTab === "overview"}
                            icon={<LayoutDashboard size={18} />}
                            label="개요"
                            onClick={() => setActiveTab("overview")}
                        />

                        <TabButton
                            active={activeTab === "quizzes"}
                            icon={<ListChecks size={18} />}
                            label="퀴즈 구성"
                            onClick={() => setActiveTab("quizzes")}
                        />

                        <TabButton
                            active={activeTab === "analytics"}
                            icon={<BarChart3 size={18} />}
                            label="분석"
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
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <FileText size={22} />
                    </div>

                    <div>
                        <h2 className="text-xl font-black text-slate-950">
                            숙제 개요
                        </h2>
                        <p className="text-sm font-semibold text-slate-400">
                            선생님이 설정한 숙제 기본 정보입니다.
                        </p>
                    </div>
                </div>

                <div className="mt-6 space-y-5">
                    <InfoRow label="숙제 이름" value={taskInfo.taskName} />
                    <InfoRow label="반 이름" value={taskInfo.className} />
                    <InfoRow label="시작 일시" value={formatDate(taskInfo.startDate)} />
                    <InfoRow label="마감 일시" value={formatDate(taskInfo.expiredDate)} />
                    <InfoRow label="보상 도장" value={`${taskInfo.rewardStamp}개`} />
                    <InfoRow label="상태" value={isTaskDone ? "마감됨" : "진행 중"} />

                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                            과제 설명
                        </p>

                        <div className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600 whitespace-pre-wrap">
                            {taskInfo.description || "등록된 설명이 없습니다."}
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
                            진행 요약
                        </h2>
                        <p className="text-sm font-semibold text-slate-400">
                            현재 숙제 진행 상태
                        </p>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-sm font-bold text-slate-400">
                                제출률
                            </p>
                            <p className="text-5xl font-black text-slate-950">
                                {completionRate}
                                <span className="text-2xl text-slate-400">%</span>
                            </p>
                        </div>

                        <p className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-600">
                            퀴즈 {quizCount}개
                        </p>
                    </div>

                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-blue-600 transition-all duration-700"
                            style={{ width: `${completionRate}%` }}
                        />
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-500">
                        나중에 학생별 제출 상태, 미제출 학생 목록, 평균 풀이 시간까지 이 카드 아래로 확장할 수 있습니다.
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
                                등록된 퀴즈 구성
                            </h2>
                            <p className="text-sm font-semibold text-slate-400">
                                이 숙제에는 총 {quizList.length}개의 퀴즈가 포함되어 있습니다.
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
                    퀴즈 추가
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
                            아직 등록된 퀴즈가 없습니다.
                        </h3>

                        <p className="mt-2 text-sm font-semibold text-slate-400">
                            퀴즈를 추가하면 학생들이 풀 문제 구성이 이곳에 표시됩니다.
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
    return (
        <article className="group rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    {quiz.quizImage ? (
                        <img
                            src={quiz.quizImage}
                            alt={`${quiz.quizName} 이미지`}
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
                            {quiz.quizName || "제목 없는 퀴즈"}
                        </h3>

                        <p className="mt-1 text-sm font-semibold text-slate-400">
                            문제 ID: {quiz.quizId}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                    <button
                        onClick={onEdit}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-extrabold text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                        <Edit size={16} />
                        수정
                    </button>

                    <button
                        onClick={onDelete}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-extrabold text-red-600 hover:bg-red-100 transition-colors"
                    >
                        <Trash2 size={16} />
                        삭제
                    </button>
                </div>
            </div>
        </article>
    );
}