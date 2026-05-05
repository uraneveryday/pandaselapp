package LearningAppDemo.demo.controller.api.student.me;

import LearningAppDemo.demo.common.authority.CustomUserDetails;
import LearningAppDemo.demo.domain.user.Role;
import LearningAppDemo.demo.domain.user.Student;
import LearningAppDemo.demo.domain.user.User;
import LearningAppDemo.demo.dto.StudentDto;
import LearningAppDemo.demo.exception.FaildToValidate;
import LearningAppDemo.demo.service.StudentService;
import LearningAppDemo.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController @Slf4j
@RequestMapping("/api/student/me")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    @GetMapping("/stamp")
    public ResponseEntity<?> getMyStamp(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
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
        Map<String, Object> data = new HashMap<>();
        data.put("currentStamps", student.getStamp());
        data.put("currentCoupons", student.getCoupon());
        data.put("maxStamps", 10);


        response.put("success", true);
        response.put("data", data);


        return ResponseEntity.ok(response);

    }
}
