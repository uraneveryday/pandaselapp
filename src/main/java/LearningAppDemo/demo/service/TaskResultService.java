package LearningAppDemo.demo.service;

import LearningAppDemo.demo.domain.task.Quiz;
import LearningAppDemo.demo.domain.task.QuizResult;
import LearningAppDemo.demo.domain.task.Task;
import LearningAppDemo.demo.domain.task.TaskResult;
import LearningAppDemo.demo.domain.user.Student;
import LearningAppDemo.demo.dto.request.TaskSubmitRequestDto;
import LearningAppDemo.demo.repository.QuizRepository;
import LearningAppDemo.demo.repository.StudentRepository;
import LearningAppDemo.demo.repository.TaskRepository;
import LearningAppDemo.demo.repository.TaskResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service @Transactional(readOnly = true)
@RequiredArgsConstructor
public class TaskResultService {


    private final TaskResultRepository taskResultRepository;
    private final TaskRepository taskRepository;
    private final StudentRepository studentRepository;
    private final QuizRepository quizRepository;

    @Transactional
    public void submit(Long studentId, Long taskId, TaskSubmitRequestDto request) {

        if (taskResultRepository.existsByTaskIdAndStudentId(taskId,studentId))
            throw new IllegalStateException("이미 제출완료한 과제입니다");

        Task task = taskRepository.findById(taskId).orElseThrow();
        Student student = studentRepository.findStudentById(studentId).orElseThrow();


        //takes time 계산
        LocalDateTime startTime = request.getStartTime();
        LocalDateTime endTime = request.getEndTime();
        long seconds = Duration.between(startTime, endTime).getSeconds();

        int rewardStamp = task.getRewardStamp(); //숙제의 스탬프 부여된거 가져오기
        student.setStamp(rewardStamp + student.getStamp()); // 스탬프 더하기

        TaskResult taskResult = new TaskResult();

        taskResult.setTask(task);
        taskResult.setStudent(student);
        taskResult.setCompleted(true);
        taskResult.setStartTime(request.getStartTime());
        taskResult.setEndTime(request.getEndTime());
        taskResult.setTakesTime(seconds);




        int correctCount=0;

        for (TaskSubmitRequestDto.QuizSubmitDto answerDto : request.getAnswers()) {
            // 실제 퀴즈 데이터 조회
            Quiz quiz = quizRepository.findById(answerDto.getQuizId()).orElseThrow();

            QuizResult quizResult = new QuizResult();
            quizResult.setQuiz(quiz);
            quizResult.setSubmittedAnswer(answerDto.getSubmittedAnswer());

            // ⭐️ 핵심: 서버에서 직접 채점! (String 변환 후 비교 등 로직 필요)
            boolean isCorrect = quiz.getCorrectAnswer().toString().equals(answerDto.getSubmittedAnswer());
            quizResult.setCorrect(isCorrect);

            if (isCorrect) correctCount++;

            // 연관관계 편의 메서드로 부모(TaskResult)에 자식(QuizResult) 추가
            taskResult.addQuizResult(quizResult);
        }
        int totalQuizzes = task.getQuizzes().size();
        int score = (int) Math.round(((double) correctCount / totalQuizzes) * 100);
        taskResult.setTaskScore(score);

        // 6. DB 저장 (Cascade 옵션 덕분에 TaskResult만 save해도 QuizResult N개가 한 번에 저장됨)
        taskResultRepository.save(taskResult);
    }


    public double getAverageTakesTime(Long taskId) {
        return taskResultRepository.averageTakesTimeByTaskId(taskId);
    }
}
