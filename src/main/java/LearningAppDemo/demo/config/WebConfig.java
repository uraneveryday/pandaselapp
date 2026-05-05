package LearningAppDemo.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 모든 경로에 대해
                .allowedOrigins("http://localhost:3000") // 리액트 앱 허용
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // OPTIONS (Preflight) 반드시 포함
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600); // Preflight 캐시 시간 (1시간)
    }
}
