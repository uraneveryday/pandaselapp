import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DayPicker, type DateRange } from "@daypicker/react";
import { ko } from "@daypicker/react/locale";

import "@daypicker/react/style.css";
import "./TaskCreatePage.css";

type TaskCategory = "MATH" | "CHINESE";

interface TaskFormData {
    taskName: string;
    description: string;
    category: TaskCategory;
    rewardStamp: number;
}

/**
 * Date 객체를 서버의 LocalDateTime 형식으로 변환합니다.
 *
 * toISOString()을 사용하면 한국 시간대에서 날짜가
 * 전날로 변경될 수 있으므로 로컬 날짜를 직접 조립합니다.
 *
 * 결과 예시:
 * 2026-06-18T00:00:00
 */
function toLocalMidnightString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}T00:00:00`;
}

function formatDisplayDate(
    date: Date | undefined,
    emptyText: string,
    locale: string,
): string {
    if (!date) {
        return emptyText;
    }

    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
    }).format(date);
}

export function TaskCreatePage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { t, i18n } = useTranslation();

    const classRoomId = Number(id);
    const currentLocale = i18n.resolvedLanguage || i18n.language || "zh-CN";

    /**
     * 오늘 날짜의 시·분·초를 0으로 설정합니다.
     * 과거 날짜 비활성화 기준으로 사용합니다.
     */
    const today = useMemo(() => {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        return currentDate;
    }, []);

    const [formData, setFormData] = useState<TaskFormData>({
        taskName: "",
        description: "",
        category: "MATH",
        rewardStamp: 1,
    });

    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const updateField = <K extends keyof TaskFormData>(
        field: K,
        value: TaskFormData[K],
    ) => {
        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage("");

        if (!Number.isInteger(classRoomId) || classRoomId <= 0) {
            setErrorMessage(t("teacher.taskCreate.errors.invalidClassroom"));
            return;
        }

        if (!dateRange?.from || !dateRange.to) {
            setErrorMessage(t("teacher.taskCreate.errors.needStartAndEnd"));
            return;
        }

        if (
            !Number.isInteger(formData.rewardStamp) ||
            formData.rewardStamp < 1
        ) {
            setErrorMessage(t("teacher.taskCreate.errors.invalidStamp"));
            return;
        }

        const token = localStorage.getItem("jwt_token");

        if (!token) {
            setErrorMessage(t("teacher.taskCreate.errors.noLoginInfo"));
            return;
        }

        const requestBody = {
            classRoomId,
            taskName: formData.taskName.trim(),
            description: formData.description.trim(),
            category: formData.category,
            rewardStamp: formData.rewardStamp,

            // 시·분·초는 자동으로 00:00:00 설정
            startDate: toLocalMidnightString(dateRange.from),
            endDate: toLocalMidnightString(dateRange.to),
        };

        try {
            setIsSubmitting(true);

            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/teacher/classrooms/${id}/tasks/create`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(requestBody),
                },
            );

            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(
                    t("teacher.taskCreate.errors.serverError", {
                        status: response.status,
                        message: responseText,
                    }),
                );
            }

            alert(
                responseText
                    ? t("teacher.taskCreate.success.withNumber", { taskId: responseText })
                    : t("teacher.taskCreate.success.default"),
            );

            navigate(`/teacher/classrooms/${id}/task`);
        } catch (error) {
            console.error("숙제 생성 실패:", error);

            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : t("teacher.taskCreate.errors.unknown"),
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="task-create-page">
            <div className="task-create-container">
                <header className="task-create-header">
                    <button
                        type="button"
                        className="back-button"
                        onClick={() => navigate(-1)}
                        aria-label={t("common.back")}
                    >
                        ←
                    </button>

                    <div>
                        <p className="page-eyebrow">HOMEWORK MANAGEMENT</p>
                        <h1>{t("teacher.taskCreate.title")}</h1>
                        <p className="page-description">
                            {t("teacher.taskCreate.subtitleLine1")}
                            {t("teacher.taskCreate.subtitleLine2")}
                        </p>
                    </div>
                </header>

                <form className="task-create-form" onSubmit={handleSubmit}>
                    <section className="form-section">
                        <div className="section-heading">
                            <span className="section-number">1</span>

                            <div>
                                <h2>{t("teacher.taskCreate.basicInfoTitle")}</h2>
                                <p>{t("teacher.taskCreate.basicInfoDescription")}</p>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="form-field form-field-full">
                                <label htmlFor="taskName">
                                    {t("teacher.taskCreate.fields.taskName")}
                                    <span className="required-mark">*</span>
                                </label>

                                <input
                                    id="taskName"
                                    type="text"
                                    value={formData.taskName}
                                    onChange={(event) =>
                                        updateField(
                                            "taskName",
                                            event.target.value,
                                        )
                                    }
                                    placeholder={t("teacher.taskCreate.fields.taskNamePlaceholder")}
                                    maxLength={100}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="category">
                                    {t("teacher.taskCreate.fields.subject")}
                                    <span className="required-mark">*</span>
                                </label>

                                <select
                                    id="category"
                                    value={formData.category}
                                    onChange={(event) =>
                                        updateField(
                                            "category",
                                            event.target
                                                .value as TaskCategory,
                                        )
                                    }
                                >
                                    <option value="MATH">{t("teacher.taskCreate.subject.math")}</option>
                                    <option value="CHINESE">{t("teacher.taskCreate.subject.chinese")}</option>
                                </select>
                            </div>

                            <div className="form-field">
                                <label htmlFor="stampCount">
                                    {t("teacher.taskCreate.fields.stampCount")}
                                    <span className="required-mark">*</span>
                                </label>

                                <div className="stamp-input-wrapper">
                                    <input
                                        id="stampCount"
                                        type="number"
                                        min={1}
                                        step={1}
                                        value={formData.rewardStamp}
                                        onChange={(event) =>
                                            updateField(
                                                "rewardStamp",
                                                Number(event.target.value),
                                            )
                                        }
                                        required
                                    />

                                    <span className="input-suffix">{t("teacher.taskCreate.fields.stampSuffix")}</span>
                                </div>

                                <p className="field-help">
                                    {t("teacher.taskCreate.fields.stampHelpLine1")}
                                    {t("teacher.taskCreate.fields.stampHelpLine2")}
                                </p>
                            </div>

                            <div className="form-field form-field-full">
                                <label htmlFor="description">
                                    {t("teacher.taskCreate.fields.description")}
                                    <span className="required-mark">*</span>
                                </label>

                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(event) =>
                                        updateField(
                                            "description",
                                            event.target.value,
                                        )
                                    }
                                    placeholder={t("teacher.taskCreate.fields.descriptionPlaceholder")}
                                    maxLength={1000}
                                    required
                                />

                                <div className="character-count">
                                    {formData.description.length}/1000
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="form-section date-section">
                        <div className="section-heading">
                            <span className="section-number">2</span>

                            <div>
                                <h2>{t("teacher.taskCreate.periodTitle")}</h2>
                                <p>
                                    {t("teacher.taskCreate.periodDescriptionLine1")}
                                    {t("teacher.taskCreate.periodDescriptionLine2")}
                                </p>
                            </div>
                        </div>

                        <div className="date-summary">
                            <div
                                className={`date-summary-card ${
                                    dateRange?.from ? "date-selected" : ""
                                }`}
                            >
                                <span className="date-label">{t("teacher.taskCreate.startDate")}</span>
                                <strong>
                                    {formatDisplayDate(dateRange?.from, t("teacher.taskCreate.errors.dateRequired"), currentLocale)}
                                </strong>
                                <span className="date-time">
                                    {t("teacher.taskCreate.fromMidnight")}
                                </span>
                            </div>

                            <div className="date-arrow" aria-hidden="true">
                                →
                            </div>

                            <div
                                className={`date-summary-card ${
                                    dateRange?.to ? "date-selected" : ""
                                }`}
                            >
                                <span className="date-label">{t("teacher.taskCreate.endDate")}</span>
                                <strong>
                                    {formatDisplayDate(dateRange?.to, t("teacher.taskCreate.errors.dateRequired"), currentLocale)}
                                </strong>
                                <span className="date-time">
                                    {t("teacher.taskCreate.untilEndOfDay")}
                                </span>
                            </div>
                        </div>

                        <div className="date-picker-panel">
                            <DayPicker
                                mode="range"
                                locale={ko}
                                selected={dateRange}
                                onSelect={setDateRange}
                                defaultMonth={today}
                                startMonth={today}
                                disabled={{ before: today }}
                                numberOfMonths={2}
                                min={0}
                                excludeDisabled
                                resetOnSelect
                                showOutsideDays
                                fixedWeeks
                                animate
                            />
                        </div>

                        <p className="calendar-help">
                            {t("teacher.taskCreate.dateHelpLine1")}
                            {t("teacher.taskCreate.dateHelpLine2")}
                            {t("teacher.taskCreate.dateHelpLine3")}
                        </p>
                    </section>

                    {errorMessage && (
                        <div className="form-error" role="alert">
                            <strong>{t("teacher.taskCreate.saveFailedTitle")}</strong>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() => navigate(-1)}
                            disabled={isSubmitting}
                        >
                            {t("teacher.taskCreate.cancel")}
                        </button>

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={
                                isSubmitting ||
                                !dateRange?.from ||
                                !dateRange.to
                            }
                        >
                            {isSubmitting ? t("teacher.taskCreate.submitting") : t("teacher.taskCreate.submit")}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}