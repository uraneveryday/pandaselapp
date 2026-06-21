import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {supabase} from "../../../utils/supabaseClient";

// 백엔드로 보낼 Request 타입 정의
interface QuizRequest {
    type: "OX" | "CHOOSE";
    questionText: string;
    questImagePath: string;
    options: string[];
    correctAnswer: number;
}

const QuizCreate: React.FC = () => {
    const { t } = useTranslation();

    // URL에서 파라미터 추출
    const navigate = useNavigate();
    const { id: classroomId, taskId } = useParams();

    // 폼 상태 관리
    const [type, setType] = useState<"OX" | "CHOOSE">("CHOOSE");
    const [questionText, setQuestionText] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [questImagePath, setQuestImagePath] = useState("");

    // ⭐️ 로딩 상태 관리 (업로드 중 중복 클릭 방지)
    const [isSubmitting, setIsSubmitting] = useState(false);

    // jwt 토큰
    const token = localStorage.getItem("jwt_token");

    // 선택지 및 정답 상태 관리
    const [chooseOptions, setChooseOptions] = useState<string[]>(["", "", "", ""]);
    const [chooseAnswerIndex, setChooseAnswerIndex] = useState<number>(0);
    const [oxAnswerIndex, setOxAnswerIndex] = useState<number>(0); // 0: O, 1: X

    // 객관식 보기 내용 변경 핸들러
    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...chooseOptions];
        newOptions[index] = value;
        setChooseOptions(newOptions);
    };

    // 폼 제출 핸들러
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 유효성 검사
        if (!questionText.trim() && !imageFile && !questImagePath) {
            alert(t("teacher.quizCreate.alerts.questionRequired"));
            return;
        }

        if (type === "CHOOSE" && chooseOptions.some((opt) => opt.trim() === "")) {
            alert(t("teacher.quizCreate.alerts.choicesRequired"));
            return;
        }

        setIsSubmitting(true);

        try {
            let finalImageUrl = questImagePath;

            // 1. 이미지가 있다면 Supabase에 실제 업로드 진행
            if (imageFile) {
                console.log("Supabase 이미지 업로드 진행 중...");

                // 파일명 중복 방지 로직
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

                // Supabase Storage에 업로드 (버킷 이름: quiz_imeages)
                const { error: uploadError } = await supabase.storage
                    .from('quiz_imeages')
                    .upload(fileName, imageFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error("업로드 실패:", uploadError.message);
                    alert(t("teacher.quizCreate.alerts.imageUploadFailed"));
                    setIsSubmitting(false); // 실패 시 로딩 종료
                    return; // 함수 실행 중단
                }

                // 업로드 성공 후 Public URL 가져오기
                const { data: publicUrlData } = supabase.storage
                    .from('quiz_imeages')
                    .getPublicUrl(fileName);

                finalImageUrl = publicUrlData.publicUrl;
                console.log("업로드 성공! 이미지 URL:", finalImageUrl);
            }

            // 2. 백엔드 DTO에 맞게 데이터 조립
            const requestData: QuizRequest = {
                type,
                questionText,
                questImagePath: finalImageUrl, // ⭐️ 생성된 URL 혹은 빈 문자열 할당
                options: type === "OX" ? ["O", "X"] : chooseOptions,
                correctAnswer: type === "OX" ? oxAnswerIndex : chooseAnswerIndex,
            };

            console.log("백엔드로 전송할 JSON:", JSON.stringify(requestData, null, 2));

            // 3. Spring Boot 백엔드로 POST 요청
            const response =
                    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/teacher/classrooms/${classroomId}/tasks/${taskId}/add-quizzes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                alert(t("teacher.quizCreate.alerts.createSuccess"));
                navigate(`/teacher/classrooms/${classroomId}/task/${taskId}`);
            } else {
                alert(t("teacher.quizCreate.alerts.createFailed"));
            }
        } catch (error) {
            console.error("Error submitting quiz:", error);
            alert(t("teacher.quizCreate.alerts.serverError"));
        } finally {
            setIsSubmitting(false); // ⭐️ 성공/실패 여부와 상관없이 처리 완료 시 버튼 활성화
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10 border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">{t("teacher.quizCreate.title", { taskId })}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 타입 선택 영역 */}
                <div className="flex items-center space-x-4">
                    <label className="font-semibold text-gray-700 w-24">{t("teacher.quizCreate.type")}</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as "OX" | "CHOOSE")}
                        className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="CHOOSE">{t("teacher.quizCreate.types.choose")}</option>
                        <option value="OX">{t("teacher.quizCreate.types.ox")}</option>
                    </select>
                </div>

                {/* 문제 내용 입력 영역 */}
                <div>
                    <label className="font-semibold text-gray-700 block mb-2">
                        {t("teacher.quizCreate.question.label")} <span className="text-sm text-gray-500 font-normal">{t("teacher.quizCreate.question.hint")}</span>
                    </label>
                    <textarea
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder={t("teacher.quizCreate.question.placeholder")}
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                    />
                </div>

                {/* 이미지 업로드 영역 */}
                <div>
                    <label className="font-semibold text-gray-700 block mb-2">{t("teacher.quizCreate.question.imageOptional")}</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>

                {/* 정답 입력 영역 (조건부 렌더링) */}
                <div className="pt-4 border-t border-gray-200">
                    <label className="font-semibold text-gray-700 block mb-4">{t("teacher.quizCreate.answer.title")}</label>

                    {type === "CHOOSE" ? (
                        <div className="space-y-3">
                            {chooseOptions.map((opt, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <input
                                        type="radio"
                                        name="correctAnswer"
                                        checked={chooseAnswerIndex === index}
                                        onChange={() => setChooseAnswerIndex(index)}
                                        className="w-5 h-5 text-blue-600 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        placeholder={t("teacher.quizCreate.answer.choicePlaceholder", { number: index + 1 })}
                                        className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {chooseAnswerIndex === index && <span className="text-green-600 font-bold text-sm">{t("teacher.quizCreate.answer.correct")}</span>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex space-x-6">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="oxAnswer"
                                    checked={oxAnswerIndex === 0}
                                    onChange={() => setOxAnswerIndex(0)}
                                    className="w-5 h-5 text-blue-600"
                                />
                                <span className="text-lg font-bold">O</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="oxAnswer"
                                    checked={oxAnswerIndex === 1}
                                    onChange={() => setOxAnswerIndex(1)}
                                    className="w-5 h-5 text-blue-600"
                                />
                                <span className="text-lg font-bold">X</span>
                            </label>
                        </div>
                    )}
                </div>

                {/* ⭐️ 제출 버튼 로딩 상태 적용 */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full font-bold py-3 rounded transition duration-200 text-white ${
                        isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {isSubmitting ? t("teacher.quizCreate.submitting") : t("teacher.quizCreate.submit")}
                </button>
            </form>
        </div>
    );
};

export default QuizCreate;