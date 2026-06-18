package LearningAppDemo.demo.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Getter;

@Getter
@Data
public class TaskListItemResponse {

    private Long id;

//    private int taskOrder;

    private String taskName;

    @JsonProperty("isDone")
    private boolean done;

    public TaskListItemResponse(Long id, String taskName, boolean done) {
        this.id = id;
        this.taskName = taskName;
        this.done = done;
    }
}