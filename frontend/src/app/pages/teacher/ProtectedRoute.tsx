import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { t } = useTranslation();

    // 💡 키 이름을 로그인 로직과 정확히 통일하세요! (여기서는 teacher_token으로 가정)
    const token = localStorage.getItem("jwt_token");

    // 1. 아예 로그인을 안 한 사람
    if (!token) {
        alert(t("common.auth.loginRequired"));
        return <Navigate to="/login" replace />;
    }

    // 2. 토큰을 직접 까서 권한을 확인합니다. (따로 저장된 user_role을 믿지 않음)
    try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));

        if (decodedPayload.auth !== "ROLE_TEACHER") {
            alert(t("common.auth.teacherOnly"));
            return <Navigate to="/" replace />; // 학생 메인으로
        }
    } catch (error) {
        console.error("토큰 해독 오류:", error);
        localStorage.removeItem("teacher_token"); // 이상한 토큰이면 지워버림
        return <Navigate to="/login" replace />;
    }

    // 선생님이 맞다면 통과! (TeacherLayout 렌더링 시작)
    return <>{children}</>;
}