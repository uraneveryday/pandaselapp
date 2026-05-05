package LearningAppDemo.demo.dto.request;

import LearningAppDemo.demo.domain.user.Gender;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StudentSignUpRequest {

    @NotBlank
    private String studentName;

    @NotBlank
    private String studentLoginId;

    @NotBlank
    private String studentPassword;

    private Gender gender; //studentGender

    private String phoneNumber; //parent's
}
