package LearningAppDemo.demo.dto.response;

import LearningAppDemo.demo.domain.task.Task;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskResponse {
    private Long id;
    private String taskName;
    private String category; // 프론트엔드와 안전한 통신을 위해 String으로 변환
    private String description;
    private LocalDateTime expirationDate;

    private boolean isDone; // 선생님의 마감 여부
    private boolean completed; // 학생의 완료 여부 (프론트에서 필수 요구)

    public TaskResponse(Task task) {
        this.id = task.getId();
        this.taskName = task.getTaskName();
        this.category = task.getCategory().name(); // Enum -> String
        this.description = task.getDescription();
        this.expirationDate = task.getExpiredDate();
        this.isDone = task.isDone();

        // 현재 컨트롤러 로직(안 푼 것만 리턴) 상 무조건 false
        this.completed = false;
    }
}