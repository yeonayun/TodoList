const express = require('express');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const router = express.Router();
const adapter = new FileSync('db.json');
const db = low(adapter);

// 초기값
db.defaults({ todos: [] }).write();

router.get('/', (req, res) => {
  const todos = db.get('todos').value();
  res.json(todos);
});

router.post('/', (req, res) => {
  const { text } = req.body;
  const newTodo = {
    id: Date.now(),
    text,
    completed: false,
    important: false,
  };
  db.get('todos').push(newTodo).write();
  res.json(newTodo);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { text, completed, important } = req.body;

  const todo = db.get('todos').find({ id: parseInt(id) });
  if (!todo.value()) {
    return res.status(404).json({ error: '할 일을 찾을 수 없습니다.' });
  }

  todo.assign({
    text: text ?? todo.value().text,
    completed: completed ?? todo.value().completed,
    important: important ?? todo.value().important,
  }).write();

  res.json(todo.value());
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.get('todos').remove({ id: parseInt(id) }).write();
  res.json({ success: true });
});

module.exports = router;