package LearningAppDemo.demo.dto.response.data;

public record AnswerChoiceAnalysisResponse(
        String answerValue,
        String answerLabel,
        Long selectionCount,
        Double selectionRate,
        boolean correct,
        boolean mostCommonWrong) {
}
