package LearningAppDemo.demo.dto;

import LearningAppDemo.demo.domain.classroom.Classroom;
import LearningAppDemo.demo.domain.user.Gender;
import LearningAppDemo.demo.domain.user.Student;
import lombok.Data;

@Data
public class StudentDto {
    private Long id;
    private String name;
    private String parentPhoneNumber;
    private Gender gender;

    // Classroom 엔티티 전체를 넘기지 말고, 화면에 필요한 값만 쪼개서 넘깁니다.
    private Long classroomId;
    private String classroomName;

    public StudentDto(Student student) {
        this.id = student.getId();
        this.name = student.getUsername();
        this.parentPhoneNumber = student.getPhoneNumber();
        this.gender = student.getGender();

        // 🚨 NullPointerException 방지를 위해 null 체크 필수
        if (student.getClassRoom() != null) {
            this.classroomId = student.getClassRoom().getId();
            this.classroomName = student.getClassRoom().getClassName(); // 교실 이름 필드가 있다면
        }
    }
}
