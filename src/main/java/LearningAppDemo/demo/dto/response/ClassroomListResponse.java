package LearningAppDemo.demo.dto.response;

import LearningAppDemo.demo.domain.classroom.Classroom;
import lombok.Data;

import java.util.List;

@Data
public class ClassroomListResponse {
    private Long id;
    private String className;
    private List<TaskDto> tasks; // 이미 통계가 포함된 완성본을 받을 것

    public ClassroomListResponse(Classroom classroom, List<TaskDto> tasks) {
        this.id = classroom.getId();
        this.className = classroom.getClassName();
       this.tasks = tasks; // Service에서 넘겨준 통계 포함 리스트
    }
}
