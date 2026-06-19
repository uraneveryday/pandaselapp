package LearningAppDemo.demo.dto.response;

import LearningAppDemo.demo.domain.task.Task;
import LearningAppDemo.demo.domain.task.Quiz;
import lombok.Data;

import java.util.List;

@Data
public class QuizDetailResponse {
    private Task.Type type; // "OX" or "CHOOSE" (이전 코드에서 쓰신 Enum)
    private String questionText; // 퀴즈 질문
    private List<String> options; // 1~4선지 (OX일 경우 null이거나 ["O", "X"] 전달)
    private String correctAnswer; // 정답지 (0~3 인덱스)
    private String questImagePath; // 이미지 저장 경로

    public QuizDetailResponse(Quiz quiz) {
        this.type = quiz.getType();
        this.questionText = quiz.getQuestionText();
        this.options = quiz.getOptions();
        this.correctAnswer = quiz.getCorrectAnswer();
        this.questImagePath = quiz.getQuestImagePath();
    }
}
