package LearningAppDemo.demo.dto.response.data;

import java.util.List;

public record TaskLearningAnalyticsResponse(
        Long taskId,
        List<QuizLearningAnalysisResponse> quizzes,
        TimeScoreAnalysisResponse timeScore) {
}
