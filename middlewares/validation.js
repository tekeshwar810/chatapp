const user_modal = require("../models/users")
const bcrypt = require('bcryptjs')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const sendEmail = require("../nodemailer/email")
const logger = require("../logger");

async function validatePassword(plainPassword, hashedPassword){
    return await bcrypt.compare(plainPassword, hashedPassword)
}

exports.userSignupValidator = (req, res, next) => {
    logger.debug('inside signup validation fuction')
    req.check('name', 'Name is required').notEmpty()
        .isAlpha()
        .withMessage('please enter only aplphabat in name field ');
    
    req.check('email', 'Email is required').notEmpty();
    req.check('email')
        .matches(/.+\@.+\..+/)    
        .withMessage('Invalid email id')
        .isLength({max:55})
        .withMessage('email max length is 55')

    req.check('password', 'Password is required').notEmpty();
    req.check('password')
        .isLength({ min: 6 })
        .withMessage('Password must contain at least 6 characters')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/)
        .withMessage('Password must contain at least one (numeric digit,uppercase,lowercase) and length 6-20  ');
 
    function isDate(str) {    
        var parms = str.split(/[\\\/]/);
        var yyyy = parseInt(parms[2],10);
        var mm   = parseInt(parms[1],10);
        var dd   = parseInt(parms[0],10);
        var date = new Date(yyyy,mm-1,dd,0,0,0,0);
        return mm === (date.getMonth()+1) && dd === (date.getDate()) && yyyy === date.getFullYear();
    }

    const errors = req.validationErrors();
    if (errors) {
        const firstError = errors.map(error => error.msg)[0];
        logger.error(firstError)
        console.log('psfdsjkf',firstError)
        res.render('register',{err_msg:firstError})
        // return res.status(400).json({ success:false, msg:firstError });
    }else{
    const dates = req.body.dob
    const resp = isDate(dates)
    if(resp === true && dates.match(/(((0|1)[0-9]|2[0-9]|3[0-1])\/(0[1-9]|1[0-2])\/((19|20)\d\d))$/)){
       next()
    }else{
        logger.error('invalid date error')
        res.render('register',{err_msg:firstError}) 
        // return res.status(400).json({ success:false, msg:'Invaild Date of Birth Ex:(dd/mm/yyyy)' });
    }
  }
}

//user update the email then check email already exist or not and user change the email then email verifiction link sent his old email 
exports.checkEmail = async(req,res,next)=>{
    logger.debug('inside email check fuction')
    const userData = await user_modal.findOne({email:req.body.email})
    if(userData){
        if(userData._id == req.params.userId){
              next()
        }else{
            logger.error('email exist error')
            res.status(400).json({success:false,msg:'email already exist'})
        }
      }else{
        const userInfo = await user_modal.findOne({_id:req.params.userId})
        if(userInfo){
            const new_token = jwt.sign({ _id: userInfo._id}, process.env.JWT_SECRET,{expiresIn:"10m"})
            const Resp = await sendEmail.Mail(userInfo.email,new_token)
            if(Resp == 'success'){
                req.userMsg = 'email verification link sent successfully'
                req.email_verify_token = new_token
                next()
            }else{
                logger.error('verification link error')
                res.status(400).json({success:false,msg:'email verification link not sent'})        
            }
        }
    }
}

exports.userUpdateValidator = (req, res, next) => {
    logger.debug('inside update user info validation fuction')
    req.check('name', 'Name is required').notEmpty()
        .isAlpha()
        .withMessage('please enter only aplphabat in name field ');
    
    req.check('email', 'Email is required').notEmpty();
    req.check('email')
        .matches(/.+\@.+\..+/)    
        .withMessage('Invalid email id')
        .isLength({max:75})
        .withMessage('email max length is 75')
        
    function isDate(str) {    
            var parms = str.split(/[\\\/]/);
            var yyyy = parseInt(parms[2],10);
            var mm   = parseInt(parms[1],10);
            var dd   = parseInt(parms[0],10);
            var date = new Date(yyyy,mm-1,dd,0,0,0,0);
            return mm === (date.getMonth()+1) && dd === (date.getDate()) && yyyy === date.getFullYear();
     }
    
    const errors = req.validationErrors();
        if (errors) {
            if(req.file){
              fs.unlinkSync(req.file.path)
            }
            const firstError = errors.map(error => error.msg)[0];
            logger.error(firstError)
            return res.status(400).json({ success:false, msg:firstError });
        }else{
        const dates = req.body.dob
        const resp = isDate(dates)
        if(resp === true && dates.match(/(((0|1)[0-9]|2[0-9]|3[0-1])\/(0[1-9]|1[0-2])\/((19|20)\d\d))$/)){
           next()
        }else{
            if(req.file){
            fs.unlinkSync(req.file.path)
            }
            logger.error('invaild date error')
            return res.status(400).json({ success:false, msg:'Invaild Date of Birth Ex:(dd/mm/yyyy)' });
        }
      }
};

exports.userPasswordValidator = (req, res, next)=>{
    logger.debug('inside password validation fuction')
    req.check('old_password', 'old password is required').notEmpty();

    req.check('new_password', 'new password is required').notEmpty();
    req.check('new_password')
        .isLength({ min: 6 })
        .withMessage('Password must contain at least 6 characters')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/)
        .withMessage('Password must contain at least one (numeric digit,uppercase,lowercase) and length 6-20  ');

    const errors = req.validationErrors();
    if (errors) {
        const firstError = errors.map(error => error.msg)[0];
        logger.error(firstError)
        return res.status(400).json({ success:false,msg: firstError });
    }
    else{
       next()
    }
}

exports.user_active_check = async(req,res,next)=>{
    logger.debug('inside check user active or not fuction')
    const { email, password } = req.body
    const infoUser = await user_modal.findOne({email:req.body.email})
    if(infoUser){

        if(infoUser.email_verify === true || infoUser.email_verify === false){
            if(infoUser.status === true || infoUser.email_verify === false){
             
                const validPassword = await validatePassword(password, infoUser.password)
                    if (!validPassword) {
                        logger.error('password invalid')
             
                        res.status(401).json({success:false,msg:'Password is invailid'})
                    }else{
                        
                        req.user = infoUser
                        next()
                }
            }else{
                logger.error('email not activate error')
                res.status(401).json({msg:'your account is not active please contact to admin',success:false})        
            }
        }else{  
                logger.error('email verfiy error')
                res.status(401).json({msg:'your email id is not verify',success:false})        
        }
    }else{
        logger.error('user not exist please signup')
        res.status(400).json({msg:'this user not exist,Please SignUp',success:false})
    }

}

