const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const port = 5000;

// JWT 비밀 키 (실제 환경에서는 환경변수로 관리)
const JWT_SECRET = 'your-secret-key-here';

app.use(cors());
app.use(bodyParser.json());

// 메모리 저장소 (실제 환경에서는 데이터베이스 사용)
let users = [];
let todos = [];

// JWT 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: '토큰이 필요합니다' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '유효하지 않은 토큰입니다' });
    }
    req.user = user;
    next();
  });
};

// 회원가입 (POST)
app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 입력값 검증
    if (!email || !password || !name) {
      return res.status(400).json({ error: '이메일, 비밀번호, 이름을 모두 입력해주세요' });
    }

    // 이미 존재하는 사용자 확인
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ error: '이미 존재하는 이메일입니다' });
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새 사용자 생성
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      createdAt: new Date()
    };

    users.push(newUser);

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: '회원가입이 완료되었습니다',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// 로그인 (POST)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 입력값 검증
    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요' });
    }

    // 사용자 찾기
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: '존재하지 않는 이메일입니다' });
    }

    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: '비밀번호가 올바르지 않습니다' });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: '로그인 성공',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// 사용자 정보 확인 (GET)
app.get('/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name
  });
});

// 모든 투두 가져오기 (GET) - 인증 필요
app.get('/todos', authenticateToken, (req, res) => {
  const userTodos = todos.filter(todo => todo.userId === req.user.userId);
  res.json(userTodos);
});

// 새 투두 추가하기 (POST) - 인증 필요
app.post('/todos', authenticateToken, (req, res) => {
  const { text } = req.body;
  const newTodo = {
    id: Date.now().toString(),
    text,
    completed: false,
    important: false,
    userId: req.user.userId,
    createdAt: new Date()
  };
  todos.push(newTodo);
  res.json(newTodo);
});

// 투두 업데이트 (PUT) - 인증 필요
app.put('/todos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const updated = req.body;

  const todoIndex = todos.findIndex(todo => todo.id === id && todo.userId === req.user.userId);
  if (todoIndex === -1) {
    return res.status(404).json({ error: '투두를 찾을 수 없습니다' });
  }

  todos[todoIndex] = { ...todos[todoIndex], ...updated };
  res.json(todos[todoIndex]);
});

// 투두 삭제 (DELETE) - 인증 필요
app.delete('/todos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const todoIndex = todos.findIndex(todo => todo.id === id && todo.userId === req.user.userId);
  
  if (todoIndex === -1) {
    return res.status(404).json({ error: '투두를 찾을 수 없습니다' });
  }

  todos.splice(todoIndex, 1);
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`✅ 서버 실행됨: http://localhost:${port}`);
});