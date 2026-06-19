package LearningAppDemo.demo.domain.task;


import LearningAppDemo.demo.domain.classroom.Classroom;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasks")
@Getter @Setter
@NoArgsConstructor
public class Task {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_id")
    private Long id; //숙제 pk

    @Column(name = "task_name")
    private String taskName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classRoom")
    private Classroom classRoom; //반 이름

    @Column(name = "reward_stamp")
    private int rewardStamp; //이거풀면 스탬프 몇개?

    @Enumerated(EnumType.STRING)
    private Category category; //한자인지 숫자인지

    @Column(nullable = false)
    private String description; //학습목표

    //// cascade = CascadeType.ALL: 숙제를 지우면 문제들도 다 같이 지워짐
    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Quiz> quizzes = new ArrayList<>();

    @Column
    private LocalDateTime generatedDate;

    @Column
    private LocalDateTime startDate;
    @Column
    private LocalDateTime expiredDate;

    @Column
    private boolean isDone = false; //완료된 숙제인지 (선생님이 체크)

    public void addQuiz(Quiz quiz) {
        quizzes.add(quiz);
        quiz.setTask(this);
    }

    public enum Type {
        OX, CHOOSE // CHOOSE는 4지선다 등
    }

    public enum Category {
        MATH, CHINESE
    }
}
