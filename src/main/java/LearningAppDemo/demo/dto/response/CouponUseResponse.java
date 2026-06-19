package LearningAppDemo.demo.dto.response;

import LearningAppDemo.demo.domain.user.Student;
import lombok.Data;

@Data
public class CouponUseResponse {

    private final Long studentId;
    private final int stampCount;
    private final int couponCount;

    public CouponUseResponse(Student student) {
        this.studentId = student.getId();
        this.stampCount = student.getStamp();
        this.couponCount = student.getCoupon();
    }
}
