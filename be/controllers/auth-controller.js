const bcrypt = require("bcrypt");
const path = require("path");
const fileSystem = require("fs");
const fsPromises = require("fs").promises; // 비동기 파일 작업용
const userPath = path.join(__dirname, "../../users.json");

// 회원가입
const postSignup = (req, res) => {
    try {
        const { email, password, name } = req.body;
        const profileImagePath = `/img/profile/${req.file.filename}`;

        if (!req.file) {
            return res.status(400).json({ message: "프로필 이미지가 업로드되지 않았습니다." });
        }
        if (!email || !password || !name) {
            return res.status(400).json({ message: "필수 입력값이 누락되었습니다." });
        }

        if (!fileSystem.existsSync(userPath)) {
            fileSystem.writeFileSync(userPath, JSON.stringify([], null, 2), "utf-8");
        }

        const users = JSON.parse(fileSystem.readFileSync(userPath, "utf-8") || "[]");
        if (users.some((user) => user.email === email)) {
            return res.status(409).json({ message: "이미 사용 중인 이메일입니다." });
        }
        if (users.some((user) => user.name === name)) {
            return res.status(409).json({ message: "이미 사용 중인 닉네임입니다." });
        }

        const newUserId = users.length > 0 ? Math.max(...users.map((user) => user.user_id)) + 1 : 1;
        const encryptedPassword = bcrypt.hashSync(password, 10);

        const newUser = { user_id: newUserId, email, password: encryptedPassword, name, profileImagePath };
        users.push(newUser);
        fileSystem.writeFileSync(userPath, JSON.stringify(users, null, 2), "utf-8");
        res.status(201).json({ message: "회원가입이 완료되었습니다.", data: { user_id: newUserId } });
    } catch (error) {
        console.error("서버 에러 발생:", error);
        res.status(500).json({ message: "서버에서 문제가 발생했습니다." });
    }
};

// 로그인
const postLogin = (req, res) => {
    const { email, password } = req.body;

    let users = [];
    if (fileSystem.existsSync(userPath)) {
        const data = fileSystem.readFileSync(userPath, "utf-8");
        users = data ? JSON.parse(data) : [];
    }

    const user = users.find((user) => user.email === email);
    if (!user) {
        return res.status(401).json({ message: "이메일 또는 비밀번호가 잘못되었습니다.", data: null });
    }

    const passwordValid = bcrypt.compareSync(password, user.password);
    if (!passwordValid) {
        return res.status(401).json({ message: "이메일 또는 비밀번호가 잘못되었습니다.", data: null });
    }

    req.session.user = {
        id: user.user_id,
        nickname: user.name,
        profileImg: user.profileImagePath,
        email: user.email,
    };

    console.log("세션 정보 저장 성공:", req.session.user);
    res.status(200).json({
        message: "로그인 성공",
        user: req.session.user,
    });
};

// 세션 정보 반환
const getSession = (req, res) => {
    if (req.session && req.session.user) {
        return res.status(200).json({ user: req.session.user });
    }
    res.status(401).json({ message: "로그인 정보가 없습니다." });
};

module.exports = {
    postSignup,
    postLogin,
    getSession,
};
