package LearningAppDemo.demo.domain.task;

import LearningAppDemo.demo.domain.user.Student;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class StudentTask {
    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    private Student student; // 누가

    @ManyToOne
    private Task task; // 어떤 숙제를

    private boolean isCompleted; // 완료했는가? (여기서 true/false로 관리)
}
