package LearningAppDemo.demo.controller.api.student.task;

import LearningAppDemo.demo.common.authority.CustomUserDetails;
import LearningAppDemo.demo.domain.task.Task;
import LearningAppDemo.demo.domain.user.Student;
import LearningAppDemo.demo.dto.request.TaskSubmitRequestDto;
import LearningAppDemo.demo.dto.response.QuizDetailResponse;
import LearningAppDemo.demo.dto.response.TaskQuizDetailResponse;
import LearningAppDemo.demo.dto.response.TaskResponse;
import LearningAppDemo.demo.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

// 프론트엔드 주소에 맞추고 싶다면 백엔드를 이렇게 수정
@RestController
@RequestMapping("/api/student/tasks")
@RequiredArgsConstructor
public class StudentTaskController {

    private final TaskService taskService;
    private final StudentService studentService;
    private final QuizService quizService;
    private final ClassRoomService classRoomService;
    private final TaskResultService taskResultService;

    //학급별 숙제목록 조회
    @GetMapping("/get")// 경로를 그냥 /api/student/tasks 로 단순화
    public ResponseEntity<?> getMyTasks(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        Long userId = customUserDetails.getUserId();
        Long studentId = studentService.findStudentById(userId).orElseThrow().getId();

        // 서비스에서 로그인 아이디로 학생을 찾고, 그 학생의 클래스룸 ID를 알아서 가져오게 합니다.
        Long myClassRoomId = studentService.findClassRoomIdByStudentId(userId);

        if (myClassRoomId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("소속된 반이 없습니다.");
        }

        List<Task> tasks = taskService.findTasksByClassRoomForStudent(studentId, myClassRoomId);
        return ResponseEntity.ok(tasks.stream().map(TaskResponse::new).collect(Collectors.toList()));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<List<TaskQuizDetailResponse>> getTasks(@PathVariable Long taskId,
                                                                 @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        Long userId = customUserDetails.getUserId();
        Long classroomId = classRoomService.getClassroomIdByStudentId(userId);
        return ResponseEntity.ok(quizService.getQuizzesForTaskStudent(classroomId, taskId));
    }

    @PostMapping("/{taskId}/submit")
    public ResponseEntity<Void> submitTask(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                              @PathVariable Long taskId,
                                              @RequestBody TaskSubmitRequestDto request) {
        Optional<Student> student = studentService.findStudentById(customUserDetails.getUserId());
        taskResultService.submit(student.get().getId(),taskId, request);
        return  ResponseEntity.ok().build();
    }

}
