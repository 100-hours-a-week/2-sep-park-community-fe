const path = require('path');
const fsPromises = require("fs").promises; // 비동기 파일 작업용
const userPath = path.join(__dirname, '../../users.json');
const postPath = path.join(__dirname, '../../posts.json');
const commentsPath = path.join(__dirname, '../data/comments.json'); // 댓글 데이터 경로

const fileSystem = require("fs");
// 게시글 데이터 읽기 함수
const readPosts = async () => {
    try {
        const data = await fsPromises.readFile(postPath, "utf-8");
        return JSON.parse(data || "[]");
    } catch (error) {
        if (error.code === "ENOENT") {
            // 파일이 없을 경우 초기화
            await fsPromises.writeFile(postPath, JSON.stringify([], null, 2), "utf-8");
            return [];
        }
        throw error;
    }
};

// 게시글 데이터 쓰기 함수
const writePosts = async (posts) => {
    await fsPromises.writeFile(postPath, JSON.stringify(posts, null, 2), "utf-8");
};







//게시글 목록조회
const getPosts = async (req, res) => {
    //세선정보 없을때(로그인이 안됨)
    if(!req.session.user){
        return res.status(401).json({ message: 'Unauthorized' }); // 로그인이 필요함
    }

    try {
        //json파일경로 읽어오기
        const rawPosts = fileSystem.readFileSync(postPath, 'utf-8');
        const rawUsers = fileSystem.readFileSync(userPath, 'utf-8');
        //파싱
        const posts = JSON.parse(rawPosts);
        const users = JSON.parse(rawUsers);
        //id 대조해서 정보저장
        const formattedPosts = posts.map(post => {
            const user = users.find(u => u.user_id === post.userId) || {};
            return {
                postId: post.post_id,
                title: post.title,
                content: post.content,
                postImagePath: post.postImagePath,
                date_at: post.DateAt,
                author: user.name || "Unknown",
                profile_image: user.profileImagePath || null,
                like_count: post.likeCount || 0,
                comment_count: post.commentCount || 0,
                view_count: post.viewCount || 0,
            };
        });

        res.status(200).json({
            message: "Posts retrieved successfully",
            data: {posts: formattedPosts},
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve posts",
            error: error.message,
        });
    }
};


//게시글상세조회
const getPost = async (req, res) => {
    try {
        const {postId} =req.params;
        console.log('Received postId:', postId);
        // 파일 읽기
        const rawPosts = fileSystem.readFileSync(postPath, 'utf-8');
        const rawUsers = fileSystem.readFileSync(userPath, 'utf-8');

        const posts = JSON.parse(rawPosts);
        const users = JSON.parse(rawUsers);

        // 특정 게시글 찾기
        const post = posts.find((post) => post.post_id === Number(postId));
        if (!post) {
            return res.status(404).json({
                message: "게시글을 찾을 수 없습니다2.",
            });
        }

        // 작성자 정보 매핑
        const user = users.find((u) => u.user_id === post.userId) || {};

        // 상세 게시글 데이터 구성
        const formattedPost = {
            postId: post.post_id,
            title: post.title,
            content: post.content,
            postImagePath: post.postImagePath,
            date_at: post.DateAt,
            author: user.name || "Unknown",
            profile_image: user.profileImagePath || null,
            like_count: post.likeCount || 0,
            comment_count: post.commentCount || 0,
            view_count: post.viewCount || 0
        };

        res.status(200).json({
            message: "Post retrieved successfully",
            data: {post: formattedPost},
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve post",
            error: error.message,
        });
    }
};
// 게시글 작성
const postPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const user = req.session?.user;

        // 사용자 확인
        if (!user) {
            return res.status(401).json({ message: "로그인이 필요합니다." });
        }

        const { id: userId } = user; // 사용자 ID 추출

        // 유효성 검사
        if (!title || !content) {
            return res.status(400).json({ message: "제목과 내용을 입력해주세요." });
        }

        // 게시글 데이터 읽기
        const posts = await readPosts();

        // 이미지 경로 설정
        const postImagePath = req.file ? `/img/posts/${req.file.filename}` : null;

        // 날짜와 시간 포맷팅
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 10); // YYYY-MM-DD
        const formattedTime = now.toTimeString().slice(0, 8); // HH:MM:SS
        const DateAt = `${formattedDate} ${formattedTime}`;

        // 새 게시글 ID 생성
        const newPostId = posts.length > 0 ? Math.max(...posts.map((post) => post.post_id)) + 1 : 1;

        // 게시글 객체 생성
        const newPost = {
            userId,
            post_id: newPostId,
            title,
            content,
            postImagePath,
            DateAt,
            like_count: 0,
            comment_count: 0,
            view_count: 0,
        };

        // 게시글 추가
        posts.push(newPost);

        // 게시글 저장
        await writePosts(posts);

        // 로그로 게시글 정보 확인
        console.log("게시글 저장:", newPost);
        res.status(201).json({ message: "게시글이 생성되었습니다.", post: newPost });
    } catch (error) {
        console.error("게시글 작성 중 오류 발생:", error);
        res.status(500).json({ message: "서버에서 문제가 발생했습니다." });
    }
};

//// PUT: 게시글 수정
const editPost = async (req, res) => {
    const { postId } = req.params;
    const updatedData = req.body;
    const uploadedFile = req.file || null;

    console.log(`postId: ${postId}`);
    console.log('수정할 데이터:', updatedData);
    console.log('업로드된 파일:', uploadedFile);

    // 데이터 유효성 검사
    if (!updatedData.editTitle || !updatedData.editContent) {
        return res.status(400).json({ message: "제목과 내용을 모두 입력해주세요." });
    }

    try {
        // posts.json 읽기
        const data = await fsPromises.readFile(postPath, 'utf8');
        const posts = JSON.parse(data);
        const userId = req.session?.user?.id; // 세션에서 사용자 ID 추출

        // 게시글 찾기
        const postIndex = posts.findIndex((post) => post.post_id === Number(postId));
        if (postIndex === -1) {
            return res.status(404).json({ message: '해당 게시글을 찾을 수 없습니다.' });
        }

        // 권한 확인
        if (posts[postIndex].userId !== userId) {
            return res.status(403).json({ message: '게시글 수정 권한이 없습니다.' });
        }

        // 파일 경로 설정 (새 파일 업로드 여부 확인)
        const postImagePath = uploadedFile ? `/img/posts/${uploadedFile.filename}` : posts[postIndex].postImagePath;

        // 게시글 데이터 업데이트
        posts[postIndex] = {
            ...posts[postIndex],
            title: updatedData.editTitle,
            content: updatedData.editContent,
            postImagePath,
        };

        console.log('수정된 게시글:', posts[postIndex]);

        // 파일 저장
        await fsPromises.writeFile(postPath, JSON.stringify(posts, null, 2), 'utf8');
        console.log('posts.json 파일이 성공적으로 업데이트되었습니다.');

        // 성공 응답
        res.status(200).json({ message: '게시글이 성공적으로 수정되었습니다.', post: posts[postIndex] });
    } catch (error) {
        console.error('서버 오류 발생:', error);
        res.status(500).json({ message: '서버에서 문제가 발생했습니다.' });
    }
};

// 게시글 삭제 API
deletePost = async (req, res) => {
    const { postId } = req.params;
    console.log('Received postId:', postId);

    // 세션에서 사용자 ID 가져오기
    const userId = req.session?.user?.id;
    if (!userId) {
        return res.status(401).json({ message: '사용자 인증이 필요합니다.' });
    }

    try {
        // posts.json 읽기
        const data = await fsPromises.readFile(postPath, 'utf8');
        const posts = JSON.parse(data);

        // 삭제 대상 게시글 찾기
        const postIndex = posts.findIndex((post) => post.post_id === Number(postId));
        if (postIndex === -1) {
            return res.status(404).json({ message: '해당 게시글을 찾을 수 없습니다.' });
        }

        // 권한 확인
        if (posts[postIndex].userId !== userId) {
            return res.status(403).json({ message: '게시글 삭제 권한이 없습니다.' });
        }

        // 게시글 삭제
        posts.splice(postIndex, 1); // 해당 인덱스의 게시글 삭제
        await fsPromises.writeFile(postPath, JSON.stringify(posts, null, 2), 'utf8');
        console.log(`게시글 ID ${postId} 삭제 완료`);

        res.status(200).json({ message: '게시글이 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error('서버 오류:', error.message);
        res.status(500).json({ message: '서버 오류: 게시글 삭제 실패' });
    }
};
//댓글 목록
// 댓글 조회
const getComments = async (req, res) => {
    const { postId } = req.params; // 게시글 ID
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' }); // 로그인이 필요함
    }

    try {
        // 댓글 및 사용자 데이터 읽기
        const rawComments = await fsPromises.readFile(commentsPath, 'utf-8');
        const rawUsers = await fsPromises.readFile(userPath, 'utf-8');
        const comments = JSON.parse(rawComments || '[]');
        const users = JSON.parse(rawUsers || '[]');

        // 댓글 필터링 (해당 게시글 ID에 해당하는 댓글만 추출)
        const filteredComments = comments.filter(comment => comment.postId === Number(postId));

        // 댓글 작성자 정보 매칭 및 포맷팅
        const formattedComments = filteredComments.map(comment => {
            const user = users.find(u => u.user_id === comment.userId) || {};
            return {
                commentId: comment.commentId,
                content: comment.content,
                date_at: comment.dateAt,
                author: user.name || "Unknown",
                profile_image: user.profileImagePath || null,
            };
        });

        res.status(200).json({
            message: "Comments retrieved successfully",
            data: { comments: formattedComments },
        });
    } catch (error) {
        console.error('댓글 조회 중 오류:', error);
        res.status(500).json({
            message: "Failed to retrieve comments",
            error: error.message,
        });
    }
};


//댓글작성
const postComments = async (req, res) => {
    const { postId } = req.params; // 게시글 ID
    const { userId } = req.session.user; // 세션에서 사용자 ID 가져오기
    const { commentContent } = req.body; // 요청 바디에서 댓글 내용 가져오기

    try {
        let comments = [];
        try {
            const data = await fsPromises.readFile(commentsPath, 'utf-8');
            comments = JSON.parse(data || '[]');
        } catch (error) {
            console.warn('댓글 데이터를 읽을 수 없으므로 초기화합니다.');
        }

        // new commentid 생성
        const newCommentId = comments.length > 0
            ? Math.max(...comments.map(comment => comment.commentId)) + 1 : 1;

        const dateAt = new Date().toISOString();


        const newComment = {
            commentId: newCommentId,
            postId: Number(postId),
            userId,
            content: commentContent.trim(),
            dateAt,
        };


        comments.push(newComment);
        await fsPromises.writeFile(commentsPath, JSON.stringify(comments, null, 2), 'utf-8');

        //응답성공
        res.status(201).json({
            message: '댓글이 성공적으로 작성되었습니다.',
            comment: newComment,
        });
    } catch (error) {
        console.error('서버 오류 발생:', error.message);
        res.status(500).json({ message: '서버 오류: 댓글 작성 실패' });
    }
};

module.exports = { postComments };

const putComments = async (req, res) => {

};
const deleteComments = async (req, res) => {

};
module.exports = {
    postPost,
    getPosts,
    getPost,
    editPost,
    deletePost,
    getComments,
    postComments,
    putComments,
    deleteComments,

};