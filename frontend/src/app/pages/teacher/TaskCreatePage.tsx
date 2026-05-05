import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // ⭐️ useParams 추가

export function TaskCreatePage() {
    const navigate = useNavigate();

    // ⭐️ 1. URL에서 해당 클래스룸의 id를 추출
    const { id } = useParams<{ id: string }>();

    const [formData, setFormData] = useState({
        classRoomId: Number(id), // ⭐️ 기존 하드코딩(1) 대신 실제 URL의 id를 숫자로 변환해 사용
        taskName: "", description: "", category: "MATH", startDate: "", endDate: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // ⭐️ 2. 로컬 스토리지에서 JWT 토큰 가져오기
        const token = localStorage.getItem("jwt_token");

        // ⭐️ 3. 백틱(`)을 사용하여 URL에 동적 id 삽입
        fetch(`http://localhost:8080/api/teacher/classrooms/${id}/task/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // ⭐️ 4. 인증 헤더 필수 추가
            },
            body: JSON.stringify(formData)
        })
            .then(async (res) => {
                if (!res.ok) {
                    // 서버에서 보낸 에러 메시지 확인용
                    const errText = await res.text();
                    throw new Error(`서버 에러 (${res.status}): ${errText}`);
                }
                return res.text();
            })
            .then((data) => {
                alert(`🎉 숙제 생성 성공! (번호: ${data})`);
                navigate(`/teacher/classrooms/${id}/task`); // 💡 성공 시 해당 반의 숙제 목록으로 이동하는 것이 논리적입니다.
            })
            .catch((err) => {
                console.error(err);
                alert("에러 발생: 콘솔을 확인하세요.");
            });
    };

    return (
        <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "10px" }}>
            <h2 style={{ textAlign: "center" }}>📝 새 숙제 만들기</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <input type="text" name="taskName" placeholder="숙제 이름" value={formData.taskName} onChange={handleChange} required style={{ padding: "8px" }} />
                <select name="category" value={formData.category} onChange={handleChange} style={{ padding: "8px" }}>
                    <option value="MATH">수학 (MATH)</option>
                    <option value="CHINESE">한자 (CHINESE)</option>
                </select>
                <textarea name="description" placeholder="숙제 설명" value={formData.description} onChange={handleChange} required style={{ padding: "8px", height: "80px" }} />
                <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} required style={{ padding: "8px" }} />
                <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} required style={{ padding: "8px" }} />
                <button type="submit" style={{ padding: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>저장하기</button>
            </form>
        </div>
    );
}