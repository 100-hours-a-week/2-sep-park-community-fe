import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;

// 로그 미들웨어
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

/// 미들웨어 설정
app.use(express.json()); // JSON 파싱
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일 제공
app.use('/img/profile', express.static(path.join(__dirname, 'img/profile'))); // 업로드된 파일 정적 제공
app.use('/img/posts', express.static(path.join(__dirname, 'img/posts'))); //

// 라우트 설정(페이지 이동)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'signup.html'));
});
app.get('/posts', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'post.html'));
});
app.get('/posts/addpost', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'addpost.html'));
});
app.get('/posts/:postId', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'postcheck.html'));
});

app.get('/editpost/:postId', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'postedit.html'));
});

app.get('/users/editinfo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'informationedit.html'));
});

app.get('/users/pwedit', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'pwedit.html'));
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});