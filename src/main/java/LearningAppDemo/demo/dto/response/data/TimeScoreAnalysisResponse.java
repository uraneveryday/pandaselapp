package LearningAppDemo.demo.dto.response.data;

import java.util.List;

public record TimeScoreAnalysisResponse(
        Long completedStudents,
        Double medianTime,
        Double medianScore,
        List<TimeScoreQuadrantResponse> quadrants,
        List<StudentTimeScoreResponse> students) {
}
