package LearningAppDemo.demo.dto.response;

import LearningAppDemo.demo.domain.user.Gender;
import LearningAppDemo.demo.domain.user.Student;
import lombok.Data;

@Data
public class StudentSummaryResponse {
    private final Long id;
    private final String loginId;
    private final String name;
    private final Gender gender;
    private final String parentPhoneNumber;
    private final int stampCount;
    private final int couponCount;


    public StudentSummaryResponse(Student student) {
        this.id = student.getId();
        this.loginId = student.getLoginId();
        this.name = student.getUsername();
        this.gender = student.getGender();
        this.parentPhoneNumber = student.getParentPhoneNumber();
        this.stampCount = student.getStamp();
        this.couponCount = student.getCoupon();
    }
}
