import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface TaskResponse {
    id: number;
    taskName: string;
    category: string;
    description: string;
    expirationDate: string | Date;
    completed: boolean;
    isDone: boolean;
    dDay?: number;
    dDayText?: string;
}

interface HomeworkContextType {
    tasks: TaskResponse[];
    isLoading: boolean;
    hasNoClassroom: boolean;
    hasHomework: boolean;
    fetchTasks: () => void;
}

const HomeworkContext = createContext<HomeworkContextType | undefined>(undefined);

const calculateDDayInfo = (expirationDate: string | Date) => {
    if (!expirationDate) return { dDay: 0, dDayText: "" };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(expirationDate);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let dDayText = "";
    if (diffDays > 0) {
        dDayText = `D-${diffDays}`;
    } else if (diffDays === 0) {
        dDayText = "D-Day";
    } else {
        dDayText = `D+${Math.abs(diffDays)}`;
    }

    return { dDay: diffDays, dDayText };
};

export function HomeworkProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasNoClassroom, setHasNoClassroom] = useState(false);

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("jwt_token");

            // ⭐️ 403 에러 해결: Authorization 헤더 완벽 복구
            const response = await fetch('/api/student/tasks/get', {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.status === 404 || response.status === 403) {
                setHasNoClassroom(true);
                setTasks([]);
                return;
            }

            if (response.ok) {
                const rawData = await response.json();

                // ⭐️ 데이터 정규화 및 필터링: 백엔드 변수명 이슈(snake_case 등) 완벽 방어
                const processedTasks = rawData
                    .filter((task: any) => {
                        // isDone, is_done, done 어떤 이름으로 오든 마감 여부 캐치
                        const isClosed = task.isDone ?? task.is_done ?? task.done ?? false;
                        return isClosed === false; // 마감 안 된 것만 통과!
                    })
                    .map((task: any) => {
                        // 만약 DB에서 expired_date로 온다면 처리
                        const expDate = task.expirationDate || task.expired_date;
                        const { dDay, dDayText } = calculateDDayInfo(expDate);

                        return {
                            id: task.id,
                            taskName: task.taskName || task.task_name,
                            category: task.category,
                            description: task.description,
                            expirationDate: expDate,
                            completed: task.completed || false,
                            isDone: false, // 이미 위에서 필터링 했으므로 노출된 과제는 무조건 false
                            dDay,
                            dDayText
                        } as TaskResponse;
                    });

                setTasks(processedTasks);
                setHasNoClassroom(false);
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const hasHomework = tasks.some(task => !task.completed);

    return (
        <HomeworkContext.Provider value={{ tasks, isLoading, hasNoClassroom, hasHomework, fetchTasks }}>
            {children}
        </HomeworkContext.Provider>
    );
}

export function useHomework() {
    const context = useContext(HomeworkContext);
    if (!context) {
        throw new Error("useHomework must be used within a HomeworkProvider");
    }
    return context;
}