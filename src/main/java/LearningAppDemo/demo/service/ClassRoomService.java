package LearningAppDemo.demo.service;

import LearningAppDemo.demo.domain.classroom.Classroom;
import LearningAppDemo.demo.domain.user.Student;
import LearningAppDemo.demo.domain.user.Teacher;
import LearningAppDemo.demo.exception.ClassroomAccessDeniedException;
import LearningAppDemo.demo.dto.response.ClassroomDetailResponse;
import LearningAppDemo.demo.dto.response.ClassroomListResponse;
import LearningAppDemo.demo.dto.response.TaskListItemResponse;
import LearningAppDemo.demo.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ClassRoomService {

    // 타입명은 대문자로 시작해야 하므로 ClassRoomRepository 또는 ClassroomRepository 로 수정해야 합니다.
    // (본인의 Repository 클래스명에 맞게 대소문자를 맞춰주세요)
    private final ClassroomRepository classRoomRepository;
    private final TeacherRepository teacherRepository;
    private final TaskRepository taskRepository;
    private final StudentRepository studentRepository;
    private final TaskResultRepository taskResultRepository;

    public List<ClassroomListResponse> getClassroomsByTeacherId(Long teacherId) {
        List<Classroom> classrooms = classRoomRepository.findByTeacherId(teacherId);

        // stream의 map 안에서 직접 헬퍼 메서드를 호출하여 리스트 반환
        return classrooms.stream()
                .map(ClassroomListResponse::new)
                .toList();
    }


    @Transactional
    public void createClassroom(String classroomName, String studentLoginCode, Long userId) {

        Teacher teacher = teacherRepository.findTeacherById(userId)
                        .orElseThrow(() -> new IllegalArgumentException("선생님 정보를 찾을 수 없습니다."));
        Classroom classroom = new Classroom();
        classroom.setClassName(classroomName.trim());
        if (classRoomRepository.existsByStudentLoginCode(studentLoginCode)) {
            throw new LearningAppDemo.demo.exception.DuplicateResourceException(
                    "studentLoginCode", "CLASS_CODE_ALREADY_EXISTS", "이미 사용 중인 반 코드입니다.");
        }
        classroom.setStudentLoginCode(studentLoginCode);
        classroom.setCreateDate(LocalDateTime.now());
        classroom.setTeacher(teacher);

        classRoomRepository.save(classroom);
    }

    public ClassroomListResponse getClassroomForEdit(Long classroomId, Long teacherId) throws AccessDeniedException {
        Classroom classroom = getClassroomOwnedByTeacher(classroomId, teacherId);

        // 여기서도 기존의 new ClassroomResponse(classroom) 대신 헬퍼 메서드 사용
        return new ClassroomListResponse(classroom);
    }





    @Transactional
    public ClassroomDetailResponse getInfo(Long classroomId) {
        Classroom classrooms = classRoomRepository.findById(classroomId)
                .orElseThrow();
        return new ClassroomDetailResponse(classrooms);
    }

    @Transactional
    public ClassroomDetailResponse getInfoForTeacher(Long classroomId, Long teacherId) {
        return new ClassroomDetailResponse(getClassroomOwnedByTeacher(classroomId, teacherId));
    }

    public Classroom getClassroomOwnedByTeacher(Long classroomId, Long teacherId) {
        Classroom classroom = classRoomRepository.findById(classroomId)
                .orElseThrow(() -> new EntityNotFoundException("해당 클래스룸이 존재하지 않습니다."));
        if (classroom.getTeacher() == null || !classroom.getTeacher().getId().equals(teacherId)) {
            throw new ClassroomAccessDeniedException();
        }
        return classroom;
    }

    public Long getClassroomIdByStudentId(Long userId) {
        Optional<Student> student = studentRepository.findById(userId);
        return student.orElseThrow().getClassRoom().getId();
    }

    public List<TaskListItemResponse> getTasksList(Long classroomId) {

        List<TaskListItemResponse> list = new ArrayList<>();

        taskRepository.findByClassRoom_Id(classroomId)
                .forEach(task -> {
                    list.add(
                            new TaskListItemResponse(task.getId(), task.getTaskName(), task.isDone())
                    );

                });

        return list;
    }
}
