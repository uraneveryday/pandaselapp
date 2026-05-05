package LearningAppDemo.demo.repository;

import LearningAppDemo.demo.domain.user.Student;
import LearningAppDemo.demo.domain.user.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    Optional<Teacher> findTeacherById(Long id);
}
