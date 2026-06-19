package LearningAppDemo.demo.service;

import LearningAppDemo.demo.domain.user.Student;
import LearningAppDemo.demo.dto.request.TaskSubmitRequestDto;
import LearningAppDemo.demo.dto.response.CouponUseResponse;
import LearningAppDemo.demo.repository.StudentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service @Transactional(readOnly = true)
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;


    public Long findClassRoomIdByLoginId(String loginId) {
        // 1. Student 타입으로 바로 반환받습니다.
        Student student = studentRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("해당 아이디를 가진 학생을 찾을 수 없습니다: " + loginId));
        // 2. Student 객체이므로 getClassRoom()을 문제없이 호출할 수 있습니다.
        if (student.getClassRoom() == null) {
            return null;
        }
        return student.getClassRoom().getId();
    }
    // 2. JWT 도입 후 권장 방식: PK(Long)로 바로 조회
    // CustomUserDetails가 Long userId를 가지고 있으므로, 컨트롤러에서 바로 Long 값을 넘겨주면 DB 인덱스를 타기 훨씬 효율적입니다.
    public Long findClassRoomIdByStudentId(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("해당 식별자를 가진 학생을 찾을 수 없습니다: " + studentId));

        if (student.getClassRoom() == null) {
            return null;
        }
        return student.getClassRoom().getId();
    }

    public Optional<Student> findStudentByLoginId(String loginId) {
        return studentRepository.findByLoginId(loginId);
    }

    public  Optional<Student> findStudentById(Long userId) {
        return studentRepository.findStudentById((userId));
    }

    @Transactional
    public CouponUseResponse useCoupons(Long classroomId, Long studentId) {
        Student student = studentRepository.findStudentById(studentId)
                .orElseThrow();
        if (student.getClassRoom().getId()!=(classroomId)) {
            throw new EntityNotFoundException("선택한 학생이 해당 classroom에 존재하지 않습니다");
        } else if (student.getCoupon()<=0) {
            throw new IllegalArgumentException("쿠폰이 0개 이하입니다");
        }
        student.setCoupon(student.getCoupon()-1);
        return new CouponUseResponse(student);
    }


        }



