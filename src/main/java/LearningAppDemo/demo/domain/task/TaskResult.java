package LearningAppDemo.demo.domain.task;

import LearningAppDemo.demo.domain.user.Student;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter @Setter
@NoArgsConstructor
@Table(
        name = "task_result",
        // ⭐️ 핵심: 한 학생은 하나의 Task당 딱 1개의 Result만 가질 수 있도록 DB 수준에서 강제
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_student_task",
                        columnNames = {"student_id", "task_id"}
                )
        }
)
public class TaskResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_result_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    private boolean completed; // 숙제 완료 여부
    private LocalDateTime startTime; // 언제 시작했는지
    private LocalDateTime endTime; // 언제 끝났는지
    private double takesTime; // 얼마나 걸렸는지
    private int taskScore; // 총점

    // ⭐️ 이 과제 제출건에 딸려있는 학생의 개별 문항 제출 기록들
    // cascade = CascadeType.ALL: TaskResult를 저장할 때 QuizResult도 자동으로 같이 저장됨
    @OneToMany(mappedBy = "taskResult", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizResult> quizResults = new ArrayList<>();

    // 연관관계 편의 메서드 (데이터를 집어넣을 때 양쪽을 한 번에 세팅)
    public void addQuizResult(QuizResult quizResult) {
        this.quizResults.add(quizResult);
        quizResult.setTaskResult(this);
    }
}