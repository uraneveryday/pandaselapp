package LearningAppDemo.demo.controller.api.teacher.classrooms;



import LearningAppDemo.demo.common.authority.CustomUserDetails;
import LearningAppDemo.demo.dto.response.CouponUseResponse;
import LearningAppDemo.demo.service.ClassRoomService;
import LearningAppDemo.demo.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teacher/classrooms")
@RequiredArgsConstructor
public class ClassroomCouponController {

    private final StudentService studentService;
    private final ClassRoomService classRoomService;

    //선생님이 쿠폰 사용
    @PatchMapping("/{id}/students/{studentId}/coupons/use")
    ResponseEntity<CouponUseResponse> useCoupon(
            @PathVariable("id") Long classroomId,
            @PathVariable("studentId") Long studentId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal CustomUserDetails userDetails) {
        classRoomService.getClassroomOwnedByTeacher(classroomId, userDetails.getUserId());

        return ResponseEntity.ok(studentService.useCoupons(classroomId,studentId));

    }

}
