package LearningAppDemo.demo.repository;

import LearningAppDemo.demo.domain.user.Student;
import LearningAppDemo.demo.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByLoginId(String loginId);

    Optional<Student> existsStudentByLoginId(String loginId);

    Optional<Student> findStudentById(Long id);
}
