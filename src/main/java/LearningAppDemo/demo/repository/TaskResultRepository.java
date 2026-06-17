package LearningAppDemo.demo.repository;

import LearningAppDemo.demo.domain.task.TaskResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskResultRepository extends JpaRepository<TaskResult, Long> {


    boolean existsByTaskIdAndStudentId(Long taskId, Long studentId);

    @Query(value = "select COUNT(task_result_id) from task_result where task_id = :taskId AND completed = true",
            nativeQuery = true)
    int studentsCompleted(@Param("taskId")Long taskId);
}
