import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
    ko: {
        translation: {
            login: {
                title: "로그인",
                subtitleLine1: "선생님 또는 학생 계정으로 로그인하여",
                subtitleLine2: "학습을 시작해보세요.",
                loginId: "아이디",
                loginIdPlaceholder: "아이디를 입력하세요",
                password: "비밀번호",
                passwordPlaceholder: "비밀번호를 입력하세요",
                submit: "로그인",
                loading: "로그인 중...",
                teacherAccountQuestion: "아직 선생님 계정이 없으신가요?",
                teacherRegister: "선생님 회원가입",
                studentAccountGuideLine1: "학생 계정은 담당 선생님이",
                studentAccountGuideLine2: "학급 관리 화면에서 생성할 수 있습니다.",
                languageKo: "한국어",
                languageZh: "中文",
                errors: {
                    required: "아이디와 비밀번호를 모두 입력해주세요.",
                    invalidCredential: "아이디 또는 비밀번호가 일치하지 않습니다.",
                    missingToken: "서버로부터 로그인 토큰을 전달받지 못했습니다.",
                    invalidRole: "사용자 권한 정보를 확인할 수 없습니다.",
                    unknown: "로그인 중 오류가 발생했습니다.",
                },
            },
        },
    },

    "zh-CN": {
        translation: {
            login: {
                title: "登录",
                subtitleLine1: "使用老师或学生账号登录",
                subtitleLine2: "开始你的学习吧。",
                loginId: "账号",
                loginIdPlaceholder: "请输入账号",
                password: "密码",
                passwordPlaceholder: "请输入密码",
                submit: "登录",
                loading: "登录中...",
                teacherAccountQuestion: "还没有教师账号吗？",
                teacherRegister: "教师注册",
                studentAccountGuideLine1: "学生账号由负责老师",
                studentAccountGuideLine2: "在班级管理页面中创建。",
                languageKo: "한국어",
                languageZh: "中文",
                errors: {
                    required: "请输入账号和密码。",
                    invalidCredential: "账号或密码不正确。",
                    missingToken: "服务器没有返回登录令牌。",
                    invalidRole: "无法确认用户权限信息。",
                    unknown: "登录过程中发生错误。",
                },
            },
        },
    },
};

const savedLanguage = localStorage.getItem("language") || "zh-CN";

i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage,
    fallbackLng: "zh-CN",
    interpolation: {
        escapeValue: false,
    },
});

document.documentElement.lang = savedLanguage;

i18n.on("languageChanged", (lng) => {
    localStorage.setItem("language", lng);
    document.documentElement.lang = lng;
});

export default i18n;