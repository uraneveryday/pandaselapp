package LearningAppDemo.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice // 프로젝트 전역에서 발생하는 에러를 낚아채는 역할
public class GlobalExceptionHandler {

    // @Valid 검증 실패 시 발생하는 에러를 잡음
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        // 발생한 에러들 중에서 첫 번째 에러의 메시지만 추출
        String errorMessage = ex.getBindingResult().getAllErrors().get(0).getDefaultMessage();

        // 400 Bad Request 상태 코드와 함께 깔끔한 텍스트 메시지만 반환
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMessage);
    }
}