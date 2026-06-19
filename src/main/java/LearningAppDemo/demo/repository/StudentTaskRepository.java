package LearningAppDemo.demo.repository;

import LearningAppDemo.demo.domain.StudentTask;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentTaskRepository extends JpaRepository<StudentTask, Long> {

}
