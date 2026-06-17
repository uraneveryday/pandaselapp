package LearningAppDemo.demo.domain.classroom;
import LearningAppDemo.demo.domain.task.Task;
import LearningAppDemo.demo.domain.user.Student;
import LearningAppDemo.demo.domain.user.Teacher;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "class_room")
@Getter @Setter
@NoArgsConstructor
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "class_room_id")
    private Long id; //classroom id PK

    @Column(nullable = false, length = 50)
    private String className; //클래스이름

    // 연관관계
    // mappedBy = "classRoom"은 Student 엔티티의 classRoom 변수와 연결된다는 뜻입니다.
    @OneToMany(mappedBy = "classRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Student> students; //아이들 목록

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id") // FK
    private Teacher teacher; //담당 선생님 이름


    @OneToMany(mappedBy = "classRoom", cascade = CascadeType.ALL)
    private List<Task> tasks = new ArrayList<>(); //지금까지의 숙제들

    @Column(updatable = false) //업데이트안되도록
    LocalDateTime createDate; // 생성날짜

    @PrePersist
    public void prePersist() {
        this.createDate = LocalDateTime.now();
    }

    public void addStudentAtClassroom(Student student) {
        this.students.add(student);
        if(student.getClassRoom() != this)
            student.setClassRoom(this);
    }
    public int studentCount() {
        return this.students.size();
    }
}
