package LearningAppDemo.demo.controller.api.teacher.task;

import LearningAppDemo.demo.dto.response.data.TaskQuizWrongRateAnalysisResponse;
import LearningAppDemo.demo.dto.response.data.TaskLearningAnalyticsResponse;
import LearningAppDemo.demo.common.authority.CustomUserDetails;
import LearningAppDemo.demo.service.TaskService;
import LearningAppDemo.demo.service.TaskAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/teacher/tasks")
public class TaskAnalyticsController {

    private final TaskAnalyticsService taskAnalyticsService;
    private final TaskService taskService;


    @GetMapping("/{taskId}/analytics/quiz-wrong-rates")
    public ResponseEntity<TaskQuizWrongRateAnalysisResponse> getQuizWrongRates(
            @PathVariable Long taskId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        taskService.verifyTaskOwnership(taskId, userDetails.getUserId());

        return ResponseEntity.ok(
                taskAnalyticsService.getQuizWrongRateAnalysis(taskId)
        );
    }

    @GetMapping("/{taskId}/analytics/learning-overview")
    public ResponseEntity<TaskLearningAnalyticsResponse> getLearningOverview(
            @PathVariable Long taskId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal CustomUserDetails userDetails) {
        taskService.verifyTaskOwnership(taskId, userDetails.getUserId());
        return ResponseEntity.ok(taskAnalyticsService.getLearningAnalytics(taskId));
    }
    
}
