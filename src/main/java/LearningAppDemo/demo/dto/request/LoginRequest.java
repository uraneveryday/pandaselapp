package LearningAppDemo.demo.dto.request;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data @Getter @Setter
public class LoginRequest {
    private String loginId;
    private String password;
}
