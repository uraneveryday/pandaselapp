import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Gift } from "lucide-react";

interface StampTrackerProps {
    onRewardClick?: () => void;
}

export function StampTracker({ onRewardClick }: StampTrackerProps) {
    // 1. API 통신 결과를 담을 상태(State) 정의
    const [currentStamps, setCurrentStamps] = useState<number>(0);
    const [currentCoupons, setCurrentCoupons] = useState<number>(0);
    const [maxStamps, setMaxStamps] = useState<number>(10); // 기본값 10
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // 2. 컴포넌트가 화면에 처음 나타날 때(Mount) API 호출
    useEffect(() => {
        const fetchStampData = async () => {
            try {
                // 로컬 스토리지에서 앞서 저장한 JWT 토큰 꺼내기
                const token = localStorage.getItem("jwt_token");

                if (!token) {
                    console.error("로그인 토큰이 없습니다.");
                    setIsLoading(false);
                    return;
                }

                // Fetch API를 이용한 백엔드 통신 (토큰 헤더 포함)
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/student/stamp`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("스탬프 데이터를 불러오는데 실패했습니다.");
                }

                // 응답 데이터 파싱
                const result = await response.json();

                // 🚨 주의: 백엔드 응답 JSON 구조에 맞춰 아래 코드를 수정해야 합니다.
                // 예시 구조: { success: true, data: { currentStamps: 5, currentCoupon : 1 } }
                if (result.data) {
                    setCurrentStamps(result.data.currentStamps);
                    setCurrentCoupons(result.data.currentCoupons);
                    if (result.data.maxStamps) {
                        setMaxStamps(result.data.maxStamps);
                    }
                }
            } catch (error) {
                console.error("API 통신 에러:", error);
            } finally {
                // 성공하든 실패하든 로딩 상태 종료
                setIsLoading(false);
            }
        };

        fetchStampData();
    }, []); // 빈 배열([])을 넣어야 무한 반복되지 않고 처음 한 번만 실행됩니다.

    // 3. 로딩 중 UI 처리 (데이터가 오기 전에 애니메이션이 깨지는 것 방지)
    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl p-6 shadow-sm flex items-center justify-center min-h-[200px]">
                <p className="text-muted-foreground text-sm">스탬프 정보를 불러오는 중...</p>
            </div>
        );
    }

    // 데이터 로딩 완료 후 배열 생성
    const stamps = Array.from({ length: maxStamps }, (_, i) => i < currentStamps);

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="mb-1">스탬프 모으기</h3>
                    <p className="text-sm text-muted-foreground">
                        {currentStamps} / {maxStamps} 개
                    </p>
                </div>
                <motion.button
                    onClick={onRewardClick}
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        currentStamps >= maxStamps
                            ? "bg-gradient-to-br from-[#FF9ECD] to-[#D4A5FF]"
                            : "bg-muted"
                    }`}
                    whileHover={{ scale: currentStamps >= maxStamps ? 1.1 : 1 }}
                    whileTap={{ scale: currentStamps >= maxStamps ? 0.9 : 1 }}
                    animate={
                        currentStamps >= maxStamps
                            ? {
                                rotate: [0, -10, 10, -10, 0],
                                transition: { repeat: Infinity, duration: 2 },
                            }
                            : {}
                    }
                >
                    <Gift
                        className={`w-6 h-6 ${
                            currentStamps >= maxStamps ? "text-white" : "text-muted-foreground"
                        }`}
                    />
                </motion.button>
            </div>

            <div className="grid grid-cols-5 gap-3">
                {stamps.map((filled, index) => (
                    <motion.div
                        key={index}
                        className={`aspect-square rounded-2xl flex items-center justify-center ${
                            filled
                                ? "bg-gradient-to-br from-[#FFE4B5] to-[#FFCBA4]"
                                : "bg-muted border-2 border-dashed border-border"
                        }`}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: index * 0.05,
                        }}
                    >
                        {filled ? (
                            <motion.span
                                className="text-2xl"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.05 + 0.2 }}
                            >
                                ⭐
                            </motion.span>
                        ) : (
                            <span className="text-2xl opacity-20">⭐</span>
                        )}
                    </motion.div>
                ))}
            </div>

            {currentStamps >= maxStamps && (
                <motion.div
                    className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-[#FF9ECD] to-[#D4A5FF] text-white text-center text-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    🎉 축하해요! 선물을 받을 수 있어요!
                </motion.div>
            )}
        </div>
    );
}