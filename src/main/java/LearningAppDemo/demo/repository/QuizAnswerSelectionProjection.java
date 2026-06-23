package LearningAppDemo.demo.repository;

public interface QuizAnswerSelectionProjection {
    Long getQuizId();
    String getSubmittedAnswer();
    Long getSelectionCount();
}
