package LearningAppDemo.demo.dto.request;

import LearningAppDemo.demo.domain.task.Task;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateTaskRequest {

    private Long classRoomId;

    private String taskName;
    private String description;

    private Task.Category category;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

}
