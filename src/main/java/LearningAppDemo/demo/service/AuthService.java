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
import LearningAppDemo.demo.dto.request.StudentLoginRequest;
import LearningAppDemo.demo.dto.response.RegistrationAvailabilityResponse;
import LearningAppDemo.demo.exception.DuplicateResourceException;
import LearningAppDemo.demo.exception.InvalidCredentialsException;
import LearningAppDemo.demo.repository.ClassroomRepository;
import LearningAppDemo.demo.repository.StudentRepository;
import LearningAppDemo.demo.repository.TeacherRepository;
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
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;

    @Transactional
    public Long register(SignUpRequest signUpRequest) {
        if (userRepository.existsByLoginId(signUpRequest.getUserId().trim())) {
            throw new DuplicateResourceException("userId", "LOGIN_ID_ALREADY_EXISTS", "이미 사용 중인 아이디입니다.");
        }
        if (teacherRepository.existsByEmailIgnoreCase(signUpRequest.getEmail().trim())) {
            throw new DuplicateResourceException("email", "EMAIL_ALREADY_EXISTS", "이미 사용 중인 이메일입니다.");
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
        var classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 클래스룸입니다."));
        String studentLoginId = request.getStudentLoginId().trim();
        if (studentRepository.existsByClassRoomIdAndStudentLoginId(classroomId, studentLoginId)) {
            throw new DuplicateResourceException("studentLoginId", "STUDENT_LOGIN_ID_ALREADY_EXISTS", "이 반에서 이미 사용 중인 학생 아이디입니다.");
        }
        Student newStudent = new Student();
        newStudent.setRole(Role.STUDENT);
        newStudent.setClassRoom(classroom);
        newStudent.setStudentLoginId(studentLoginId);
        newStudent.setLoginId("student:" + classroom.getStudentLoginCode() + ":" + studentLoginId);
        newStudent.setPassword(passwordEncoder.encode(request.getStudentPassword()));
        newStudent.setUsername(request.getStudentName());
        newStudent.setGender(request.getGender());


        userRepository.save(newStudent);

        return newStudent.getId();
    }

    public RegistrationAvailabilityResponse getRegistrationAvailability(String loginId, String email) {
        boolean loginIdAvailable = loginId == null || loginId.isBlank() || !userRepository.existsByLoginId(loginId.trim());
        boolean emailAvailable = email == null || email.isBlank() || !teacherRepository.existsByEmailIgnoreCase(email.trim());
        return new RegistrationAvailabilityResponse(loginIdAvailable, emailAvailable);
    }

    // 💡 반환 타입을 LoginResponse에서 TokenInfo(JWT)로 변경
    public TokenInfo login(String loginId, String password) {
        // 1. 아이디 존재 확인
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(InvalidCredentialsException::new);

        // 2. 비밀번호 일치 확인
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException();
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

    public TokenInfo loginStudent(StudentLoginRequest request) {
        Student student = studentRepository.findByClassCodeAndStudentLoginId(
                        request.getClassCode(), request.getStudentLoginId())
                .orElseThrow(InvalidCredentialsException::new);
        if (!passwordEncoder.matches(request.getPassword(), student.getPassword())) {
            throw new InvalidCredentialsException();
        }
        CustomUserDetails principal = new CustomUserDetails(
                student.getLoginId(), student.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT")), student.getId());
        Authentication authentication = new UsernamePasswordAuthenticationToken(principal, "", principal.getAuthorities());
        return jwtTokenProvider.createToken(authentication);
    }
}
