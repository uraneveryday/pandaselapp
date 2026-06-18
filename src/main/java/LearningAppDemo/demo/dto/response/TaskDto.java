package LearningAppDemo.demo.dto.response;

import LearningAppDemo.demo.domain.task.Task;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskDto {

    private Long id;
    private String taskName;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime expiredDate;

    @JsonProperty("isDone")
    private boolean isDone;
    // teacherName 삭제됨
    private String className;
    private double completionRate;

    public TaskDto(Task task, int totalStudentCount, int completedStudentCount) {
        this.id = task.getId();
        this.taskName = task.getTaskName();
        this.description = task.getDescription();
        this.startDate = task.getStartDate();
        this.expiredDate = task.getExpiredDate();
        this.isDone = task.isDone();

        this.className = task.getClassRoom().getClassName();

        if (totalStudentCount > 0) {
            this.completionRate = Math.round(((double) completedStudentCount / totalStudentCount) * 100.0 * 10) / 10.0;
        } else {
            this.completionRate = 0.0;
        }
    }
}