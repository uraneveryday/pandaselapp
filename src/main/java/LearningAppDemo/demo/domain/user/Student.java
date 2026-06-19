package LearningAppDemo.demo.domain.user;

import LearningAppDemo.demo.domain.StudentTask;
import LearningAppDemo.demo.domain.classroom.Classroom;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter @Setter
@Entity
@NoArgsConstructor
@DiscriminatorValue("STUDENT")
public class Student extends User {



    @Column
    private int stamp; //스탬프 몇개모았는지

    @Column
    private int coupon; //쿠폰 갯수

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classRoom")
    private Classroom classRoom; // 속한 클래스

    // [보완] isDone, isNotDone 두 리스트 대신, 중간 매핑 엔티티(StudentTask)를 사용하는 것을 강력히 권장합니다.
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<StudentTask> studentTasks = new ArrayList<>();


    @Column
    private String parentPhoneNumber;

}
