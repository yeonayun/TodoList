import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/todos';

const fetchTodos = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch todos');
  return res.json();
};

const addTodo = async (text) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('Failed to add todo');
  return res.json();
};

const updateTodo = async (id, updatedFields) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedFields),
  });
  if (!res.ok) throw new Error('Failed to update todo');
  return res.json();
};

const deleteTodo = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete todo');
};

function App() {
  const [todos, setTodos] = useState([]);
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodos()
      .then(setTodos)
      .catch(err => setError(err.message));
  }, []);

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

  return (
    <div className="container">
      <div className="todo-box">
        <h1>📝 ToDo List</h1>
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
