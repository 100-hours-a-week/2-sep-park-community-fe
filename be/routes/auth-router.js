const express = require("express");
const path = require("path");
const authRouter = express.Router();
const authController = require("../controllers/auth-controller");
const multer = require("multer");
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
const upload = multer({storage});
// 회원가입
authRouter.post("/signup", upload.single("profileImage"), authController.postSignup);
//로그인
authRouter.post("/login",authController.postLogin);
//세션 데이터 반환 라우터
authRouter.get("session",authController.getSession);

module.exports = authRouter;