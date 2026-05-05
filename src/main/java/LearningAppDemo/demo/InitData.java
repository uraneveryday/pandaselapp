package LearningAppDemo.demo;

import LearningAppDemo.demo.domain.classroom.Classroom;
import LearningAppDemo.demo.domain.task.Task;
import LearningAppDemo.demo.domain.user.Gender;
import LearningAppDemo.demo.domain.user.Role;
import LearningAppDemo.demo.domain.user.Student;
import LearningAppDemo.demo.domain.user.Teacher;
import LearningAppDemo.demo.repository.ClassroomRepository;
import LearningAppDemo.demo.repository.TaskRepository;
import LearningAppDemo.demo.repository.UserRepository;
import LearningAppDemo.demo.service.TaskService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class InitData {

    private final InitService initService;


    // 스프링 서버가 켜질 때 이 메서드가 자동으로 딱 한 번 실행됩니다!
    @PostConstruct
    public void init() {
        initService.dbInit();
    }

    @Component
    @Transactional
    @RequiredArgsConstructor
    static class InitService {

        private final UserRepository userRepository;
        private final ClassroomRepository classRoomRepository;
        private final PasswordEncoder passwordEncoder;
        private final TaskRepository taskRepository;

        public void dbInit() {
            // 이미 데이터가 있으면 중복으로 넣지 않도록 방어
            if (userRepository.count() > 0) return;
            // 2. 자바 코드로 학급 생성
            Classroom classRoom = new Classroom();
            classRoom.setClassName("햇님반");

            // 1. 자바 코드로 선생님 객체 생성 (JPA가 알아서 완벽한 SQL로 변환해 줍니다)
            Teacher teacher = new Teacher();
            teacher.setUsername("테스트선생님");
            teacher.setGender(Gender.FEMALE);
            teacher.setLoginId("test_id");
            String encoded = passwordEncoder.encode("1234");
            teacher.setPassword(encoded);
            teacher.setRole(Role.TEACHER);

            // 1. 자바 코드로 student 객체 생성 (JPA가 알아서 완벽한 SQL로 변환해 줍니다)
            Student student = new Student();
            student.setUsername("baby1");
            student.setGender(Gender.FEMALE);
            student.setLoginId("test1");
            String enc = passwordEncoder.encode("1234");
            student.setPassword(enc);
            student.setRole(Role.STUDENT);
            student.setClassRoom(classRoom);

            // DB에 저장! (부모/자식 테이블 조인 문제 알아서 완벽하게 해결)
            userRepository.save(teacher);
            userRepository.save(student);


            classRoom.setTeacher(teacher); // 💡 아까 만든 선생님 객체를 그대로 연결!
            classRoomRepository.save(classRoom);


            //임의 숙제 생성
            Task task = new Task();
            task.setTaskName("임시 숙제");
            task.setClassRoom(classRoom);
            task.setExpiredDate(LocalDateTime.now().plusDays(7));
            task.setCategory(Task.Category.CHINESE);
            task.setStartDate(LocalDateTime.now());
            task.setGeneratedDate(LocalDateTime.now());
            task.setDescription("임시를 위한것");
            taskRepository.save(task);//임의 숙제 생성

            // DB에 저장!
        }
    }
}