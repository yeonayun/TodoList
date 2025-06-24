// 필수 모듈 가져오기
const express = require('express');              // Express 프레임워크
const cors = require('cors');                    // CORS 설정을 위한 모듈 (다른 도메인에서의 요청 허용)
const bodyParser = require('body-parser');       // 요청 body를 JSON 형식으로 파싱
const bcrypt = require('bcryptjs');              // 비밀번호 암호화를 위한 bcrypt
const jwt = require('jsonwebtoken');             // JWT 토큰 생성 및 검증용

const app = express();                           // Express 앱 생성
const port = 5000;                               // 서버 포트

// JWT 서명용 비밀 키 (실제 배포 시에는 .env 환경변수로 설정)
const JWT_SECRET = 'your-secret-key-here';

// 미들웨어 설정
app.use(cors());                                 // 모든 요청에 대해 CORS 허용
app.use(bodyParser.json());                      // JSON 형식의 요청 body 파싱

// 메모리 저장소 (임시): 실제로는 DB를 사용해야 함
let users = [];                                  // 사용자 목록
let todos = [];                                  // 투두 목록

// 🔐 JWT 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];           // 요청 헤더에서 Authorization 값 가져오기
  const token = authHeader && authHeader.split(' ')[1];      // "Bearer TOKEN" 형태에서 TOKEN만 추출

  if (!token) {
    return res.status(401).json({ error: '토큰이 필요합니다' }); // 토큰 없으면 401 반환
  }

  // 토큰 유효성 검사
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '유효하지 않은 토큰입니다' }); // 유효하지 않으면 403
    }
    req.user = user;  // 인증된 사용자 정보 저장
    next();           // 다음 미들웨어/라우터로 이동
  });
};

///////////////////////// 🔹 사용자 인증 API /////////////////////////

// ✅ 회원가입 API
app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 필수값 체크
    if (!email || !password || !name) {
      return res.status(400).json({ error: '이메일, 비밀번호, 이름을 모두 입력해주세요' });
    }

    // 이미 존재하는 이메일인지 확인
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ error: '이미 존재하는 이메일입니다' });
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새로운 사용자 생성
    const newUser = {
      id: Date.now().toString(),      // 고유 ID
      email,
      password: hashedPassword,       // 암호화된 비밀번호 저장
      name,
      createdAt: new Date()
    };

    users.push(newUser);              // 메모리에 저장

    // JWT 토큰 발급
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }           // 24시간 유효
    );

    // 응답 반환
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

// ✅ 로그인 API
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 필수값 확인
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

    // JWT 발급
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

// ✅ 내 정보 확인 API (로그인된 사용자)
app.get('/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId); // JWT에서 가져온 ID로 사용자 조회
  if (!user) {
    return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name
  });
});

///////////////////////// 📝 투두 관리 API /////////////////////////

// ✅ 사용자별 투두 전체 조회 (GET)
app.get('/todos', authenticateToken, (req, res) => {
  const userTodos = todos.filter(todo => todo.userId === req.user.userId); // 자신의 투두만 필터링
  res.json(userTodos);
});

// ✅ 새 투두 추가 (POST)
app.post('/todos', authenticateToken, (req, res) => {
  const { text } = req.body;

  const newTodo = {
    id: Date.now().toString(),     // 고유 ID
    text,                          // 내용
    completed: false,              // 완료 여부
    important: false,              // 중요 여부
    userId: req.user.userId,       // 현재 사용자 ID
    createdAt: new Date()
  };

  todos.push(newTodo);             // 메모리에 추가
  res.json(newTodo);
});

// ✅ 투두 수정 (PUT)
app.put('/todos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const updated = req.body;

  const todoIndex = todos.findIndex(todo => todo.id === id && todo.userId === req.user.userId);
  if (todoIndex === -1) {
    return res.status(404).json({ error: '투두를 찾을 수 없습니다' });
  }

  todos[todoIndex] = { ...todos[todoIndex], ...updated };  // 기존 투두에 덮어쓰기
  res.json(todos[todoIndex]);
});

// ✅ 투두 삭제 (DELETE)
app.delete('/todos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  const todoIndex = todos.findIndex(todo => todo.id === id && todo.userId === req.user.userId);
  if (todoIndex === -1) {
    return res.status(404).json({ error: '투두를 찾을 수 없습니다' });
  }

  todos.splice(todoIndex, 1);   // 배열에서 제거
  res.json({ success: true });
});

///////////////////////// 🚀 서버 시작 /////////////////////////
app.listen(port, () => {
  console.log(`✅ 서버 실행됨: http://localhost:${port}`);
});
