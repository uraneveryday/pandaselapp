package LearningAppDemo.demo.repository;

public interface QuizWrongRateProjection {
    Long getQuizId();

    Integer getQuizNum();

    String getQuestionText();

    Long getTotalAttempts();

    Long getWrongCount();

    Double getWrongRate();
}
