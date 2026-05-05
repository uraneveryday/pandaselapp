package LearningAppDemo.demo.dto.response;

import LearningAppDemo.demo.domain.task.Quiz;
import lombok.Data;

@Data
public class QuizzesResponse {

    private int quizNum;
    private String quizName;
    private Long quizId;
    private String quizImage;

    public QuizzesResponse(Quiz quiz) {
        this.quizNum = quiz.getQuizNum();
        this.quizName = quiz.getQuestionText();
        this.quizId = quiz.getId();
        this.quizImage = quiz.getQuestImagePath();
    }
}
