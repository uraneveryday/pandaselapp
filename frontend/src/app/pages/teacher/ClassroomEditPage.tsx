import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowLeft,
    Pencil,
    Save,
    Search,
    Trash2,
    UserPlus,
    X,
} from "lucide-react";

type Gender = "MALE" | "FEMALE";

interface Student {
    id: number; // 화면에는 표시하지 않고, key/API 요청용으로만 사용
    loginId?: string;
    name?: string;
    username?: string;
    gender: Gender;
    parentPhoneNumber: string | null;
    stampCount: number;
    couponCount: number;
}

interface Classroom {
    id: number;
    className: string;
    studentCount: number;
    students: Student[];
}

interface CreateStudentForm {
    loginId: string;
    password: string;
    username: string;
    parentPhoneNumber: string;
    gender: Gender;
}

interface EditStudentForm {
    name: string;
    loginId: string;
    gender: Gender;
    parentPhoneNumber: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function ClassroomEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isCreatingStudent, setIsCreatingStudent] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const [searchKeyword, setSearchKeyword] = useState("");

    const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
    const [updatingStudentId, setUpdatingStudentId] = useState<number | null>(null);

    const [createForm, setCreateForm] = useState<CreateStudentForm>({
        loginId: "",
        password: "",
        username: "",
        parentPhoneNumber: "",
        gender: "MALE",
    });

    const [editForm, setEditForm] = useState<EditStudentForm>({
        name: "",
        loginId: "",
        gender: "MALE",
        parentPhoneNumber: "",
    });

    useEffect(() => {
        fetchClassroomDetails();
    }, [id]);

    const getToken = () => localStorage.getItem("jwt_token");

    const unwrapData = (result: any) => {
        return result?.success ? result.data : result;
    };

    const fetchClassroomDetails = async () => {
        try {
            setIsLoading(true);

            const res = await fetch(
                `${API_BASE_URL}/api/teacher/classrooms/${id}/edit`,
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                    },
                },
            );

            if (!res.ok) {
                throw new Error(t("teacher.classroomEdit.alerts.loadFailed"));
            }

            const result = await res.json();
            const data = unwrapData(result);

            setClassroom({
                ...data,
                students: data.students ?? [],
            });
        } catch (error) {
            console.error(error);
            alert(t("teacher.classroomEdit.alerts.loadError"));
        } finally {
            setIsLoading(false);
        }
    };

    const filteredStudents = useMemo(() => {
        if (!classroom?.students) return [];

        const keyword = searchKeyword.trim().toLowerCase();

        if (!keyword) return classroom.students;

        return classroom.students.filter((student) => {
            const name = student.name || student.username || "";
            const loginId = student.loginId || "";
            const parentPhoneNumber = student.parentPhoneNumber || "";

            return (
                name.toLowerCase().includes(keyword) ||
                loginId.toLowerCase().includes(keyword) ||
                parentPhoneNumber.includes(keyword)
            );
        });
    }, [classroom, searchKeyword]);

    const handleCreateStudent = async (e: FormEvent) => {
        e.preventDefault();

        if (!createForm.username.trim()) {
            return alert(t("teacher.classroomEdit.alerts.studentNameRequired"));
        }

        if (!createForm.loginId.trim()) {
            return alert(t("teacher.classroomEdit.alerts.loginIdRequired"));
        }

        if (!createForm.password.trim()) {
            return alert(t("teacher.classroomEdit.alerts.initialPasswordRequired"));
        }

        try {
            setIsCreating(true);

            const requestData = {
                studentName: createForm.username.trim(),
                studentLoginId: createForm.loginId.trim(),
                studentPassword: createForm.password.trim(),
                gender: createForm.gender,

                // 현재 기존 코드에서 phoneNumber로 보내고 있었기 때문에 유지
                // 백엔드 DTO가 parentPhoneNumber라면 이 키만 parentPhoneNumber로 바꾸면 됨
                phoneNumber: createForm.parentPhoneNumber.trim() || null,
            };

            const res = await fetch(
                `${API_BASE_URL}/api/teacher/classrooms/${id}/edit/student`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestData),
                },
            );

            if (!res.ok) {
                throw new Error(t("teacher.classroomEdit.alerts.createFailed"));
            }

            const result = await res.json();
            const newStudent = unwrapData(result);

            setClassroom((prev) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    studentCount: prev.students.length + 1,
                    students: [...prev.students, newStudent],
                };
            });

            setCreateForm({
                loginId: "",
                password: "",
                username: "",
                parentPhoneNumber: "",
                gender: "MALE",
            });

            setIsCreatingStudent(false);
            alert(t("teacher.classroomEdit.alerts.createSuccess"));
        } catch (error: any) {
            console.error(error);
            alert(error.message || t("teacher.classroomEdit.alerts.createUnknown"));
        } finally {
            setIsCreating(false);
        }
    };

    const handleStartEdit = (student: Student) => {
        setEditingStudentId(student.id);
        setEditForm({
            name: student.name || student.username || "",
            loginId: student.loginId || "",
            gender: student.gender,
            parentPhoneNumber: student.parentPhoneNumber || "",
        });
    };

    const handleCancelEdit = () => {
        setEditingStudentId(null);
        setEditForm({
            name: "",
            loginId: "",
            gender: "MALE",
            parentPhoneNumber: "",
        });
    };

    const handleUpdateStudent = async (studentId: number) => {
        if (!editForm.name.trim()) {
            return alert(t("teacher.classroomEdit.alerts.studentNameRequired"));
        }

        try {
            setUpdatingStudentId(studentId);

            const requestData = {
                studentName: editForm.name.trim(),
                gender: editForm.gender,

                // 백엔드 DTO가 parentPhoneNumber라면 이 키만 parentPhoneNumber로 변경
                phoneNumber: editForm.parentPhoneNumber.trim() || null,
            };

            /*
             * 백엔드에 학생 수정 API가 아직 없다면 아래 형태로 하나 만들면 됨.
             *
             * PATCH /api/teacher/students/{studentId}
             *
             * 또는 클래스룸 기준으로 관리하고 싶으면:
             * PATCH /api/teacher/classrooms/{classroomId}/students/{studentId}
             *
             * 아래 코드는 첫 번째 방식을 기준으로 작성.
             */
            const res = await fetch(
                `${API_BASE_URL}/api/teacher/students/${studentId}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestData),
                },
            );

            if (!res.ok) {
                throw new Error(t("teacher.classroomEdit.alerts.updateFailed"));
            }

            let updatedStudent: Partial<Student> | null = null;

            try {
                const result = await res.json();
                updatedStudent = unwrapData(result);
            } catch {
                updatedStudent = null;
            }

            setClassroom((prev) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    students: prev.students.map((student) => {
                        if (student.id !== studentId) return student;

                        return {
                            ...student,
                            ...updatedStudent,
                            name: editForm.name.trim(),
                            gender: editForm.gender,
                            parentPhoneNumber:
                                editForm.parentPhoneNumber.trim() || null,
                        };
                    }),
                };
            });

            handleCancelEdit();
        } catch (error: any) {
            console.error(error);
            alert(error.message || t("teacher.classroomEdit.alerts.updateUnknown"));
        } finally {
            setUpdatingStudentId(null);
        }
    };

    const handleRemoveStudent = async (student: Student) => {
        const studentName = student.name || student.username || t("teacher.classroomEdit.alerts.fallbackStudentName");

        if (
            !window.confirm(
                t("teacher.classroomEdit.alerts.removeConfirm", { studentName }),
            )
        ) {
            return;
        }

        try {
            const res = await fetch(
                `${API_BASE_URL}/api/teacher/classrooms/${id}/students/${student.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        "Content-Type": "application/json",
                    },
                },
            );

            if (!res.ok) {
                throw new Error(t("teacher.classroomEdit.alerts.removeFailed"));
            }

            setClassroom((prev) => {
                if (!prev) return prev;

                const nextStudents = prev.students.filter(
                    (s) => s.id !== student.id,
                );

                return {
                    ...prev,
                    studentCount: nextStudents.length,
                    students: nextStudents,
                };
            });
        } catch (error: any) {
            console.error(error);
            alert(error.message || t("teacher.classroomEdit.alerts.removeUnknown"));
        }
    };

    if (isLoading) {
        return (
            <div style={centerStyle}>
                <p style={loadingTextStyle}>{t("teacher.classroomEdit.loading")}</p>
            </div>
        );
    }

    if (!classroom) {
        return (
            <div style={centerStyle}>
                <p style={emptyTextStyle}>{t("teacher.classroomEdit.empty")}</p>
            </div>
        );
    }

    return (
        <main style={pageStyle}>
            <div style={headerStyle}>
                <button
                    type="button"
                    onClick={() => navigate("/teacher")}
                    style={backButtonStyle}
                >
                    <ArrowLeft size={18} />
                    {t("teacher.classroomEdit.backToList")}
                </button>

                <div>
                    <p style={eyebrowStyle}>Classroom Edit</p>
                    <h1 style={titleStyle}>{classroom.className}</h1>
                    <p style={subtitleStyle}>
                        {t("teacher.classroomEdit.subtitle")}
                    </p>
                </div>
            </div>

            <section style={summaryGridStyle}>
                <div style={summaryCardStyle}>
                    <span style={summaryLabelStyle}>{t("teacher.classroomEdit.summary.classroom")}</span>
                    <strong style={summaryValueStyle}>{classroom.className}</strong>
                </div>

                <div style={summaryCardStyle}>
                    <span style={summaryLabelStyle}>{t("teacher.classroomEdit.summary.registeredStudents")}</span>
                    <strong style={summaryValueStyle}>
                        {t("teacher.classroomEdit.summary.studentCount", { count: classroom.students.length })}
                    </strong>
                </div>
            </section>

            <section style={sectionStyle}>
                <div style={sectionHeaderStyle}>
                    <div>
                        <h2 style={sectionTitleStyle}>{t("teacher.classroomEdit.studentManagement")}</h2>
                        <p style={sectionDescriptionStyle}>
                            {t("teacher.classroomEdit.studentManagementDescription")}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsCreatingStudent((prev) => !prev)}
                        style={primaryButtonStyle}
                    >
                        {isCreatingStudent ? <X size={17} /> : <UserPlus size={17} />}
                        {isCreatingStudent ? t("teacher.classroomEdit.close") : t("teacher.classroomEdit.newStudent")}
                    </button>
                </div>

                <AnimatePresence>
                    {isCreatingStudent && (
                        <motion.form
                            onSubmit={handleCreateStudent}
                            initial={{ opacity: 0, y: -8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: -8, height: 0 }}
                            transition={{ duration: 0.22 }}
                            style={{ overflow: "hidden" }}
                        >
                            <div style={createBoxStyle}>
                                <div style={formGridStyle}>
                                    <label style={fieldStyle}>
                                        <span style={fieldLabelStyle}>{t("teacher.classroomEdit.form.studentName")}</span>
                                        <input
                                            value={createForm.username}
                                            onChange={(e) =>
                                                setCreateForm({
                                                    ...createForm,
                                                    username: e.target.value,
                                                })
                                            }
                                            placeholder={t("teacher.classroomEdit.form.studentNamePlaceholder")}
                                            style={inputStyle}
                                        />
                                    </label>

                                    <label style={fieldStyle}>
                                        <span style={fieldLabelStyle}>{t("teacher.classroomEdit.form.gender")}</span>
                                        <select
                                            value={createForm.gender}
                                            onChange={(e) =>
                                                setCreateForm({
                                                    ...createForm,
                                                    gender: e.target.value as Gender,
                                                })
                                            }
                                            style={inputStyle}
                                        >
                                            <option value="MALE">{t("common.gender.maleStudent")}</option>
                                            <option value="FEMALE">{t("common.gender.femaleStudent")}</option>
                                        </select>
                                    </label>

                                    <label style={fieldStyle}>
                                        <span style={fieldLabelStyle}>{t("teacher.classroomEdit.form.loginId")}</span>
                                        <input
                                            value={createForm.loginId}
                                            onChange={(e) =>
                                                setCreateForm({
                                                    ...createForm,
                                                    loginId: e.target.value,
                                                })
                                            }
                                            placeholder={t("teacher.classroomEdit.form.loginIdPlaceholder")}
                                            style={inputStyle}
                                        />
                                    </label>

                                    <label style={fieldStyle}>
                                        <span style={fieldLabelStyle}>{t("teacher.classroomEdit.form.initialPassword")}</span>
                                        <input
                                            type="password"
                                            value={createForm.password}
                                            onChange={(e) =>
                                                setCreateForm({
                                                    ...createForm,
                                                    password: e.target.value,
                                                })
                                            }
                                            placeholder={t("teacher.classroomEdit.form.initialPasswordPlaceholder")}
                                            style={inputStyle}
                                        />
                                    </label>

                                    <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                                        <span style={fieldLabelStyle}>
                                            {t("teacher.classroomEdit.form.parentPhoneNumber")}
                                        </span>
                                        <input
                                            value={createForm.parentPhoneNumber}
                                            onChange={(e) =>
                                                setCreateForm({
                                                    ...createForm,
                                                    parentPhoneNumber: e.target.value,
                                                })
                                            }
                                            placeholder={t("teacher.classroomEdit.form.optionalPlaceholder")}
                                            style={inputStyle}
                                        />
                                    </label>
                                </div>

                                <div style={formButtonRowStyle}>
                                    <button
                                        type="button"
                                        onClick={() => setIsCreatingStudent(false)}
                                        style={secondaryButtonStyle}
                                    >
                                        {t("teacher.classroomEdit.buttons.cancel")}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        style={{
                                            ...primaryButtonStyle,
                                            opacity: isCreating ? 0.65 : 1,
                                        }}
                                    >
                                        <UserPlus size={17} />
                                        {isCreating ? t("teacher.classroomEdit.form.creating") : t("teacher.classroomEdit.form.createAccount")}
                                    </button>
                                </div>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div style={toolbarStyle}>
                    <div style={searchBoxStyle}>
                        <Search size={17} color="#94a3b8" />
                        <input
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            placeholder={t("teacher.classroomEdit.searchPlaceholder")}
                            style={searchInputStyle}
                        />
                    </div>

                    <span style={countBadgeStyle}>
                        {t("teacher.classroomEdit.filteredCount", { count: filteredStudents.length })}
                    </span>
                </div>

                <div style={tableWrapperStyle}>
                    <table style={tableStyle}>
                        <thead>
                        <tr>
                            <th style={thStyle}>{t("teacher.classroomEdit.table.studentName")}</th>
                            <th style={thStyle}>{t("teacher.classroomEdit.table.loginId")}</th>
                            <th style={thStyle}>{t("teacher.classroomEdit.table.gender")}</th>
                            <th style={thStyle}>{t("teacher.classroomEdit.table.parentPhoneNumber")}</th>
                            <th style={thStyle}>{t("teacher.classroomEdit.table.stamp")}</th>
                            <th style={thStyle}>{t("teacher.classroomEdit.table.coupon")}</th>
                            <th style={{ ...thStyle, textAlign: "right" }}>{t("teacher.classroomEdit.table.manage")}</th>
                        </tr>
                        </thead>

                        <tbody>
                        {filteredStudents.map((student) => {
                            const isEditing = editingStudentId === student.id;
                            const isUpdating = updatingStudentId === student.id;

                            return (
                                <tr key={student.id} style={trStyle}>
                                    <td style={tdStyle}>
                                        {isEditing ? (
                                            <input
                                                value={editForm.name}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        name: e.target.value,
                                                    })
                                                }
                                                style={smallInputStyle}
                                            />
                                        ) : (
                                            <div style={studentNameBoxStyle}>
                                                    <span style={avatarStyle}>
                                                        {(student.name || student.username || "?").slice(
                                                            0,
                                                            1,
                                                        )}
                                                    </span>
                                                <strong style={studentNameStyle}>
                                                    {student.name || student.username || t("teacher.classroomEdit.defaultStudentName")}
                                                </strong>
                                            </div>
                                        )}
                                    </td>
                                    <td style={tdStyle}>
                                        {isEditing ? (
                                            <input
                                                value={editForm.loginId}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        loginId: e.target.value,
                                                    })
                                                }
                                                placeholder={t("teacher.classroomEdit.table.loginId")}
                                                style={smallInputStyle}
                                            />
                                        ) : (
                                            <span style={loginIdBadgeStyle}>
            {student.loginId || "-"}
        </span>
                                        )}
                                    </td>
                                    <td style={tdStyle}>
                                        {isEditing ? (
                                            <select
                                                value={editForm.gender}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        gender: e.target.value as Gender,
                                                    })
                                                }
                                                style={smallInputStyle}
                                            >
                                                <option value="MALE">{t("common.gender.maleStudent")}</option>
                                                <option value="FEMALE">{t("common.gender.femaleStudent")}</option>
                                            </select>
                                        ) : (
                                            <span style={genderBadgeStyle(student.gender)}>
                                                    {student.gender === "MALE" ? t("common.gender.maleStudent") : t("common.gender.femaleStudent")}
                                                </span>
                                        )}
                                    </td>

                                    <td style={tdStyle}>
                                        {isEditing ? (
                                            <input
                                                value={editForm.parentPhoneNumber}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        parentPhoneNumber: e.target.value,
                                                    })
                                                }
                                                placeholder={t("teacher.classroomEdit.form.optionalPlaceholder")}
                                                style={smallInputStyle}
                                            />
                                        ) : (
                                            <span style={mutedTextStyle}>
                                                    {student.parentPhoneNumber || "-"}
                                                </span>
                                        )}
                                    </td>

                                    <td style={tdStyle}>
                                            <span style={numberBadgeStyle}>
                                                {student.stampCount ?? 0}
                                            </span>
                                    </td>

                                    <td style={tdStyle}>
                                            <span style={numberBadgeStyle}>
                                                {student.couponCount ?? 0}
                                            </span>
                                    </td>

                                    <td style={{ ...tdStyle, textAlign: "right" }}>
                                        {isEditing ? (
                                            <div style={actionRowStyle}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdateStudent(student.id)}
                                                    disabled={isUpdating}
                                                    style={iconPrimaryButtonStyle}
                                                >
                                                    <Save size={15} />
                                                    {isUpdating ? t("teacher.classroomEdit.buttons.saving") : t("teacher.classroomEdit.buttons.save")}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={handleCancelEdit}
                                                    style={iconSecondaryButtonStyle}
                                                >
                                                    <X size={15} />
                                                    {t("teacher.classroomEdit.buttons.cancel")}
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={actionRowStyle}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleStartEdit(student)}
                                                    style={iconSecondaryButtonStyle}
                                                >
                                                    <Pencil size={15} />
                                                    {t("teacher.classroomEdit.buttons.edit")}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveStudent(student)}
                                                    style={dangerButtonStyle}
                                                >
                                                    <Trash2 size={15} />
                                                    {t("teacher.classroomEdit.buttons.remove")}
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>

                    {filteredStudents.length === 0 && (
                        <div style={emptyBoxStyle}>
                            <p style={emptyTitleStyle}>{t("teacher.classroomEdit.emptyStudentsTitle")}</p>
                            <p style={emptyTextStyle}>
                                {t("teacher.classroomEdit.emptyStudentsDescription")}
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
const loginIdBadgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "6px 10px",
    backgroundColor: "#f8fafc",
    color: "#475569",
    fontSize: 13,
    fontWeight: 850,
    fontFamily:
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};
const pageStyle: React.CSSProperties = {
    maxWidth: 1120,
    margin: "0 auto",
    padding: "32px 24px 56px",
    fontFamily:
        "Inter, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    color: "#0f172a",
};

const centerStyle: React.CSSProperties = {
    minHeight: "60vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const headerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 18,
    marginBottom: 24,
};

const backButtonStyle: React.CSSProperties = {
    width: "fit-content",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    color: "#475569",
    borderRadius: 999,
    padding: "9px 14px",
    fontWeight: 800,
    cursor: "pointer",
};

const eyebrowStyle: React.CSSProperties = {
    margin: "0 0 6px",
    color: "#2563eb",
    fontSize: 13,
    fontWeight: 900,
    letterSpacing: "0.04em",
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.15,
    fontWeight: 950,
    letterSpacing: "-0.04em",
};

const subtitleStyle: React.CSSProperties = {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: 15,
    fontWeight: 600,
};

const summaryGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
    marginBottom: 18,
};

const summaryCardStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 22,
    padding: 20,
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.05)",
};

const summaryLabelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: 8,
    color: "#64748b",
    fontSize: 13,
    fontWeight: 800,
};

const summaryValueStyle: React.CSSProperties = {
    display: "block",
    color: "#0f172a",
    fontSize: 24,
    fontWeight: 950,
};

const sectionStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 26,
    padding: 24,
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.06)",
};

const sectionHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 18,
};

const sectionTitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 22,
    fontWeight: 950,
    letterSpacing: "-0.03em",
};

const sectionDescriptionStyle: React.CSSProperties = {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: 14,
    fontWeight: 600,
};

const createBoxStyle: React.CSSProperties = {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
};

const formGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
};

const fieldStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 7,
};

const fieldLabelStyle: React.CSSProperties = {
    color: "#334155",
    fontSize: 13,
    fontWeight: 850,
};

const inputStyle: React.CSSProperties = {
    height: 46,
    border: "1px solid #cbd5e1",
    borderRadius: 14,
    padding: "0 14px",
    outline: "none",
    fontSize: 14,
    fontWeight: 650,
    backgroundColor: "#ffffff",
};

const smallInputStyle: React.CSSProperties = {
    width: "100%",
    minWidth: 120,
    height: 38,
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    padding: "0 12px",
    outline: "none",
    fontSize: 14,
    fontWeight: 650,
    backgroundColor: "#ffffff",
};

const formButtonRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
};

const primaryButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "none",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    borderRadius: 14,
    padding: "11px 16px",
    fontWeight: 900,
    cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    color: "#475569",
    borderRadius: 14,
    padding: "11px 16px",
    fontWeight: 850,
    cursor: "pointer",
};

const toolbarStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
};

const searchBoxStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 9,
    height: 46,
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: "0 14px",
    backgroundColor: "#ffffff",
};

const searchInputStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    border: "none",
    outline: "none",
    fontSize: 14,
    fontWeight: 650,
};

const countBadgeStyle: React.CSSProperties = {
    whiteSpace: "nowrap",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    borderRadius: 999,
    padding: "9px 13px",
    fontSize: 13,
    fontWeight: 850,
};

const tableWrapperStyle: React.CSSProperties = {
    overflowX: "auto",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
};

const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 860,
};

const thStyle: React.CSSProperties = {
    backgroundColor: "#f8fafc",
    color: "#64748b",
    textAlign: "left",
    padding: "13px 16px",
    fontSize: 13,
    fontWeight: 900,
    borderBottom: "1px solid #e2e8f0",
};

const trStyle: React.CSSProperties = {
    borderBottom: "1px solid #f1f5f9",
};

const tdStyle: React.CSSProperties = {
    padding: "14px 16px",
    verticalAlign: "middle",
    fontSize: 14,
};

const studentNameBoxStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
};

const avatarStyle: React.CSSProperties = {
    width: 34,
    height: 34,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    fontWeight: 950,
};

const studentNameStyle: React.CSSProperties = {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: 900,
};

const mutedTextStyle: React.CSSProperties = {
    color: "#64748b",
    fontWeight: 650,
};

const genderBadgeStyle = (gender: Gender): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "6px 10px",
    backgroundColor: gender === "MALE" ? "#eff6ff" : "#fdf2f8",
    color: gender === "MALE" ? "#2563eb" : "#db2777",
    fontSize: 13,
    fontWeight: 900,
});

const numberBadgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 34,
    height: 28,
    borderRadius: 999,
    backgroundColor: "#f8fafc",
    color: "#334155",
    fontSize: 13,
    fontWeight: 900,
};

const actionRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
};

const iconPrimaryButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: "none",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    borderRadius: 12,
    padding: "8px 11px",
    fontSize: 13,
    fontWeight: 900,
    cursor: "pointer",
};

const iconSecondaryButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    color: "#475569",
    borderRadius: 12,
    padding: "8px 11px",
    fontSize: 13,
    fontWeight: 900,
    cursor: "pointer",
};

const dangerButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: "none",
    backgroundColor: "#fff1f2",
    color: "#e11d48",
    borderRadius: 12,
    padding: "8px 11px",
    fontSize: 13,
    fontWeight: 900,
    cursor: "pointer",
};

const emptyBoxStyle: React.CSSProperties = {
    padding: 36,
    textAlign: "center",
    backgroundColor: "#ffffff",
};

const emptyTitleStyle: React.CSSProperties = {
    margin: "0 0 6px",
    color: "#334155",
    fontSize: 16,
    fontWeight: 900,
};

const emptyTextStyle: React.CSSProperties = {
    margin: 0,
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: 650,
};

const loadingTextStyle: React.CSSProperties = {
    color: "#64748b",
    fontSize: 16,
    fontWeight: 800,
};