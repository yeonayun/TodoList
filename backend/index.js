const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

let todos = [];


// 📌 모든 투두 가져오기 (GET)
app.get('/todos', (req, res) => {
  res.json(todos);
});

// 📌 새 투두 추가하기 (POST)
app.post('/todos', (req, res) => {
  const { text } = req.body;
  const newTodo = { id: Date.now().toString(), text, completed: false };
  todos.push(newTodo);
  res.json(newTodo);
});

// 📌 투두 업데이트 (PUT)
app.put('/todos/:id', (req, res) => {
  const { id } = req.params;
  const updated = req.body;

  todos = todos.map(todo =>
    todo.id === id ? { ...todo, ...updated } : todo
  );

  const updatedTodo = todos.find(todo => todo.id === id);
  res.json(updatedTodo);
});

// 📌 투두 삭제 (DELETE)
app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  todos = todos.filter(todo => todo.id !== id);
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`✅ 서버 실행됨: http://localhost:${port}`);
});
