import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function ClassroomCreatePage() {
    const navigate = useNavigate();

    // 입력받을 클래스룸 이름 상태
    const [className, setClassName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. 유효성 검사 (엔티티 제약조건: nullable = false, length = 50)
        if (!className.trim()) {
            alert("클래스룸 이름을 입력해주세요.");
            return;
        }
        if (className.length > 50) {
            alert("클래스룸 이름은 50자를 초과할 수 없습니다.");
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
                body: JSON.stringify({ className })
            });

            if (!response.ok) throw new Error("클래스룸 생성 실패");


            // API 호출을 시뮬레이션하기 위한 임시 딜레이
            await new Promise((resolve) => setTimeout(resolve, 500));

            alert(`'${className}' 클래스룸이 성공적으로 생성되었습니다!`);

            // 생성이 완료되면 내 클래스룸 목록 페이지(/teacher)로 돌아갑니다.
            navigate("/teacher");

        } catch (error) {
            console.error("생성 에러:", error);
            alert("클래스룸 생성 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0 }}>➕ 새 클래스룸 만들기</h2>
                <button
                    onClick={() => navigate("/teacher")}
                    style={cancelButtonStyle}
                    disabled={isLoading}
                >
                    돌아가기
                </button>
            </div>

            <div style={{ backgroundColor: "#f9f9f9", padding: "30px", borderRadius: "8px", border: "1px solid #ddd" }}>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                    <div>
                        <label htmlFor="className" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>
                            클래스룸 이름 <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                            id="className"
                            type="text"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            placeholder="예: 1학년 1반 심화수학"
                            maxLength={50} // DB 엔티티 길이 제한 반영
                            disabled={isLoading}
                            style={inputStyle}
                        />
                        <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: className.length >= 50 ? "red" : "#666", textAlign: "right" }}>
                            {className.length} / 50자
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{ ...submitButtonStyle, opacity: isLoading ? 0.7 : 1 }}
                    >
                        {isLoading ? "생성 중..." : "클래스룸 생성하기"}
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