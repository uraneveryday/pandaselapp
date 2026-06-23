package LearningAppDemo.demo.service;

import LearningAppDemo.demo.domain.task.Quiz;
import LearningAppDemo.demo.domain.task.Task;
import LearningAppDemo.demo.dto.response.data.TaskLearningAnalyticsResponse;
import LearningAppDemo.demo.repository.QuizAnswerSelectionProjection;
import LearningAppDemo.demo.repository.QuizLearningAnalysisProjection;
import LearningAppDemo.demo.repository.QuizRepository;
import LearningAppDemo.demo.repository.QuizResultRepository;
import LearningAppDemo.demo.repository.StudentTimeScoreProjection;
import LearningAppDemo.demo.repository.TaskResultRepository;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TaskAnalyticsServiceTest {

    @Test
    void separatesCorrectWrongAndDontKnowAndBuildsAnswerAndQuadrantAnalysis() {
        QuizResultRepository quizResultRepository = mock(QuizResultRepository.class);
        QuizRepository quizRepository = mock(QuizRepository.class);
        TaskResultRepository taskResultRepository = mock(TaskResultRepository.class);
        TaskAnalyticsService service = new TaskAnalyticsService(
                quizResultRepository, quizRepository, taskResultRepository);

        Quiz quiz = new Quiz();
        quiz.setId(11L);
        quiz.setType(Task.Type.CHOOSE);
        quiz.setQuizNum(1);
        quiz.setCorrectAnswer("0");
        quiz.setOptions(List.of("정답", "대표 오답", "다른 보기"));

        when(quizRepository.findAllByTaskId(99L)).thenReturn(List.of(quiz));
        when(quizResultRepository.findLearningAnalysisByTaskId(99L)).thenReturn(List.of(item(11L, 1, 10L, 2L, 4L, 4L)));
        when(quizResultRepository.findAnswerSelectionsByTaskId(99L)).thenReturn(List.of(
                selection(11L, "0", 2L), selection(11L, "1", 4L)));
        when(taskResultRepository.findTimeScoreByTaskId(99L)).thenReturn(List.of(
                student(1L, "학생1", 10.0, 90),
                student(2L, "학생2", 20.0, 60),
                student(3L, "학생3", 30.0, 90),
                student(4L, "학생4", 40.0, 40)));

        TaskLearningAnalyticsResponse response = service.getLearningAnalytics(99L);

        var item = response.quizzes().get(0);
        assertEquals(20.0, item.correctRate());
        assertEquals(40.0, item.wrongRate());
        assertEquals(40.0, item.dontKnowRate());
        assertEquals("2. 대표 오답", item.answerChoices().get(1).answerLabel());
        assertTrue(item.answerChoices().get(1).mostCommonWrong());

        assertEquals(25.0, response.timeScore().medianTime());
        assertEquals(75.0, response.timeScore().medianScore());
        assertEquals("FAST_HIGH_SCORE", response.timeScore().students().get(0).quadrant());
        assertEquals("FAST_LOW_SCORE", response.timeScore().students().get(1).quadrant());
        assertEquals("SLOW_HIGH_SCORE", response.timeScore().students().get(2).quadrant());
        assertEquals("SLOW_LOW_SCORE", response.timeScore().students().get(3).quadrant());
    }

    private QuizLearningAnalysisProjection item(Long quizId, Integer quizNum, Long total, Long correct, Long wrong, Long dontKnow) {
        return new QuizLearningAnalysisProjection() {
            public Long getQuizId() { return quizId; }
            public Integer getQuizNum() { return quizNum; }
            public String getQuestionText() { return "문제"; }
            public Long getTotalAttempts() { return total; }
            public Long getCorrectCount() { return correct; }
            public Long getWrongCount() { return wrong; }
            public Long getDontKnowCount() { return dontKnow; }
        };
    }

    private QuizAnswerSelectionProjection selection(Long quizId, String answer, Long count) {
        return new QuizAnswerSelectionProjection() {
            public Long getQuizId() { return quizId; }
            public String getSubmittedAnswer() { return answer; }
            public Long getSelectionCount() { return count; }
        };
    }

    private StudentTimeScoreProjection student(Long id, String name, Double time, Integer score) {
        return new StudentTimeScoreProjection() {
            public Long getStudentId() { return id; }
            public String getStudentName() { return name; }
            public Double getTakesTime() { return time; }
            public Integer getTaskScore() { return score; }
        };
    }
}
