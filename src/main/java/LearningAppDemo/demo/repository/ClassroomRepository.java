package LearningAppDemo.demo.repository;

import LearningAppDemo.demo.domain.classroom.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, Long> {
    List<Classroom> findByTeacherId(Long teacherId);

    List<Classroom> findClassroomsById(Long id);

    Classroom findClassroomById(Long id);
}
