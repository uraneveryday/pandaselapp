import { useState, type FormEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, User, UserPlus } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";

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
    const [searchParams] = useSearchParams();
    const { t, i18n } = useTranslation();

    const locationState = location.state as LoginLocationState | null;
    const successMessage = locationState?.successMessage;

    const [loginId, setLoginId] = useState("");
    const [classCode, setClassCode] = useState(searchParams.get("classCode") ?? "");
    const [studentMode, setStudentMode] = useState(Boolean(searchParams.get("classCode")));
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const currentLanguage = i18n.resolvedLanguage || i18n.language;

    const changeLanguage = (language: "ko" | "zh-CN") => {
        i18n.changeLanguage(language);
        setErrorMessage("");
    };

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!loginId.trim() || !password || (studentMode && !/^\d{4}$/.test(classCode))) {
            setErrorMessage(t("login.errors.required"));
            return;
        }

        setErrorMessage("");
        setIsLoading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/auth/${studentMode ? "student/login" : "login"}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(studentMode ? {
                        classCode,
                        studentLoginId: loginId.trim(),
                        password,
                    } : { loginId: loginId.trim(), password }),
                }
            );

            const data = await readResponseBody(response);

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    t("login.errors.invalidCredential")
                );
            }

            const authorizationHeader = response.headers.get("Authorization");

            const headerToken = authorizationHeader?.replace(
                /^Bearer\s+/i,
                ""
            );

            const token = data.accessToken || headerToken;

            if (!token) {
                throw new Error(t("login.errors.missingToken"));
            }

            const decodedPayload = jwtDecode<JwtPayload>(token);

            const rawRole =
                decodedPayload.auth ?? decodedPayload.role ?? data.role;

            const normalizedRole = rawRole?.startsWith("ROLE_")
                ? rawRole
                : rawRole
                    ? `ROLE_${rawRole}`
                    : "";

            if (
                normalizedRole !== "ROLE_TEACHER" &&
                normalizedRole !== "ROLE_STUDENT"
            ) {
                throw new Error(t("login.errors.invalidRole"));
            }

            localStorage.setItem("jwt_token", token);
            localStorage.setItem("user_role", normalizedRole);

            if (normalizedRole === "ROLE_TEACHER") {
                navigate("/teacher/classrooms", {
                    replace: true,
                });
                return;
            }

            navigate("/student", {
                replace: true,
            });
        } catch (error) {
            localStorage.removeItem("jwt_token");
            localStorage.removeItem("user_role");

            const message =
                error instanceof Error
                    ? error.message
                    : t("login.errors.unknown");

            setErrorMessage(message);
            console.error("로그인 에러:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-sans text-gray-800 flex flex-col items-center">
            <div className="w-full max-w-md flex-1 bg-white shadow-sm relative flex flex-col justify-center px-6 py-12">
                <div className="absolute top-5 right-5 flex gap-2">
                    <button
                        type="button"
                        onClick={() => changeLanguage("zh-CN")}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                            currentLanguage.startsWith("zh")
                                ? "bg-blue-400 text-white border-blue-400"
                                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        {t("login.languageZh")}
                    </button>

                    <button
                        type="button"
                        onClick={() => changeLanguage("ko")}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                            currentLanguage.startsWith("ko")
                                ? "bg-blue-400 text-white border-blue-400"
                                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        {t("login.languageKo")}
                    </button>
                </div>

                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-blue-100">
                        <span className="text-4xl">🐻</span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        {t("login.title")}
                    </h1>

                    <p className="text-sm text-gray-500 mb-8 text-center leading-6">
                        {t("login.subtitleLine1")}
                        <br />
                        {t("login.subtitleLine2")}
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

                    <form onSubmit={handleLogin} className="w-full space-y-5">
                        {studentMode && (
                            <div className="space-y-1">
                                <label htmlFor="classCode" className="text-xs font-semibold text-gray-600 ml-1">{t("login.classCode")}</label>
                                <input id="classCode" type="text" inputMode="numeric" maxLength={4} value={classCode}
                                    onChange={(e) => setClassCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                    className="block w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm bg-gray-50" required disabled={isLoading} />
                            </div>
                        )}
                        <div className="space-y-1">
                            <label
                                htmlFor="loginId"
                                className="text-xs font-semibold text-gray-600 ml-1"
                            >
                                {studentMode ? t("login.studentLoginId") : t("login.loginId")}
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
                                    placeholder={t(
                                        studentMode ? "login.studentLoginIdPlaceholder" : "login.loginIdPlaceholder"
                                    )}
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
                                {t("login.password")}
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
                                        setPassword(e.target.value.replace(/[^A-Za-z0-9!@$%^&*]/g, ""))
                                    }
                                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all bg-gray-50 focus:bg-white"
                                    placeholder={t(
                                        "login.passwordPlaceholder"
                                    )}
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
                            {isLoading
                                ? t("login.loading")
                                : t("login.submit")}
                        </button>
                    </form>

                    <button type="button" disabled={isLoading}
                        onClick={() => { setStudentMode((value) => !value); setErrorMessage(""); }}
                        className="mt-5 text-sm font-bold text-blue-500 hover:text-blue-700">
                        {studentMode ? t("login.teacherLogin") : t("login.noClassLink")}
                    </button>

                    <div className="w-full mt-8 pt-7 border-t border-gray-100">
                        <p className="mb-3 text-xs text-center text-gray-500">
                            {t("login.teacherAccountQuestion")}
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                            disabled={isLoading}
                            className="w-full py-3.5 rounded-2xl border border-blue-300 text-blue-500 font-semibold text-sm hover:bg-blue-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <UserPlus className="w-4 h-4" />
                            {t("login.teacherRegister")}
                        </button>

                        <p className="mt-4 text-xs text-gray-400 text-center leading-5">
                            {t("login.studentAccountGuideLine1")}
                            <br />
                            {t("login.studentAccountGuideLine2")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
