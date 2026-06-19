package LearningAppDemo.demo.controller.api.student.stamp;

import LearningAppDemo.demo.common.authority.CustomUserDetails;
import LearningAppDemo.demo.domain.user.Student;
import LearningAppDemo.demo.dto.response.StampDto;
import LearningAppDemo.demo.service.StudentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController @Slf4j
@RequestMapping("/api/student/stamp")
@RequiredArgsConstructor
public class StudentStampController {

    private final StudentService studentService;
    @GetMapping
    public ResponseEntity<Map<String,Object>> getMyStamp(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        // 🚨 프론트에서 보낸 값이 아니라, JwtAuthenticationFilter가 토큰을 검증하고
        // SecurityContext에 심어둔 안전한 principal 객체를 사용함.
        Map<String, Object> response = new HashMap<>();
        Long thisUserId = customUserDetails.getUserId();
        Optional<Student> studentOpt = studentService.findStudentById(thisUserId);
        if (studentOpt.isEmpty()) {
            log.warn("Student not found for id: {}", thisUserId);
            return ResponseEntity.notFound().build();
        }
        // DB에서 최신 유저 정보 조회 (이름, 역할 등)

        // 프론트엔드에서 기대하는 JSON 형태로 반환 (data.name)
        Student student = studentOpt.get();

        response.put("success", true);
        response.put("data", new StampDto(student));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/exchange-coupon")
    public ResponseEntity<?> exchangeCoupon(@AuthenticationPrincipal CustomUserDetails customUserDetails) {

        Long userId = customUserDetails.getUserId();
        StampDto stampDto = studentService.exchangeCoupons(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "쿠폰으로 교환되었습니다");
        response.put("data", stampDto);
        return ResponseEntity.ok(response);
    }

}
