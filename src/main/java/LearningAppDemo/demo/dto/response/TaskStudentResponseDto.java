package LearningAppDemo.demo.dto.response;

import LearningAppDemo.demo.domain.task.Task;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TaskStudentResponseDto {

    private Long id;
    private String taskName;
    private String category;
    private String description;
    private LocalDateTime expirationDate;
    private boolean completed; // 학생의 완료 여부

    // ⭐️ 이 필드가 누락되어 있었습니다! 추가해 주세요.
    private boolean isDone;

    public TaskStudentResponseDto(Task task, boolean completed) {
        this.id = task.getId();
        this.taskName = task.getTaskName();
        this.category = task.getCategory().getName();
        this.description = task.getDescription();
        this.expirationDate = task.getExpiredDate();
        this.completed = completed;

        // ⭐️ Task 엔티티에서 isDone 값을 가져와서 DTO에 담아줍니다.
        this.isDone = task.isDone();
    }
}
