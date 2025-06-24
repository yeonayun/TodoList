import React, { useEffect, useState } from 'react';
import './App.css';
import { login, register, logout, getCurrentUser, isAuthenticated } from './api/auth';

const API_URL = 'http://localhost:5000/todos';

const fetchTodos = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch todos');
  return res.json();
};

const addTodo = async (text) => {
  const token = localStorage.getItem('token');
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('Failed to add todo');
  return res.json();
};

const updateTodo = async (id, updatedFields) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updatedFields),
  });
  if (!res.ok) throw new Error('Failed to update todo');
  return res.json();
};

const deleteTodo = async (id) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to delete todo');
};

// 로그인 컴포넌트
const LoginForm = ({ onLogin, switchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login({ email, password });
      onLogin(response.user);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="todo-box">
        <h1>🔐 로그인</h1>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required
              style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '10px', marginBottom: '12px' }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <button 
          onClick={switchToRegister}
          style={{ width: '100%', padding: '10px', backgroundColor: '#f0f0f0' }}
        >
          회원가입하기
        </button>
      </div>
    </div>
  );
};

// 회원가입 컴포넌트
const RegisterForm = ({ onRegister, switchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await register({ email, password, name });
      onRegister(response.user);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="todo-box">
        <h1>📝 회원가입</h1>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              required
              style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required
              style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '10px', marginBottom: '12px' }}
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>
        <button 
          onClick={switchToLogin}
          style={{ width: '100%', padding: '10px', backgroundColor: '#f0f0f0' }}
        >
          로그인하기
        </button>
      </div>
    </div>
  );
};

function App() {
  const [todos, setTodos] = useState([]);
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
          fetchTodos()
            .then(setTodos)
            .catch(err => setError(err.message));
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    fetchTodos()
      .then(setTodos)
      .catch(err => setError(err.message));
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setTodos([]);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setTodos([]);
    setError(null);
  };

  const handleAdd = async () => {
    if (!newText.trim()) return;
    try {
      const newTodo = await addTodo(newText);
      setTodos([...todos, newTodo]);
      setNewText('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggle = async (id, completed) => {
    try {
      const updated = await updateTodo(id, { completed: !completed });
      setTodos(todos.map(todo => (todo.id === id ? updated : todo)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleImportant = async (id, important) => {
    try {
      const updated = await updateTodo(id, { important: !important });
      setTodos(todos.map(todo => (todo.id === id ? updated : todo)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (id, currentText) => {
    setEditingId(id);
    setEditText(currentText);
  };

  const handleEditSubmit = async (id) => {
    if (!editText.trim()) return;
    try {
      const updated = await updateTodo(id, { text: editText });
      setTodos(todos.map(todo => (todo.id === id ? updated : todo)));
      setEditingId(null);
      setEditText('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="todo-box">
          <div>로딩 중...</div>
        </div>
      </div>
    );
  }

  // 로그인되지 않은 경우
  if (!user) {
    return isLogin ? (
      <LoginForm 
        onLogin={handleLogin} 
        switchToRegister={() => setIsLogin(false)}
      />
    ) : (
      <RegisterForm 
        onRegister={handleRegister} 
        switchToLogin={() => setIsLogin(true)}
      />
    );
  }

  // 로그인된 경우 - 기존 투두 앱
  return (
    <div className="container">
      <div className="todo-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>📝 {user.name}님의 ToDo List</h1>
          <button 
            onClick={handleLogout}
            style={{ padding: '8px 16px', backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            로그아웃
          </button>
        </div>
        
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        
        <div style={{ display: 'flex', marginBottom: '12px' }}>
          <input
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="할 일을 입력하세요"
          />
          <button
            onClick={handleAdd}
            style={{ height: '40px', padding: '0 12px', whiteSpace: 'nowrap', writingMode: 'horizontal-tb' }}
          >
            추가
          </button>
        </div>

        <ul style={{ padding: 0, listStyle: 'none' }}>
          {todos.map(todo => (
            <li
              key={todo.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '8px',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#fff',
              }}
            >
              {editingId === todo.id ? (
                <>
                  <input
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    style={{ flex: 1, marginRight: '8px' }}
                  />
                  <button onClick={() => handleEditSubmit(todo.id)}>저장</button>
                  <button onClick={() => setEditingId(null)}>취소</button>
                </>
              ) : (
                <>
                  <span
                    onClick={() => handleToggleImportant(todo.id, todo.important)}
                    style={{
                      cursor: 'pointer',
                      color: todo.important ? 'gold' : 'gray',
                      fontSize: '20px',
                      marginRight: '8px',
                      userSelect: 'none',
                    }}
                    title={todo.important ? '중요 표시됨' : '중요하지 않음'}
                  >
                    {todo.important ? '★' : '☆'}
                  </span>

                  <span
                    onClick={() => handleToggle(todo.id, todo.completed)}
                    style={{
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      flex: 1,
                      cursor: 'pointer',
                    }}
                  >
                    {todo.text}
                  </span>
                  <button onClick={() => handleEdit(todo.id, todo.text)}>수정</button>
                  <button onClick={() => handleDelete(todo.id)}>삭제</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;