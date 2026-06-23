package LearningAppDemo.demo.domain.task;

import LearningAppDemo.demo.domain.task.Quiz;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@NoArgsConstructor
@Table(name = "quiz_result")
public class QuizResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quiz_result_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_result_id")
    private TaskResult taskResult; // 어떤 과제 제출서인지 (부모)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id")
    private Quiz quiz; // 어떤 문항을 푼 것인지

    // ⭐️ 선생님이 학생을 지도하기 위해 반드시 필요한 데이터
    private String submittedAnswer; // 학생이 실제로 고른 답안 (예: "3", "O", "스프링부트")

    @Enumerated(EnumType.STRING)
    @Column(name = "answer_status", nullable = false, length = 20)
    private AnswerStatus answerStatus = AnswerStatus.ANSWERED;

    private boolean isCorrect; // 맞았는지 틀렸는지 여부 (채점 결과)
}
