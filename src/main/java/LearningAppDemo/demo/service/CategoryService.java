package LearningAppDemo.demo.service;

import LearningAppDemo.demo.domain.category.Category;
import LearningAppDemo.demo.domain.user.Role;
import LearningAppDemo.demo.domain.user.Teacher;
import LearningAppDemo.demo.domain.user.User;
import LearningAppDemo.demo.dto.response.CategoryResponse;
import LearningAppDemo.demo.repository.CategoryRepository;
import LearningAppDemo.demo.repository.TeacherRepository;
import LearningAppDemo.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;

    public List<CategoryResponse> getAvailableCategories(Long teacherId) {
        getTeacher(teacherId);
        return categoryRepository.findAvailableForTeacher(teacherId)
                .stream()
                .map(CategoryResponse::from)
                .toList();
    }

    @Transactional
    public CategoryResponse createCustomCategory(Long teacherId, String rawName) {
        Teacher teacher = getTeacher(teacherId);
        String name = rawName.trim();

        if (categoryRepository.existsByOwnerTeacherIdAndNameIgnoreCase(teacherId, name)) {
            throw new IllegalArgumentException("이미 등록한 카테고리입니다.");
        }

        Category category = new Category();
        category.setName(name);
        category.setOwnerTeacher(teacher);
        category.setSystemDefault(false);
        category.setActive(true);
        category.setCreatedAt(LocalDateTime.now());

        return CategoryResponse.from(categoryRepository.save(category));
    }

    public Category getCategoryUsableByTeacher(Long categoryId, Long teacherId) {
        if (categoryId == null) {
            throw new IllegalArgumentException("카테고리를 선택해야 합니다.");
        }
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다."));

        boolean ownedByTeacher = category.getOwnerTeacher() != null
                && category.getOwnerTeacher().getId().equals(teacherId);
        if (!category.isActive() || (!category.isSystemDefault() && !ownedByTeacher)) {
            throw new IllegalArgumentException("이 카테고리를 사용할 권한이 없습니다.");
        }
        return category;
    }

    private Teacher getTeacher(Long teacherId) {
        User user = userRepository.findById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        if (user.getRole() != Role.TEACHER) {
            throw new IllegalArgumentException("교사만 카테고리를 관리할 수 있습니다.");
        }
        return teacherRepository.findTeacherById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException("교사 정보를 찾을 수 없습니다."));
    }
}
