package LearningAppDemo.demo.repository;

import LearningAppDemo.demo.domain.category.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("""
            select c from Category c
            where c.active = true
              and (c.systemDefault = true or c.ownerTeacher.id = :teacherId)
            order by c.systemDefault desc, lower(c.name) asc
            """)
    List<Category> findAvailableForTeacher(@Param("teacherId") Long teacherId);

    boolean existsByOwnerTeacherIdAndNameIgnoreCase(Long teacherId, String name);
}
