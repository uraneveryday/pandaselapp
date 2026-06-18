package LearningAppDemo.demo.repository;

import LearningAppDemo.demo.domain.task.Task;
import LearningAppDemo.demo.domain.task.Task.Category;
import LearningAppDemo.demo.domain.task.Task.Type;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    // 학급 ID로 숙제 목록을 찾아주는 마법의 메서드
    List<Task> findByClassRoom_Id(Long classRoomId);



    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.quizzes WHERE t.id = :taskId")
    Optional<Task> findTaskWithQuizzesById(@Param("taskId") Long taskId);

    Optional<Task> findTaskById(Long id);
}
