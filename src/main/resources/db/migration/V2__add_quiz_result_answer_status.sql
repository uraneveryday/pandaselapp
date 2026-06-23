-- 기존 결과는 모두 일반 답안 제출로 보존한다. DONT_KNOW는 신규 제출부터 저장된다.
ALTER TABLE quiz_result ADD COLUMN IF NOT EXISTS answer_status VARCHAR(20);

UPDATE quiz_result
SET answer_status = 'ANSWERED'
WHERE answer_status IS NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM quiz_result WHERE answer_status IS NULL) THEN
        RAISE EXCEPTION 'quiz_result.answer_status 백필에 실패했습니다.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_quiz_result_answer_status'
    ) THEN
        ALTER TABLE quiz_result
            ADD CONSTRAINT ck_quiz_result_answer_status
            CHECK (answer_status IN ('ANSWERED', 'DONT_KNOW'));
    END IF;
END $$;

ALTER TABLE quiz_result ALTER COLUMN answer_status SET NOT NULL;
