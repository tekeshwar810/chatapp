const express = require('express');
const router = express.Router();
const { signup,signin,list_user,user_info,update_user,remove_user,update_password,logout,email_verification,manage_status,gmailSign,user_count,login_status,chat_page } = require("../controllers/users")
const { image_validation } = require("../middlewares/img_validation") 
const { userSignupValidator,userUpdateValidator,userPasswordValidator,checkEmail,user_active_check } = require("../middlewares/validation") 
const { check_login,user_verification,password_auth,del_auth,admin_auth } = require("../middlewares/verification")

router.post("/user_signup",userSignupValidator,signup) 
router.post("/user_signin",user_active_check ,signin)
router.post("/user_gmail_signin",gmailSign)
router.get("/user_list/:userId", list_user) 
router.get("/user_profile_info/:Id",user_verification, user_info) //when user click edit button then (user_verification) middleware check only user is update own details and also admin
router.put("/user_details_update/:userId",check_login, image_validation, checkEmail, userUpdateValidator, update_user)
router.patch("/user_password_update/:userId",password_auth, userPasswordValidator, update_password) // when user update the password then (password_auth) middleware check only user is update own password
router.delete("/user_delete/:userId",del_auth, remove_user)
router.get("/user_logout/:userId",logout)

router.get("/user_verify_email/:Token",email_verification)
router.put("/user_manage_status/:userId",admin_auth,manage_status) // user account active of deactive
router.get("/user_offile_online_count",admin_auth,user_count)
router.put("/user_login_status_change/:userId",login_status)

router.get('/user_signin',check_login,chat_page)

module.exports = router;
