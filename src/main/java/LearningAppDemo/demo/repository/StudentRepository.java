package LearningAppDemo.demo.repository;

import LearningAppDemo.demo.domain.user.Student;
import LearningAppDemo.demo.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByLoginId(String loginId);

    Optional<Student> existsStudentByLoginId(String loginId);

    Optional<Student> findStudentById(Long id);

    boolean existsByClassRoomIdAndStudentLoginId(Long classRoomId, String studentLoginId);

    @Query("""
            select s from Student s
            join fetch s.classRoom c
            where c.studentLoginCode = :classCode
              and s.studentLoginId = :studentLoginId
            """)
    Optional<Student> findByClassCodeAndStudentLoginId(
            @Param("classCode") String classCode,
            @Param("studentLoginId") String studentLoginId);
}
