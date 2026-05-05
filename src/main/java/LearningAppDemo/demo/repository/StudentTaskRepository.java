package LearningAppDemo.demo.repository;

import LearningAppDemo.demo.domain.task.StudentTask;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentTaskRepository extends JpaRepository<StudentTask, Long> {
    // 특정 숙제에 할당된 전체 학생 수 조회
    long countByTaskId(Long taskId);

    // 특정 숙제에서 완료한(isCompleted = true) 학생 수 조회
    long countByTaskIdAndIsCompletedTrue(Long taskId);


}
