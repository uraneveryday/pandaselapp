
import {
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Lock,
    Mail,
    Phone,
    User,
    UserPlus,
} from "lucide-react";

type Gender = "NONE" | "MALE" | "FEMALE";

interface RegisterFormData {
    userId: string;
    password: string;
    passwordConfirm: string;
    name: string;
    email: string;
    gender: Gender;
    phoneNumber: string;
}

interface RegisterResponse {
    id?: number | string;
    message?: string;
    error?: string;
}

const USER_ID_PATTERN = /^[A-Za-z0-9_]{5,20}$/;

async function readResponseBody(
    response: Response
): Promise<RegisterResponse> {
    const text = await response.text();

    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text) as RegisterResponse;
    } catch {
        return { message: text };
    }
}

export function RegisterPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<RegisterFormData>({
        userId: "",
        password: "",
        passwordConfirm: "",
        name: "",
        email: "",
        gender: "NONE",
        phoneNumber: "",
    });

    const [responseMsg, setResponseMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const validateForm = () => {
        if (!USER_ID_PATTERN.test(formData.userId.trim())) {
            return "아이디는 영문, 숫자, 밑줄을 사용하여 5~20자로 입력해주세요.";
        }

        if (
            formData.password.length < 8 ||
            formData.password.length > 20
        ) {
            return "비밀번호는 8~20자로 입력해주세요.";
        }

        if (!/[A-Za-z]/.test(formData.password)) {
            return "비밀번호에는 영문자가 한 글자 이상 포함되어야 합니다.";
        }

        if (!/\d/.test(formData.password)) {
            return "비밀번호에는 숫자가 한 글자 이상 포함되어야 합니다.";
        }

        if (!/[^A-Za-z0-9]/.test(formData.password)) {
            return "비밀번호에는 특수문자가 한 글자 이상 포함되어야 합니다.";
        }

        if (/\s/.test(formData.password)) {
            return "비밀번호에는 공백을 사용할 수 없습니다.";
        }

        if (formData.password !== formData.passwordConfirm) {
            return "비밀번호와 비밀번호 확인이 일치하지 않습니다.";
        }

        if (!formData.name.trim()) {
            return "이름을 입력해주세요.";
        }

        if (!formData.email.trim()) {
            return "이메일을 입력해주세요.";
        }

        return null;
    };

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setResponseMsg("");

        const validationMessage = validateForm();

        if (validationMessage) {
            setResponseMsg(validationMessage);
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                userId: formData.userId.trim(),
                password: formData.password,
                name: formData.name.trim(),
                email: formData.email.trim(),

                ...(formData.gender !== "NONE" && {
                    gender: formData.gender,
                }),

                ...(formData.phoneNumber.trim() && {
                    phoneNumber: formData.phoneNumber.trim(),
                }),
            };

            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await readResponseBody(response);

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        data.error ||
                        "회원가입에 실패했습니다."
                );
            }

            navigate("/login", {
                replace: true,
                state: {
                    successMessage:
                        "회원가입이 완료되었습니다. 선생님 계정으로 로그인해주세요.",
                },
            });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "회원가입 중 오류가 발생했습니다.";

            setResponseMsg(message);
            console.error("회원가입 에러:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-sans text-gray-800 flex justify-center">
            <div className="w-full max-w-md min-h-screen bg-white shadow-sm px-6 py-10">
                <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="mb-8 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    로그인으로 돌아가기
                </button>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-5 border border-blue-100 shadow-inner">
                        <UserPlus className="w-9 h-9 text-blue-400" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800">
                        선생님 회원가입
                    </h1>

                    <p className="mt-2 text-sm text-gray-500 text-center leading-6">
                        학급과 학습 활동을 관리할
                        <br />
                        선생님 계정을 만들어주세요.
                    </p>

                    <div className="w-full mt-5 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
                        <p className="text-xs text-amber-700 text-center leading-5">
                            이 페이지에서는 선생님 계정만 가입할 수
                            있습니다.
                            <br />
                            학생 계정은 가입 후 학급 관리 화면에서
                            생성해주세요.
                        </p>
                    </div>
                </div>

                {responseMsg && (
                    <div
                        role="alert"
                        className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 text-center"
                    >
                        {responseMsg}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <div className="space-y-1">
                        <label
                            htmlFor="userId"
                            className="text-xs font-semibold text-gray-600 ml-1"
                        >
                            아이디
                            <span className="text-red-400 ml-1">*</span>
                        </label>

                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

                            <input
                                id="userId"
                                type="text"
                                name="userId"
                                value={formData.userId}
                                onChange={handleChange}
                                placeholder="영문, 숫자, 밑줄 5~20자"
                                autoComplete="username"
                                minLength={5}
                                maxLength={20}
                                required
                                disabled={isLoading}
                                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label
                            htmlFor="password"
                            className="text-xs font-semibold text-gray-600 ml-1"
                        >
                            비밀번호
                            <span className="text-red-400 ml-1">*</span>
                        </label>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="영문, 숫자, 특수문자 포함 8~20자"
                                autoComplete="new-password"
                                minLength={8}
                                maxLength={20}
                                required
                                disabled={isLoading}
                                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label
                            htmlFor="passwordConfirm"
                            className="text-xs font-semibold text-gray-600 ml-1"
                        >
                            비밀번호 확인
                            <span className="text-red-400 ml-1">*</span>
                        </label>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

                            <input
                                id="passwordConfirm"
                                type="password"
                                name="passwordConfirm"
                                value={formData.passwordConfirm}
                                onChange={handleChange}
                                placeholder="비밀번호를 다시 입력하세요"
                                autoComplete="new-password"
                                required
                                disabled={isLoading}
                                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label
                            htmlFor="name"
                            className="text-xs font-semibold text-gray-600 ml-1"
                        >
                            이름
                            <span className="text-red-400 ml-1">*</span>
                        </label>

                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="선생님 이름을 입력하세요"
                                autoComplete="name"
                                required
                                disabled={isLoading}
                                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label
                            htmlFor="email"
                            className="text-xs font-semibold text-gray-600 ml-1"
                        >
                            이메일
                            <span className="text-red-400 ml-1">*</span>
                        </label>

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="example@email.com"
                                autoComplete="email"
                                required
                                disabled={isLoading}
                                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 space-y-5">
                        <div className="space-y-1">
                            <label
                                htmlFor="gender"
                                className="text-xs font-semibold text-gray-600 ml-1"
                            >
                                성별
                                <span className="ml-1 font-normal text-gray-400">
                                    선택
                                </span>
                            </label>

                            <select
                                id="gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white transition-all"
                            >
                                <option value="NONE">선택하지 않음</option>
                                <option value="MALE">남성</option>
                                <option value="FEMALE">여성</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="phoneNumber"
                                className="text-xs font-semibold text-gray-600 ml-1"
                            >
                                전화번호
                                <span className="ml-1 font-normal text-gray-400">
                                    선택
                                </span>
                            </label>

                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

                                <input
                                    id="phoneNumber"
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="010-0000-0000"
                                    autoComplete="tel"
                                    disabled={isLoading}
                                    className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 rounded-2xl font-bold text-lg text-white shadow-sm transition-all active:scale-[0.98] ${
    isLoading
        ? "bg-blue-300 cursor-not-allowed"
        : "bg-blue-400 hover:bg-blue-500 hover:shadow-md"
}`}
                    >
                        {isLoading
                            ? "가입 처리 중..."
                            : "선생님 계정 만들기"}
                    </button>
                </form>
            </div>
        </div>
    );
}
