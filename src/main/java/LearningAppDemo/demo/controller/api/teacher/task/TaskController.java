package LearningAppDemo.demo.controller.api.teacher.task;

import LearningAppDemo.demo.common.authority.CustomUserDetails;
import LearningAppDemo.demo.domain.user.Role;
import LearningAppDemo.demo.domain.user.User;
import LearningAppDemo.demo.dto.response.TaskDto;
import LearningAppDemo.demo.dto.request.CreateTaskRequest;
import LearningAppDemo.demo.dto.request.QuizRequestDto;
import LearningAppDemo.demo.dto.response.QuizzesResponse;
import LearningAppDemo.demo.dto.response.TaskListItemResponse;
import LearningAppDemo.demo.service.ClassRoomService;
import LearningAppDemo.demo.service.QuizService;
import LearningAppDemo.demo.service.TaskService;
import LearningAppDemo.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController @RequiredArgsConstructor
@RequestMapping("/api/teacher/classrooms/{classroomId}/tasks")
public class TaskController {

    private final TaskService taskService;

    private final QuizService quizService;
    private final ClassRoomService classRoomService;
    private final UserService userService;

    @GetMapping // 숙제 목록(간단한것들만)
    public ResponseEntity<List<TaskListItemResponse>> getTaskList(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                                  @PathVariable Long classroomId) {
        Long userId = customUserDetails.getUserId();
        User thisUser = userService.findById(userId);
        if(thisUser.getRole() != Role.TEACHER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "it's not teacher role"
            );
        }

        return ResponseEntity.ok(classRoomService.getTasksList(classroomId));
    }


    @GetMapping("/{taskId}") //quizzes 배열로 나열
    public ResponseEntity<List<QuizzesResponse>> getAllQuizzes(
            @PathVariable("classroomId") Long classroomId,
            @PathVariable("taskId") Long taskId) {

        // Controller는 HTTP 요청을 받고 Service의 결과를 응답하는 역할만 수행
        List<QuizzesResponse> response = quizService.getQuizzesForTask(classroomId, taskId);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{taskId}") //task 삭제 메서드
    public ResponseEntity<Void> deleteTask(
            @PathVariable("classroomId") Long classroomId,
            @PathVariable("taskId") Long taskId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {

        Long userId = customUserDetails.getUserId();
        taskService.deleteTask(classroomId,taskId,userId);

        return ResponseEntity.ok().build();
    }


    @GetMapping("/{taskId}/detail") //task deatil Dto
    public ResponseEntity<TaskDto> TasksDetail(@PathVariable("classroomId") Long classRoomId,
                                             @PathVariable("taskId") Long taskId){

        return ResponseEntity.ok(taskService.getTaskDetailWithCompletionRate(classRoomId, taskId));
    }

    @PostMapping("/create") //task 생성
    public ResponseEntity<Void> create(@PathVariable Long classroomId,
                            @RequestBody CreateTaskRequest createTaskRequest,
                           @AuthenticationPrincipal CustomUserDetails customUserDetails){
        Long userId = customUserDetails.getUserId();

        taskService.createTask(createTaskRequest,userId,classroomId);

        return ResponseEntity.ok().build();
    }


    @PatchMapping("/{taskId}/finish")    //마감 완료 버튼
    public ResponseEntity<Void> finishTask(
            @PathVariable("classroomId") Long classRoomId, // URL에 있는 {id}를 받아줌 (에러 방지용)
            @PathVariable("taskId") Long taskId) {

        taskService.completeTask(taskId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{taskId}/add-quizzes")
    public ResponseEntity<Void> addQuizzes(
            @PathVariable("taskId") Long taskId,
            @RequestBody QuizRequestDto request) {
        quizService.createQuiz(request,taskId);

        return ResponseEntity.ok().build();
    }


}
