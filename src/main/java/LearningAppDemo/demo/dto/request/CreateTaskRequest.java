package LearningAppDemo.demo.dto.request;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateTaskRequest {

    private Long classRoomId;

    private String taskName;
    private String description;

    private Long categoryId;

    private int rewardStamp;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

}
