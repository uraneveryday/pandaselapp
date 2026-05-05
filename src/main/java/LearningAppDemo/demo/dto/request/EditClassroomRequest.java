package LearningAppDemo.demo.dto.request;

import LearningAppDemo.demo.domain.user.Gender;
import lombok.Data;

@Data
public class EditClassroomRequest {

    private String classroomName;
    private String studentName; //student name
    private Gender gender; //student gender
    private String phoneNumber; //parents'

}
