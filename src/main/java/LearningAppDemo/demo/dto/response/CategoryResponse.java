package LearningAppDemo.demo.dto.response;

import LearningAppDemo.demo.domain.category.Category;

public record CategoryResponse(Long id, String name, boolean systemDefault) {

    public static CategoryResponse from(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.isSystemDefault());
    }
}
