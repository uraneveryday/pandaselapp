ALTER TABLE class_room ADD COLUMN IF NOT EXISTS student_login_code VARCHAR(4);

WITH ordered_classrooms AS (
    SELECT class_room_id, ROW_NUMBER() OVER (ORDER BY class_room_id) - 1 AS sequence
    FROM class_room
)
UPDATE class_room classroom
SET student_login_code = LPAD(ordered_classrooms.sequence::text, 4, '0')
FROM ordered_classrooms
WHERE classroom.class_room_id = ordered_classrooms.class_room_id
  AND classroom.student_login_code IS NULL;

ALTER TABLE student ADD COLUMN IF NOT EXISTS student_login_id VARCHAR(20);

UPDATE student student
SET student_login_id = users.login_id
FROM users
WHERE users.user_id = student.user_id
  AND student.student_login_id IS NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM class_room WHERE student_login_code IS NULL OR student_login_code !~ '^[0-9]{4}$') THEN
        RAISE EXCEPTION 'class_room.student_login_code 백필에 실패했습니다.';
    END IF;
    IF EXISTS (SELECT 1 FROM student WHERE student_login_id IS NULL) THEN
        RAISE EXCEPTION 'student.student_login_id 백필에 실패했습니다.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_class_room_student_login_code') THEN
        ALTER TABLE class_room ADD CONSTRAINT uk_class_room_student_login_code UNIQUE (student_login_code);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_student_classroom_login_id') THEN
        ALTER TABLE student ADD CONSTRAINT uk_student_classroom_login_id UNIQUE (class_room, student_login_id);
    END IF;
END $$;

ALTER TABLE class_room ALTER COLUMN student_login_code SET NOT NULL;
ALTER TABLE student ALTER COLUMN student_login_id SET NOT NULL;
