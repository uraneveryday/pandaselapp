package LearningAppDemo.demo.dto;

import LearningAppDemo.demo.domain.task.Task;
import lombok.Data;

import java.util.List;

@Data
public class TaskUpdateDto {
    private String taskName;
    private String description;
    private Task.Category category;

    // ⭐ 프론트엔드에서 수정된 퀴즈 목록을 통째로 받아옵니다.
    private List<QuizUpdateDto> quizzes;


}
@Data
class QuizUpdateDto {
    private Task.Type type;
    private String question;
    private List<String> options;
    private String correctAnswer;
}
