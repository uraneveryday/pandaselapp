-- 기존 Enum 문자열(MATH, CHINESE)을 보존하면서 카테고리를 독립 엔티티로 전환한다.
-- 이 스크립트는 PostgreSQL(Supabase)용이며, 기존 테이블이 없는 빈 DB에서도 안전하게 실행된다.

CREATE TABLE IF NOT EXISTS categories (
    category_id BIGSERIAL PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL,
    owner_teacher_id BIGINT NULL,
    is_system_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (category_name, owner_teacher_id, is_system_default, is_active, created_at)
SELECT 'MATH', NULL, TRUE, TRUE, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM categories
    WHERE owner_teacher_id IS NULL AND lower(category_name) = 'math'
);

INSERT INTO categories (category_name, owner_teacher_id, is_system_default, is_active, created_at)
SELECT 'CHINESE', NULL, TRUE, TRUE, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM categories
    WHERE owner_teacher_id IS NULL AND lower(category_name) = 'chinese'
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_categories_system_name
    ON categories (lower(category_name))
    WHERE owner_teacher_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_categories_owner_name
    ON categories (owner_teacher_id, lower(category_name))
    WHERE owner_teacher_id IS NOT NULL;

DO $$
BEGIN
    IF to_regclass('public.tasks') IS NOT NULL THEN
        ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category_id BIGINT;

        UPDATE tasks t
        SET category_id = c.category_id
        FROM categories c
        WHERE c.owner_teacher_id IS NULL
          AND lower(c.category_name) = lower(t.category::text)
          AND t.category_id IS NULL;

        IF EXISTS (SELECT 1 FROM tasks WHERE category_id IS NULL) THEN
            RAISE EXCEPTION '기존 tasks.category 값을 Category로 이관할 수 없습니다. 데이터 확인 후 재실행하세요.';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'fk_tasks_category'
        ) THEN
            ALTER TABLE tasks
                ADD CONSTRAINT fk_tasks_category
                FOREIGN KEY (category_id) REFERENCES categories(category_id);
        END IF;

        ALTER TABLE tasks ALTER COLUMN category_id SET NOT NULL;
    END IF;

END $$;
