import { createBrowserRouter , Navigate } from "react-router-dom";
import { RootRedirect } from "./app/components/RootRedirect";

// 👨‍🎓 학생용 페이지
import { WelcomePage } from "./app/pages/student/WelcomePage";
import { MyPage } from "./app/pages/student/MyPage";
import { RankingPage } from "./app/pages/student/RankingPage";
import { Layout } from "./app/components/Layout";

// 공통 인증 페이지
import { LoginPage } from "./app/pages/common/LoginPage";
import { RegisterPage } from "./app/pages/teacher/RegisterPage";

// 👩‍🏫 선생님용 레이아웃 및 가드
import { TeacherLayout } from "./app/components/teacher/TeacherLayout";
import { ProtectedRoute } from "./app/pages/teacher/ProtectedRoute";

// 👩‍🏫 선생님용 페이지 컴포넌트들
import { ClassroomListPage } from "./app/pages/teacher/ClassroomListPage";
import { ClassroomCreatePage } from "./app/pages/teacher/ClassroomCreatePage";
import { TaskCreatePage } from "./app/pages/teacher/TaskCreatePage";
import { ClassroomEditPage} from "./app/pages/teacher/ClassroomEditPage";
import { ClassroomTaskListPage } from "./app/pages/teacher/ClassroomTaskListPage";

// 💡 Provider 임포트
import { HomeworkProvider } from "./app/context/HomeworkContext";
import {ClassroomDetailPage} from "./app/pages/teacher/ClassroomDetailPage";
import AddQuizzes from "./app/pages/teacher/QuizCreate";
import {TaskDetailPage} from "./app/pages/teacher/TaskDetailPage";
import {StudentQuizPage} from "./app/pages/student/StudentQuizPage";

// router.tsx 수정 제안
export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootRedirect />,
    },
    { path: "/login", Component: LoginPage },
    { path: "/register", Component: RegisterPage },

    // 👨‍🎓 학생용 라우트 (유지)
    {
        path: "/student",
        element: (
            <HomeworkProvider>
                <Layout />
            </HomeworkProvider>
        ),
        children: [
            { index: true, Component: WelcomePage },
            { path: "my-page", Component: MyPage },
            { path: "ranking", Component: RankingPage },
            { path: "task/:taskId/quizzes", Component: StudentQuizPage },

        ],
    },
// 👩‍🏫 4. 선생님(관리자) 라우트 설정
    {
        path: "/teacher",
        element: (
            <ProtectedRoute>
                <TeacherLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Navigate to="classrooms" replace /> },

            // 💡 2. 클래스룸 관련 그룹화
            {
                path: "classrooms",
                children: [
                    { index: true, Component: ClassroomListPage },
                    { path: "new", Component: ClassroomCreatePage },

                    // 📚 [프론트엔드 학습 포인트 1] 동적 파라미터 (Dynamic Segment)
                    // URL에 콜론(:)이 붙으면 고정된 문자열이 아니라 '변수'로 취급해.
                    // Spring의 @PathVariable("id") 와 완전히 같은 개념이야.
                    // 이 컴포넌트 안에서는 useParams().id 로 이 값을 꺼내 쓸 수 있어.
                    {
                        path: ":id",
                        children: [
                            { index: true, Component: ClassroomDetailPage },
                            { path: "edit", Component: ClassroomEditPage },

                            // ⭐️ "task" 경로 관련 라우트들을 그룹화
                            {
                                path: "task",
                                children: [
                                    // URL: /teacher/classrooms/:id/task
                                    { index: true, Component: ClassroomTaskListPage },

                                    // URL: /teacher/classrooms/:id/task/create
                                    { path: "create", Component: TaskCreatePage },

                                    // 📚 [프론트엔드 학습 포인트 2] 중첩 라우팅 심화
                                    // 특정 Task에 종속된 기능을 만들기 위해 ":taskId"라는 변수를 또 추가했어.
                                    // 이렇게 중첩(children) 구조를 쓰면, 부모의 경로를 그대로 물려받기 때문에
                                    // 전체 경로는 "/teacher/classrooms/:id/task/:taskId" 가 돼.
                                    {
                                        path: ":taskId",
                                        children: [
                                            { index: true, Component: TaskDetailPage },

                                            // URL: /teacher/classrooms/:id/task/:taskId/add-quizzes
                                            // TaskManagement 컴포넌트에서 useParams()를 호출하면
                                            // { id: "1", taskId: "2" } 형태의 객체를 얻게 돼!
                                            { path: "add-quizzes", Component: AddQuizzes }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                ]
            },

            {
                path: "tasks",
                children: [
                    { path: "new", Component: TaskCreatePage }
                ]
            }
        ],
    },
]);