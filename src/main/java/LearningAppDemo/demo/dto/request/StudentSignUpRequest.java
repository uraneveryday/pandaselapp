package LearningAppDemo.demo.dto.request;

import LearningAppDemo.demo.domain.user.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class StudentSignUpRequest {

    @NotBlank
    private String studentName;

    @NotBlank
    @Pattern(regexp = "^[A-Za-z0-9_]{1,20}$", message = "학생 아이디는 영문, 숫자, _만 사용할 수 있습니다.")
    private String studentLoginId;

    @NotBlank
    @Pattern(regexp = "^[A-Za-z0-9!@$%^&*]{2,64}$", message = "비밀번호는 2자리 이상이며 영문, 숫자, 허용 특수문자만 사용할 수 있습니다.")
    private String studentPassword;

    private Gender gender; //studentGender

    private String phoneNumber; //parent's
}
