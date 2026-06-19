package LearningAppDemo.demo.service;

import LearningAppDemo.demo.dto.response.data.QuizWrongRateResponse;
import LearningAppDemo.demo.dto.response.data.TaskQuizWrongRateAnalysisResponse;
import LearningAppDemo.demo.repository.QuizResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service @RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskAnalyticsService {

    private final QuizResultRepository quizResultRepository;

    public TaskQuizWrongRateAnalysisResponse getQuizWrongRateAnalysis(Long taskId) {
        List<QuizWrongRateResponse> quizzes = quizResultRepository
                .findQuizWrongRatesByTaskId(taskId)
                .stream()
                .map(QuizWrongRateResponse::from)
                .toList();

        QuizWrongRateResponse hardestQuiz = quizzes.stream()
                .filter(q -> q.totalAttempts() > 0)
                .max(
                        Comparator
                                .comparing(QuizWrongRateResponse::wrongRate)
                                .thenComparing(QuizWrongRateResponse::wrongCount)
                )
                .orElse(null);

        return new TaskQuizWrongRateAnalysisResponse(
                taskId,
                hardestQuiz,
                quizzes
        );
    }
}
