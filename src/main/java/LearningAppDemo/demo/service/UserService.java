package LearningAppDemo.demo.service;

import LearningAppDemo.demo.domain.user.User;
import LearningAppDemo.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;

    // 💡 Optional 예외 처리를 서비스 단에서 깔끔하게 해결
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 유저를 찾을 수 없습니다."));
    }
}