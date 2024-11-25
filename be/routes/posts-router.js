const express = require("express");
const path = require("path");
const postsRouter = express.Router();
const postsController = require("../controllers/posts-controller");
const multer = require("multer");
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
//게시글 목록 조회
postsRouter.get("/",postsController.getPosts);
//게시글 상세 조회
postsRouter.get("/:postId",postsController.getPost);
//게시글 작성
postsRouter.post("/",uploadPostImg.single("postImg"),postsController.postPost);
//게시글 수정
postsRouter.put("/:postId",uploadPostImg.single("editPostImg"),postsController.editPost);
//게시글 삭제
postsRouter.delete("/:postId",postsController.deletePost);
//댓글 작성
postsRouter.post("/:postId/comments",postsController.postComments);
//댓글 조회
postsRouter.get("/:postId/comments/:commentsId",postsController.getComments);
//댓글 수정
postsRouter.put("/:postId/comments/:commentsId",postsController.putComments);
//댓글 삭제
postsRouter.delete("/:postId/comments/:commentsId",postsController.deleteComments);


//댓글 목록 조회


module.exports = postsRouter;