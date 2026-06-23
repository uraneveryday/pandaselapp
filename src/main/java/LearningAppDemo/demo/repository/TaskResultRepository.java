package LearningAppDemo.demo.repository;

import LearningAppDemo.demo.domain.task.TaskResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TaskResultRepository extends JpaRepository<TaskResult, Long> {


    boolean existsByTaskIdAndStudentId(Long taskId, Long studentId);

    @Query(value = "select COUNT(task_result_id) from task_result where task_id = :taskId AND completed = true",
            nativeQuery = true)
    int studentsCompleted(@Param("taskId")Long taskId);

    @Query(value = """
        select coalesce(avg(takes_time), 0)
        from task_result
        where task_id = :taskId
          and completed = true
        """, nativeQuery = true)
    double averageTakesTimeByTaskId(@Param("taskId") Long taskId);

    @Query(value = """
        SELECT
            tr.student_id AS "studentId",
            u.username AS "studentName",
            tr.takes_time AS "takesTime",
            tr.task_score AS "taskScore"
        FROM task_result tr
        JOIN users u ON u.user_id = tr.student_id
        WHERE tr.task_id = :taskId
          AND tr.completed = true
        ORDER BY tr.student_id ASC
        """, nativeQuery = true)
    List<StudentTimeScoreProjection> findTimeScoreByTaskId(@Param("taskId") Long taskId);
}
