package LearningAppDemo.demo.domain.user;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity @Getter
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "dtype")
@NoArgsConstructor
@Table(name = "users")
@Setter
public abstract class User {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(name = "user_id")
    private Long id; //pk

    private String phoneNumber; //폰 번호

    @Column
    private String username; //

    @Enumerated(EnumType.STRING)
    private Gender gender; //성별

    @Column(unique = true, nullable = false)
    private String loginId; //로그인 시 쓰여질 아이디

    private String password; //비번

    @Enumerated(EnumType.STRING)
    private Role role; //선생님인지 학생인지

    @Column
    private LocalDateTime registerTime; //가입일
}
