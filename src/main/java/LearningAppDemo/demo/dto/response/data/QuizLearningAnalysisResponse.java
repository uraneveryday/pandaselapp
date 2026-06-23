package LearningAppDemo.demo.dto.response.data;

import java.util.List;

public record QuizLearningAnalysisResponse(
        Long quizId,
        Integer quizNum,
        String questionText,
        Long totalAttempts,
        Long correctCount,
        Long wrongCount,
        Long dontKnowCount,
        Double correctRate,
        Double wrongRate,
        Double dontKnowRate,
        List<AnswerChoiceAnalysisResponse> answerChoices) {
}
