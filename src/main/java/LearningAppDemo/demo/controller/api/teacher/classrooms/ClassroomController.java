package LearningAppDemo.demo.controller.api.teacher.classrooms;

import LearningAppDemo.demo.common.authority.CustomUserDetails;
import LearningAppDemo.demo.domain.classroom.Classroom;
import LearningAppDemo.demo.dto.request.StudentSignUpRequest;
import LearningAppDemo.demo.dto.response.ClassroomInfoResponse;
import LearningAppDemo.demo.dto.response.ClassroomListResponse;
import LearningAppDemo.demo.dto.response.SignUpResopnse;
import LearningAppDemo.demo.service.AuthService;
import LearningAppDemo.demo.service.ClassRoomService;
import LearningAppDemo.demo.service.TeacherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/teacher/classrooms")
@RequiredArgsConstructor
public class ClassroomController {

    private final ClassRoomService classRoomService;
    private final TeacherService teacherService;
    private final AuthService authService;

    @PostMapping("/new")
    public void createClassroom(@Valid @RequestBody Classroom classroom,
                                @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUserId();

        String className = classroom.getClassName();

        classRoomService.createClassroom(className, userId);
    }


    // 💡 프론트엔드의 fetch URL과 일치시켜야 합니다: /api/classrooms/classroomList
    @GetMapping("/list")
    public ResponseEntity<List<ClassroomListResponse>> getClassrooms(
            @AuthenticationPrincipal CustomUserDetails userDetails // 👈 토큰에서 사용자 정보 주입
    ) {
        // 1. 토큰에서 추출된 선생님의 PK(userId)를 꺼냅니다.
        Long teacherId = userDetails.getUserId();

        // 2. 서비스에 해당 선생님의 반 목록만 요청합니다.
        List<ClassroomListResponse> list = classRoomService.getClassroomsByTeacherId(teacherId);

        return ResponseEntity.ok(list);
    }
    @GetMapping("/{id}/edit") // 반 정보 수정 등
    public ResponseEntity<ClassroomInfoResponse> editClassroom (
            @PathVariable("id") Long classroomId) {

        ClassroomInfoResponse response = classRoomService.getInfo(classroomId);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/edit/student")
    public ResponseEntity<SignUpResopnse> register(@Valid @RequestBody StudentSignUpRequest request,
                                                   @PathVariable("id") Long classroomId) {
        Long registeredId = authService.registerStudent(request, classroomId);
        SignUpResopnse signUpResopnse = new SignUpResopnse(registeredId, "학생 회원가입 완료");

        return ResponseEntity.status(HttpStatus.CREATED).body(signUpResopnse);
    }

    @GetMapping("/{id}") //정보출력
    public ResponseEntity<ClassroomInfoResponse> getClassroomById(@PathVariable("id") Long classroomId)  {
        return ResponseEntity.ok(classRoomService.getInfo(classroomId));
    }

}