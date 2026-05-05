package LearningAppDemo.demo.domain.user;

import LearningAppDemo.demo.domain.classroom.Classroom;
import jakarta.persistence.*;

import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;


@Entity @Setter
@NoArgsConstructor
@DiscriminatorValue("TEACHER")
public class Teacher extends User {

    @Column(unique = true)
    private String email;

    // mappedBy = "teacher"를 통해 연관관계 주인을 Classroom으로 넘김 (조인 테이블 생성 방지)
    // cascade = CascadeType.ALL: Teacher가 저장/삭제될 때 연관된 Classroom도 함께 처리됨
    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Classroom> classRooms = new ArrayList<>(); //관리하는 클래스들 복수개 가능

    // 연관관계 편의 메서드 (양방향 객체 상태를 안전하게 맞추기 위함)
    public void addClassroom(Classroom classroom) {
        this.classRooms.add(classroom);
        classroom.setTeacher(this);
    }
}
