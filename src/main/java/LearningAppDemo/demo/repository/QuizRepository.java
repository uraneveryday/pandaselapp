package LearningAppDemo.demo.repository;

import LearningAppDemo.demo.domain.task.Task;
import LearningAppDemo.demo.domain.task.Quiz;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface QuizRepository extends CrudRepository<Quiz, Long> {
    List<Quiz> findAllByTask(Task task);

    List<Quiz> findAllByTaskId(Long taskId);




    Long task(Task task);

    Quiz findQuizById(Long id);
}
