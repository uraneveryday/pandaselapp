package LearningAppDemo.demo.service;

import LearningAppDemo.demo.common.authority.CustomUserDetails;
import LearningAppDemo.demo.common.authority.JwtTokenProvider;
import LearningAppDemo.demo.common.authority.TokenInfo;
import LearningAppDemo.demo.domain.user.Role;
import LearningAppDemo.demo.domain.user.Student;
import LearningAppDemo.demo.domain.user.Teacher;
import LearningAppDemo.demo.domain.user.User;
import LearningAppDemo.demo.dto.request.SignUpRequest;
import LearningAppDemo.demo.dto.request.StudentSignUpRequest;
import LearningAppDemo.demo.repository.ClassroomRepository;
import LearningAppDemo.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider; // 💡 토큰 발급기 주입
    private final ClassroomRepository classroomRepository;

    @Transactional
    public Long register(SignUpRequest signUpRequest) {
        if (isDuplicatedId(signUpRequest.getUserId())) {
            throw new RuntimeException("아이디가 이미 존재합니다.");
        }
        Teacher newUser = new Teacher();

        newUser.setLoginId(signUpRequest.getUserId());
        newUser.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        newUser.setUsername(signUpRequest.getName());
        newUser.setRole(Role.TEACHER);
        newUser.setGender(signUpRequest.getGender());
        newUser.setEmail(signUpRequest.getEmail());
        newUser.setRegisterTime(LocalDateTime.now());

        userRepository.save(newUser);

        return newUser.getId();
    }

    @Transactional
    public Long registerStudent(StudentSignUpRequest request, Long classroomId) {
        if (isDuplicatedId(request.getStudentLoginId())) {
            throw new RuntimeException("아이디가 이미 존재합니다.");
        }
        Student newStudent = new Student();
        newStudent.setRole(Role.STUDENT);
        newStudent.setClassRoom(classroomRepository.findClassroomById(classroomId));
        newStudent.setLoginId(request.getStudentLoginId());
        newStudent.setPassword(passwordEncoder.encode(request.getStudentPassword()));
        newStudent.setUsername(request.getStudentName());
        newStudent.setGender(request.getGender());


        userRepository.save(newStudent);

        return newStudent.getId();
    }

    private boolean isDuplicatedId(String userId) {
        return userRepository.findByLoginId(userId).isPresent();
    }

    // 💡 반환 타입을 LoginResponse에서 TokenInfo(JWT)로 변경
    public TokenInfo login(String loginId, String password) {
        // 1. 아이디 존재 확인
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("아이디가 존재하지 않습니다."));

        // 2. 비밀번호 일치 확인
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        // 3. 💡 인증 성공 시, 앞서 만든 CustomUserDetails 객체 생성
        CustomUserDetails principal = new CustomUserDetails(
                user.getLoginId(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())),
                user.getId() // 토큰에 담길 핵심 데이터 (userId)
        );

        // 4. Spring Security용 Authentication 객체 생성
        Authentication authentication = new UsernamePasswordAuthenticationToken(principal, "", principal.getAuthorities());

        // 5. JwtTokenProvider를 통해 최종적으로 토큰 생성 후 반환
        return jwtTokenProvider.createToken(authentication);
    }
}