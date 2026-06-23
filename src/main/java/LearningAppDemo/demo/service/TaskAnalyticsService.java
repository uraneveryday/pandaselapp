package LearningAppDemo.demo.service;

import LearningAppDemo.demo.domain.task.Quiz;
import LearningAppDemo.demo.domain.task.Task;
import LearningAppDemo.demo.dto.response.data.AnswerChoiceAnalysisResponse;
import LearningAppDemo.demo.dto.response.data.QuizLearningAnalysisResponse;
import LearningAppDemo.demo.dto.response.data.QuizWrongRateResponse;
import LearningAppDemo.demo.dto.response.data.StudentTimeScoreResponse;
import LearningAppDemo.demo.dto.response.data.TaskLearningAnalyticsResponse;
import LearningAppDemo.demo.dto.response.data.TaskQuizWrongRateAnalysisResponse;
import LearningAppDemo.demo.dto.response.data.TimeScoreAnalysisResponse;
import LearningAppDemo.demo.dto.response.data.TimeScoreQuadrantResponse;
import LearningAppDemo.demo.repository.QuizAnswerSelectionProjection;
import LearningAppDemo.demo.repository.QuizLearningAnalysisProjection;
import LearningAppDemo.demo.repository.QuizRepository;
import LearningAppDemo.demo.repository.QuizResultRepository;
import LearningAppDemo.demo.repository.StudentTimeScoreProjection;
import LearningAppDemo.demo.repository.TaskResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskAnalyticsService {

    private final QuizResultRepository quizResultRepository;
    private final QuizRepository quizRepository;
    private final TaskResultRepository taskResultRepository;

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

    public TaskLearningAnalyticsResponse getLearningAnalytics(Long taskId) {
        Map<Long, Quiz> quizzesById = quizRepository.findAllByTaskId(taskId).stream()
                .collect(Collectors.toMap(Quiz::getId, Function.identity()));
        Map<Long, List<QuizAnswerSelectionProjection>> selectionsByQuizId = quizResultRepository
                .findAnswerSelectionsByTaskId(taskId)
                .stream()
                .collect(Collectors.groupingBy(QuizAnswerSelectionProjection::getQuizId));

        List<QuizLearningAnalysisResponse> quizzes = quizResultRepository
                .findLearningAnalysisByTaskId(taskId)
                .stream()
                .map(projection -> toQuizLearningAnalysis(
                        projection,
                        quizzesById.get(projection.getQuizId()),
                        selectionsByQuizId.getOrDefault(projection.getQuizId(), List.of())))
                .toList();

        return new TaskLearningAnalyticsResponse(taskId, quizzes, getTimeScoreAnalysis(taskId));
    }

    private QuizLearningAnalysisResponse toQuizLearningAnalysis(
            QuizLearningAnalysisProjection projection,
            Quiz quiz,
            List<QuizAnswerSelectionProjection> selections) {
        long totalAttempts = number(projection.getTotalAttempts());
        long correctCount = number(projection.getCorrectCount());
        long wrongCount = number(projection.getWrongCount());
        long dontKnowCount = number(projection.getDontKnowCount());

        return new QuizLearningAnalysisResponse(
                projection.getQuizId(),
                projection.getQuizNum(),
                projection.getQuestionText(),
                totalAttempts,
                correctCount,
                wrongCount,
                dontKnowCount,
                rate(correctCount, totalAttempts),
                rate(wrongCount, totalAttempts),
                rate(dontKnowCount, totalAttempts),
                toAnswerChoices(quiz, selections, totalAttempts));
    }

    private List<AnswerChoiceAnalysisResponse> toAnswerChoices(
            Quiz quiz,
            List<QuizAnswerSelectionProjection> selections,
            long totalAttempts) {
        if (quiz == null) return List.of();

        Map<String, Long> selectedCounts = selections.stream()
                .collect(Collectors.toMap(
                        QuizAnswerSelectionProjection::getSubmittedAnswer,
                        value -> number(value.getSelectionCount()),
                        Long::sum));
        List<String> answerValues = new ArrayList<>(availableAnswerValues(quiz));
        selectedCounts.keySet().stream()
                .filter(value -> !answerValues.contains(value))
                .forEach(answerValues::add);

        long maxWrongSelections = answerValues.stream()
                .filter(value -> !isCorrectAnswer(quiz, value))
                .filter(value -> !value.isBlank())
                .mapToLong(value -> selectedCounts.getOrDefault(value, 0L))
                .max()
                .orElse(0L);

        return answerValues.stream()
                .map(value -> {
                    long count = selectedCounts.getOrDefault(value, 0L);
                    boolean correct = isCorrectAnswer(quiz, value);
                    boolean mostCommonWrong = !correct && !value.isBlank()
                            && count > 0 && count == maxWrongSelections;
                    return new AnswerChoiceAnalysisResponse(
                            value,
                            answerLabel(quiz, value),
                            count,
                            rate(count, totalAttempts),
                            correct,
                            mostCommonWrong);
                })
                .toList();
    }

    private List<String> availableAnswerValues(Quiz quiz) {
        if (quiz.getType() == Task.Type.OX) return List.of("0", "1");
        if (quiz.getOptions() == null) return List.of();
        List<String> values = new ArrayList<>();
        for (int index = 0; index < quiz.getOptions().size(); index++) {
            values.add(String.valueOf(index));
        }
        return values;
    }

    private boolean isCorrectAnswer(Quiz quiz, String answerValue) {
        return quiz.getCorrectAnswer().equals(answerValue);
    }

    private String answerLabel(Quiz quiz, String answerValue) {
        if (answerValue == null || answerValue.isBlank()) return "미응답";
        if (quiz.getType() == Task.Type.OX) {
            if ("0".equals(answerValue)) return "O";
            if ("1".equals(answerValue)) return "X";
        }
        try {
            int index = Integer.parseInt(answerValue);
            if (quiz.getOptions() != null && index >= 0 && index < quiz.getOptions().size()) {
                return (index + 1) + ". " + quiz.getOptions().get(index);
            }
        } catch (NumberFormatException ignored) {
            // 기존 데이터가 인덱스 형식이 아닐 수 있으므로 원본 값을 표시한다.
        }
        return answerValue;
    }

    private TimeScoreAnalysisResponse getTimeScoreAnalysis(Long taskId) {
        List<StudentTimeScoreProjection> students = taskResultRepository.findTimeScoreByTaskId(taskId);
        double medianTime = median(students.stream().map(StudentTimeScoreProjection::getTakesTime).toList());
        double medianScore = median(students.stream()
                .map(value -> value.getTaskScore() == null ? null : value.getTaskScore().doubleValue())
                .toList());

        List<StudentTimeScoreResponse> responses = students.stream()
                .map(student -> new StudentTimeScoreResponse(
                        student.getStudentId(),
                        student.getStudentName(),
                        student.getTakesTime(),
                        student.getTaskScore(),
                        quadrant(student, medianTime, medianScore)))
                .toList();

        Map<String, Long> quadrantCounts = responses.stream()
                .collect(Collectors.groupingBy(StudentTimeScoreResponse::quadrant, Collectors.counting()));
        List<TimeScoreQuadrantResponse> quadrants = List.of(
                "FAST_HIGH_SCORE", "SLOW_HIGH_SCORE", "FAST_LOW_SCORE", "SLOW_LOW_SCORE")
                .stream()
                .map(quadrant -> new TimeScoreQuadrantResponse(quadrant, quadrantCounts.getOrDefault(quadrant, 0L)))
                .toList();

        return new TimeScoreAnalysisResponse(
                (long) students.size(),
                round(medianTime),
                round(medianScore),
                quadrants,
                responses);
    }

    private String quadrant(StudentTimeScoreProjection student, double medianTime, double medianScore) {
        boolean fast = student.getTakesTime() < medianTime;
        boolean highScore = student.getTaskScore() >= medianScore;
        if (fast && highScore) return "FAST_HIGH_SCORE";
        if (!fast && highScore) return "SLOW_HIGH_SCORE";
        if (fast) return "FAST_LOW_SCORE";
        return "SLOW_LOW_SCORE";
    }

    private double median(List<Double> values) {
        List<Double> sorted = values.stream()
                .filter(value -> value != null)
                .sorted()
                .toList();
        if (sorted.isEmpty()) return 0;
        int middle = sorted.size() / 2;
        return sorted.size() % 2 == 0
                ? (sorted.get(middle - 1) + sorted.get(middle)) / 2
                : sorted.get(middle);
    }

    private long number(Long value) {
        return value == null ? 0L : value;
    }

    private double rate(long count, long total) {
        return total == 0 ? 0 : round(count * 100.0 / total);
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
