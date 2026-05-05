package LearningAppDemo.demo.dto.response;

import LearningAppDemo.demo.domain.task.Quiz;
import LearningAppDemo.demo.domain.task.Task;
import lombok.Data;

import java.util.List;

@Data
public class TaskQuizDetailResponse {
    private Long quizId; //quizId
    private Task.Type type; // "OX" or "CHOOSE" (이전 코드에서 쓰신 Enum)
    private String questionText; // 퀴즈 질문
    private List<String> options; // 1~4선지 (OX일 경우 null이거나 ["O", "X"] 전달)
    private String questImagePath; // 이미지 저장 경로

    public TaskQuizDetailResponse(Quiz quiz) {
        this.quizId = quiz.getId();
        this.type = quiz.getType();
        this.questionText = quiz.getQuestionText();
        this.options = quiz.getOptions();
        this.questImagePath = quiz.getQuestImagePath();
    }
}
