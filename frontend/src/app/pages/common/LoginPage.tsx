import { useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import { useState } from "react";

export function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

    // 💡 비동기(async) 통신 로직으로 변경
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) return;

        setIsLoading(true);

        try {
            // 1. 백엔드 로그인 API 호출
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // 🚨 백엔드의 LoginRequest DTO 필드명(loginId, password)과 정확히 일치시켜야 합니다.
                body: JSON.stringify({
                    loginId: username,
                    password: password,
                }),
            });

            // 2. HTTP 상태 코드가 200번대(성공)가 아닐 경우 에러 처리
            if (!response.ok) {
                throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.");
            }

            // 3. 백엔드에서 반환한 JSON 데이터 (TokenInfo 객체) 추출
            const data = await response.json();


            // 4. 데이터 안에 accessToken이 정상적으로 들어있는지 확인
            if (data.accessToken) {
                const token = data.accessToken;

                // 💡 [추가된 로직] JWT 토큰 해독하기
                // 토큰은 헤더.페이로드.서명 으로 이루어져 있으므로 [1]번째 인덱스인 페이로드를 가져옵니다.
                const payloadBase64 = token.split('.')[1];

                // Base64 문자열을 디코딩하여 JSON 객체로 변환합니다.
                const decodedPayload = JSON.parse(atob(payloadBase64));
                console.log("login auth ?:", decodedPayload.auth); // 👈 이 줄을 추가!
                // 5. 토큰 저장
                localStorage.setItem("jwt_token", token);
                // 선택사항: 역할 정보도 따로 저장해두면 나중에 UI 분기처리가 편합니다.
                localStorage.setItem("user_role", decodedPayload.auth);

                alert("로그인 성공!");

                // 💡 6. 역할(Role)에 따른 맞춤형 라우팅 (경로는 본인의 프로젝트에 맞게 수정하세요)
                if (decodedPayload.auth === "ROLE_TEACHER") {
                    navigate("/teacher");
                } else if (decodedPayload.auth === "ROLE_STUDENT") {
                    // 학생일 경우 학생 전용 경로로 이동
                    navigate("/student");
                } else {
                    // 권한이 없거나 예외 상황일 경우
                    navigate("/");
                }

            } else {
                throw new Error("서버로부터 정상적인 토큰을 발급받지 못했습니다.");
            }


        } catch (error: any) {
            alert(error.message);
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

                    <h1 className="text-2xl font-bold text-gray-800 mb-2">반가워요!</h1>
                    <p className="text-sm text-gray-500 mb-10 text-center">
                        아이디와 비밀번호를 입력하고
                        <br />
                        재미있는 학습을 시작해볼까요?
                    </p>

                    <form onSubmit={handleLogin} className="w-full space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600 ml-1">아이디</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all bg-gray-50 focus:bg-white"
                                    placeholder="아이디를 입력하세요"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600 ml-1">비밀번호</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all bg-gray-50 focus:bg-white"
                                    placeholder="비밀번호를 입력하세요"
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

                    <div className="mt-12 text-center w-full pb-4">
                        <p className="text-xs text-gray-400 bg-gray-50 py-3 rounded-xl">
                            계정이 없다면 선생님께 문의해주세요 😊
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}