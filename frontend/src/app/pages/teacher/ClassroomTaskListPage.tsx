import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import {TaskCreatePage} from "./TaskCreatePage";

// 1. 백엔드에서 내려주는 Task 리스트 DTO 타입 정의 (completionRate 추가)
interface TaskDTO {
    id: number;
    taskName: string;
    description: string;
    startDate: string;
    expiredDate: string;
    isDone: boolean;
    teacherName: string;
    className: string;
    completionRate: number; // ⭐️ 백엔드에서 계산되어 한 번에 넘어오는 완료율
}

export function ClassroomTaskListPage() {
    const { id } = useParams<{ id: string }>(); // URL에서 id 추출
    const navigate = useNavigate();

    const [tasks, setTasks] = useState<TaskDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ⭐️ 마감 처리 후 로컬 상태 업데이트를 위한 함수
    const handleTaskFinished = (taskId: number) => {
        setTasks(prevTasks =>
            prevTasks.map(t => t.id === taskId ? { ...t, isDone: true } : t)
        );
    };

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem("jwt_token");
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/teacher/classrooms/${id}/task/list`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (!response.ok) throw new Error("불러오기 실패");
                const taskData: TaskDTO[] = await response.json();
                setTasks(taskData.sort((a, b) => b.id - a.id));
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTasks();
    }, [id]);

    if (isLoading) return <div style={centerStyle}>로딩 중...</div>;

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
            {/* 상단 헤더 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2
                    onClick={() => navigate('/teacher')}
                    style={{ cursor: "pointer", margin: 0, color: "#333" }}
                >
                   홈으로
                </h2>
                <button
                    // 2. createTask 클릭 시 Task 생성 페이지로 이동
                    // router.tsx 기준 경로: /teacher/classrooms/:id/task/create
                    onClick={() => navigate(`/teacher/classrooms/${id}/task/create`)}
                    style={createButtonStyle}
                >
                    <Plus size={18} /> createTask
                </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {tasks.map((task, index) => (
                    <TaskListItem
                        key={task.id}
                        task={task}
                        sequence={tasks.length - index}
                        onFinish={handleTaskFinished}
                        classroomId={id} // ⭐️ 1. 부모가 가진 id를 자식(Props)에게 전달
                    />
                ))}
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// 개별 숙제 아이템 컴포넌트 (수정됨)
// ----------------------------------------------------------------------
function TaskListItem({task, sequence, onFinish, classroomId}: {
    task: TaskDTO,
    sequence: number,
    onFinish: (id: number) => void,
    classroomId?: string | undefined
}) {
    const navigate = useNavigate(); // 네비게이션 훅 추가

    // 마감하기 버튼 클릭 이벤트
    const handleFinishClick = async (e: React.MouseEvent) => {
        e.stopPropagation(); // ⭐️ 중요: 마감 버튼 클릭 시 부모 div의 onClick(상세페이지 이동)이 실행되지 않도록 막음

        if (!window.confirm("이 숙제를 마감하시겠습니까? 마감 후에는 학생들이 제출할 수 없습니다.")) return;

        try {
            const token = localStorage.getItem("jwt_token");
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/teacher/classrooms/${classroomId}/task/${task.id}/finish`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                alert("숙제가 마감되었습니다.");
                onFinish(task.id);
            } else {
                throw new Error("마감 처리 실패");
            }
        } catch (err) {
            alert("처리 중 에러가 발생했습니다.");
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "미정";
        const d = new Date(dateString);
        return `${String(d.getFullYear()).slice(-2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    };

    return (
        // ⭐️ onClick 이벤트 추가 및 cursor 포인터 스타일 적용
        <div
            style={{ ...listItemStyle, cursor: "pointer" }}
            onClick={() => navigate(`/teacher/classrooms/${classroomId}/task/${task.id}`)}
        >
            <div style={sequenceBoxStyle}>
                <span style={{ fontSize: "14px", color: "#666" }}>Task</span>
                <span style={{ fontSize: "24px", fontWeight: "900", color: "#1976d2" }}>{sequence}</span>
            </div>

            <div style={centerContentStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
                    {/* ⭐️ 진행중/종료됨 상태 배지 구분 */}
                    {task.isDone ? (
                        <span style={{ ...statusBadgeStyle, backgroundColor: "#eeeeee", color: "#666666" }}>종료됨</span>
                    ) : (
                        <span style={{ ...statusBadgeStyle, backgroundColor: "#e8f5e9", color: "#2e7d32" }}>진행 중</span>
                    )}
                    <h3 style={{ margin: 0, fontSize: "18px", color: "#333" }}>{task.taskName}</h3>
                </div>
                <div style={{ fontSize: "14px", color: "#666" }}>
                    🗓️ {formatDate(task.startDate)} ~ {formatDate(task.expiredDate)}
                </div>

                {/* ⭐️ 진행 중일 때만 마감하기 버튼 노출 */}
                {!task.isDone && (
                    <button onClick={handleFinishClick} style={finishBtnStyle}>마감하기</button>
                )}
            </div>

            <div style={rightContentStyle}>
                <div style={rateStyle}>{task.completionRate}%</div>
                <div style={metaTextStyle}>{task.className}</div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// 스타일 추가
// ----------------------------------------------------------------------
const statusBadgeStyle = {
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold" as const
};

const finishBtnStyle = {
    marginTop: "10px",
    width: "fit-content",
    padding: "5px 12px",
    backgroundColor: "white",
    color: "#d32f2f",
    border: "1px solid #d32f2f",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "bold" as const,
    transition: "all 0.2s"
};

// ----------------------------------------------------------------------
// 스타일 정의
// ----------------------------------------------------------------------
const centerStyle = { padding: "50px", textAlign: "center" as const, color: "#666" };
const iconButtonStyle = { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", borderRadius: "50%", backgroundColor: "#f5f5f5" };
const createButtonStyle = { display: "flex", alignItems: "center", gap: "5px", padding: "8px 16px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" };
const emptyBoxStyle = { padding: "40px", textAlign: "center" as const, backgroundColor: "#f9f9f9", borderRadius: "8px", color: "#888" };

const listItemStyle = {
    display: "flex",
    alignItems: "stretch",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #eaeaea",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
    overflow: "hidden"
};

const sequenceBoxStyle = {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e3f2fd",
    minWidth: "80px",
    padding: "15px",
    borderRight: "1px solid #eaeaea"
};

const centerContentStyle = {
    flex: 1,
    padding: "20px",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center"
};

const rightContentStyle = {
    padding: "20px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: "150px"
};

const rateStyle = {
    fontSize: "32px",
    fontWeight: "900",
    color: "#ff5722",
    marginBottom: "8px",
    fontFamily: "monospace"
};

const metaTextStyle = {
    fontSize: "12px",
    color: "#888",
    textAlign: "right" as const
};

const badgeStyle = {
    marginLeft: "8px",
    fontSize: "12px",
    padding: "2px 6px",
    backgroundColor: "#eee",
    color: "#666",
    borderRadius: "4px",
    verticalAlign: "middle",
    fontWeight: "normal"
};