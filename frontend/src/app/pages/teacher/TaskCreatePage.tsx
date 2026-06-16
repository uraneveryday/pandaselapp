import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { DayPicker, type DateRange } from "@daypicker/react";
import { ko } from "@daypicker/react/locale";

import "@daypicker/react/style.css";
import "./TaskCreatePage.css";

type TaskCategory = "MATH" | "CHINESE";

interface TaskFormData {
    taskName: string;
    description: string;
    category: TaskCategory;
    stampCount: number;
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

function formatDisplayDate(date?: Date): string {
    if (!date) {
        return "날짜를 선택해주세요";
    }

    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
    }).format(date);
}

export function TaskCreatePage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const classRoomId = Number(id);

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
        stampCount: 1,
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
            setErrorMessage("잘못된 클래스룸 주소입니다.");
            return;
        }

        if (!dateRange?.from || !dateRange.to) {
            setErrorMessage("숙제 시작일과 종료일을 모두 선택해주세요.");
            return;
        }

        if (
            !Number.isInteger(formData.stampCount) ||
            formData.stampCount < 1
        ) {
            setErrorMessage("스탬프 개수는 1개 이상의 정수로 입력해주세요.");
            return;
        }

        const token = localStorage.getItem("jwt_token");

        if (!token) {
            setErrorMessage("로그인 정보가 없습니다. 다시 로그인해주세요.");
            return;
        }

        const requestBody = {
            classRoomId,
            taskName: formData.taskName.trim(),
            description: formData.description.trim(),
            category: formData.category,
            stampCount: formData.stampCount,

            // 시·분·초는 자동으로 00:00:00 설정
            startDate: toLocalMidnightString(dateRange.from),
            endDate: toLocalMidnightString(dateRange.to),
        };

        try {
            setIsSubmitting(true);

            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/teacher/classrooms/${id}/task/create`,
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
                    `서버 에러 (${response.status}): ${responseText}`,
                );
            }

            alert(
                responseText
                    ? `숙제가 생성되었습니다. 숙제 번호: ${responseText}`
                    : "숙제가 생성되었습니다.",
            );

            navigate(`/teacher/classrooms/${id}/task`);
        } catch (error) {
            console.error("숙제 생성 실패:", error);

            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "숙제를 생성하는 중 오류가 발생했습니다.",
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
                        aria-label="이전 페이지로 이동"
                    >
                        ←
                    </button>

                    <div>
                        <p className="page-eyebrow">HOMEWORK MANAGEMENT</p>
                        <h1>새 숙제 만들기</h1>
                        <p className="page-description">
                            숙제 내용과 학습 기간, 학생이 받을 보상을
                            설정해주세요.
                        </p>
                    </div>
                </header>

                <form className="task-create-form" onSubmit={handleSubmit}>
                    <section className="form-section">
                        <div className="section-heading">
                            <span className="section-number">1</span>

                            <div>
                                <h2>숙제 기본 정보</h2>
                                <p>학생에게 표시될 숙제 정보를 입력합니다.</p>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="form-field form-field-full">
                                <label htmlFor="taskName">
                                    숙제 이름
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
                                    placeholder="예: 덧셈 문제 10개 풀기"
                                    maxLength={100}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="category">
                                    과목
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
                                    <option value="MATH">수학</option>
                                    <option value="CHINESE">한자</option>
                                </select>
                            </div>

                            <div className="form-field">
                                <label htmlFor="stampCount">
                                    스탬프 개수
                                    <span className="required-mark">*</span>
                                </label>

                                <div className="stamp-input-wrapper">
                                    <input
                                        id="stampCount"
                                        type="number"
                                        min={1}
                                        step={1}
                                        value={formData.stampCount}
                                        onChange={(event) =>
                                            updateField(
                                                "stampCount",
                                                Number(event.target.value),
                                            )
                                        }
                                        required
                                    />

                                    <span className="input-suffix">개</span>
                                </div>

                                <p className="field-help">
                                    숙제를 완료한 학생이 받게 될 스탬프
                                    수입니다.
                                </p>
                            </div>

                            <div className="form-field form-field-full">
                                <label htmlFor="description">
                                    숙제 설명
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
                                    placeholder={
                                        "학생이 해야 할 내용을 자세히 입력해주세요.\n예: 교재 10쪽의 덧셈 문제를 풀고 제출해주세요."
                                    }
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
                                <h2>숙제 기간</h2>
                                <p>
                                    시작일을 먼저 선택한 후 종료일을
                                    선택해주세요.
                                </p>
                            </div>
                        </div>

                        <div className="date-summary">
                            <div
                                className={`date-summary-card ${
                                    dateRange?.from ? "date-selected" : ""
                                }`}
                            >
                                <span className="date-label">시작일</span>
                                <strong>
                                    {formatDisplayDate(dateRange?.from)}
                                </strong>
                                <span className="date-time">
                                    00:00부터
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
                                <span className="date-label">종료일</span>
                                <strong>
                                    {formatDisplayDate(dateRange?.to)}
                                </strong>
                                <span className="date-time">
                                    23:59까지
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
                            회색으로 표시된 과거 날짜는 선택할 수 없습니다.
                            같은 날짜를 두 번 선택하면 하루짜리 숙제로
                            설정할 수 있습니다.
                        </p>
                    </section>

                    {errorMessage && (
                        <div className="form-error" role="alert">
                            <strong>숙제를 저장하지 못했습니다.</strong>
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
                            취소
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
                            {isSubmitting ? "저장 중..." : "숙제 저장하기"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}