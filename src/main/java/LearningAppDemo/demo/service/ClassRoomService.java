package LearningAppDemo.demo.service;

import LearningAppDemo.demo.domain.classroom.Classroom;
import LearningAppDemo.demo.domain.user.Student;
import LearningAppDemo.demo.domain.user.Teacher;
import LearningAppDemo.demo.domain.user.User;
import LearningAppDemo.demo.dto.TaskDto;
import LearningAppDemo.demo.dto.response.ClassroomInfoResponse;
import LearningAppDemo.demo.dto.response.ClassroomListResponse;
import LearningAppDemo.demo.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ClassRoomService {

    // 타입명은 대문자로 시작해야 하므로 ClassRoomRepository 또는 ClassroomRepository 로 수정해야 합니다.
    // (본인의 Repository 클래스명에 맞게 대소문자를 맞춰주세요)
    private final ClassroomRepository classRoomRepository;
    private final TeacherRepository teacherRepository;
    private final StudentTaskRepository studentTaskRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TaskResultRepository taskResultRepository;

    public List<ClassroomListResponse> getClassroomsByTeacherId(Long teacherId) {
        List<Classroom> classrooms = classRoomRepository.findByTeacherId(teacherId);

        // stream의 map 안에서 직접 헬퍼 메서드를 호출하여 리스트 반환
        return classrooms.stream()
                .map(this::convertToResponseWithStats)
                .collect(Collectors.toList());
    }


    @Transactional
    public void createClassroom(String classroomName, Long userId) {

        Teacher teacher = teacherRepository.findTeacherById(userId)
                        .orElseThrow(() -> new IllegalArgumentException("선생님 정보를 찾을 수 없습니다."));
        Classroom classroom = new Classroom();
        classroom.setClassName(classroomName.trim());
        classroom.setCreateDate(LocalDateTime.now());
        classroom.setTeacher(teacher);

        classRoomRepository.save(classroom);
    }

    public ClassroomListResponse getClassroomForEdit(Long classroomId, Long teacherId) throws AccessDeniedException {
        Classroom classroom = classRoomRepository.findById(classroomId)
                .orElseThrow(() -> new EntityNotFoundException("해당 클래스룸이 존재하지 않습니다."));

        if (!classroom.getTeacher().getId().equals(teacherId)) {
            throw new AccessDeniedException("해당 클래스룸을 관리할 권한이 없습니다.");
        }

        // 여기서도 기존의 new ClassroomResponse(classroom) 대신 헬퍼 메서드 사용
        return convertToResponseWithStats(classroom);
    }


    private ClassroomListResponse convertToResponseWithStats(Classroom classroom) {

        List<TaskDto> taskDtos = classroom.getTasks().stream()
                .map(task -> {
                    int total = classroom.studentCount();
//                    int completed = (int) studentTaskRepository.countByTaskIdAndIsCompletedTrue(task.getId());
                    int completed = taskResultRepository.studentsCompleted(task.getId());
                    return new TaskDto(task, total, completed);
                })
                .toList();

        return new ClassroomListResponse(classroom, taskDtos);
    }


    public ClassroomInfoResponse getInfo(Long classroomId) {
        Classroom classrooms = classRoomRepository.findClassroomById(classroomId);
        return new ClassroomInfoResponse(classrooms);
    }

    public Long getClassroomIdByStudentId(Long userId) {
        Optional<Student> student = studentRepository.findById(userId);
        return student.orElseThrow().getClassRoom().getId();
    }
}