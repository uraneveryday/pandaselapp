package LearningAppDemo.demo.domain.task;

import LearningAppDemo.demo.domain.task.Task.Category;
import LearningAppDemo.demo.domain.task.Task.Type;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter @Setter
@Table(name = "quiz")
@NoArgsConstructor
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quiz_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    @Enumerated(EnumType.STRING)
    private Type type;

    @Enumerated(EnumType.STRING)
    private Category category;

    @Column
    private String questionText;

    @Column
    private String questImagePath;

    @Column
    private int quizNum =1;

    // 객체가 아닌 단순 String 리스트를 DB에 저장할 때 사용합니다.
    // 'quiz_options'라는 별도의 매핑 테이블이 자동 생성됩니다.
    @ElementCollection
    @CollectionTable(name = "quiz_options", joinColumns
            = @JoinColumn(name = "quiz_id"))
    @Column(name = "option_text", nullable = false)
    private List<String> options; //선택지들

    @Column(nullable = false)
    private String correctAnswer;
}
