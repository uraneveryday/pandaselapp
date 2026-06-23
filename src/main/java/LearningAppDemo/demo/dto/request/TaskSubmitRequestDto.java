package LearningAppDemo.demo.dto.request;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TaskSubmitRequestDto {

    // 프론트엔드에서 타이머를 돌려 측정하거나 시작/종료 버튼을 누른 시간
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // 학생이 제출한 개별 답안 리스트
    private List<QuizSubmitDto> answers;

    @Data
    public static class QuizSubmitDto {
        private Long quizId; // 어떤 문제인지 반드시 PK가 필요함!
        private String submittedAnswer; // 학생이 고른 답 (예: "0", "1", "O", "X" 등)
        private boolean dontKnow; // 답 대신 "모른다"를 선택했는지 여부
    }

}
