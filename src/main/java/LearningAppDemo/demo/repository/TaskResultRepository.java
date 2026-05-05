package LearningAppDemo.demo.repository;

import LearningAppDemo.demo.domain.task.Task;
import LearningAppDemo.demo.domain.task.TaskResult;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskResultRepository extends JpaRepository<TaskResult, Long> {


    boolean existsByTaskIdAndStudentId(Long taskId, Long studentId);
}
