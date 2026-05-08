import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    ArrowLeft, Plus, Edit, Trash2,
    Calendar, CheckCircle, Clock, Users, BookOpen
} from "lucide-react";

import { QuizEditModal } from "./QuizEditModal";
import {supabase} from "../../../utils/supabaseClient";
const getFileNameFromUrl = (url: string) => {
    if (!url) return null;

    // 1. 쿼리 파라미터(? 뒤에 있는 찌꺼기) 제거
    const cleanUrl = url.split('?')[0];

    // 2. 맨 마지막 파일명 추출
    let fileName = cleanUrl.split('/').pop();

    // 3. 파일명에 한글이나 띄어쓰기가 있을 경우(%20 등)를 위해 디코딩
    if (fileName) {
        return decodeURIComponent(fileName);
    }
    return null;
};
// 퀴즈 응답 타입
interface QuizzesResponse {
    quizNum: number;
    quizName: string;
    quizId: bigint;
    quizImage: string;
}

export interface TaskDto {
    id: number;
    taskName: string;
    description: string;
    startDate: string;
    expiredDate: string;
    isDone: boolean;
    className: string;
    completionRate: number;
}

export function TaskDetailPage() {
    const { id: classroomId, taskId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // 상태 관리
    const [taskInfo, setTaskInfo] = useState<TaskDto | null>(location.state as TaskDto | null);
    const [quizList, setQuizList] = useState<QuizzesResponse[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // ⭐️ 모달 상태 관리 (수정할 퀴즈의 ID)
    const [editQuizId, setEditQuizId] = useState<bigint | null>(null);

    // 날짜 포맷 함수
    const formatDate = (dateString?: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
// ⭐️ 숙제(Task) 삭제 핸들러
    const handleDeleteTask = async () => {
        if (!window.confirm("정말 삭제하시겠습니까? 되돌릴 수 없습니다.")) return;

        const token = localStorage.getItem("jwt_token");
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/teacher/classrooms/${classroomId}/task/${taskId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                alert("숙제가 안전하게 삭제되었습니다.");
                // 삭제 후 숙제 목록 페이지로 이동
                navigate(`/teacher/classrooms/${classroomId}/task`);
            } else {
                alert("숙제 삭제에 실패했습니다.");
            }
        } catch (error) {
            console.error("숙제 삭제 오류:", error);
            alert("서버 오류가 발생했습니다.");
        }
    };


    // ⭐️ 퀴즈 목록만 다시 불러오는 함수 (삭제, 수정 완료 후 호출됨)
    const fetchQuizList = async () => {
        const token = localStorage.getItem("jwt_token");
        try {
            const quizRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/teacher/classrooms/${classroomId}/task/${taskId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (quizRes.ok) {
                const data = await quizRes.json();
                setQuizList(data);
            }
        } catch (error) {
            console.error("퀴즈 목록 로딩 오류:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const token = localStorage.getItem("jwt_token");
            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            };

            try {
                // 1. Task 정보가 없을 경우 목록 API에서 검색 (기존과 동일하게 유지됨!)
                if (!taskInfo) {
                    const taskRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/teacher/classrooms/${classroomId}/task/list`,
                        { headers });
                    if (taskRes.ok) {
                        const list: TaskDto[] = await taskRes.json();
                        const current = list.find(t => t.id === Number(taskId));
                        if (current) setTaskInfo(current);
                    }
                }

                // 2. 퀴즈 목록 조회
                await fetchQuizList();
            } catch (error) {
                console.error("데이터 로딩 오류:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [classroomId, taskId]);

    //
    // ⭐️ 퀴즈 삭제 핸들러 (imageUrl 파라미터 추가)
    const handleDeleteQuiz = async (quizId: bigint, imageUrl?: string) => {
        if (!window.confirm("이 퀴즈를 정말 삭제하시겠습니까?")) return;

        const token = localStorage.getItem("jwt_token");
        console.log("삭제할 이미지 URL:", imageUrl);
        // 1. Supabase 스토리지에서 이미지 먼저 삭제
        if (imageUrl) {
            const fileName = getFileNameFromUrl(imageUrl);
            if (fileName) {
                try {
                    await supabase.storage.from('quiz_imeages').remove([fileName]);
                    console.log("스토리지 이미지 삭제 완료:", fileName);
                } catch (storageError) {
                    // 스토리지 삭제 실패하더라도 DB 삭제는 진행되도록 에러만 로그로 남김
                    console.error("스토리지 이미지 삭제 오류:", storageError);
                }
            }
        }

        // 2. 백엔드 DB에서 퀴즈 삭제
        try {
            const response = await fetch(`/api/teacher/quizzes/${quizId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                alert("삭제되었습니다.");
                fetchQuizList(); // 리스트 새로고침
            } else {
                alert("DB 데이터 삭제에 실패했습니다.");
            }
        } catch (error) {
            console.error("삭제 오류:", error);
            alert("서버 오류가 발생했습니다.");
        }
    };

    if (isLoading && !taskInfo) {
        return <div className="p-10 text-center font-bold text-gray-500">데이터를 불러오는 중...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-6 mt-6 space-y-6">
            {/* 상단 네비게이션 */}
            <button
                onClick={() => navigate(`/teacher/classrooms/${classroomId}/task`)}
                className="flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium"
            >
                <ArrowLeft size={18} className="mr-2" /> 숙제 목록으로 돌아가기
            </button>

            {/* 메인 상세 정보 카드 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-8">
                    {/* 타이틀 및 상태 배지 & ⭐️ 삭제 버튼 추가 */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded">
                        <BookOpen size={14} /> {taskInfo?.className}
                    </span>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${
                                    taskInfo?.isDone ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                                }`}>
                        {taskInfo?.isDone ? "마감됨" : "진행 중"}
                    </span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-gray-900">{taskInfo?.taskName}</h1>
                        </div>

                        {/* ⭐️ 숙제 삭제 버튼 */}
                        <button
                            onClick={handleDeleteTask}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                            <Trash2 size={16} /> DELETE
                        </button>
                    </div>

                    {/* ... (이하 진행률 등 기존 코드 동일) ... */}

                    {/* 그리드형 정보 섹션 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* 진행률 (completionRate) */}
                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                                    <Users size={16} /> 학생 제출 현황
                                </span>
                                <span className="text-lg font-bold text-blue-600">{taskInfo?.completionRate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-blue-600 h-full transition-all duration-500"
                                    style={{ width: `${taskInfo?.completionRate}%` }}
                                />
                            </div>
                        </div>

                        {/* 시작 일시 (startDate) */}
                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                            <span className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-2">
                                <Calendar size={16} /> 시작 일시
                            </span>
                            <p className="text-gray-800 font-bold">{formatDate(taskInfo?.startDate)}</p>
                        </div>

                        {/* 종료 일시 (expiredDate) */}
                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                            <span className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-2">
                                <Clock size={16} /> 마감 일시
                            </span>
                            <p className="text-red-600 font-bold">{formatDate(taskInfo?.expiredDate)}</p>
                        </div>
                    </div>

                    {/* 설명 (description) */}
                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">과제 설명</h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {taskInfo?.description || "등록된 설명이 없습니다."}
                        </p>
                    </div>
                </div>
            </div>

            {/* 퀴즈 목록 섹션 */}
            <div className="space-y-4">
                <div className="flex justify-between items-end px-2">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <CheckCircle size={22} className="text-blue-500" /> 등록된 퀴즈 구성
                        </h2>
                        <p className="text-sm text-gray-500">해당 숙제에는 총 {quizList.length}개의 문항이 포함되어 있습니다.</p>
                    </div>
                    <button
                        onClick={() => navigate(`/teacher/classrooms/${classroomId}/task/${taskId}/add-quizzes`)}
                        className="flex items-center gap-2 bg-gray-900 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95"
                    >
                        <Plus size={18} /> 퀴즈 추가
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {quizList.length > 0 ? (
                        quizList.map((quiz) => (
                            <div key={quiz.quizNum} className="group flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all">
                                <div className="flex items-center gap-5">
                                    <div className="flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 font-black rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        {quiz.quizNum}
                                    </div>
                                    <span className="text-lg text-gray-800 font-bold uppercase tracking-tight">
                                        {quiz.quizName}
                                    </span>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {/* ⭐️ 클릭 시 상태 업데이트 */}
                                    <button
                                        onClick={() => setEditQuizId(quiz.quizId)}
                                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg">
                                        <Edit size={18} />
                                    </button>

                                    {/* ⭐️ 삭제 핸들러에 imageUrl 같이 넘겨주기 */}
                                    <button
                                        onClick={() => handleDeleteQuiz(quiz.quizId, quiz.quizImage)}
                                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl text-center">
                            <p className="text-gray-400 font-medium italic">아직 등록된 퀴즈가 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ⭐️ 모달 렌더링 (editQuizId가 있으면 띄움) */}
            {editQuizId && classroomId && taskId && (
                <QuizEditModal
                    taskId={taskId}
                    quizId={editQuizId}
                    onClose={() => setEditQuizId(null)}
                    onSuccess={() => fetchQuizList()} // 성공 시 퀴즈 리스트만 새로고침
                />
            )}
        </div>
    );
}