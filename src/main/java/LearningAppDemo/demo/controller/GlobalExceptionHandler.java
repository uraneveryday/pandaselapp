package LearningAppDemo.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import LearningAppDemo.demo.dto.response.ApiErrorResponse;
import LearningAppDemo.demo.exception.DuplicateResourceException;
import LearningAppDemo.demo.exception.InvalidCredentialsException;
import LearningAppDemo.demo.exception.ClassroomAccessDeniedException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice // 프로젝트 전역에서 발생하는 에러를 낚아채는 역할
public class GlobalExceptionHandler {

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiErrorResponse> handleDuplicate(DuplicateResourceException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiErrorResponse(ex.getCode(), ex.getMessage(), ex.getField()));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidCredentials(InvalidCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiErrorResponse("INVALID_CREDENTIALS", ex.getMessage(), null));
    }

    @ExceptionHandler(ClassroomAccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleClassroomAccessDenied(ClassroomAccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiErrorResponse("CLASSROOM_ACCESS_DENIED", ex.getMessage(), null));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiErrorResponse("DUPLICATE_RESOURCE", "이미 사용 중인 값입니다.", null));
    }

    // @Valid 검증 실패 시 발생하는 에러를 잡음
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        // 발생한 에러들 중에서 첫 번째 에러의 메시지만 추출
        String errorMessage = ex.getBindingResult().getAllErrors().get(0).getDefaultMessage();

        // 400 Bad Request 상태 코드와 함께 깔끔한 텍스트 메시지만 반환
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMessage);
    }
}
