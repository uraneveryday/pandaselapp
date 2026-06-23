package LearningAppDemo.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateClassroomRequest {
    @NotBlank
    @Size(max = 50)
    private String className;

    @Pattern(regexp = "^[0-9]{4}$", message = "반 코드는 숫자 4자리여야 합니다.")
    private String studentLoginCode;
}
