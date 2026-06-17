import { useEffect, useState } from "react";
import { ArrowLeft, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../../api/client";
import { ProgressHeader } from "../../components/ProgressHeader";
import { StampTracker } from "../../components/StampTracker";
import { useHomework } from "../../context/HomeworkContext";

// 1. API 응답 타입 정의 (필수)
interface UserMeResponse {
    name: string;
    totalStars: number; // 토탈 스코어? 추후 백엔드에서 제공해야 할 데이터
    streak: number;     // 연속 학습? 추후 백엔드에서 제공해야 할 데이터
}

// 2. 개별 과제(Task) 렌더링용 하위 컴포넌트 분리
// (Task의 타입은 HomeworkContext에서 정의한 것을 가져와 쓰는 것이 좋습니다)
const TaskCard = ({ task, onStart }: { task: any, onStart: (id: number) => void }) => {
    const isDateExpired = task.dDay !== undefined && task.dDay < 0;
    const isCompleted = task.completed;

    return (
        <div className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
            isCompleted ? "border-green-200 bg-green-50" : "border-blue-100 bg-white"
        }`}>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                        {task.category}
                    </span>

                    {!isCompleted && task.dDayText && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            isDateExpired || task.dDay === 0
                                ? 'bg-red-100 text-red-600'
                                : 'bg-orange-100 text-orange-600'
                        }`}>
                            {task.dDayText}
                        </span>
                    )}

                    {isCompleted && (
                        <span className="text-xs font-bold px-2 py-1 bg-green-200 text-green-700 rounded-full">
                            완료
                        </span>
                    )}
                </div>
                <h4 className="font-bold text-gray-800">{task.taskName}</h4>
                <p className="text-sm text-gray-500">{task.description}</p>
            </div>

            {!isCompleted && (
                <motion.button
                    whileHover={!isDateExpired ? { scale: 1.05 } : {}}
                    whileTap={!isDateExpired ? { scale: 0.95 } : {}}
                    onClick={() => {
                        if (isDateExpired) {
                            alert("😥 앗! ⚠️ 이미 숙제 기한이 지났어요!");
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
                        <><span>⚠️</span>기한 만료</>
                    ) : (
                        <><PlayCircle className="w-4 h-4" />시작하기</>
                    )}
                </motion.button>
            )}
        </div>
    );
};

export function MyPage() {
    const navigate = useNavigate();
    // userInfo 객체 하나로 상태를 묶어 관리 (추후 확장성 고려)
    const [userInfo, setUserInfo] = useState<UserMeResponse | null>(null);

    const { tasks, isLoading, hasNoClassroom } = useHomework();

    const handleStartTask = (taskId: number) => {
        navigate(`/student/task/${taskId}/quizzes`);
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("jwt_token");
            if (!token) {
                alert("정상적인 로그인 절차가 필요합니다.");
                navigate("/login", { replace: true });
                return;
            }

            try {
                // 3. 타입 안정성 확보 및 async/await 적용
                const res = await apiClient.get<UserMeResponse>("/users/me");
                setUserInfo(res.data);
            } catch (err) {
                console.error("me API 통신 실패 원인:", err);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleRewardClick = () => {
        console.log("선물 버튼 클릭됨!");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 font-bold">데이터를 불러오는 중입니다...</p>
            </div>
        );
    }

    if (hasNoClassroom) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center space-y-4">
                    <div className="text-4xl">🏫</div>
                    <h2 className="text-xl font-bold text-gray-800">소속된 클래스룸이 없습니다.</h2>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate("/")}
                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full font-medium"
                    >
                        홈으로 돌아가기
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
                    <h2 className="text-xl font-bold">나의 학습</h2>
                </div>

                {/* API가 로드된 후에만 헤더를 렌더링. 하드코딩 제거를 대비한 설계 */}
                {userInfo && (
                    <ProgressHeader
                        userName={userInfo.name}
                        totalStars={userInfo.totalStars || 342} // 백엔드 연동 전까지 임시 기본값 부여
                        streak={userInfo.streak || 7}           // 백엔드 연동 전까지 임시 기본값 부여
                    />
                )}

                <StampTracker onRewardClick={handleRewardClick} />

                <div>
                    <h3 className="mb-4 px-2 font-bold text-lg">오늘의 학습 과제</h3>

                    {tasks.length === 0 ? (
                        <div className="bg-white p-6 rounded-2xl shadow-sm text-center border-2 border-dashed border-gray-200">
                            <span className="text-3xl mb-2 block">🎉</span>
                            <p className="text-gray-600 font-medium">야호! 지금은 할 숙제가 없어요!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* 4. 분리된 TaskCard 컴포넌트를 활용하여 맵핑 로직을 대폭 단순화 */}
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