import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Settings } from "lucide-react"; // 아이콘 라이브러리 가정

// 1. 상세 페이지에서 받을 데이터의 타입 정의 (백엔드 DTO 구조)
interface Student {
    id: number;
    name: string; // 혹은 userName 등 백엔드 변수명과 일치
    // 필요한 추가 학생 정보들...
}

interface ClassroomDetail {
    id: number;
    className: string;
    studentCount: number;
    students: Student[]; // 상세 페이지이므로 소속된 학생들 전체 목록이 들어옵니다.
}

export function ClassroomDetailPage() {
    // 2. URL 경로에서 id 값을 추출 (예: /teacher/classrooms/5 -> id는 "5")
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [classroom, setClassroom] = useState<ClassroomDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClassroomDetail = async () => {
            const token = localStorage.getItem("jwt_token");

            if (!token) {
                alert("로그인이 필요합니다.");
                navigate("/login", { replace: true });
                return;
            }

            try {
                const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;

                // 3. RESTful 표준에 맞게 Path Variable로 ID를 넘겨줍니다.
                const response = await fetch(`${API_BASE_URL}/api/teacher/classrooms/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    if (response.status === 404) throw new Error("해당 클래스룸을 찾을 수 없습니다.");
                    throw new Error("데이터를 불러오는데 실패했습니다.");
                }

                const result = await response.json();

                // 4. 공통 응답 포맷({ success, data }) 파싱
                if (result.success && result.data) {
                    setClassroom(result.data);
                } else {
                    // 백엔드가 래퍼 없이 DTO만 바로 리턴할 경우를 대비한 폴백
                    setClassroom(result);
                }
            } catch (err: any) {
                console.error("상세 정보 통신 에러:", err);
                setError(err.message || "알 수 없는 에러가 발생했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        // id가 존재할 때만 함수 실행
        if (id) {
            fetchClassroomDetail();
        }
    }, [id, navigate]); // id가 바뀔 때마다 재실행되도록 의존성 배열에 추가

    // ---------------------------------------------------------
    // 렌더링 영역: 로딩 처리, 에러 처리, 정상 렌더링 분기
    // ---------------------------------------------------------

    if (isLoading) {
        return <div style={centerStyle}>데이터를 불러오는 중입니다... ⏳</div>;
    }

    if (error || !classroom) {
        return (
            <div style={centerStyle}>
                <h3 style={{ color: "red" }}>앗! 문제가 발생했어요.</h3>
                <p>{error}</p>
                <button onClick={() => navigate(-1)} style={backButtonStyle}>뒤로 가기</button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
            {/* 상단 헤더 및 뒤로가기 버튼 */}
            <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "30px" }}>
                <button onClick={() => navigate("/teacher/classrooms")} style={iconButtonStyle}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ margin: 0, fontSize: "24px" }}>{classroom.className}</h2>

                {/* ⭐️ Task 이동 버튼 추가 */}
                <button
                    onClick={() => navigate(`/teacher/classrooms/${id}/task`)}
                    style={taskButtonStyle}
                >
                    Task
                </button>

                <button style={{ ...iconButtonStyle, marginLeft: "auto" }}>
                    <Settings size={20} />
                </button>
            </div>

            {/* 클래스룸 요약 정보 카드 */}
            <div style={summaryCardStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Users size={24} color="#4CAF50" />
                    <span style={{ fontSize: "18px", fontWeight: "bold" }}>총 학생 수: {classroom.studentCount}명</span>
                </div>
            </div>

            {/* 학생 목록 리스트 */}
            <div>
                <h3 style={{ marginBottom: "15px" }}>소속 학생 목록</h3>

                {classroom.students && classroom.students.length > 0 ? (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {classroom.students.map((student) => (
                            <li key={student.id} style={studentItemStyle}>
                                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                    <div style={avatarStyle}>
                                        {/* 이름의 첫 글자만 따서 프로필 아이콘처럼 표시 */}
                                        {student.name.charAt(0)}
                                    </div>
                                    <span style={{ fontSize: "16px", fontWeight: "500" }}>{student.name}</span>
                                </div>
                                <button style={actionButtonStyle}>과제 보기</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div style={emptyBoxStyle}>
                        아직 이 클래스룸에 등록된 학생이 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}

// 간단한 인라인 스타일 정의
const centerStyle = { padding: "50px", textAlign: "center" as const, color: "#666" };
const backButtonStyle = { marginTop: "20px", padding: "8px 16px", backgroundColor: "#eee", border: "none", borderRadius: "5px", cursor: "pointer" };
const iconButtonStyle = { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", borderRadius: "50%", backgroundColor: "#f5f5f5" };
const summaryCardStyle = { padding: "20px", backgroundColor: "white", borderRadius: "12px", border: "1px solid #eaeaea", marginBottom: "30px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" };
const studentItemStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px", marginBottom: "10px", backgroundColor: "white", border: "1px solid #eaeaea", borderRadius: "8px" };
const avatarStyle = { width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#e3f2fd", color: "#1976d2", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "16px" };
const actionButtonStyle = { padding: "6px 12px", backgroundColor: "white", color: "#1976d2", border: "1px solid #1976d2", borderRadius: "4px", cursor: "pointer", fontSize: "14px" };
const emptyBoxStyle = { padding: "40px", textAlign: "center" as const, backgroundColor: "#f9f9f9", borderRadius: "8px", color: "#888" };

// ⭐️ Task 버튼 전용 스타일 추가
const taskButtonStyle = {
    padding: "6px 14px",
    backgroundColor: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    boxShadow: "0 2px 4px rgba(25, 118, 210, 0.2)"
};