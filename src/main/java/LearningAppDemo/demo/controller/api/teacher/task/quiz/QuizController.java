package LearningAppDemo.demo.controller.api.teacher.task.quiz;

import LearningAppDemo.demo.dto.request.QuizRequestDto;
import LearningAppDemo.demo.dto.response.QuizDetailResponse;
import LearningAppDemo.demo.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/teacher/quizzes/")
public class QuizController {

    private final QuizService quizService;

    @DeleteMapping("/{quizId}") //DELETE
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long quizId) {
        quizService.deleteQuiz(quizId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{quizId}") //GET
    public ResponseEntity<QuizDetailResponse> getQuiz(@PathVariable Long quizId) {
        QuizDetailResponse quizDetailResponse = quizService.getQuizDetailResponse(quizId);
        return ResponseEntity.ok().body(quizDetailResponse);
    }

    @PutMapping("/{quizId}") //PUT
    public ResponseEntity<Void> updateQuiz(@PathVariable Long quizId, @RequestBody QuizRequestDto quiz) {
        quizService.updateQuiz(quizId,quiz);
        return  ResponseEntity.ok().build();
    }
}
