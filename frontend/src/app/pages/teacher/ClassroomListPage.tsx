import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle2,
    ChevronRight,
    ClipboardList,
    Loader2,
    Plus,
    RefreshCw,
} from "lucide-react";

interface TaskListItemDTO {
    id: number;
    taskOrder: number;
    taskName: string;
    isDone: boolean;
}

export function ClassroomTaskListPage() {
    const { id: classroomId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [tasks, setTasks] = useState<TaskListItemDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // 현재 마감 처리 중인 숙제 ID
    const [finishingTaskId, setFinishingTaskId] =
        useState<number | null>(null);

    const fetchTasks = useCallback(async () => {
        if (!classroomId) {
            setErrorMessage("교실 정보를 확인할 수 없습니다.");
            setIsLoading(false);
            return;
        }

        const token = localStorage.getItem("jwt_token");

        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/teacher/classrooms/${classroomId}/tasks`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 401 || response.status === 403) {
                navigate("/login", { replace: true });
                return;
            }

            if (!response.ok) {
                throw new Error(`숙제 목록 조회 실패: ${response.status}`);
            }

            const data: TaskListItemDTO[] = await response.json();

            setTasks(
                [...data].sort(
                    (a, b) => b.taskOrder - a.taskOrder
                )
            );
        } catch (error) {
            console.error("숙제 목록 조회 오류:", error);
            setErrorMessage("숙제 목록을 불러오지 못했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, [classroomId, navigate]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleTaskFinish = async (
        event: React.MouseEvent<HTMLButtonElement>,
        taskId: number
    ) => {
        event.stopPropagation();

        if (finishingTaskId !== null) {
            return;
        }

        const confirmed = window.confirm(
            "이 숙제를 마감하시겠습니까?\n마감 후에는 학생들이 더 이상 제출할 수 없습니다."
        );

        if (!confirmed) {
            return;
        }

        const token = localStorage.getItem("jwt_token");

        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        setFinishingTaskId(taskId);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/teacher/classrooms/${classroomId}/tasks/${taskId}/finish`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`숙제 마감 실패: ${response.status}`);
            }

            setTasks(previousTasks =>
                previousTasks.map(task =>
                    task.id === taskId
                        ? { ...task, isDone: true }
                        : task
                )
            );
        } catch (error) {
            console.error("숙제 마감 오류:", error);
            window.alert("숙제를 마감하지 못했습니다.");
        } finally {
            setFinishingTaskId(null);
        }
    };

    const openTaskDetail = (taskId: number) => {
        navigate(
            `/teacher/classrooms/${classroomId}/task/${taskId}`
        );
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
                {/* 상단 이동 버튼 */}
                <button
                    type="button"
                    onClick={() => navigate("/teacher")}
                    className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
                >
                    <ArrowLeft size={17} />
                    교실 관리로 돌아가기
                </button>

                {/* 페이지 헤더 */}
                <header className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
                            <ClipboardList size={17} />
                            CLASSROOM TASKS
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            숙제 관리
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            등록된 숙제 {tasks.length}개
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/teacher/classrooms/${classroomId}/task/create`
                            )
                        }
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-600 active:scale-[0.98]"
                    >
                        <Plus size={18} />
                        새 숙제 만들기
                    </button>
                </header>

                {/* 로딩 */}
                {isLoading && (
                    <TaskListSkeleton />
                )}

                {/* 조회 실패 */}
                {!isLoading && errorMessage && (
                    <div className="rounded-2xl border border-red-100 bg-white px-6 py-14 text-center shadow-sm">
                        <p className="font-semibold text-slate-700">
                            {errorMessage}
                        </p>

                        <button
                            type="button"
                            onClick={fetchTasks}
                            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                        >
                            <RefreshCw size={16} />
                            다시 불러오기
                        </button>
                    </div>
                )}

                {/* 빈 목록 */}
                {!isLoading &&
                    !errorMessage &&
                    tasks.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
                            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                <ClipboardList size={26} />
                            </div>

                            <h2 className="text-lg font-bold text-slate-800">
                                등록된 숙제가 없습니다
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                첫 번째 숙제를 만들어 학생들에게 배정해보세요.
                            </p>
                        </div>
                    )}

                {/* 숙제 목록 */}
                {!isLoading &&
                    !errorMessage &&
                    tasks.length > 0 && (
                        <section className="space-y-3">
                            {tasks.map(task => (
                                <TaskListItem
                                    key={task.id}
                                    task={task}
                                    isFinishing={
                                        finishingTaskId === task.id
                                    }
                                    onOpen={() =>
                                        openTaskDetail(task.id)
                                    }
                                    onFinish={event =>
                                        handleTaskFinish(
                                            event,
                                            task.id
                                        )
                                    }
                                />
                            ))}
                        </section>
                    )}
            </main>
        </div>
    );
}

interface TaskListItemProps {
    task: TaskListItemDTO;
    isFinishing: boolean;
    onOpen: () => void;
    onFinish: (
        event: React.MouseEvent<HTMLButtonElement>
    ) => void;
}

function TaskListItem({
                          task,
                          isFinishing,
                          onOpen,
                          onFinish,
                      }: TaskListItemProps) {
    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLElement>
    ) => {
        if (
            event.key === "Enter" ||
            event.key === " "
        ) {
            event.preventDefault();
            onOpen();
        }
    };

    return (
        <article
            role="link"
            tabIndex={0}
            onClick={onOpen}
            onKeyDown={handleKeyDown}
            className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:p-5"
        >
            {/* 숙제 순서 */}
            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-100 transition-colors group-hover:bg-blue-50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Task
                </span>

                <span className="text-xl font-black text-slate-800 group-hover:text-blue-600">
                    {task.taskOrder}
                </span>
            </div>

            {/* 상태와 숙제 이름 */}
            <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2">
                    {task.isDone ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            마감됨
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                            진행 중
                        </span>
                    )}
                </div>

                <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                    {task.taskName}
                </h2>
            </div>

            {/* 우측 액션 */}
            <div className="flex shrink-0 items-center gap-2">
                {!task.isDone ? (
                    <button
                        type="button"
                        onClick={onFinish}
                        disabled={isFinishing}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-xs font-bold text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:h-10 sm:px-4 sm:text-sm"
                    >
                        {isFinishing ? (
                            <>
                                <Loader2
                                    size={15}
                                    className="animate-spin"
                                />
                                <span className="hidden sm:inline">
                                    처리 중
                                </span>
                            </>
                        ) : (
                            "마감하기"
                        )}
                    </button>
                ) : (
                    <div className="hidden items-center gap-1.5 px-2 text-xs font-semibold text-slate-400 sm:flex">
                        <CheckCircle2 size={16} />
                        마감 완료
                    </div>
                )}

                <ChevronRight
                    size={20}
                    className="text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-blue-500"
                />
            </div>
        </article>
    );
}

function TaskListSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3, 4].map(item => (
                <div
                    key={item}
                    className="flex animate-pulse items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5"
                >
                    <div className="h-14 w-14 rounded-xl bg-slate-200" />

                    <div className="flex-1">
                        <div className="mb-3 h-5 w-20 rounded-full bg-slate-200" />
                        <div className="h-5 w-2/5 rounded bg-slate-200" />
                    </div>

                    <div className="h-10 w-24 rounded-lg bg-slate-200" />
                </div>
            ))}
        </div>
    );
}