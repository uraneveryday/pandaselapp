package LearningAppDemo.demo.repository;

public interface QuizLearningAnalysisProjection {
    Long getQuizId();
    Integer getQuizNum();
    String getQuestionText();
    Long getTotalAttempts();
    Long getCorrectCount();
    Long getWrongCount();
    Long getDontKnowCount();
}
