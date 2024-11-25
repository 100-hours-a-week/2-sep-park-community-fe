const {postSignup} = require("./auth-controller");
const postLogout = (req,res)=>{
    req.session.destroy(err => {
        if (err) {
            console.error("세션 삭제 오류:", err);
            return res.status(500).json({message: "로그아웃에 실패했습니다."});
        }
        res.clearCookie('connect.sid'); // 세션 쿠키 삭제
        res.status(200).json({message: "로그아웃 성공"});
    });
};
module.exports = {
    postLogout,
};