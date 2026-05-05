package LearningAppDemo.demo.dto.response;

import LearningAppDemo.demo.domain.user.Gender;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class SignUpResopnse {

    private Long userId;
    private String message;

}
