import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Ticket } from "lucide-react";
import { apiClient } from "../../api/client";

interface StampTrackerProps {
    onRewardClick?: () => void;
}

interface StampData {
    currentStamps: number;
    currentCoupons: number;
    maxStamps?: number;
    canExchange?: boolean;
}

const MAX_STAMPS = 10;
const PARTICLE_COUNT = 18;

export function StampTracker({ onRewardClick }: StampTrackerProps) {
    const [currentStamps, setCurrentStamps] = useState<number>(0);
    const [currentCoupons, setCurrentCoupons] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isExchanging, setIsExchanging] = useState<boolean>(false);
    const [showCouponEffect, setShowCouponEffect] = useState<boolean>(false);
    const [message, setMessage] = useState<string | null>(null);

    const canExchange = currentStamps >= MAX_STAMPS;
    const isRewardReady = canExchange && !showCouponEffect;

    useEffect(() => {
        const fetchStampData = async () => {
            try {
                const res = await apiClient.get<{ data: StampData }>("/student/stamp");

                const data = res.data.data;

                setCurrentStamps(data.currentStamps);
                setCurrentCoupons(data.currentCoupons);
            } catch (error) {
                console.error("스탬프 데이터 조회 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStampData();
    }, []);

    const handleExchangeCoupon = async () => {
        if (!canExchange || isExchanging) return;

        try {
            setIsExchanging(true);

            const res = await apiClient.post<{ data: StampData; message?: string }>(
                "/student/stamp/exchange-coupon"
            );

            const data = res.data.data;

            setCurrentStamps(data.currentStamps);
            setCurrentCoupons(data.currentCoupons);

            setShowCouponEffect(true);
            setMessage("유치원에 가면 선생님이 선물을 줄 거예요!");

            onRewardClick?.();

            setTimeout(() => {
                setShowCouponEffect(false);
                setMessage(null);
            }, 2600);
        } catch (error) {
            console.error("쿠폰 교환 실패:", error);
            alert("아직 쿠폰으로 바꿀 수 없어요.");
        } finally {
            setIsExchanging(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl p-6 shadow-sm flex items-center justify-center min-h-[220px]">
                <p className="text-muted-foreground text-sm">스탬프 정보를 불러오는 중...</p>
            </div>
        );
    }

    const displayStamps = Math.min(currentStamps, MAX_STAMPS);
    const stamps = Array.from({ length: MAX_STAMPS }, (_, i) => i < displayStamps);

    return (
        <div className="relative bg-white rounded-3xl p-6 shadow-sm overflow-hidden min-h-[300px]">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="mb-1 font-bold">스탬프 모으기</h3>

                    <p className="text-sm text-muted-foreground">
                        {displayStamps} / {MAX_STAMPS} 개
                        {currentStamps > MAX_STAMPS && (
                            <span className="ml-1 text-xs text-purple-500">
                                보유 {currentStamps}개
                            </span>
                        )}
                    </p>

                    <p className="text-xs text-purple-500 mt-1">
                        보유 쿠폰: {currentCoupons}장
                    </p>
                </div>
            </div>

            {/* 스탬프판: 10개가 다 차면 흐려짐 */}
            <motion.div
                className="grid grid-cols-5 gap-3"
                animate={{
                    opacity: isRewardReady ? 0.25 : 1,
                    filter: isRewardReady ? "blur(1.5px)" : "blur(0px)",
                    scale: isRewardReady ? 0.98 : 1,
                }}
                transition={{ duration: 0.35 }}
            >
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
            </motion.div>

            {/* 스탬프 10개 완성 시 중앙 선물상자 등장 */}
            <AnimatePresence>
                {isRewardReady && (
                    <motion.div
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 bg-white/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.button
                            onClick={handleExchangeCoupon}
                            disabled={isExchanging}
                            className="flex flex-col items-center justify-center"
                            initial={{ scale: 0, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.7, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 16,
                            }}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                        >
                            <motion.div
                                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#FF9ECD] to-[#D4A5FF] shadow-lg flex items-center justify-center"
                                animate={{
                                    y: [0, -8, 0],
                                    rotate: [0, -5, 5, -5, 0],
                                    scale: [1, 1.04, 1],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1.6,
                                    ease: "easeInOut",
                                }}
                            >
                                <Gift className="w-12 h-12 text-white" />
                            </motion.div>

                            <motion.div
                                className="mt-4 px-4 py-2 rounded-full bg-white shadow-sm text-sm font-bold text-pink-500"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                🎉 선물상자를 눌러 쿠폰 받기!
                            </motion.div>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 클릭 후 펑! 쿠폰 획득 애니메이션 */}
            <AnimatePresence>
                {showCouponEffect && (
                    <motion.div
                        className="absolute inset-0 z-20 bg-white/95 flex flex-col items-center justify-center overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* 폭죽 파티클 */}
                        <div className="absolute inset-0 pointer-events-none">
                            {Array.from({ length: PARTICLE_COUNT }).map((_, index) => {
                                const angle = (index / PARTICLE_COUNT) * Math.PI * 2;
                                const distance = index % 2 === 0 ? 130 : 95;

                                return (
                                    <motion.span
                                        key={index}
                                        className="absolute left-1/2 top-1/2 text-2xl"
                                        initial={{
                                            x: 0,
                                            y: 0,
                                            scale: 0,
                                            opacity: 1,
                                            rotate: 0,
                                        }}
                                        animate={{
                                            x: Math.cos(angle) * distance,
                                            y: Math.sin(angle) * distance,
                                            scale: [0, 1.2, 0.6],
                                            opacity: [1, 1, 0],
                                            rotate: 360,
                                        }}
                                        transition={{
                                            duration: 1.1,
                                            ease: "easeOut",
                                            delay: index * 0.015,
                                        }}
                                    >
                                        {index % 3 === 0 ? "⭐" : index % 3 === 1 ? "✨" : "🎉"}
                                    </motion.span>
                                );
                            })}
                        </div>

                        {/* 쿠폰 카드 */}
                        <motion.div
                            className="relative w-32 h-24 rounded-3xl bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-200 flex flex-col items-center justify-center shadow-xl border-4 border-white"
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{
                                scale: [0, 1.2, 1],
                                rotate: [-20, 8, 0],
                            }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 250,
                                damping: 16,
                            }}
                        >
                            <Ticket className="w-10 h-10 text-pink-500 mb-1" />
                            <span className="text-xs font-bold text-pink-600">
                                선물 쿠폰
                            </span>
                        </motion.div>

                        <motion.h3
                            className="mt-5 text-xl font-extrabold text-gray-800"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                        >
                            쿠폰 1개 획득!
                        </motion.h3>

                        {message && (
                            <motion.p
                                className="mt-2 px-8 text-center text-sm font-bold text-gray-600"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                {message}
                            </motion.p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}