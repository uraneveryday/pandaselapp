package LearningAppDemo.demo.exception;

import lombok.Getter;

@Getter
public class DuplicateResourceException extends RuntimeException {
    private final String field;
    private final String code;

    public DuplicateResourceException(String field, String code, String message) {
        super(message);
        this.field = field;
        this.code = code;
    }
}
