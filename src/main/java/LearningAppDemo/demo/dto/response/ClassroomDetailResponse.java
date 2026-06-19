package LearningAppDemo.demo.dto.response;

import LearningAppDemo.demo.domain.classroom.Classroom;
import lombok.Data;

import java.util.List;

@Data
public class ClassroomDetailResponse {
    private Long id;
    private String className;
    private final int studentCount;
    private List<StudentSummaryResponse> students;

    public ClassroomDetailResponse(Classroom classroom) {
        this.id = classroom.getId();
        this.className = classroom.getClassName();
        this.students = classroom.getStudents().stream().map(StudentSummaryResponse::new).toList();
        this.studentCount = this.students.size();
    }
}
