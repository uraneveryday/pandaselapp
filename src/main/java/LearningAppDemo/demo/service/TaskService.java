package LearningAppDemo.demo.service;

import LearningAppDemo.demo.domain.classroom.Classroom;
import LearningAppDemo.demo.domain.task.Task;
import LearningAppDemo.demo.domain.user.Role;
import LearningAppDemo.demo.domain.user.User;
import LearningAppDemo.demo.dto.response.TaskDto;
import LearningAppDemo.demo.dto.request.CreateTaskRequest;
import LearningAppDemo.demo.exception.FaildToValidate;
import LearningAppDemo.demo.repository.*;
import LearningAppDemo.demo.dto.TaskUpdateDto;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ClassroomRepository classRoomRepository;
    private final StudentTaskRepository studentTaskRepository;
    private final TeacherRepository teacherRepository;
    private final TaskResultRepository taskResultRepository;


    public Long createTask(CreateTaskRequest createTaskRequest,Long userId) {

        Task task = new Task();
        // 1. 유저 및 학급 검증, 그리고 학급 엔티티 가져오기
        Classroom classRoom = validateAndGetClassRoom(userId, createTaskRequest.getClassRoomId());
        // 2. ⭐️ 연관관계 세팅 (이 숙제가 어느 반 것인지 DB에 알려주기 위함)
        task.setClassRoom(classRoom);
        task.setRewardStamp(createTaskRequest.getReward());
        task.setTaskName(createTaskRequest.getTaskName());
        task.setDescription(createTaskRequest.getDescription());
        task.setCategory(createTaskRequest.getCategory());
        task.setExpiredDate(createTaskRequest.getEndDate());
        task.setStartDate(createTaskRequest.getStartDate());
        task.setGeneratedDate(LocalDateTime.now());
        // 3. DB 저장
        taskRepository.save(task);

        // 4. 저장된 숙제의 ID 리턴
        return task.getId();
    }

    private Classroom validateAndGetClassRoom(Long teacherId, Long classRoomId) {
        // 1. 선생님 검증 (orElseThrow로 값이 없으면 즉시 에러 발생)
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> {
                    log.error("유저가 존재하지 않습니다. teacherId: {}", teacherId);
                    return new FaildToValidate("존재하지 않는 유저입니다.");
                });

        if (teacher.getRole() != Role.TEACHER) {
            log.error("선생님 권한이 없습니다. userId: {}", teacherId);
            throw new FaildToValidate("선생님 권한이 없습니다.");
        }

        // 2. 학급 검증 및 리턴
        return classRoomRepository.findById(classRoomId)
                .orElseThrow(() -> {
                    log.error("학급이 존재하지 않습니다. classRoomId: {}", classRoomId);
                    return new FaildToValidate("존재하지 않는 학급입니다.");
                });
    }


    public List<Task> findTasksByClassRoomForStudent(Long studentId , Long classRoomId) {
        List<Task> tasks = taskRepository.findByClassRoom_Id(classRoomId);
        List<Task> notyetTasks = new ArrayList<>();
        for (Task task : tasks) {
            if (!taskResultRepository.existsByTaskIdAndStudentId(task.getId(), studentId))
                notyetTasks.add(task);
        }
        return notyetTasks;
    }



    public void updateTask(Long taskId, TaskUpdateDto updateDto) {

    }


    @Transactional
    public void deleteTask(Long classroomId, Long taskId, Long userId) {
        Classroom classroom = classRoomRepository.findClassroomById(classroomId);
        if (!classroom.getTeacher().equals(teacherRepository.getById(userId))) {
            throw new IllegalStateException("유효하지않은 반과 선생");
        }

        taskRepository.deleteById(taskId);
    }


    public Task findTaskById(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> {
                    log.error("there is no task with id: {}", taskId);
                    return new FaildToValidate("존재하지않는 task");
                });

    }



    @Transactional
    public List<TaskDto> getTaskListWithCompletionRate(Long classRoomId) {

        // 1. 해당 반의 전체 숙제 엔티티 목록을 가져옵니다.
        List<Task> tasks = taskRepository.findByClassRoom_Id(classRoomId);

        // 2. Stream을 사용하여 각 Task 엔티티를 TaskDto로 변환합니다.
        return tasks.stream().map(task -> {

            // 3. StudentTask 테이블(레포지토리)에 쿼리를 날려 전체/완료 학생 수를 구합니다.
            int totalCount = (int) studentTaskRepository.countByTaskId(task.getId());
            int completedCount = (int) studentTaskRepository.countByTaskIdAndIsCompletedTrue(task.getId());

            // 4. 완성해두신 DTO 생성자에 변수 3개를 딱 맞게 넣어줍니다.
            return new TaskDto(task, totalCount, completedCount);

        }).toList(); // 최종적으로 List<TaskDto> 형태로 반환


    }


    @Transactional
    public void completeTask(Long taskId) {

        Task task = taskRepository.findById(taskId).orElseThrow( () -> new EntityNotFoundException("숙제를 찾을 수 없습니다"));
        task.setDone(true);
    }
}
