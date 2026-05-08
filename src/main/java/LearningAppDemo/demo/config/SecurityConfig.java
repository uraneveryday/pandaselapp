package LearningAppDemo.demo.config;

import LearningAppDemo.demo.common.authority.JwtAuthenticationFilter;
import LearningAppDemo.demo.common.authority.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. 시큐리티 내부의 CORS는 끕니다. (아래에서 만든 전역 필터가 문 앞에서 다 처리함)
                .cors(cors -> cors.disable())

                // 2. CSRF 비활성화 (JWT 사용 시 필수)
                .csrf(csrf -> csrf.disable())

                // 3. 세션 관리 정책 STATELESS
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers.frameOptions(frame -> frame.disable())) // H2 콘솔용

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**", "/error").permitAll()
                        .requestMatchers("/api/users/me").authenticated()
                        .requestMatchers("/api/teacher/**").hasAuthority("ROLE_TEACHER")
                        .requestMatchers("/api/student/**").hasAuthority("ROLE_STUDENT")
                        .anyRequest().authenticated()
                )
                // 4. JWT 필터 배치
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 💡 중복 제거의 핵심: 오직 이 필터 하나만 남겨서 문지기로 세웁니다.
    @Bean
    public FilterRegistrationBean<org.springframework.web.filter.CorsFilter> globalCorsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        // @Value 파싱 에러를 원천 차단하기 위해 List.of 로 명확히 지정
        config.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:5173",
                "https://pandasel-app.netlify.app"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        FilterRegistrationBean<org.springframework.web.filter.CorsFilter> bean =
                new FilterRegistrationBean<>(new org.springframework.web.filter.CorsFilter(source));

        // 🚨 핵심: 모든 시큐리티 필터보다 무조건 가장 먼저 실행되도록 순서 1위 강제 할당!
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }
}