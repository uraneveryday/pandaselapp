package LearningAppDemo.demo.exception;

public class FaildToValidate extends RuntimeException {
    public FaildToValidate(String message) {
        super(message);
    }

    public FaildToValidate() {
        super();
    }

    public FaildToValidate(String message, Throwable cause) {
        super(message, cause);
    }

    public FaildToValidate(Throwable cause) {
        super(cause);
    }

    protected FaildToValidate(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
