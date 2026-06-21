import React, { useState, useEffect } from "react";
import { ImagePlus, X, UploadCloud } from "lucide-react";
import { useTranslation } from "react-i18next";
import {supabase} from "../../../utils/supabaseClient"; // 아이콘 추가


interface QuizEditModalProps {
    taskId: string;
    quizId: number;
    onClose: () => void;
    onSuccess: () => void;
}

export const QuizEditModal: React.FC<QuizEditModalProps> = ({ taskId, quizId, onClose, onSuccess }) => {
    const { t } = useTranslation();

    const [type, setType] = useState<"OX" | "CHOOSE">("CHOOSE");
    const [questionText, setQuestionText] = useState("");

    // 이미지 관련 상태
    const [imageFile, setImageFile] = useState<File | null>(null); // 새로 업로드할 파일
    const [previewImage, setPreviewImage] = useState<string>(""); // 새로 업로드할 파일의 로컬 미리보기
    const [existingImage, setExistingImage] = useState(""); // 기존 DB에 있던 이미지 URL
    const [questImagePath, setQuestImagePath] = useState(""); // 최종 전송될 기존 이미지 경로

    const [chooseOptions, setChooseOptions] = useState<string[]>(["", "", "", ""]);
    const [chooseAnswerIndex, setChooseAnswerIndex] = useState<number>(0);
    const [oxAnswerIndex, setOxAnswerIndex] = useState<number>(0);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const token = localStorage.getItem("jwt_token");

    // 기존 데이터 불러오기
    useEffect(() => {
        const fetchQuizData = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/teacher/quizzes/${quizId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setType(data.type);
                    setQuestionText(data.questionText);
                    setQuestImagePath(data.questImagePath || "");
                    setExistingImage(data.questImagePath || "");

                    if (data.type === "CHOOSE") {
                        setChooseOptions(data.options || ["", "", "", ""]);
                        setChooseAnswerIndex(data.correctAnswer);
                    } else {
                        setOxAnswerIndex(data.correctAnswer);
                    }
                } else {
                    alert(t("teacher.quizEdit.alerts.loadFailed"));
                    onClose();
                }
            } catch (error) {
                console.error(error);
                onClose();
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuizData();
    }, [taskId, quizId, token, onClose]);

    // ⭐️ 새 이미지를 선택했을 때 로컬 미리보기 URL 생성
    useEffect(() => {
        if (imageFile) {
            const objectUrl = URL.createObjectURL(imageFile);
            setPreviewImage(objectUrl);
            return () => URL.revokeObjectURL(objectUrl); // 메모리 누수 방지
        } else {
            setPreviewImage("");
        }
    }, [imageFile]);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...chooseOptions];
        newOptions[index] = value;
        setChooseOptions(newOptions);
    };

    // 이미지 삭제 핸들러 (기존 이미지 또는 새 이미지 초기화)
    const handleRemoveImage = () => {
        setImageFile(null);
        setExistingImage("");
        setQuestImagePath(""); // 서버에 보낼 때 기존 이미지 지웠음을 알리기 위해 비움
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!questionText.trim() && !imageFile && !questImagePath) {
            alert(t("teacher.quizEdit.alerts.questionRequired"));
            return;
        }

        if (type === "CHOOSE" && chooseOptions.some((opt) => opt.trim() === "")) {
            alert(t("teacher.quizEdit.alerts.choicesRequired"));
            return;
        }

        setIsSubmitting(true);

        try {
            let finalImageUrl = questImagePath;

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('quiz_imeages')
                    .upload(fileName, imageFile, { cacheControl: '3600', upsert: false });

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('quiz_imeages').getPublicUrl(fileName);

                finalImageUrl = publicUrlData.publicUrl;
            }

            const requestData = {
                type,
                questionText,
                questImagePath: finalImageUrl,
                options: type === "OX" ? ["O", "X"] : chooseOptions,
                correctAnswer: type === "OX" ? oxAnswerIndex : chooseAnswerIndex,
            };

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/teacher/quizzes/${quizId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                alert(t("teacher.quizEdit.alerts.updateSuccess"));
                onSuccess();
                onClose();
            } else {
                alert(t("teacher.quizEdit.alerts.updateFailed"));
            }
        } catch (error) {
            console.error("Error updating quiz:", error);
            alert(t("teacher.quizEdit.alerts.serverError"));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center backdrop-blur-sm">
                <div className="bg-white p-6 rounded-2xl shadow-xl font-bold text-gray-700 flex items-center gap-3">
                    <div className="w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    {t("teacher.quizEdit.loading")}
                </div>
            </div>
        );
    }

    // 화면에 보여줄 이미지 결정 (새로 올린 파일이 최우선, 그다음이 기존 이미지)
    const displayImage = previewImage || existingImage;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center overflow-y-auto backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl p-8 rounded-3xl shadow-2xl my-8 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900">{t("teacher.quizEdit.title")}</h2>
                        <p className="text-sm text-gray-500 mt-1">{t("teacher.quizEdit.description")}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 직관적인 이미지 렌더링 영역 (프로필 사진 변경 스타일) */}
                    <div className="flex flex-col items-center p-6 bg-gray-50 border border-gray-200 rounded-2xl">
                        {displayImage ? (
                            <div className="relative group w-full max-w-md h-48 rounded-xl overflow-hidden border border-gray-300 shadow-sm">
                                <img src={displayImage} alt={t("teacher.quizEdit.imageAlt")} className="w-full h-full object-contain bg-white" />

                                {/* 이미지 호버 시 나타나는 오버레이 UI */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <label className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-lg font-bold text-sm shadow hover:bg-gray-100 flex items-center gap-2">
                                        <ImagePlus size={16} /> {t("teacher.quizEdit.changePhoto")}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow hover:bg-red-600"
                                    >
                                        {t("teacher.quizEdit.delete")}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className="w-full max-w-md h-48 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors rounded-xl flex flex-col items-center justify-center cursor-pointer group">
                                <UploadCloud size={40} className="text-gray-400 group-hover:text-blue-500 mb-3 transition-colors" />
                                <span className="font-bold text-gray-600 group-hover:text-blue-600">{t("teacher.quizEdit.uploadClick")}</span>
                                <span className="text-xs text-gray-400 mt-1">{t("teacher.quizEdit.dragDrop")}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                                />
                            </label>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* 타입 선택 영역 */}
                        <div className="col-span-1">
                            <label className="font-bold text-gray-700 block mb-2 text-sm">{t("teacher.quizEdit.type")}</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as "OX" | "CHOOSE")}
                                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium"
                            >
                                <option value="CHOOSE">{t("teacher.quizEdit.types.choose")}</option>
                                <option value="OX">{t("teacher.quizEdit.types.ox")}</option>
                            </select>
                        </div>

                        {/* 문제 내용 입력 영역 */}
                        <div className="col-span-1 md:col-span-3">
                            <label className="font-bold text-gray-700 block mb-2 text-sm">{t("teacher.quizEdit.question.label")}</label>
                            <textarea
                                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none leading-relaxed"
                                rows={3}
                                placeholder={t("teacher.quizEdit.question.placeholder")}
                                value={questionText}
                                onChange={(e) => setQuestionText(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* 보기 및 정답 설정 영역 */}
                    <div className="pt-6 border-t border-gray-200">
                        <label className="font-bold text-gray-800 block mb-4 text-lg">{t("teacher.quizEdit.answer.title")}</label>
                        {type === "CHOOSE" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {chooseOptions.map((opt, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-colors ${
                                            chooseAnswerIndex === index ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-blue-300"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="correctAnswer"
                                            checked={chooseAnswerIndex === index}
                                            onChange={() => setChooseAnswerIndex(index)}
                                            className="w-5 h-5 text-blue-600 cursor-pointer accent-blue-600"
                                        />
                                        <input
                                            type="text"
                                            value={opt}
                                            placeholder={t("teacher.quizEdit.answer.choicePlaceholder", { number: index + 1 })}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                            className="flex-1 bg-transparent outline-none font-medium text-gray-700 placeholder-gray-400"
                                        />
                                        {chooseAnswerIndex === index && <span className="text-blue-600 font-extrabold text-xs bg-white px-2 py-1 rounded shadow-sm">{t("teacher.quizEdit.answer.correct")}</span>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex space-x-8 justify-center bg-gray-50 py-6 rounded-2xl border border-gray-200">
                                <label className={`flex items-center justify-center w-32 h-16 rounded-xl cursor-pointer border-2 transition-all ${oxAnswerIndex === 0 ? 'border-blue-500 bg-blue-100 text-blue-700 shadow-md' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                                    <input type="radio" checked={oxAnswerIndex === 0} onChange={() => setOxAnswerIndex(0)} className="hidden" />
                                    <span className="text-3xl font-black">O</span>
                                </label>
                                <label className={`flex items-center justify-center w-32 h-16 rounded-xl cursor-pointer border-2 transition-all ${oxAnswerIndex === 1 ? 'border-red-500 bg-red-100 text-red-700 shadow-md' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                                    <input type="radio" checked={oxAnswerIndex === 1} onChange={() => setOxAnswerIndex(1)} className="hidden" />
                                    <span className="text-3xl font-black">X</span>
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="w-1/3 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                            {t("teacher.quizEdit.cancel")}
                        </button>
                        <button type="submit" disabled={isSubmitting} className={`w-2/3 font-bold py-3.5 rounded-xl text-white transition-all shadow-md ${isSubmitting ? "bg-gray-400" : "bg-gray-900 hover:bg-blue-600 hover:shadow-lg active:scale-[0.98]"}`}>
                            {isSubmitting ? t("teacher.quizEdit.submitting") : t("teacher.quizEdit.submit")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};