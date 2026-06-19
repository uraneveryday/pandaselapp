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

export function StampTracker({ onRewardClick }: StampTrackerProps) {
    const [currentStamps, setCurrentStamps] = useState<number>(0);
    const [currentCoupons, setCurrentCoupons] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isExchanging, setIsExchanging] = useState<boolean>(false);
    const [showCouponEffect, setShowCouponEffect] = useState<boolean>(false);
    const [message, setMessage] = useState<string | null>(null);

    const canExchange = currentStamps >= MAX_STAMPS;

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
            setMessage("🎁 쿠폰으로 바뀌었어요! 유치원에 가면 선생님이 선물을 줄 거예요!");

            onRewardClick?.();

            setTimeout(() => {
                setShowCouponEffect(false);
                setMessage(null);
            }, 2500);
        } catch (error) {
            console.error("쿠폰 교환 실패:", error);
            alert("아직 쿠폰으로 바꿀 수 없어요.");
        } finally {
            setIsExchanging(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl p-6 shadow-sm flex items-center justify-center min-h-[200px]">
                <p className="text-muted-foreground text-sm">스탬프 정보를 불러오는 중...</p>
            </div>
        );
    }

    const displayStamps = Math.min(currentStamps, MAX_STAMPS);
    const stamps = Array.from({ length: MAX_STAMPS }, (_, i) => i < displayStamps);

    return (
        <div className="relative bg-white rounded-3xl p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="mb-1 font-bold">스탬프 모으기</h3>
                    <p className="text-sm text-muted-foreground">
                        {currentStamps} / {MAX_STAMPS} 개
                    </p>
                    <p className="text-xs text-purple-500 mt-1">
                        보유 쿠폰: {currentCoupons}장
                    </p>
                </div>

                <motion.button
                    onClick={handleExchangeCoupon}
                    disabled={!canExchange || isExchanging}
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        canExchange
                            ? "bg-gradient-to-br from-[#FF9ECD] to-[#D4A5FF] cursor-pointer"
                            : "bg-muted cursor-default"
                    }`}
                    whileHover={{ scale: canExchange ? 1.1 : 1 }}
                    whileTap={{ scale: canExchange ? 0.9 : 1 }}
                    animate={
                        canExchange
                            ? {
                                rotate: [0, -10, 10, -10, 0],
                                transition: { repeat: Infinity, duration: 2 },
                            }
                            : {}
                    }
                >
                    <Gift
                        className={`w-6 h-6 ${
                            canExchange ? "text-white" : "text-muted-foreground"
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

            {canExchange && (
                <motion.div
                    className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-[#FF9ECD] to-[#D4A5FF] text-white text-center text-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    🎉 스탬프가 다 모였어요! 선물상자를 눌러 쿠폰으로 바꿔요!
                </motion.div>
            )}

            <AnimatePresence>
                {showCouponEffect && (
                    <motion.div
                        className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 250, damping: 15 }}
                            className="w-28 h-20 rounded-2xl bg-gradient-to-br from-yellow-200 to-pink-200 flex items-center justify-center shadow-md"
                        >
                            <Ticket className="w-10 h-10 text-pink-500" />
                        </motion.div>

                        {message && (
                            <motion.p
                                className="mt-4 px-6 text-center text-sm font-bold text-gray-700"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
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