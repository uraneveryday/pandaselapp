package LearningAppDemo.demo.dto.response.data;

public record StudentTimeScoreResponse(
        Long studentId,
        String studentName,
        Double takesTime,
        Integer taskScore,
        String quadrant) {
}
