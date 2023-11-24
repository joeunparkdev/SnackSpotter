const express = require("express")
const usersRouter = express.Router();
const isAuthenticated = require("../middlewares/authMiddleware");
const verifyToken = require("../middlewares/verifyToken.middleware");
const db = require("../models/index.js");
const { Users } = db;

usersRouter.get("/profile", isAuthenticated, verifyToken, async (req, res)=>{
    try {
        const user = res.locals.user;

        const { name, email } = await Users.findOne({where : { userId : user.id }});
        
        return res.status(200).json({
            success: true,
            message: "내 정보 조회에 성공했습니다.",
            data: {},
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
          success: false,
          message: '예상치 못한 에러가 발생했습니다. 관리자에게 문의하세요.',
        });
    }
})

usersRouter.put("/profile", isAuthenticated, verifyToken, async (req, res) => {
    try{
        const { name, email, introduce } = req.body;
        const user = res.locals.user;
        const userId = user.id;
    
        if(!name || !email) {
                return res.status(400).json({
                success: false,
                message: "이메일, 이름 둘 다 입력해야 합니다.",
                data: {}
            })
        }
    
        const updatedInfo = { name, email, introduce };
        const updatedUser = await Users.update(updatedInfo, { where : { id: userId }})
        res.status(200).json({
            success : true,
            message : "프로필 수정에 성공했습니다.",
            data: updatedUser
        })
    } catch(error) {
        console.error(error);
        return res.status(500).json({
          success: false,
          message: '예상치 못한 에러가 발생했습니다. 관리자에게 문의하세요.',
        });
    }

})

module.exports = usersRouter;