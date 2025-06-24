// ./api/todos.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/todos';

export const fetchTodos = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const addTodo = async (text) => {
  const newTodo = {
    text,
    completed: false,
    important: false,
    id: Date.now(), // 또는 서버에서 생성되게 하면 이 줄 빼기
  };
  const res = await axios.post(API_URL, newTodo);
  return res.data;
};
