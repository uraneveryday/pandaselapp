package LearningAppDemo.demo.controller.api.users;

import LearningAppDemo.demo.common.authority.CustomUserDetails;
import LearningAppDemo.demo.domain.user.User;
import LearningAppDemo.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getMyInfo(@AuthenticationPrincipal CustomUserDetails userDetails) {
        // 🚨 프론트에서 보낸 값이 아니라, JwtAuthenticationFilter가 토큰을 검증하고
        // SecurityContext에 심어둔 안전한 principal 객체를 사용함.
        Long userId = userDetails.getUserId();

        // DB에서 최신 유저 정보 조회 (이름, 역할 등)
        User user = userService.findById(userId);

        // 프론트엔드에서 기대하는 JSON 형태로 반환 (data.name)
        Map<String, Object> response = new HashMap<>();
        response.put("name", user.getUsername());
        response.put("role", user.getRole());
        return ResponseEntity.ok(response);
    }

}
