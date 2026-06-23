package LearningAppDemo.demo.repository;

import LearningAppDemo.demo.domain.task.Task;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskSearchCond {

    private LocalDateTime fromDate;
    private LocalDateTime untilDate;
    private Long categoryId;
    private Task.Type type;
}
