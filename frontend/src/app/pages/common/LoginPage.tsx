
import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, User, UserPlus } from "lucide-react";
import { jwtDecode } from "jwt-decode";

interface LoginResponse {
    accessToken?: string;
    role?: string;
    message?: string;
    error?: string;
}

interface JwtPayload {
    auth?: string;
    role?: string;
    sub?: string;
    exp?: number;
}

interface LoginLocationState {
    successMessage?: string;
}

async function readResponseBody(response: Response): Promise<LoginResponse> {
    const text = await response.text();

    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text) as LoginResponse;
    } catch {
        return { message: text };
    }
}

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const locationState = location.state as LoginLocationState | null;
    const successMessage = locationState?.successMessage;

    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!loginId.trim() || !password) {
            setErrorMessage("아이디와 비밀번호를 모두 입력해주세요.");
            return;
        }

        setErrorMessage("");
        setIsLoading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        loginId: loginId.trim(),
                        password,
                    }),
                }
            );

            const data = await readResponseBody(response);

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        data.error ||
                        "아이디 또는 비밀번호가 일치하지 않습니다."
                );
            }

            /*
             * 현재 코드는 두 가지 응답 형태를 모두 지원합니다.
             *
             * 1. 응답 JSON의 accessToken
             * 2. Authorization 응답 헤더의 Bearer 토큰
             */
            const authorizationHeader =
                response.headers.get("Authorization");

            const headerToken = authorizationHeader?.replace(
                /^Bearer\s+/i,
                ""
            );

            const token = data.accessToken || headerToken;

            if (!token) {
                throw new Error(
                    "서버로부터 로그인 토큰을 전달받지 못했습니다."
                );
            }

            const decodedPayload = jwtDecode<JwtPayload>(token);


            const rawRole =
    decodedPayload.auth ||
    decodedPayload.role ||
    data.role;

            const normalizedRole = rawRole?.startsWith("ROLE_")
    ? rawRole
    : rawRole
      ? `ROLE_${rawRole}`
      : "";

// 교사와 학생 역할만 정상 로그인 처리
if (
    normalizedRole !== "ROLE_TEACHER" &&
    normalizedRole !== "ROLE_STUDENT"
) {
    throw new Error(
        "사용자 권한 정보를 확인할 수 없습니다."
    );
}

// 토큰과 역할 저장
localStorage.setItem("jwt_token", token);
localStorage.setItem("user_role", normalizedRole);

// 역할에 따른 페이지 이동
if (normalizedRole === "ROLE_TEACHER") {
    navigate("/teacher/classrooms", {
        replace: true,
    });
} else {
    navigate("/student", {
        replace: true,
    });
}



            localStorage.setItem("jwt_token", token);
            localStorage.setItem("user_role", normalizedRole);

            navigate("/teacher/classrooms", {
                replace: true,
            });
        } catch (error) {
            localStorage.removeItem("jwt_token");
            localStorage.removeItem("user_role");

            const message =
                error instanceof Error
                    ? error.message
                    : "로그인 중 오류가 발생했습니다.";

            setErrorMessage(message);
            console.error("로그인 에러:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-sans text-gray-800 flex flex-col items-center">
            <div className="w-full max-w-md flex-1 bg-white shadow-sm relative flex flex-col justify-center px-6 py-12">
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-blue-100">
                        <span className="text-4xl">🐻</span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        선생님 로그인
                    </h1>

                    <p className="text-sm text-gray-500 mb-8 text-center leading-6">
                        선생님 계정으로 로그인하여
                        <br />
                        학급과 학습 활동을 관리해주세요.
                    </p>

                    {successMessage && (
                        <div className="w-full mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 text-center">
                            {successMessage}
                        </div>
                    )}

                    {errorMessage && (
                        <div
                            role="alert"
                            className="w-full mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 text-center"
                        >
                            {errorMessage}
                        </div>
                    )}

                    <form
                        onSubmit={handleLogin}
                        className="w-full space-y-5"
                    >
                        <div className="space-y-1">
                            <label
                                htmlFor="loginId"
                                className="text-xs font-semibold text-gray-600 ml-1"
                            >
                                아이디
                            </label>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>

                                <input
                                    id="loginId"
                                    type="text"
                                    value={loginId}
                                    onChange={(e) =>
                                        setLoginId(e.target.value)
                                    }
                                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all bg-gray-50 focus:bg-white"
                                    placeholder="선생님 아이디를 입력하세요"
                                    autoComplete="username"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="password"
                                className="text-xs font-semibold text-gray-600 ml-1"
                            >
                                비밀번호
                            </label>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>

                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all bg-gray-50 focus:bg-white"
                                    placeholder="비밀번호를 입력하세요"
                                    autoComplete="current-password"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full mt-4 py-4 rounded-2xl font-bold text-lg shadow-sm transition-all active:scale-[0.98] ${
    isLoading
        ? "bg-blue-300 cursor-not-allowed text-white"
        : "bg-blue-400 hover:bg-blue-500 text-white hover:shadow-md"
}`}
                        >
                            {isLoading ? "로그인 중..." : "로그인"}
                        </button>
                    </form>

                    <div className="w-full mt-8 pt-7 border-t border-gray-100">
                        <p className="mb-3 text-xs text-center text-gray-500">
                            아직 선생님 계정이 없으신가요?
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                            disabled={isLoading}
                            className="w-full py-3.5 rounded-2xl border border-blue-300 text-blue-500 font-semibold text-sm hover:bg-blue-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <UserPlus className="w-4 h-4" />
                            선생님 회원가입
                        </button>

                        <p className="mt-4 text-xs text-gray-400 text-center leading-5">
                            학생 계정은 담당 선생님이
                            <br />
                            학급 관리 화면에서 생성할 수 있습니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
