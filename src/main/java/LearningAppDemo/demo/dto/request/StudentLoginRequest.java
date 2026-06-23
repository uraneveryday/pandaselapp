package LearningAppDemo.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class StudentLoginRequest {
    @Pattern(regexp = "^[0-9]{4}$", message = "반 코드는 숫자 4자리여야 합니다.")
    private String classCode;

    @Pattern(regexp = "^[A-Za-z0-9_]{1,20}$", message = "학생 아이디는 영문, 숫자, _만 사용할 수 있습니다.")
    private String studentLoginId;

    @NotBlank
    @Pattern(regexp = "^[A-Za-z0-9!@$%^&*]{4,64}$", message = "비밀번호는 영문, 숫자, 허용 특수문자만 사용할 수 있습니다.")
    private String password;
}
