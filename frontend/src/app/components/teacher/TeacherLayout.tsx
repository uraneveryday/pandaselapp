import { useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    GraduationCap,
    LogOut,
    Sparkles,
    UserRound,
} from "lucide-react";

export function TeacherLayout() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [userName, setUserName] = useState("");

    const handleLogout = useCallback(() => {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_name");

        alert(t("teacher.layout.logoutAlert"));
        navigate("/login", { replace: true });
    }, [navigate, t]);

    useEffect(() => {
        const token = localStorage.getItem("jwt_token");

        if (!token) {
            alert(t("common.auth.normalLoginRequired"));
            navigate("/login", { replace: true });
            return;
        }

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Token expired or invalid access");
                }

                return res.json();
            })
            .then((data) => {
                setUserName(data.name ?? "");
            })
            .catch((err) => {
                console.error("me API request failed:", err);
                handleLogout();
            });
    }, [navigate, handleLogout, t]);

    const displayName = userName || "Teacher";

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
                            <GraduationCap size={25} />
                        </div>

                        <div className="min-w-0">
                            <div className="mb-1 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-600">
                                <Sparkles size={13} />
                                Teacher Dashboard
                            </div>

                            <h1 className="truncate text-lg font-black tracking-tight text-slate-950 md:text-2xl">
                                {t("teacher.layout.pageTitle", {
                                    userName: displayName,
                                })}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                                <UserRound size={17} />
                            </div>

                            <span className="max-w-[120px] truncate text-sm font-bold text-slate-600">
                                {displayName}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 text-sm font-extrabold text-red-600 transition-all hover:border-red-200 hover:bg-red-100 active:scale-[0.98]"
                        >
                            <LogOut size={17} />
                            <span className="hidden sm:inline">
                                {t("teacher.layout.logout")}
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            <main>
                <Outlet />
            </main>
        </div>
    );
}