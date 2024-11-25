//const path = require('path');
//const fileSystem = require('fs');
//const fsPromises = require('fs').promises; // 비동기 방식
//const bcrypt = require('bcrypt');
//const userPath = path.join(__dirname, 'users.json');
//const postPath = path.join(__dirname, 'posts.json');
const bodyParser = require("body-parser");
const express = require('express');
const multer = require('multer');
const session = require('express-session');
const path = require("path");
const usersRouter = require("./routes/users-router");
const postsRouter = require("./routes/posts-router");
const authRouter = require("./routes/auth-router");
const app = express();
const cors = require('cors');

// CORS 설정
app.use(cors({
    origin: 'http://localhost:3000', // 허용할 도메인 (프론트엔드 URL)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // 허용할 HTTP 메서드
    credentials: true, // 쿠키, 인증 정보 허용
}));

const PORT = 4000;// 서버분리..
/// Multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // 프로젝트 루트 기준으로 img/profile 디렉토리 설정
        const dir = path.join(__dirname, "../../img/profile");
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8'); // 인코딩 변환
        const sanitizedName = originalName.replace(/\s+/g, '_'); // 공백 제거 및 치환
        cb(null, sanitizedName);
    },
});

app.use(bodyParser.json());

// Multer: 게시글 이미지 저장 설정
const postStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // 프로젝트 루트 기준으로 img/profile 디렉토리 설정
        const dir = path.join(__dirname, "../../img/posts");
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8'); // 인코딩 변환
        const sanitizedName = originalName.replace(/\s+/g, '_'); // 공백 제거 및 치환
        cb(null, sanitizedName);
    },
});

const uploadPostImg = multer({storage: postStorage});
const upload = multer({storage});

app.use(
    session(
        {
            secret: "myKey", // [필수] SID를 생성할 때 사용되는 비밀키로 String or Array 사용 가능.
            resave: true, // true(default): 변경 사항이 없어도 세션을 다시 저장, false: 변경시에만 다시 저장
            saveUninitialized: true, // true: 어떠한 데이터도 추가되거나 변경되지 않은 세션 설정 허용, false: 비허용
            cookie: {
                httpOnly: true,
                secure: false,
                maxAge: 60 * 60 * 1000, // 1시간
            },
        })
);
// 로그 미들웨어
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

/// 미들웨어 설정
app.use(express.json()); // JSON 파싱
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일 제공
app.use('/img/profile', express.static(path.join(__dirname,"../img/profile"))); // 업로드된 파일 정적 제공
app.use('/img/posts', express.static(path.join(__dirname, "../img/posts"))); //
//--------라우터들 -----------
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/posts", postsRouter);
// 생각해보니 posts 안에 comments가 달려오니까 따로 라우트를 할 필요가없나??
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});