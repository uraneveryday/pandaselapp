package LearningAppDemo.demo.domain;

import LearningAppDemo.demo.domain.task.Task;
import LearningAppDemo.demo.domain.user.Student;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(
        name = "student_task",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_student_task_assignment",
                        columnNames = {"student_id", "task_id"}
                )
        }
)
public class StudentTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_task_id")
    private Long id;

    // 어떤 학생에게 배정된 숙제인지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    // 어떤 숙제인지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StudentTaskStatus status = StudentTaskStatus.ASSIGNED;

    @Column(updatable = false)
    private LocalDateTime assignedAt;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    @PrePersist
    public void prePersist() {
        this.assignedAt = LocalDateTime.now();
    }

    public void start() {
        this.status = StudentTaskStatus.IN_PROGRESS;
        this.startedAt = LocalDateTime.now();
    }

    public void complete() {
        this.status = StudentTaskStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
    }

    public enum StudentTaskStatus {
        ASSIGNED,      // 배정됨
        IN_PROGRESS,   // 푸는 중
        COMPLETED,     // 완료
        EXPIRED        // 기한 만료
    }
}
