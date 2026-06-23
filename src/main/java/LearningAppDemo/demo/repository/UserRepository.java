package LearningAppDemo.demo.repository;

import LearningAppDemo.demo.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    //// 아이디로 사용자 찾기 (Teacher, Student 구분 없이 검색됨)  로그인할때 필요
    Optional<User> findByLoginId(String loginId);

    Optional<User> findByUsername(String username);

    boolean existsByLoginId(String loginId);
}
