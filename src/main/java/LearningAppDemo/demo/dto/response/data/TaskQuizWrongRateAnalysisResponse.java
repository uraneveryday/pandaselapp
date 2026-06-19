package LearningAppDemo.demo.dto.response.data;

import java.util.List;

public record TaskQuizWrongRateAnalysisResponse(
        Long taskId,

        QuizWrongRateResponse hardestQuiz,

        List<QuizWrongRateResponse> quizzes) {

}
