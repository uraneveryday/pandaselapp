import { BarChart3 } from "lucide-react";

interface TaskAnalyticsTabProps {
    completionRate: number;
    quizCount: number;
}

export function TaskAnalyticsTab({
                                     completionRate,
                                     quizCount,
                                 }: TaskAnalyticsTabProps) {
    return (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                        <BarChart3 size={22} />
                    </div>

                    <div>
                        <h2 className="text-xl font-black text-slate-950">
                            숙제 분석
                        </h2>
                        <p className="text-sm font-semibold text-slate-400">
                            이후 오답률, 평균 풀이 시간, 문제별 난이도 분석이 들어갈 영역입니다.
                        </p>
                    </div>
                </div>

                <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-extrabold text-slate-500">
                    준비 중
                </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <AnalyticsPreviewCard
                    label="현재 제출률"
                    value={`${completionRate}%`}
                    description="현재 task detail API의 completionRate 기반"
                />

                <AnalyticsPreviewCard
                    label="퀴즈 수"
                    value={`${quizCount}개`}
                    description="현재 task에 연결된 quiz list 기반"
                />

                <AnalyticsPreviewCard
                    label="평균 풀이 시간"
                    value="API 필요"
                    description="학생 풀이 기록 테이블이 추가되면 계산 가능"
                />
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-6">
                <h3 className="text-base font-black text-slate-800">
                    이후 추가할 분석 데이터 예시
                </h3>

                <div className="mt-4 space-y-4">
                    <FakeBar label="문제별 오답률" value="wrongRate" />
                    <FakeBar label="문제별 평균 풀이 시간" value="averageSolveSeconds" />
                    <FakeBar label="학생별 제출 상태" value="submitted / notSubmitted" />
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-500">
                    이 영역은 나중에 별도 API인
                    <span className="mx-1 rounded bg-white px-2 py-1 font-mono text-xs text-slate-700">
                        /tasks/:taskId/analytics
                    </span>
                    를 붙이면 실제 차트로 교체하면 됩니다.
                </p>
            </div>
        </section>
    );
}

function AnalyticsPreviewCard({
                                  label,
                                  value,
                                  description,
                              }: {
    label: string;
    value: string;
    description: string;
}) {
    return (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-2xl font-black text-slate-950">
                {value}
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
                {description}
            </p>
        </div>
    );
}

function FakeBar({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-extrabold text-slate-600">
                    {label}
                </p>

                <p className="font-mono text-xs font-bold text-slate-400">
                    {value}
                </p>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white">
                <div className="h-full w-2/3 rounded-full bg-slate-300" />
            </div>
        </div>
    );
}