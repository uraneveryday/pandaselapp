import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

import {
    ArrowLeft,
    BookOpen,
    LoaderCircle,
    Phone,
    Settings,
    Sparkles,
    Ticket,
    Users
} from "lucide-react";

import "./ClassroomDetailPage.css";

type Gender = "MALE" | "FEMALE";

interface Student {
    id: number;
    name: string;
    gender: Gender;
    parentPhoneNumber: string | null;
    stampCount: number;
    couponCount: number;
}

interface ClassroomDetail {
    id: number;
    className: string;
    studentCount?: number;
    students: Student[];
}

interface CouponUseResponse {
    studentId: number;
    stampCount: number;
    couponCount: number;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

function unwrapResponse<T>(response: ApiResponse<T> | T): T {
    if (
        typeof response === "object" &&
        response !== null &&
        "success" in response &&
        "data" in response
    ) {
        return (response as ApiResponse<T>).data;
    }

    return response as T;
}

export function ClassroomDetailPage() {
    const { id: classroomId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [classroom, setClassroom] =
        useState<ClassroomDetail | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 현재 쿠폰 사용 요청 중인 학생 ID
    const [usingCouponStudentId, setUsingCouponStudentId] =
        useState<number | null>(null);
    const [couponSuccessMessage, setCouponSuccessMessage] =
        useState<string | null>(null);

    useEffect(() => {
        const fetchClassroomDetail = async () => {
            const token = localStorage.getItem("jwt_token");

            if (!token) {
                navigate("/login", { replace: true });
                return;
            }

            if (!classroomId) {
                setError(t("teacher.classroomDetail.errors.invalidClassroomId"));
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const API_BASE_URL =
                    import.meta.env.VITE_API_BASE_URL;

                const response = await fetch(
                    `${API_BASE_URL}/api/teacher/classrooms/${classroomId}`,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error(t("teacher.classroomDetail.errors.loginExpired"));
                    }

                    if (response.status === 403) {
                        throw new Error(
                            t("teacher.classroomDetail.errors.noPermission")
                        );
                    }

                    if (response.status === 404) {
                        throw new Error(
                            t("teacher.classroomDetail.errors.notFound")
                        );
                    }

                    throw new Error(
                        t("teacher.classroomDetail.errors.loadFailed")
                    );
                }

                const json = await response.json();

                const data =
                    unwrapResponse<ClassroomDetail>(json);

                setClassroom({
                    ...data,
                    students: data.students ?? []
                });
            } catch (caughtError) {
                console.error(
                    "Classroom detail load failed:",
                    caughtError
                );

                setError(
                    caughtError instanceof Error
                        ? caughtError.message
                        : t("teacher.classroomDetail.errors.unknown")
                );
            } finally {
                setIsLoading(false);
            }
        };

        void fetchClassroomDetail();
    }, [classroomId, navigate, t]);

    const handleUseCoupon = async (student: Student) => {
        if (!classroomId || student.couponCount <= 0) {
            return;
        }

        const shouldUseCoupon = window.confirm(
            t("teacher.classroomDetail.couponUseConfirm", { studentName: student.name })
        );

        if (!shouldUseCoupon) {
            return;
        }

        const token = localStorage.getItem("jwt_token");

        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        try {
            setUsingCouponStudentId(student.id);

            const API_BASE_URL =
                import.meta.env.VITE_API_BASE_URL;

            const response = await fetch(
                `${API_BASE_URL}/api/teacher/classrooms/${classroomId}/students/${student.id}/coupons/use`,
                {
                    method: "PATCH",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                const errorBody = await response
                    .json()
                    .catch(() => null);

                throw new Error(
                    errorBody?.message ??
                    t("teacher.classroomDetail.errors.couponUseNotCompleted")
                );
            }

            const json = await response.json();

            const updatedReward =
                unwrapResponse<CouponUseResponse>(json);

            // 전체 목록을 다시 요청하지 않고
            // 변경된 학생만 업데이트
            setClassroom((previous) => {
                if (!previous) {
                    return previous;
                }

                return {
                    ...previous,
                    students: previous.students.map(
                        (currentStudent) =>
                            currentStudent.id ===
                            updatedReward.studentId
                                ? {
                                    ...currentStudent,
                                    stampCount:
                                    updatedReward.stampCount,
                                    couponCount:
                                    updatedReward.couponCount
                                }
                                : currentStudent
                    )
                };
            });
            setCouponSuccessMessage(
                t("teacher.classroomDetail.couponUseSuccess", { studentName: student.name })
            );

            setTimeout(() => {
                setCouponSuccessMessage(null);
            }, 2200);

        } catch (caughtError) {
            console.error("Coupon use failed:", caughtError);

            alert(
                caughtError instanceof Error
                    ? caughtError.message
                    : t("teacher.classroomDetail.errors.couponUseFailed")
            );
        } finally {
            setUsingCouponStudentId(null);
        }
    };

    if (isLoading) {
        return (
            <main className="classroom-page centered-state">
                <motion.div
                    className="loading-card"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <LoaderCircle
                        className="loading-spinner"
                        size={34}
                    />

                    <strong>{t("teacher.classroomDetail.loadingTitle")}</strong>
                    <span>{t("teacher.classroomDetail.loadingDescription")}</span>
                </motion.div>
            </main>
        );
    }

    if (error || !classroom) {
        return (
            <main className="classroom-page centered-state">
                <motion.div
                    className="error-card"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span className="error-emoji">🥲</span>
                    <h2>{t("teacher.classroomDetail.errorTitle")}</h2>
                    <p>{error}</p>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={17} />
                        {t("teacher.classroomDetail.back")}
                    </button>
                </motion.div>
            </main>
        );
    }

    const studentCount = classroom.students.length;

    return (
        <main className="classroom-page">
            <AnimatePresence>
                {couponSuccessMessage && (
                    <motion.div
                        className="coupon-success-toast"
                        initial={{ opacity: 0, y: -20, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.92 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20
                        }}
                    >
                        <div className="coupon-success-icon">
                            <Ticket size={22} />
                        </div>

                        <div>
                            <strong>{t("teacher.classroomDetail.couponUseCompleteTitle")}</strong>
                            <p>{couponSuccessMessage}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.header
                className="classroom-header"
                initial={{ opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="header-main">
                    <button
                        type="button"
                        className="round-icon-button"
                        aria-label={t("teacher.classroomDetail.back")}
                        onClick={() =>
                            navigate("/teacher/classrooms")
                        }
                    >
                        <ArrowLeft size={22} />
                    </button>

                    <div className="title-group">
                        <div className="title-label">
                            <Sparkles size={15} />
                            Classroom
                        </div>

                        <h1>{classroom.className}</h1>
                    </div>
                </div>

                <div className="header-actions">
                    <button
                        type="button"
                        className="task-button"
                        onClick={() =>
                            navigate(
                                `/teacher/classrooms/${classroomId}/task`
                            )
                        }
                    >
                        <BookOpen size={18} />
                        {t("teacher.classroomDetail.taskManagement")}
                    </button>

                    <button
                        type="button"
                        className="round-icon-button"
                        aria-label={t("teacher.classroomDetail.classroomSetting")}
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </motion.header>

            <motion.section
                className="classroom-summary"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08 }}
            >
                <div className="summary-icon">
                    <Users size={25} />
                </div>

                <div>
                    <span className="summary-label">
                        {t("teacher.classroomDetail.friendsTitle")}
                    </span>

                    <strong>{t("teacher.classroomDetail.studentCount", { count: studentCount })}</strong>
                </div>

                <div className="summary-decoration">
                    ★
                </div>
            </motion.section>

            <section className="student-section">
                <div className="section-heading">
                    <div>
                        <span className="section-eyebrow">
                            STUDENTS
                        </span>
                        <h2>{t("teacher.classroomDetail.studentsTitle")}</h2>
                    </div>

                    <span className="student-count-badge">
                        {t("teacher.classroomDetail.studentCount", { count: studentCount })}
                    </span>
                </div>

                {studentCount > 0 ? (
                    <div className="student-grid">
                        {classroom.students.map(
                            (student, index) => (
                                <StudentRewardCard
                                    key={student.id}
                                    student={student}
                                    index={index}
                                    isUsingCoupon={
                                        usingCouponStudentId ===
                                        student.id
                                    }
                                    onUseCoupon={
                                        handleUseCoupon
                                    }
                                />
                            )
                        )}
                    </div>
                ) : (
                    <motion.div
                        className="empty-student-card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <span>🌱</span>
                        <h3>{t("teacher.classroomDetail.emptyStudentTitle")}</h3>
                        <p>
                            {t("teacher.classroomDetail.emptyStudentDescriptionLine1")}
                            {t("teacher.classroomDetail.emptyStudentDescriptionLine2")}
                        </p>
                    </motion.div>
                )}
            </section>
        </main>
    );
}

interface StudentRewardCardProps {
    student: Student;
    index: number;
    isUsingCoupon: boolean;
    onUseCoupon: (student: Student) => Promise<void>;
}

function StudentRewardCard({
                               student,
                               index,
                               isUsingCoupon,
                               onUseCoupon
                           }: StudentRewardCardProps) {
    const { t } = useTranslation();

    const safeStampCount = Math.max(
        0,
        Math.min(student.stampCount, 10)
    );

    const genderLabel =
        student.gender === "MALE" ? t("common.gender.maleStudent") : t("common.gender.femaleStudent");

    return (
        <motion.article
            className="student-card"
            initial={{
                opacity: 0,
                y: 22,
                scale: 0.97
            }}
            animate={{
                opacity: 1,
                y: 0,
                scale: 1
            }}
            transition={{
                delay: index * 0.06,
                type: "spring",
                stiffness: 180,
                damping: 18
            }}
            whileHover={{
                y: -5,
                rotate: index % 2 === 0 ? 0.3 : -0.3
            }}
        >
            <div className="student-profile">
                <motion.div
                    className={`student-avatar ${
                        student.gender === "MALE"
                            ? "avatar-blue"
                            : "avatar-pink"
                    }`}
                    whileHover={{
                        rotate: [0, -7, 7, 0],
                        scale: 1.06
                    }}
                >
                    {student.name.charAt(0).toUpperCase()}
                </motion.div>

                <div className="student-name-area">
                    <div className="student-name-row">
                        <h3>{student.name}</h3>
                        <span className="gender-chip">
                            {genderLabel}
                        </span>
                    </div>

                    <div className="phone-info">
                        <Phone size={13} />
                        {student.parentPhoneNumber ??
                            t("teacher.classroomDetail.guardianPhoneNotRegistered")}
                    </div>
                </div>
            </div>

            <div className="reward-panel">
                <div className="reward-heading">
                    <div>
                        <span className="reward-title">
                            {t("teacher.classroomDetail.todayStamp")}
                        </span>
                        <span className="reward-description">
                            {t("teacher.classroomDetail.stampGuide")}
                        </span>
                    </div>

                    <strong>
                        {safeStampCount}
                        <span>/10</span>
                    </strong>
                </div>

                <div
                    className="stamp-board"
                    aria-label={t("teacher.classroomDetail.stampAriaLabel", { count: safeStampCount })}
                >
                    {Array.from({ length: 10 }).map(
                        (_, stampIndex) => {
                            const isFilled =
                                stampIndex <
                                safeStampCount;

                            return (
                                <motion.div
                                    key={stampIndex}
                                    className={
                                        isFilled
                                            ? "stamp-dot filled"
                                            : "stamp-dot"
                                    }
                                    initial={false}
                                    animate={{
                                        scale: isFilled
                                            ? 1
                                            : 0.92,
                                        rotate: isFilled
                                            ? 0
                                            : -4
                                    }}
                                    whileHover={{
                                        scale: 1.18,
                                        rotate: 8
                                    }}
                                >
                                    {isFilled ? "★" : ""}
                                </motion.div>
                            );
                        }
                    )}
                </div>
            </div>

            <div
                className={
                    student.couponCount > 0
                        ? "coupon-panel coupon-available"
                        : "coupon-panel"
                }
            >
                <div className="coupon-information">
                    <div className="coupon-icon">
                        <Ticket size={21} />
                    </div>

                    <div>
                        <span>{t("teacher.classroomDetail.ownedCoupon")}</span>
                        <strong>
                            {t("teacher.classroomDetail.couponCount", { count: student.couponCount })}
                        </strong>
                    </div>
                </div>

                {student.couponCount > 0 ? (
                    <motion.button
                        type="button"
                        className="coupon-use-button"
                        disabled={isUsingCoupon}
                        whileHover={
                            isUsingCoupon
                                ? undefined
                                : { scale: 1.04 }
                        }
                        whileTap={
                            isUsingCoupon
                                ? undefined
                                : { scale: 0.96 }
                        }
                        onClick={() =>
                            void onUseCoupon(student)
                        }
                    >
                        {isUsingCoupon ? (
                            <>
                                <LoaderCircle
                                    className="button-spinner"
                                    size={16}
                                />
                                {t("teacher.classroomDetail.usingCoupon")}
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} />
                                {t("teacher.classroomDetail.useCoupon")}
                            </>
                        )}
                    </motion.button>
                ) : (
                    <span className="no-coupon-message">
                        {t("teacher.classroomDetail.needMoreStamp")}
                    </span>
                )}
            </div>
        </motion.article>
    );
}