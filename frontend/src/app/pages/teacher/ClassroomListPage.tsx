import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// 1. 타입스크립트 인터페이스 정의 (백엔드 DTO 구조와 일치해야 함)
interface Classroom {
    id: number;
    className: string;
    studentCount: number; // 백엔드에서 배열 전체가 아닌 숫자만 넘겨주도록 최적화 필요
    studentLoginCode: string;
}

export function ClassroomListPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // 2. any[] 대신 명확한 타입 사용
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchClassrooms = async () => {
            const token = localStorage.getItem("jwt_token");

            // 3. 사전 방어: 토큰이 없으면 서버에 요청조차 보내지 않음
            if (!token) {
                alert(t("teacher.classroomList.alerts.loginRequired"));
                navigate("/login");
                return;
            }

            try {
                // 4. 추후 환경 변수로 뺄 것을 대비해 도메인 분리
                const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;

                const response = await fetch(`${API_BASE_URL}/api/teacher/classrooms/list`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(t("teacher.classroomList.alerts.loadFailed"));
                }

                const result = await response.json();

                // 5. 공통 응답 포맷 처리 (이전 대화에서 합의한 { success, data } 형태 적용)
                if (result.success && result.data) {
                    setClassrooms(result.data);
                } else {
                    // 응답 포맷이 배열 자체로 온다면 setClassrooms(result) 사용
                    setClassrooms(result);
                }

            } catch (error) {
                console.error("API 통신 에러:", error);
                alert(t("teacher.classroomList.alerts.serverCheck"));
            } finally {
                setIsLoading(false);
            }
        };

        fetchClassrooms();
    }, [navigate, t]);

    // 6. 프론트엔드 전용 라우팅 경로로 수정 (api/ 제거 및 절대 경로 사용)
    const handleCreateClick = () => {
        navigate("/teacher/classrooms/new");
    };

    const handleClassroomClick = (id: number) => {
        navigate(`/teacher/classrooms/${id}`);
    };

    const handleEditClick = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        navigate(`/teacher/classrooms/${id}/edit`);
    };

    const copyLoginLink = async (e: React.MouseEvent, code: string) => {
        e.stopPropagation();
        const url = `${window.location.origin}/login?classCode=${encodeURIComponent(code)}`;
        await navigator.clipboard.writeText(url);
        alert(t("teacher.classroomList.loginLinkCopied"));
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0 }}>{t("teacher.classroomList.title")}</h2>
                <button onClick={handleCreateClick} style={createButtonStyle}>
                    {t("teacher.classroomList.create")}
                </button>
            </div>

            {isLoading ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
                    {t("teacher.classroomList.loading")}
                </div>
            ) : classrooms.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
                    <p style={{ color: "#666" }}>{t("teacher.classroomList.empty")}</p>
                </div>
            ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {classrooms.map((cls) => (
                        <li key={cls.id} onClick={() => handleClassroomClick(cls.id)} style={listItemStyle}>
                            <div>
                                <h3 style={{ margin: "0 0 5px 0", fontSize: "18px" }}>{cls.className}</h3>
                                {/* DTO 최적화를 반영하여 studentCount 바로 렌더링 */}
                                <span style={{ fontSize: "14px", color: "#666" }}>
                                    {t("teacher.classroomList.studentCount", { count: cls.studentCount || 0 })}
                                </span>
                                <span style={{ marginLeft: "10px", fontSize: "13px", color: "#1565C0", fontWeight: "bold" }}>#{cls.studentLoginCode}</span>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={(e) => copyLoginLink(e, cls.studentLoginCode)} style={editButtonStyle}>{t("teacher.classroomList.copyLoginLink")}</button>
                                <button onClick={(e) => handleEditClick(e, cls.id)} style={editButtonStyle}>{t("teacher.classroomList.edit")}</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// 스타일 생략
const createButtonStyle = { padding: "10px 15px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" as const };
const listItemStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", marginBottom: "15px", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", backgroundColor: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" };
const editButtonStyle = { padding: "8px 12px", backgroundColor: "#f5f5f5", color: "#333", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" as const };
