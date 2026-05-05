package LearningAppDemo.demo.dto.response;


import lombok.AllArgsConstructor;
import lombok.Getter;


@AllArgsConstructor @Getter
public class LoginResponse {
    private String role; // TEACHER or STUDENT
    private String name;
    private int hasStamp;
}
