package LearningAppDemo.demo.repository;

import LearningAppDemo.demo.domain.task.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    @Query(value = """
        SELECT
            q.quiz_id AS "quizId",
            q.quiz_num AS "quizNum",
            q.question_text AS "questionText",

            COUNT(tr.task_result_id) AS "totalAttempts",

            COALESCE(
                SUM(
                    CASE
                        WHEN tr.task_result_id IS NOT NULL
                         AND qr.is_correct = false
                        THEN 1
                        ELSE 0
                    END
                ),
                0
            ) AS "wrongCount",

            CAST(
                CASE
                    WHEN COUNT(tr.task_result_id) = 0 THEN 0
                    ELSE
                        COALESCE(
                            SUM(
                                CASE
                                    WHEN tr.task_result_id IS NOT NULL
                                     AND qr.is_correct = false
                                    THEN 1
                                    ELSE 0
                                END
                            ),
                            0
                        ) * 100.0 / COUNT(tr.task_result_id)
                END
            AS double precision) AS "wrongRate"

        FROM quiz q

        LEFT JOIN quiz_result qr
            ON qr.quiz_id = q.quiz_id

        LEFT JOIN task_result tr
            ON tr.task_result_id = qr.task_result_id
           AND tr.task_id = :taskId
           AND tr.completed = true

        WHERE q.task_id = :taskId

        GROUP BY
            q.quiz_id,
            q.quiz_num,
            q.question_text

        ORDER BY
            q.quiz_num ASC
        """, nativeQuery = true)
    List<QuizWrongRateProjection> findQuizWrongRatesByTaskId(
            @Param("taskId") Long taskId
    );
}
