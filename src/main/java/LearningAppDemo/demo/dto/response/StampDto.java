package LearningAppDemo.demo.dto.response;

import LearningAppDemo.demo.domain.user.Student;
import lombok.Data;
@Data
public class StampDto {

    public static final int MAX_STAMPS = 10;

    private final int currentStamps;
    private final int currentCoupons;
    private final int maxStamps;
    private final boolean canExchange;

    public StampDto(Student student) {
        this.currentStamps = student.getStamp();
        this.currentCoupons = student.getCoupon();
        this.maxStamps = MAX_STAMPS;

        this.canExchange = this.currentStamps >= this.maxStamps;

    }
}
