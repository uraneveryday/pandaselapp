import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export function TeacherLayout() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("jwt_token");

        // 1. 토큰 존재 여부 확인
        if (!token) {
            alert("정상적인 로그인 절차가 필요합니다.");
            navigate("/login", { replace: true });
            return;
        }

        // 3. 권한이 확인된 사람만 백엔드에 내 정보(me)를 요청
        fetch("http://localhost:8080/api/users/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                if (!res.ok) throw new Error("토큰 만료 혹은 비정상적 접근");
                return res.json();
            })
            .then(data => {
                // 💡 [수정됨] 백엔드에서 받은 실제 이름을 세팅합니다.
                setUserName(data.name);
            })
            .catch(err => {
                console.error("me API 통신 실패 원인:", err);
                handleLogout();
            });

    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("jwk_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_name");
        alert("로그아웃 되었습니다.");
        navigate("/login");
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif" }}>
            <header style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 0",
                borderBottom: "2px solid #ddd",
                marginBottom: "20px"
            }}>
                <h1 style={{ margin: 0, color: "#1565C0" }}>
                    👩‍🏫 {userName}님 페이지
                </h1>

                <nav style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={handleLogout}
                        style={{ ...navStyle, backgroundColor: "#ff4d4f", color: "white", border: "none", cursor: "pointer" }}
                    >
                        로그아웃
                    </button>
                </nav>
            </header>

            <main>
                <Outlet />
            </main>
        </div>
    );
}

const navStyle = {
    padding: "8px 15px",
    textDecoration: "none",
    borderRadius: "5px",
    backgroundColor: "#f0f0f0",
    color: "#333",
    fontWeight: "bold"
};