package LearningAppDemo.demo.common.authority;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data @AllArgsConstructor
public class TokenInfo {
    private String grantType;// 보통 "Bearer"
    private String accessToken; //실제 Jwt문자열
}