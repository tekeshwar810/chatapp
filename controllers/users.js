const user_modal = require("../models/users")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const sendEmail = require("../nodemailer/email")
const logger = require("../logger");
var userId =''
var userName = ''

//password encrypt function
async function hashPassword(password){
    return await bcrypt.hash(password, 10)
}
//compare the encrypted password and normal password function
async function validatePassword(plainPassword, hashedPassword){
    return await bcrypt.compare(plainPassword, hashedPassword)
}

exports.chat_page = (req,res)=>{
    userId = req.cookies.userId
    userName = req.cookies.userName
    var obj = {} 
    obj._id = userId
    obj.name = userName
    res.render('mychat',{msg:obj})
}

exports.signup = async(req,res)=>{
    const { name,email,password,dob } = req.body;
    const hashedPassword = await hashPassword(password)
    const data_check = await user_modal.findOne({ email: email })
   
    if (!data_check) {
        const datas = new user_modal({
            name:name,
            email: email,
            password: hashedPassword,
            dob:dob
        })
    var userId = datas._id
    var emailId = datas.email
    var token = jwt.sign({ _id: userId }, 'myscretkey',{expiresIn:'10m'})
    
    const emailResp = 'success'
         if(emailResp == 'success'){
           datas.email_verify_token=token
           datas.save()
           .then((resp) => {
               /* res.status(200).json({msg:"email verification link sent on your email id",success:true,data:resp})*/
               res.redirect('/login')
            }).catch((error)=>{
                logger.error(error)
                // res.status(400).json({msg:"user not register",success:false})
                res.redirect('/signup')
            })
          }else if( emailResp == 'error'){
            res.status(500).json({msg:"email not sent",success:false})
        }
    }
    else{
        if(data_check.email_verify === false){
           const Re_token = jwt.sign({ _id: userId }, 'myscretkey',{expiresIn:'10m'})
           const rep_emailResp = await sendEmail.Mail(data_check.email,Re_token)
            if(rep_emailResp == 'success'){
               await user_modal.updateOne({_id:data_check._id},{$set:{email_verify_token:Re_token}})
               res.status(200).json({ msg:"new email verification link sent successfully",success:true}) 
            }
            else if( rep_emailResp == 'error'){
               res.status(500).json({msg:"email not sent",success:false})
            }
        }
        else if(data_check.email_verify === true && data_check.status ===  false){
            logger.error('account activation error')
            res.status(400).json({ msg:"email already exist and you account not activate by admin",success:false})
        }
        else{
            logger.error('email already exist error')
            res.status(400).json({ msg:"email already exist",success:false}) 
        }
    }
}

exports.signin = async(req,res)=>{
    
            const user = req.user
            console.log(req.body,user)
            const token = jwt.sign({ _id: user._id, role:user.role}, 'myscretkey')
            localStorage.setItem('myToken',token)
            await user_modal.updateOne({_id:user._id},{$set:{check_login:true}})
            const userData = {}
            userData._id = user._id
            userData.name = user.name
            userData.email = user.email
            userData.dob = user.dob
            userData.profile_pic = user.profile_pic
            userData.role = user.role
            userData.check_login = true
            userData.text = 'Welcome to Mychat App'
            res.cookie("userId", user._id)
            res.cookie("userName", user.name)
                      
            // res.status(200).json({success:true,msg:userData})
            res.render("mychat",{msg:userData,user_list:[],msgList:[]})
}

function userResp(userData){
    logger.debug('inside user info resp function')
    const data = {}
    data._id = userData._id
    data.email = userData.email
    data.profile_pic = userData.profile_pic
    data.role = userData.role
    return data
} 

exports.gmailSign = async(req,res)=>{
    const{ email,social_id,social_type,profile_pic } = req.body
    const result = (Object.keys(profile_pic).length === 0)?{'profile_img':process.env.DEMO_IMG}:{'profile_img':profile_pic};
    
    const user_info = await user_modal.findOne({$or: [{email:email},{social_id:social_id}]})
    if(!user_info){
    const userObj = new user_modal({
              email:email,
              social_id:social_id,
              social_type:social_type,
              email_verify:true,
              status:true,
              profile_pic:result.profile_img
          })
    
         const token = jwt.sign({ _id: userObj._id, role:userObj.role}, process.env.JWT_SECRET)
         localStorage.setItem('myToken',token)          
         const user = await userObj.save()
         const data_result = userResp(userObj)
         res.status(200).json({success:true,msg:'social login successfully',data:data_result})  
   }
   else{
        const token = jwt.sign({ _id: user_info._id, role:user_info.role}, process.env.JWT_SECRET)
        localStorage.setItem('myToken',token)
        const updatePic = await user_modal.updateOne({_id:user_info._id},{$set:{profile_pic:result.profile_img}})
        const user_result = userResp(user_info)
        user_result.profile_pic = result.profile_img
        res.status(200).json({success:true,msg:'social login successfully',data:user_result})     
    }
}

exports.logout = async(req,res)=>{
    await user_modal.updateOne({_id:req.params.userId},{$set:{check_login:false}})       
    localStorage.removeItem('myToken')
    res.redirect('/login')
    // res.status(200).json({msg:'logout successfully'})
}

exports.list_user = async(req,res)=>{
    userId = req.cookies.userId
    userName = req.cookies.userName
    var obj = {} 
    obj._id = userId
    obj.name = userName
    obj.text = 'Welcome to Mychat App'

    const group = await user_modal.findOne({_id:req.params.userId},{upsert:true}).populate('group_ids')
    const users = await user_modal.find({role:0,_id:{$ne:req.params.userId}},{name:1,email:1,dob:1,profile_pic:1})
    let user_list = users.concat(group.group_ids)
 
    if(user_list.length>0){
        res.cookie("user_list",user_list)
        res.render('mychat',{user_list:user_list,msg:obj,msgsdata:[],msgList:[]})
    }else{
        logger.debug('user list empty')
        res.status(204).json({user:'user list in empty'})
    }
}

exports.user_info = async(req,res)=>{
    const user_info = await user_modal.findOne({_id:req.params.Id},{token:0,password:0,role:0})
    res.status(200).json({success:true,userInfo:user_info})
}

exports.update_user = async(req,res)=>{
    if(req.userMsg == undefined){
        var emailVerify = true
        var msg_link = ''
        var newToken = ""
    }else{
        var emailVerify = false
        var msg_link = req.userMsg
        var newToken = req.email_verify_token
    }
    const update_user = await user_modal.findOneAndUpdate({_id:req.params.userId},
                        {name:req.body.name,
                         email:req.body.email,
                         dob:req.body.dob,
                         email_verify:emailVerify, 
                         email_verify_token:newToken
                        })
    if(update_user){
        if(req.file){
            if(Object.keys(update_user.profile_pic).length === 0){
             var img_path = req.file.path
             }else{
                fs.unlinkSync(update_user.profile_pic)
                var img_path = req.file.path
             }  
             try{
                const update_img = await user_modal.updateOne({_id:req.params.userId},{$set:{profile_pic:img_path}})
                res.status(200).json({success:true,msg:'user details successfully update with image',msg_link: msg_link})                  
             }catch(e){
                logger.error(e) 
                res.status(400).json({success:false,msg:'user image not update'})
             }
        }
        else{
           res.status(200).json({success:true,msg:'user details successfully update',msg_link:msg_link })            
        }
    }
    else{
        logger.error('user image not update error') 
        res.status(400).json({success:false,msg:'user details not update'})
    }
}

exports.update_password = async(req,res)=>{
    const { old_password,new_password,confirm_password }=req.body
    const userInfo = await user_modal.findOne({_id:req.params.userId})
    if(userInfo){
          const comparePassword = await validatePassword(old_password, userInfo.password)
          if(comparePassword){
               if(new_password != confirm_password){
                logger.error('password not match')   
                res.status(400).json({success:false,msg:'new password and confirm password not match'})
              }
              else{
                const encryptPassword = await hashPassword(new_password)
                await user_modal.updateOne({_id:req.params.userId},{$set:{password:encryptPassword}})
                res.status(200).json({success:true,msg:'password update successfully'})
              }
        }
        else{
              logger.error('wrong password') 
              res.status(400).json({success:false,msg:'old password is wrong'})
        }
   }else{
       logger.error('user not found')
    res.status(400).json({success:false,msg:'user data not found'})
   }
}

exports.remove_user = async(req,res)=>{
    const delete_user = await user_modal.findOneAndRemove({_id:req.params.userId})
    if(delete_user){
        res.status(200).json({success:true, msg:'user is remove successfully'})
    }else{
        res.status(400).json({success:false, msg:'user already remove'})
    }
}

exports.email_verification = async(req,res,next)=>{
    const Token = req.params.Token
    jwt.verify(Token,process.env.JWT_SECRET, async(err,data)=>{
        if(err){
            logger.error('token error')
            res.json({success:false,msg:'your email verification link is expire'})
        }else{
            const userInfo = await user_modal.findOne({email_verify_token:Token})
            if(userInfo){
                if(userInfo.status == true){
                    await user_modal.findOneAndUpdate({_id:userInfo._id},{$set:{email_verify:true, email_verify_token:""}})
                    res.json({success:true,msg:'your email verify successfully'})  
                }
                else{
                const admin_info = await user_modal.findOne({role:1}) 
                const adminMail = await sendEmail.admin_mail(admin_info.email,userInfo)
                if(adminMail == 'success'){ 
                const emailVerify = await user_modal.findOneAndUpdate({_id:userInfo._id},{$set:{email_verify:true, email_verify_token:""}})
                if(emailVerify){
                  res.json({success:true,msg:'your email verify successfully Please contact to admin for account activation'})
                }
               }else{
                   res.json({success:false,msg:'user infomation not sent to admin'})
               }
             }
           }else{
                logger.error('verification link expire')
                res.json({success:false,msg:'your email verification link is expire'})
            }
        }
  })
    
    
  

}

exports.manage_status = async(req,res)=>{
    if(Object.keys('status').length === 0 || req.body.status == undefined){
        res.json({code:400,msg:"please send any status"})
    }else{
    if(req.body.status === true){
        const data = await user_modal.findOne({_id:req.params.userId,status:true})
        if(data){ 
            res.status(400).json({success:false,msg:'user account already activate'})
        }else{
            await user_modal.findOneAndUpdate({_id:req.params.userId},{$set:{status:true}})
            res.status(200).json({success:true,msg:"user account activate successfully"})
        }
    }
    else if(req.body.status === false){
        const data = await user_modal.findOne({_id:req.params.userId,status:false})
        if(data){ 
            res.status(400).json({success:false,msg:'user account already deactivate'})
        }else{
            await user_modal.findOneAndUpdate({_id:req.params.userId},{$set:{status:false}})
            res.status(200).json({success:true,msg:"user account deactivate successfully"})
       }
    }
}
}

exports.user_count = async(req,res)=>{
    const online_user = await user_modal.find({$and:[{role:0},{check_login:true}]}).count()
    const offline_user = await user_modal.find({$and:[{role:0},{check_login:false}]}).count()
    res.status(200).json({success:true,online_user:online_user, offline_user:offline_user})
}

exports.login_status = async(req,res)=>{
    if(req.body.login_type == true){
         await user_modal.updateOne({_id:req.params.userId},{$set:{check_login:true}})
         res.status(200).json({success:true,msg:'user is online'})
    }else if(req.body.login_type == false){
        await user_modal.updateOne({_id:req.params.userId},{$set:{check_login:false}})
         res.status(200).json({success:true,msg:'user is offline'})
    }
}
