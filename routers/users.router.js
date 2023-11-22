const express = require("express")
const usersRouter = express.Router();
const needSignin = require("../middlewares/need-signin.middleware")

usersRouter.get("/profile", needSignin, (req, res)=>{
    try {
        const me = res.locals.user;

        return res.status(200).json({
            success: true,
            message: "내 정보 조회에 성공했습니다.",
            data: me,
        })
    } catch {
        console.error(error);
        return res.status(500).json({
          success: false,
          message: '예상치 못한 에러가 발생했습니다. 관리자에게 문의하세요.',
        });
    }
})

module.exports = usersRouter;