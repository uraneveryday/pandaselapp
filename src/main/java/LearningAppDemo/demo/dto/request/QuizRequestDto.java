package LearningAppDemo.demo.dto.request;

import LearningAppDemo.demo.domain.task.Task;
import lombok.Data;

import java.util.List;

@Data
public class QuizRequestDto { //front에서 요청보내는 json

    private Task.Type type; //ox or choose
    private String questionText; //퀴즈 질문 string "다음 중 스프링 부트의 특징이 아닌 것은?"
    private List<String> options; //1~4선지 (CHOOSE일 때만 값이 들어옴)
    private Integer correctAnswer; //정답지 (1~4 또는 O/X)
    private String questImagePath; //이미지 저장 경로

}
