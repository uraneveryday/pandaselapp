import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const RootRedirect = () => {
    // 1. 로컬 스토리지나 상태 관리 툴에서 토큰을 가져옵니다.
    const token = localStorage.getItem("token");

    // 2. 토큰이 없으면 무조건 로그인 페이지로 보냅니다.
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        // 3. 토큰이 있다면 디코딩하여 권한(auth)을 확인합니다.
        // (토큰 페이로드 구조가 { auth: "teacher" | "student" } 라고 가정)
        const decoded: any = jwtDecode(token);
        const role = decoded.auth;

        // 4. 권한에 맞춰 알맞은 경로로 보냅니다.
        if (role === "teacher") {
            return <Navigate to="/teacher" replace />;
        } else if (role === "student") {
            return <Navigate to="/student" replace />;
        } else {
            // 권한이 명확하지 않은 토큰이면 로그인 페이지로 보냅니다.
            return <Navigate to="/login" replace />;
        }
    } catch (error) {
        // 토큰이 만료되었거나 손상된 경우 에러가 발생하므로 로그인 페이지로 보냅니다.
        return <Navigate to="/login" replace />;
    }
};