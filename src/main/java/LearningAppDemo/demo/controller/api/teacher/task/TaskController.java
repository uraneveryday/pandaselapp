package LearningAppDemo.demo.controller.api.teacher.task;

import LearningAppDemo.demo.common.authority.CustomUserDetails;
import LearningAppDemo.demo.domain.user.Role;
import LearningAppDemo.demo.dto.response.TaskDto;
import LearningAppDemo.demo.dto.request.CreateTaskRequest;
import LearningAppDemo.demo.dto.request.QuizRequestDto;
import LearningAppDemo.demo.dto.response.QuizzesResponse;
import LearningAppDemo.demo.dto.response.TaskListItemResponse;
import LearningAppDemo.demo.service.ClassRoomService;
import LearningAppDemo.demo.service.QuizService;
import LearningAppDemo.demo.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController @RequiredArgsConstructor
@RequestMapping("/api/teacher/classrooms/{classroomId}/tasks")
public class TaskController {

    private final TaskService taskService;

    private final QuizService quizService;
    private final ClassRoomService classRoomService;

    @GetMapping // 숙제 목록(간단한것들만)
    public ResponseEntity<List<TaskListItemResponse>> getTaskList(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                                  @PathVariable Long classroomId) {
        if(customUserDetails.getUserId().equals(Role.TEACHER)) {
            return ResponseEntity.ok(classRoomService.getTasksList(classroomId));
        }

        throw new IllegalStateException("it's not teacher role");
    }


    @GetMapping("/{taskId}")
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


    @PostMapping("/create") //task 생성
    public ResponseEntity<Void> createTask(@PathVariable Long classroomId,
                            @RequestBody CreateTaskRequest createTaskRequest,
                           @AuthenticationPrincipal CustomUserDetails customUserDetails){
        Long userId = customUserDetails.getUserId();
        createTaskRequest.setClassRoomId(classroomId);
        taskService.createTask(createTaskRequest, userId);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/list") //task 조회
    public ResponseEntity<List<TaskDto>> listTasks(@PathVariable("classroomId") Long classRoomId){

        return ResponseEntity.ok(taskService.getTaskListWithCompletionRate(classRoomId));
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
