import axios from 'axios';

const API_URL = 'http://localhost:5000';

// 토큰 관리
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
});

// 요청 시 토큰 자동 첨부
api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 Unauthorized 시 토큰 삭제 및 로그인 페이지로 리다이렉트
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.reload(); // 페이지 새로고침으로 로그인 화면으로 이동
    }
    return Promise.reject(error);
  }
);

// 회원가입
export const register = async (userData) => {
  const res = await api.post('/register', userData);
  if (res.data.token) setToken(res.data.token);
  return res.data;
};

// 로그인
export const login = async (credentials) => {
  const res = await api.post('/login', credentials);
  if (res.data.token) setToken(res.data.token);
  return res.data;
};

// 내 정보 조회
export const getCurrentUser = async () => {
  const res = await api.get('/me');
  return res.data;
};

// 투두 목록 조회
export const fetchTodos = async () => {
  const res = await api.get('/todos');
  return res.data;
};

// 투두 추가 - date 필드 포함
export const addTodo = async (text, date) => {
  const res = await api.post('/todos', { 
    text, 
    date,
    completed: false,
    important: false 
  });
  return res.data;
};

// 투두 수정
export const updateTodo = async (id, updatedFields) => {
  const res = await api.put(`/todos/${id}`, updatedFields);
  return res.data;
};

// 투두 삭제
export const deleteTodo = async (id) => {
  const res = await api.delete(`/todos/${id}`);
  return res.data;
};

// 로그아웃
export const logout = () => {
  removeToken();
};