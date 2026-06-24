package LearningAppDemo.demo.dto.request;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Data @Getter @Setter
public class LoginRequest {
    @NotBlank
    private String loginId;

    @NotBlank
    @Pattern(regexp = "^[A-Za-z0-9!@$%^&*]{2,64}$", message = "비밀번호는 2자리 이상이며 영문, 숫자, 허용 특수문자만 사용할 수 있습니다.")
    private String password;
}
