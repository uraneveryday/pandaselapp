package LearningAppDemo.demo.dto.response;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;

import java.util.List;

@Data
public class TaskDetailDashboardDto {

    // 1. Task 전체 통계
    private double completionRate; // 완료율 (예: 85.5)
    private double averageTime;    // 평균 소요 시간 (분 단위 등)
    private int totalStudents;     // 전체 학생 수
    private int completedStudents; // 완료한 학생 수

    // 2. 문항별 통계 리스트
    private List<QuizStatDto> quizStats;

    @Getter
    @Builder
    public static class QuizStatDto {
        private int quizNum;         // 문항 번호 (1, 2, 3...)
        private double correctRate;  // 정답률 (예: 60.0%)
        private int totalAttempts;   // 푼 사람 수
        private int correctAttempts; // 맞춘 사람 수
    }
}
