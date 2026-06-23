package LearningAppDemo.demo.dto.response;

import LearningAppDemo.demo.domain.classroom.Classroom;
import lombok.Data;

import java.util.List;

@Data
public class ClassroomListResponse {
    private Long id;
    private String className;
    private String studentLoginCode;
    private int studentCount;

    public ClassroomListResponse(Classroom classroom) {
        this.id = classroom.getId();
        this.className = classroom.getClassName();
        this.studentLoginCode = classroom.getStudentLoginCode();
        this.studentCount = classroom.getStudents().size();
    }
}
