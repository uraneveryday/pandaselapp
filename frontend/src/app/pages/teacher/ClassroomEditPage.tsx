import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, X } from "lucide-react";

export function ClassroomEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [classroom, setClassroom] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState("");

    const [isAddingStudent, setIsAddingStudent] = useState(false);
    const [newStudentId, setNewStudentId] = useState("");

    // 🌟 엔티티 구조에 맞춰 폼 상태 확장 (username, phoneNumber, parentPhoneNumber, gender 추가)
    const [isCreatingStudent, setIsCreatingStudent] = useState(false);
    const [createForm, setCreateForm] = useState({
        loginId: "",
        password: "",
        username: "",
        //phoneNumber: "",
        parentPhoneNumber: "",
        gender: "MALE" // 기본값 설정 (MALE / FEMALE)
    });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const fetchClassroomDetails = async () => {
            try {
                const token = localStorage.getItem("jwt_token");
                const res = await fetch(`http://localhost:8080/api/teacher/classrooms/${id}/edit`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("데이터 로드 실패");
                const result = await res.json();

                // 공통 응답 포맷 대응
                const data = result.success ? result.data : result;
                setClassroom(data);
                setEditNameValue(data.className);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchClassroomDetails();
    }, [id]);

    const handleSaveName = async () => {
        if (!editNameValue.trim()) return alert("이름을 입력해주세요.");
        setClassroom({ ...classroom, className: editNameValue });
        setIsEditingName(false);
    };

    const handleAddStudent = async () => {
        if (!newStudentId.trim()) return;
        setNewStudentId("");
        setIsAddingStudent(false);
    };


    const handleRemoveStudent = async (studentId: number) => {
        if (!window.confirm("정말 이 학생을 클래스룸에서 제외하시겠습니까?")) return;

        try {
            const token = localStorage.getItem("jwt_token");

            // id : classroom ID
            const response = await fetch(`/api/teacher/classrooms/${id}/students/${studentId}`, {
                method: "DELETE", // 또는 상태 변경이라면 PUT/PATCH
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            // 2. 서버에서 삭제가 성공적으로 완료되었을 때만 UI 상태 업데이트 (비관적 업데이트 방식)
            if (response.ok) {
                const filtered = classroom.students.filter((s: any) => s.id !== studentId);
                setClassroom({ ...classroom, students: filtered });
                // alert("학생이 제외되었습니다."); // 필요시 주석 해제
            } else {
                // 4xx, 5xx 에러 발생 시 처리
                alert("학생 제외 처리에 실패했습니다. 다시 시도해주세요.");
            }

        } catch (error) {
            // 3. 네트워크 단절 등 서버 통신 자체가 실패했을 때의 예외 처리
            console.error("학생 삭제 API 오류:", error);
            alert("서버 통신 중 오류가 발생했습니다.");
        }
    };

    const handleCreateStudent = async (e: React.FormEvent) => {
        e.preventDefault();

        // 필수 값 검증
        if (!createForm.loginId || !createForm.password || !createForm.username) {
            return alert("필수 정보(이름, 아이디, 비밀번호)를 모두 입력해주세요.");
        }

        setIsCreating(true);
        try {
            const token = localStorage.getItem("jwt_token");

            // 클래스룸 ID도 함께 넘겨주어야 백엔드에서 매핑하기 편합니다.
            const requestData = {
                studentName: createForm.username,        // username을 studentName으로 포장
                studentLoginId: createForm.loginId,      // loginId를 studentLoginId로 포장
                studentPassword: createForm.password,    // password를 studentPassword로 포장
                gender: createForm.gender,
                phoneNumber: createForm.parentPhoneNumber // 백엔드가 phoneNumber라는 이름으로 학부모 번호를 받기로 했다면!
            };

            const res = await fetch(`http://localhost:8080/api/teacher/classrooms/${id}/edit/student`, {
                method: 'POST',
                headers: { "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json" },
                body: JSON.stringify(requestData) // 👈 예쁘게 포장한 데이터를 전송
            });

            if (!res.ok) throw new Error("학생 가입에 실패했습니다.");
            const newStudent = await res.json();

            setClassroom({
                ...classroom,
                students: [...classroom.students, newStudent.data || newStudent]
            });

            alert(`🎉 ${createForm.username} 학생이 성공적으로 가입되었습니다!`);

            // 폼 초기화
            setCreateForm({
                loginId: "", password: "", username: "",
                parentPhoneNumber: "", gender: "MALE"
            });
            setIsCreatingStudent(false);

        } catch (error: any) {
            alert(error.message);
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    if (isLoading) return <div style={{ padding: "40px", textAlign: "center" }}>데이터 로딩 중... ⏳</div>;
    if (!classroom) return <div style={{ padding: "40px", textAlign: "center" }}>데이터를 찾을 수 없습니다.</div>;

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <h2 style={{ margin: 0 }}>⚙️ 클래스룸 관리</h2>
                <button onClick={() => navigate("/teacher")} style={btnStyle("gray")}>목록으로</button>
            </div>

            {/* --- 1. 기본 정보 섹션 --- */}
            <section style={sectionStyle}>
                <h3 style={sectionTitleStyle}>기본 정보</h3>
                <div style={rowStyle}>
                    <span style={labelStyle}>클래스 이름</span>
                    {isEditingName ? (
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <input
                                value={editNameValue}
                                onChange={(e) => setEditNameValue(e.target.value)}
                                style={inputStyle}
                            />
                            {/*<button onClick={handleSaveName} style={btnStyle("blue")}>저장</button>*/}

                            <button onClick={() => { setIsEditingName(false); setEditNameValue(classroom.className); }} style={btnStyle("white")}>취소</button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <span style={{ fontSize: "18px", fontWeight: "bold" }}>{classroom.className}</span>
                            {/*<button onClick={() => setIsEditingName(true)} style={btnStyle("white")}>✏️ 수정</button>*/}
                        </div>
                    )}
                </div>
            </section>

            {/* --- 2. 학생 관리 섹션 --- */}
            <section style={sectionStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <h3 style={{ margin: 0, ...sectionTitleStyle, border: "none", padding: 0 }}>학생 목록 ({classroom.students?.length || 0}명)</h3>

                    <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={() => setIsAddingStudent(!isAddingStudent)} style={btnStyle("white")}>
                            기존 학생 연동
                        </button>
                        <button
                            onClick={() => setIsCreatingStudent(!isCreatingStudent)}
                            style={btnStyle("tossBlue")}
                        >
                            <UserPlus size={16} style={{ marginRight: "4px", display: "inline-block", verticalAlign: "text-bottom" }} />
                            새 학생 가입
                        </button>
                    </div>
                </div>

                {isAddingStudent && (
                    <div style={{ marginBottom: "15px", padding: "15px", backgroundColor: "#f9fafb", borderRadius: "8px", display: "flex", gap: "10px" }}>
                        <input
                            placeholder="추가할 학생의 로그인 ID 입력"
                            value={newStudentId}
                            onChange={(e) => setNewStudentId(e.target.value)}
                            style={inputStyle}
                        />
                        <button onClick={handleAddStudent} style={btnStyle("gray")}>추가</button>
                    </div>
                )}

                {/* 🌟 확장된 새 학생 가입 폼 */}
                <AnimatePresence>
                    {isCreatingStudent && (
                        <motion.form
                            onSubmit={handleCreateStudent}
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            style={{ overflow: "hidden", marginBottom: "20px" }}
                        >
                            <div style={{ backgroundColor: "#f2f4f6", padding: "24px", borderRadius: "16px", position: "relative" }}>
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingStudent(false)}
                                    style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "#8b95a1" }}
                                >
                                    <X size={20} />
                                </button>

                                <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#333d4b" }}>✨ 새 학생 계정 만들기</h4>

                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

                                    {/* 이름 & 성별 (나란히 배치) */}
                                    <div style={{ display: "flex", gap: "12px" }}>
                                        <input
                                            placeholder="학생 이름 (예: 김민지) *"
                                            value={createForm.username}
                                            onChange={(e) => setCreateForm({...createForm, username: e.target.value})}
                                            style={{ ...tossInputStyle, flex: 2 }} required
                                        />
                                        <select
                                            value={createForm.gender}
                                            onChange={(e) => setCreateForm({...createForm, gender: e.target.value})}
                                            style={{ ...tossInputStyle, flex: 1, cursor: "pointer" }}
                                        >
                                            <option value="MALE">남성</option>
                                            <option value="FEMALE">여성</option>
                                        </select>
                                    </div>

                                    {/* 계정 정보 */}
                                    <input
                                        placeholder="로그인 ID *"
                                        value={createForm.loginId}
                                        onChange={(e) => setCreateForm({...createForm, loginId: e.target.value})}
                                        style={tossInputStyle} required
                                    />
                                    <input
                                        type="password"
                                        placeholder="초기 비밀번호 *"
                                        value={createForm.password}
                                        onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                                        style={tossInputStyle} required
                                    />

                                    {/* 연락처 정보 */}
                                    <input
                                        type="tel"
                                        placeholder="학부모 전화번호 (선택)"
                                        value={createForm.parentPhoneNumber}
                                        onChange={(e) => setCreateForm({...createForm, parentPhoneNumber: e.target.value})}
                                        style={tossInputStyle}
                                    />

                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        style={{
                                            ...btnStyle("tossBlue"),
                                            padding: "14px",
                                            fontSize: "16px",
                                            marginTop: "8px",
                                            opacity: isCreating ? 0.6 : 1
                                        }}
                                    >
                                        {isCreating ? "계정 생성 중..." : "계정 생성 및 클래스룸 추가"}
                                    </button>
                                </div>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {classroom.students?.map((student: any) => (
                        <li key={student.id} style={listItemStyle}>
                            <span style={{ fontWeight: 500, color: "#333d4b" }}>
                                👤 {student.name || student.username}
                                <span style={{ color: "#8b95a1", fontSize: "13px", marginLeft: "4px" }}>(ID: {student.loginId || student.id})</span>
                            </span>
                            <button onClick={() => handleRemoveStudent(student.id)} style={btnStyle("red")}>제외</button>
                        </li>
                    ))}
                    {(!classroom.students || classroom.students.length === 0) && <p style={{ color: "#888", fontSize: "14px", padding: "10px 0" }}>등록된 학생이 없습니다.</p>}
                </ul>
            </section>
        </div>
    );
}

// ==== UI 스타일 정의 ====
const sectionStyle = {
    backgroundColor: "white", padding: "24px", borderRadius: "16px",
    border: "1px solid #f2f4f6", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
};
const sectionTitleStyle = { borderBottom: "2px solid #f2f4f6", paddingBottom: "12px", marginBottom: "20px", color: "#191f28", fontSize: "18px" };
const rowStyle = { display: "flex", alignItems: "center", marginBottom: "15px" };
const labelStyle = { width: "150px", fontWeight: "600", color: "#4e5968", fontSize: "14px" };
const inputStyle = { padding: "10px 12px", border: "1px solid #e5e8eb", borderRadius: "8px", flex: 1, outline: "none" };
const tossInputStyle = { padding: "14px 16px", backgroundColor: "white", border: "1px solid #e5e8eb", borderRadius: "12px", outline: "none", fontSize: "15px", transition: "border 0.2s ease" };
const listItemStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f2f4f6" };

const btnStyle = (color: "blue" | "white" | "red" | "gray" | "green" | "tossBlue") => {
    const styles = {
        tossBlue: { bg: "#3182f6", color: "white", border: "none" },
        blue: { bg: "#1565C0", color: "white", border: "none" },
        green: { bg: "#4CAF50", color: "white", border: "none" },
        red: { bg: "#fee50000", color: "#f04452", border: "none" },
        white: { bg: "white", color: "#4e5968", border: "1px solid #e5e8eb" },
        gray: { bg: "#f2f4f6", color: "#4e5968", border: "none" }
    };
    return {
        padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px",
        backgroundColor: styles[color].bg, color: styles[color].color, border: styles[color].border,
        transition: "background-color 0.2s ease"
    };
};