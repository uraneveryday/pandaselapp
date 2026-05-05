package LearningAppDemo.demo.common.authority;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JwtTokenProvider {

    private final String secretKey;
    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 24; // 1일

    public JwtTokenProvider(@Value("${jwt.secret}") String secretKey) {
        this.secretKey = secretKey;
    }

    public SecretKey getKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
    }

    /**
     * JWT 토큰 생성
     */
    public TokenInfo createToken(Authentication authentication) {
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).collect(Collectors.joining(","));
        Date now = new Date();
        Date accessExpiration = new Date(now.getTime() + EXPIRATION_TIME);

        // 💡 [수정됨] 도메인 User로의 위험한 다운캐스팅 제거.
        // 시큐리티 전용 CustomUserDetails에서 안전하게 userId 추출
        Long userId = null;
        if (authentication.getPrincipal() instanceof CustomUserDetails) {
            userId = ((CustomUserDetails) authentication.getPrincipal()).getUserId();
        } else {
            log.error("Principal이 CustomUserDetails 타입이 아닙니다. 인증 로직(UserDetailsService)을 확인하세요.");
            throw new JwtException("토큰 발급 실패: 인증 주체 타입 오류");
        }

        String jwt = Jwts.builder()
                .subject(authentication.getName())
                .claim("auth", authorities)
                .claim("userId", userId) // 추출한 userId 안전하게 삽입
                .issuedAt(now)
                .expiration(accessExpiration)
                .signWith(getKey())
                .compact();

        // 💡 [수정됨] 생성된 JWT 문자열을 담아 반환
        return new TokenInfo("Bearer", jwt);
    }

    /**
     * JWT 토큰 정보 추출
     */
    public Authentication getAuthentication(String jwt) {
        Claims claims = getClaims(jwt);

        // 💡 [수정됨] 예외 누수를 막기 위해 RuntimeException 대신 JwtException 사용
        String auth = Optional.ofNullable(claims.get("auth", String.class))
                .orElseThrow(() -> new JwtException("토큰에 권한 정보가 없습니다."));

        // 💡 [수정됨] Number 변환을 통한 ClassCastException 방지
        Number userIdNumber = claims.get("userId", Number.class);
        if (userIdNumber == null) {
            throw new JwtException("토큰에 userId 정보가 없습니다.");
        }
        Long userId = userIdNumber.longValue();

        Collection<GrantedAuthority> authorities = Arrays.stream(auth.split(","))
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        // 💡 [수정됨] 기본 User 객체 대신, userId를 보관할 수 있는 CustomUserDetails 생성
        // 비밀번호는 토큰에 없으므로 빈 문자열 처리
        CustomUserDetails principal = new CustomUserDetails(claims.getSubject(), "", authorities, userId);

        return new UsernamePasswordAuthenticationToken(principal, jwt, authorities);
    }

    /**
     * 토큰 검증
     */
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            if (e instanceof SecurityException || e instanceof MalformedJwtException) {
                log.debug("잘못된 토큰 구조");
                throw new JwtException("잘못된 토큰 구조입니다.");
            } else if (e instanceof ExpiredJwtException) {
                log.debug("토큰 만료");
                throw new JwtException("만료된 토큰입니다.");
            } else if (e instanceof UnsupportedJwtException) {
                log.debug("지원하지 않는 토큰");
                throw new JwtException("지원하지 않는 형식의 토큰입니다.");
            } else if (e instanceof IllegalArgumentException) {
                log.debug("토큰 인자 오류");
                throw new JwtException("토큰이 비어있거나 잘못되었습니다.");
            } else {
                log.debug("미처리 토큰 검증 오류: " + e.getClass());
                throw new JwtException("토큰 검증 중 알 수 없는 오류 발생");
            }
        }
    }

    private Claims getClaims(String jwt) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(jwt)
                .getPayload();
    }
}