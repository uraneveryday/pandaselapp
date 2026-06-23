import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function ClassroomCreatePage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // 입력받을 클래스룸 이름 상태
    const [className, setClassName] = useState("");
    const generateClassCode = () => String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    const [studentLoginCode, setStudentLoginCode] = useState(generateClassCode);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. 유효성 검사 (엔티티 제약조건: nullable = false, length = 50)
        if (!className.trim()) {
            alert(t("teacher.classroomCreate.alerts.nameRequired"));
            return;
        }
        if (className.length > 50) {
            alert(t("teacher.classroomCreate.alerts.nameTooLong"));
            return;
        }
        if (!/^\d{4}$/.test(studentLoginCode)) {
            alert(t("teacher.classroomCreate.alerts.codeRequired"));
            return;
        }

        setIsLoading(true);

        try {
            /**
             * 💡 실제 API 호출 부분
             * 백엔드 API 명세에 맞춰 fetch나 axios를 사용해 POST 요청을 보냅니다.
             * Authorization 헤더에 선생님의 토큰을 담아 보내면,
             * 백엔드에서 토큰을 해석해 Teacher 객체를 찾아 Classroom과 매핑해야 합니다.
             */


            const token = localStorage.getItem("jwt_token");
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/teacher/classrooms/new`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ className, studentLoginCode })
            });

            if (!response.ok) {
                const body = await response.json().catch(() => null);
                throw new Error(body?.message || t("teacher.classroomCreate.alerts.createFailed"));
            }


            // API 호출을 시뮬레이션하기 위한 임시 딜레이
            await new Promise((resolve) => setTimeout(resolve, 500));

            alert(t("teacher.classroomCreate.alerts.createSuccess", { className }));

            // 생성이 완료되면 내 클래스룸 목록 페이지(/teacher)로 돌아갑니다.
            navigate("/teacher");

        } catch (error) {
            console.error("생성 에러:", error);
            alert(t("teacher.classroomCreate.alerts.unknown"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0 }}>{t("teacher.classroomCreate.title")}</h2>
                <button
                    onClick={() => navigate("/teacher")}
                    style={cancelButtonStyle}
                    disabled={isLoading}
                >
                    {t("teacher.classroomCreate.back")}
                </button>
            </div>

            <div style={{ backgroundColor: "#f9f9f9", padding: "30px", borderRadius: "8px", border: "1px solid #ddd" }}>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                    <div>
                        <label htmlFor="className" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>
                            {t("teacher.classroomCreate.className")} <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                            id="className"
                            type="text"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            placeholder={t("teacher.classroomCreate.classNamePlaceholder")}
                            maxLength={50} // DB 엔티티 길이 제한 반영
                            disabled={isLoading}
                            style={inputStyle}
                        />
                        <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: className.length >= 50 ? "red" : "#666", textAlign: "right" }}>
                            {t("teacher.classroomCreate.charCount", { count: className.length })}
                        </p>
                    </div>

                    <div>
                        <label htmlFor="studentLoginCode" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>
                            {t("teacher.classroomCreate.loginCode")}
                        </label>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <input id="studentLoginCode" inputMode="numeric" pattern="[0-9]{4}" maxLength={4}
                                value={studentLoginCode}
                                onChange={(e) => setStudentLoginCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                disabled={isLoading} style={{ ...inputStyle, letterSpacing: "0.25em", fontWeight: "bold" }} />
                            <button type="button" onClick={() => setStudentLoginCode(generateClassCode())} disabled={isLoading} style={cancelButtonStyle}>
                                {t("teacher.classroomCreate.refreshCode")}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{ ...submitButtonStyle, opacity: isLoading ? 0.7 : 1 }}
                    >
                        {isLoading ? t("teacher.classroomCreate.creating") : t("teacher.classroomCreate.submit")}
                    </button>
                </form>
            </div>
        </div>
    );
}

// 스타일 정의
const inputStyle = {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    boxSizing: "border-box" as const, // 패딩 포함 너비 계산
};

const submitButtonStyle = {
    padding: "15px",
    fontSize: "16px",
    fontWeight: "bold",
    backgroundColor: "#1565C0",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px"
};

const cancelButtonStyle = {
    padding: "8px 15px",
    backgroundColor: "#fff",
    color: "#555",
    border: "1px solid #ccc",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold"
};
