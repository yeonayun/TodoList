import axios from 'axios';

const API_URL = 'http://localhost:5000';

// 토큰을 localStorage에서 가져오기
const getToken = () => {
  return localStorage.getItem('token');
};

// 토큰을 localStorage에 저장
const setToken = (token) => {
  localStorage.setItem('token', token);
};

// 토큰 삭제
const removeToken = () => {
  localStorage.removeItem('token');
};

// 회원가입
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    if (response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || '회원가입 중 오류가 발생했습니다';
  }
};

// 로그인
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    if (response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || '로그인 중 오류가 발생했습니다';
  }
};

// 로그아웃
export const logout = () => {
  removeToken();
};

// 사용자 정보 확인
export const getCurrentUser = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('토큰이 없습니다');
    }
    
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || '사용자 정보를 가져올 수 없습니다';
  }
};

// 로그인 상태 확인
export const isAuthenticated = () => {
  return !!getToken();
};

// axios 인터셉터 설정 (모든 요청에 토큰 자동 추가)
axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 401 에러 시 자동 로그아웃
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);