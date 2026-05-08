package LearningAppDemo.demo.config;

import LearningAppDemo.demo.common.authority.JwtAuthenticationFilter;
import LearningAppDemo.demo.common.authority.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor // 💡 JwtTokenProvider 주입을 위해 추가
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider; // 💡 필터 생성에 필요

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. 전역 CORS 설정 적용
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. CSRF 비활성화 (JWT 사용 시 필수)
                .csrf(csrf -> csrf.disable())

                // 3. 세션 관리 정책을 STATELESS로 설정 (JWT 인증의 핵심)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .headers(headers -> headers.frameOptions(frame -> frame.disable())) // H2 콘솔용

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/error").permitAll() // 로그인, 회원가입 허용
                        /// /error 일시 허용
                        // 💡 인증이 필요한 API는 authenticated()로 보호
                        .requestMatchers("/api/users/me").authenticated()
                        // 선생님 전용 API들은 "TEACHER" 권한을 가진 토큰만 통과시킴
                        .requestMatchers("/api/teacher/**").hasAuthority("ROLE_TEACHER")
                        // 학생 전용 API 통제
                        .requestMatchers("/api/student/**").hasAuthority("ROLE_STUDENT")
                        .anyRequest().authenticated() // 나머지는 모두 인증 필요
                )

                // 4. 💡 핵심: JwtAuthenticationFilter를 UsernamePasswordAuthenticationFilter 앞에 배치
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 💡 보안을 위해 실제 서비스 시에는 특정 도메인만 허용하는 것이 좋습니다.
        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:3000",
                "http://localhost:5173",
                "https://선생님의-프론트엔드-배포주소.com"));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}