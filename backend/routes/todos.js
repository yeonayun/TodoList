// 필요한 모듈 불러오기
const express = require('express');
const low = require('lowdb');                            // 간단한 로컬 JSON DB 라이브러리
const FileSync = require('lowdb/adapters/FileSync');    // 파일을 동기식으로 처리하는 어댑터

const router = express.Router();                         // Express 라우터 객체 생성
const adapter = new FileSync('db.json');                 // db.json 파일을 어댑터로 지정
const db = low(adapter);                                 // lowdb 인스턴스 생성

// DB 초기값 설정 (todos가 없으면 빈 배열로 초기화됨)
db.defaults({ todos: [] }).write();

///////////////////////// ✅ 전체 투두 목록 가져오기 /////////////////////////
router.get('/', (req, res) => {
  const todos = db.get('todos').value();                // DB에서 todos 배열 가져오기
  res.json(todos);                                      // JSON 형식으로 응답
});

///////////////////////// ✅ 새로운 투두 추가 /////////////////////////
router.post('/', (req, res) => {
  const { text } = req.body;

  // 새 투두 객체 생성
  const newTodo = {
    id: Date.now(),               // 고유 ID (timestamp 기반)
    text,                         // 할 일 내용
    completed: false,             // 완료 여부 (기본 false)
    important: false              // 중요 여부 (기본 false)
  };

  // DB에 추가하고 저장
  db.get('todos').push(newTodo).write();

  res.json(newTodo);             // 추가된 투두 응답
});

///////////////////////// ✅ 투두 수정 /////////////////////////
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { text, completed, important } = req.body;

  // 해당 ID를 가진 투두 검색
  const todo = db.get('todos').find({ id: parseInt(id) });

  if (!todo.value()) {
    return res.status(404).json({ error: '할 일을 찾을 수 없습니다.' }); // 존재하지 않을 경우
  }

  // 전달된 값만 수정 (없으면 기존 값 유지)
  todo.assign({
    text: text ?? todo.value().text,
    completed: completed ?? todo.value().completed,
    important: important ?? todo.value().important
  }).write();

  res.json(todo.value()); // 수정된 값 응답
});

///////////////////////// ✅ 투두 삭제 /////////////////////////
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // 해당 ID의 투두 삭제
  db.get('todos').remove({ id: parseInt(id) }).write();

  res.json({ success: true }); // 성공 메시지 응답
});

///////////////////////// ✅ 라우터 내보내기 /////////////////////////
module.exports = router;
