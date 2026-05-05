import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';

// 1. 기본 설정으로 axios 인스턴스 생성
export const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api',
});

// 2. 요청(Request) 인터셉터
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('jwt_token');

    // config.headers가 존재함을 보장하면서 Authorization 추가
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 3. 응답(Response) 인터셉터
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => { // 에러 타입을 AxiosError로 지정
        if (error.response && error.response.status === 401) {
            // 🚨 토큰 만료 됨! 전역 처리
            alert('로그인이 만료되었습니다. 다시 로그인해 주세요.');
            localStorage.removeItem('jwt_token');

            // React Router 외부에서 라우팅 처리
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);