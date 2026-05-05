package LearningAppDemo.demo.dto.response;

import LearningAppDemo.demo.domain.classroom.Classroom;
import LearningAppDemo.demo.dto.StudentDto;
import LearningAppDemo.demo.dto.TaskDto;
import lombok.Data;

import java.util.List;

@Data
public class ClassroomListResponse {
    private Long id;
    private String className;
//    private List<StudentDto> students;
//    private List<TaskDto> tasks; // 이미 통계가 포함된 완성본을 받을 것

    public ClassroomListResponse(Classroom classroom, List<TaskDto> tasks) {
        this.id = classroom.getId();
        this.className = classroom.getClassName();
//        this.students = classroom.getStudents().stream().map(StudentDto::new).toList();
//        this.tasks = tasks; // Service에서 넘겨준 통계 포함 리스트
    }
}
