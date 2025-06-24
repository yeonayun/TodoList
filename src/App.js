import React, { useEffect, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, X, Edit2, Star, Trash2 } from 'lucide-react';
import * as api from './api'; // API 모듈 import
import './App.css';

// ==================== LoginForm ====================
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
      if (!email || !password) throw new Error('이메일과 비밀번호를 입력해주세요');

      // API 모듈 사용
      const { user } = await api.login({ email, password });
      onLogin(user);
    } catch (err) {
      setError(err.response?.data?.error || err.message || '로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1 className="auth-title">🔐 로그인</h1>
        {error && <div className="auth-error">{error}</div>}
        <input
          type="email"
          placeholder="이메일을 입력하세요"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호를 입력하세요"
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="auth-button auth-button-primary"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
        <button onClick={switchToRegister} className="auth-button auth-button-secondary">
          회원가입하기
        </button>
      </div>
    </div>
  );
};

// ==================== RegisterForm ====================
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
      if (!email || !password || !name) throw new Error('모든 필드를 입력해주세요');

      // API 모듈 사용
      const { user } = await api.register({ email, password, name });
      onRegister(user);
    } catch (err) {
      setError(err.response?.data?.error || err.message || '회원가입 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1 className="auth-title">📝 회원가입</h1>
        {error && <div className="auth-error">{error}</div>}
        <input
          type="text"
          placeholder="이름을 입력하세요"
          className="auth-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="이메일을 입력하세요"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호를 입력하세요"
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="auth-button auth-button-primary"
        >
          {loading ? '가입 중...' : '회원가입'}
        </button>
        <button onClick={switchToLogin} className="auth-button auth-button-secondary">
          로그인하기
        </button>
      </div>
    </div>
  );
};

// ==================== CalendarView ====================
const CalendarView = ({
  todos,
  selectedDate,
  onDateSelect,
  onAddTodo,
  onUpdateTodo,
  onDeleteTodo
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);
  const [editText, setEditText] = useState('');

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(year, month, day);
    onDateSelect(clickedDate);
  };

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getTodosForDate = (day) => {
    const date = new Date(year, month, day);
    const dateKey = formatDateKey(date);
    return todos.filter(todo => {
      // date 필드가 있으면 사용, 없으면 createdAt 사용
      const todoDate = todo.date || (todo.createdAt ? todo.createdAt.split('T')[0] : null);
      return todoDate === dateKey;
    });
  };

  const isToday = (day) => {
    return today.getFullYear() === year &&
           today.getMonth() === month &&
           today.getDate() === day;
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return selectedDate.getFullYear() === year &&
           selectedDate.getMonth() === month &&
           selectedDate.getDate() === day;
  };

  const handleAddTodo = async () => {
    if (!newTodoText.trim() || !selectedDate) return;

    try {
      const dateKey = formatDateKey(selectedDate);
      // API 모듈의 addTodo 함수 사용
      await onAddTodo(newTodoText, dateKey);
      
      setNewTodoText('');
      setShowAddModal(false);
    } catch (error) {
      console.error('할일 추가 에러:', error);
      alert('할일 추가 중 오류가 발생했습니다.');
    }
  };

  const handleEditTodo = (todo) => {
    setEditingTodo(todo);
    setEditText(todo.text);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    await onUpdateTodo(editingTodo.id, { text: editText });
    setEditingTodo(null);
    setEditText('');
  };

  const selectedDateTodos = selectedDate ? getTodosForDate(selectedDate.getDate()) : [];

  const renderCalendarDays = () => {
    const days = [];

    // 빈 칸 추가
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day"></div>);
    }

    // 실제 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const dayTodos = getTodosForDate(day);
      const completedCount = dayTodos.filter(todo => todo.completed).length;
      const totalCount = dayTodos.length;

      let dayClasses = "calendar-day";

      if (isToday(day)) {
        dayClasses += " today";
      } else if (isSelected(day)) {
        dayClasses += " selected";
      }

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={dayClasses}
        >
          <div className="calendar-day-number">{day}</div>
          {totalCount > 0 && (
            <div className="calendar-day-todos">
              <div className="calendar-day-stats">
                {completedCount}/{totalCount}
              </div>
              <div>
                {dayTodos.slice(0, 2).map(todo => (
                  <div
                    key={todo.id}
                    className={`calendar-day-todo-item ${todo.completed ? 'completed' : 'pending'} ${todo.important ? 'important' : ''}`}
                  >
                    {todo.important && '★ '}{todo.text}
                  </div>
                ))}
                {dayTodos.length > 2 && (
                  <div className="calendar-day-more">+{dayTodos.length - 2}</div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="calendar-container">
      {/* 캘린더 */}
      <div className="calendar-main">
        {/* 헤더 */}
        <div className="calendar-header">
          <button
            onClick={handlePrevMonth}
            className="calendar-nav-button"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="calendar-month-title">
            {year}년 {monthNames[month]}
          </h2>
          <button
            onClick={handleNextMonth}
            className="calendar-nav-button"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="calendar-weekdays">
          {weekDays.map(day => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="calendar-grid">
          {renderCalendarDays()}
        </div>
      </div>

      {/* 사이드바 */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h3 className="sidebar-title">
            <Calendar size={20} />
            {selectedDate ?
              `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일` :
              '날짜를 선택하세요'
            }
          </h3>
          {selectedDate && (
            <button
              onClick={() => setShowAddModal(true)}
              className="add-todo-button"
            >
              <Plus size={16} />
              할일 추가
            </button>
          )}
        </div>

        <div className="sidebar-content">
          {selectedDate && selectedDateTodos.length === 0 && (
            <div className="no-todos">
              할일이 없습니다
            </div>
          )}

          {selectedDateTodos.map(todo => (
            <div key={todo.id} className="todo-item">
              {editingTodo?.id === todo.id ? (
                <div className="todo-edit-form">
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="todo-edit-input"
                  />
                  <div className="todo-edit-actions">
                    <button
                      onClick={handleSaveEdit}
                      className="todo-edit-button save"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setEditingTodo(null)}
                      className="todo-edit-button cancel"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="todo-item-header">
                    <button
                      onClick={() => onUpdateTodo(todo.id, { important: !todo.important })}
                      className={`star-button ${todo.important ? '' : 'inactive'}`}
                    >
                      <Star fill={todo.important ? "currentColor" : "none"} size={16} />
                    </button>
                    <span
                      onClick={() => onUpdateTodo(todo.id, { completed: !todo.completed })}
                      className={`todo-text ${todo.completed ? 'completed' : ''}`}
                    >
                      {todo.text}
                    </span>
                  </div>
                  <div className="todo-actions">
                    <button
                      onClick={() => handleEditTodo(todo)}
                      className="todo-action-button edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteTodo(todo.id)}
                      className="todo-action-button delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 할일 추가 모달 */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">할일 추가</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="modal-close"
              >
                <X size={20} />
              </button>
            </div>
            <input
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="할일을 입력하세요"
              className="modal-input"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
            />
            <div className="modal-actions">
              <button
                onClick={handleAddTodo}
                className="modal-button primary"
              >
                추가
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="modal-button secondary"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Main App ====================
function App() {
  const [todos, setTodos] = useState([]);
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 로그인 성공 처리
  const handleLogin = (userData) => {
    setUser(userData);
  };

  // 회원가입 성공 처리
  const handleRegister = (userData) => {
    setUser(userData);
  };

  // 로그아웃 처리
  const handleLogout = () => {
    api.logout();
    setUser(null);
    setTodos([]);
  };

  // 할 일 리스트 서버에서 불러오기
  useEffect(() => {
    if (!user) return;

    const loadTodos = async () => {
      setLoading(true);
      try {
        const todosData = await api.fetchTodos();
        setTodos(todosData);
      } catch (err) {
        console.error('할일 목록 불러오기 에러:', err);
        alert('할일 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, [user]);

  // 할 일 추가 (API 모듈 사용)
  const handleAddTodo = async (text, date) => {
    try {
      const newTodo = await api.addTodo(text, date);
      setTodos((prev) => [...prev, newTodo]);
      return newTodo;
    } catch (err) {
      console.error('할일 추가 에러:', err);
      alert('할일 추가 중 오류가 발생했습니다.');
      throw err;
    }
  };

  // 할 일 수정 (API 모듈 사용)
  const handleUpdateTodo = async (id, updatedFields) => {
    try {
      const updatedTodo = await api.updateTodo(id, updatedFields);
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
    } catch (err) {
      console.error('할일 수정 에러:', err);
      alert('할일 수정 중 오류가 발생했습니다.');
    }
  };

  // 할 일 삭제 (API 모듈 사용)
  const handleDeleteTodo = async (id) => {
    try {
      await api.deleteTodo(id);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (err) {
      console.error('할일 삭제 에러:', err);
      alert('할일 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">로딩 중...</div>
      </div>
    );
  }

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

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <span>{user.name} 님 환영합니다.</span>
          <button onClick={handleLogout} className="logout-button">
            로그아웃
          </button>
        </div>
      </header>
      <CalendarView
        todos={todos}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        onAddTodo={handleAddTodo}
        onUpdateTodo={handleUpdateTodo}
        onDeleteTodo={handleDeleteTodo}
      />
    </div>
  );
}

export default App;