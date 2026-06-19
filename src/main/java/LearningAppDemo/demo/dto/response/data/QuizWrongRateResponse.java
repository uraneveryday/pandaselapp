package LearningAppDemo.demo.dto.response.data;

import LearningAppDemo.demo.repository.QuizWrongRateProjection;



public record QuizWrongRateResponse( Long quizId,
                                     Integer quizNum,
                                     String questionText,
                                     Long totalAttempts,
                                     Long wrongCount,
                                     Double wrongRate) {


    public static QuizWrongRateResponse from(QuizWrongRateProjection p) {
        return new QuizWrongRateResponse(
                p.getQuizId(),
                p.getQuizNum(),
                p.getQuestionText(),
                p.getTotalAttempts(),
                p.getWrongCount(),
                Math.round(p.getWrongRate() * 10.0) / 10.0
        );

    }
}
