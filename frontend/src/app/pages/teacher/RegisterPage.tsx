import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function RegisterPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        userId: "",
        password: "",
        name: "",
        email: "",
        gender: "NONE",
        phoneNumber: ""
    });

    const [responseMsg, setResponseMsg] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setResponseMsg("");

        // 💡 [수정된 부분] TypeScript 에러 해결!
        // delete를 쓰지 않고, gender와 나머지(rest)를 분리합니다.
        const { gender, ...rest } = formData;

        // gender가 "NONE"이면 gender를 제외한 rest만 담고, 아니면 전부(formData) 담습니다.
        const payload = gender === "NONE" ? rest : formData;



        fetch("http://localhost:8080/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(errText || "회원가입 실패 (서버 오류)");
                }
                return res.json();
            })
            .then((data) => {
                alert(`🎉 회원가입 성공! (발급된 고유번호: ${data.id})\n이제 로그인해주세요.`);
                navigate("/login");
            })
            .catch((err) => {
                setResponseMsg(err.message);
            });
    };

    return (
        <div style={{ padding: "30px", border: "1px solid #2196F3", borderRadius: "10px", backgroundColor: "#E3F2FD", textAlign: "center", maxWidth: "400px", margin: "50px auto" }}>
            <h2 style={{ color: "#1565C0", margin: "0 0 20px 0" }}>📝 선생님 회원가입</h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", textAlign: "left" }}>

                <div>
                    <label style={labelStyle}>아이디 <span style={{color: "red"}}>*</span></label>
                    <input type="text" name="userId" placeholder="사용할 아이디" value={formData.userId} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>비밀번호 <span style={{color: "red"}}>*</span></label>
                    <input type="password" name="password" placeholder="비밀번호" value={formData.password} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>이름 <span style={{color: "red"}}>*</span></label>
                    <input type="text" name="name" placeholder="실명 입력" value={formData.name} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>이메일 <span style={{color: "red"}}>*</span></label>
                    <input type="email" name="email" placeholder="example@email.com" value={formData.email} onChange={handleChange} required style={inputStyle} />
                </div>

                <hr style={{ border: "0.5px solid #BBDEFB", margin: "10px 0" }}/>

                <div>
                    <label style={labelStyle}>성별 (선택)</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
                        <option value="NONE">선택 안 함</option>
                        <option value="MALE">남성 (MALE)</option>
                        <option value="FEMALE">여성 (FEMALE)</option>
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>전화번호 (선택)</label>
                    <input type="text" name="phoneNumber" placeholder="010-0000-0000" value={formData.phoneNumber} onChange={handleChange} style={inputStyle} />
                </div>

                <button type="submit" style={btnStyle}>가입 완료하기</button>
            </form>

            {responseMsg && <div style={{ marginTop: "15px", color: "#D32F2F", fontWeight: "bold" }}>❌ {responseMsg}</div>}

            <div style={{ marginTop: "20px" }}>
                <button onClick={() => navigate("/login")} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", textDecoration: "underline" }}>
                    로그인 화면으로 돌아가기
                </button>
            </div>
        </div>
    );
}

// 💡 (추가 팁) TypeScript에서는 스타일 객체의 타입도 명시해주면 더 안전합니다.
const labelStyle: React.CSSProperties = { display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "bold", color: "#333" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "12px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box" };
const btnStyle: React.CSSProperties = { padding: "12px", backgroundColor: "#1976D2", color: "white", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer", marginTop: "10px", width: "100%" };