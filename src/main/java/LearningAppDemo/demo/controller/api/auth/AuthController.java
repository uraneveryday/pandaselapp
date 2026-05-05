package LearningAppDemo.demo.controller.api.auth;

import LearningAppDemo.demo.common.authority.CustomUserDetails;
import LearningAppDemo.demo.common.authority.TokenInfo; // 💡 임포트 추가
import LearningAppDemo.demo.domain.user.User;
import LearningAppDemo.demo.dto.request.LoginRequest;
import LearningAppDemo.demo.dto.request.SignUpRequest;
import LearningAppDemo.demo.dto.request.StudentSignUpRequest;
import LearningAppDemo.demo.dto.response.SignUpResopnse;
import LearningAppDemo.demo.service.AuthService;
import LearningAppDemo.demo.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 💡 프론트엔드에서 POST 방식으로 /api/auth/login 주소로 요청이 오면 이 메서드가 실행됨
    @PostMapping("/login")
    public ResponseEntity<TokenInfo> login(@RequestBody LoginRequest request) { // 반환 타입 변경
        // 💡 로그인 성공 시 JWT 토큰(TokenInfo)을 생성하여 반환하도록 위임
        TokenInfo tokenInfo = authService.login(request.getLoginId(), request.getPassword());
        return ResponseEntity.ok(tokenInfo);
    }

    @PostMapping("/register")
    public ResponseEntity<SignUpResopnse> register(@Valid @RequestBody SignUpRequest request) {
        Long registeredId = authService.register(request);
        SignUpResopnse signUpResopnse = new SignUpResopnse(registeredId, "회원가입 완료");

        return ResponseEntity.status(HttpStatus.CREATED).body(signUpResopnse);
    }



}