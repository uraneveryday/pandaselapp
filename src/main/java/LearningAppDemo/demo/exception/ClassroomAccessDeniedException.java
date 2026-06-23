package LearningAppDemo.demo.exception;

public class ClassroomAccessDeniedException extends RuntimeException {
    public ClassroomAccessDeniedException() {
        super("해당 클래스룸을 관리할 권한이 없습니다.");
    }
}
