package LearningAppDemo.demo.dto.request;

import LearningAppDemo.demo.domain.user.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SignUpRequest {


    @NotBlank
    @Pattern(regexp = "^[a-zA-Z0-9_]{5,20}$", message = "영문, 숫자, _만을 사용하세요")
    private String userId; //필수

    @NotBlank @Pattern(regexp = "^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@$%^&*])[a-zA-Z0-9!@$%^&*]{8,20}$",
            message = "영문, 숫자, 특수문자를 포함한 8~20자리로 입력해주세요. " +
                    "비밀번호는 암호화 되어 저장되므로 사이트 관리자는 절대 알 수 없습니다. " +
                    "분실 시, 관리자에게 문의하세요.")
    private String password; //필수

    @NotBlank
    private String name; //필수

    @NotBlank
    @Email(message = "이메일 형식을 확인하세요")
    private String email; //필수

    private Gender gender; // 선택
    private String phoneNumber; //선택

}
