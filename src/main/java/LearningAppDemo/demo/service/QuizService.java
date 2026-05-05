package LearningAppDemo.demo.service;

import LearningAppDemo.demo.domain.task.Task;
import LearningAppDemo.demo.domain.task.Quiz;
import LearningAppDemo.demo.dto.request.QuizRequestDto;
import LearningAppDemo.demo.dto.response.QuizDetailResponse;
import LearningAppDemo.demo.dto.response.QuizzesResponse;
import LearningAppDemo.demo.dto.response.TaskQuizDetailResponse;
import LearningAppDemo.demo.repository.QuizRepository;
import LearningAppDemo.demo.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service @RequiredArgsConstructor @Transactional(readOnly = true)
public class QuizService {


    private final TaskRepository taskRepository;
    private final QuizRepository quizRepository;


    @Transactional
    public void createQuiz(QuizRequestDto request, Long taskId) {
        Quiz quiz = new Quiz();
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("해당 Task를 찾을 수 없습니다. ID: " + taskId));


        quiz.setCategory(task.getCategory());
        quiz.setTask(task);
        quiz.setType(request.getType());
        quiz.setQuestionText(request.getQuestionText());
        quiz.setCorrectAnswer(request.getCorrectAnswer());
        quiz.setQuestImagePath(request.getQuestImagePath());
        quiz.setOptions(request.getOptions());
        quiz.setQuizNum(countQuizzes(taskId) + 1);
        quizRepository.save(quiz);

    }

    private int countQuizzes(Long taskId) {
        int count = 0;
        List<Quiz> allByTaskId = quizRepository.findAllByTaskId(taskId);
        for (Quiz quiz : allByTaskId) {
            count++;
        }

        return count;
    }

    @Transactional
    public void updateQuiz(Long quizId, QuizRequestDto updateDto) {
        Quiz quiz = quizRepository.findQuizById(quizId);
        updateAll(quiz,updateDto);
    }

    private void updateAll(Quiz quiz, QuizRequestDto updateDto) {
        quiz.setType(updateDto.getType());
        quiz.setQuestionText(updateDto.getQuestionText());
        quiz.setOptions(updateDto.getOptions());
        quiz.setCorrectAnswer(updateDto.getCorrectAnswer());
        quiz.setQuestImagePath(updateDto.getQuestImagePath());
    }

    @Transactional
    public void deleteQuiz(Long quizId) {
        quizRepository.deleteById(quizId);
    }

    public Quiz findQuizById(Long QuizId) {
        return null;
    }

    public List<QuizzesResponse> getQuizzesForTask(Long classroomId, Long taskId) {
        // 1. Fetch Join으로 데이터 한 번에 조회
        Task task = taskRepository.findTaskWithQuizzesById(taskId)
                .orElseThrow(() -> {
                    log.error("There is no task with id: {}", taskId);
                    return new IllegalArgumentException("존재하지 않는 task입니다."); // 커스텀 예외 권장
                });

        // 2. 보안 검증: 해당 Task가 요청된 Classroom에 속해 있는지 반드시 확인해야 합니다.
        // (Task 엔티티에 Classroom 연관관계가 있다고 가정)
        if (!task.getClassRoom().getId().equals(classroomId)) {
            log.error("Task {} does not belong to Classroom {}", taskId, classroomId);
            throw new SecurityException("해당 클래스룸의 과제가 아닙니다.");
        }

        // 3. 엔티티 -> DTO 변환 (Stream API 활용)
        // Service 계층(트랜잭션 내부)에서 지연 로딩/DTO 변환이 모두 끝나므로 안전함
        return task.getQuizzes().stream()
                .map(QuizzesResponse::new)
                .collect(Collectors.toList());
    }

    public List<TaskQuizDetailResponse> getQuizzesForTaskStudent(Long classroomId, Long taskId) {
        // 1. Fetch Join으로 데이터 한 번에 조회
        Task task = taskRepository.findTaskWithQuizzesById(taskId)
                .orElseThrow(() -> {
                    log.error("There is no task with id: {}", taskId);
                    return new IllegalArgumentException("존재하지 않는 task입니다."); // 커스텀 예외 권장
                });

        // 2. 보안 검증: 해당 Task가 요청된 Classroom에 속해 있는지 반드시 확인해야 합니다.
        // (Task 엔티티에 Classroom 연관관계가 있다고 가정)
        if (!task.getClassRoom().getId().equals(classroomId)) {
            log.error("Task {} does not belong to Classroom {}", taskId, classroomId);
            throw new SecurityException("해당 클래스룸의 과제가 아닙니다.");
        }

        // 3. 엔티티 -> DTO 변환 (Stream API 활용)
        // Service 계층(트랜잭션 내부)에서 지연 로딩/DTO 변환이 모두 끝나므로 안전함
        return task.getQuizzes().stream()
                .map(TaskQuizDetailResponse::new)
                .collect(Collectors.toList());
    }

    public QuizDetailResponse getQuizDetailResponse(Long quizId) {
        Quiz quiz = quizRepository.findQuizById(quizId);
        return new QuizDetailResponse(quiz);
    }
}

