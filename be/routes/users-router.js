const express = require("express");
const usersRouter = express.Router();
const usersController = require("../controllers/users-controller");
const multer = require("multer");
/// Multer 프로필 설정
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
//로그아웃
usersRouter.post("/logout",usersController.postLogout);
//회원정보 수정

//회원정보 삭제

//회원 비밀번호 수정

module.exports = usersRouter;