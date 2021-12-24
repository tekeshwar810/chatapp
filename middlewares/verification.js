const jwt = require("jsonwebtoken"); // to generate signed token
const logger = require("../logger");

exports.check_login =(req,res,next)=>{
    console.log('get api user list run')
    logger.debug('inside the check login function')
    const myToken = localStorage.getItem('myToken')
    try{
    const tokenObj = jwt.verify(myToken,process.env.JWT_SECRET)
    req.id = tokenObj._id
    next()
    }catch(e){
        logger.error('token not decode')
        res.status(401).json({success:false,msg:'you need to login'})
    }
}

exports.user_verification = (req,res,next)=>{
    logger.debug('inside user verification function')
    const myToken = localStorage.getItem('myToken')
    jwt.verify(myToken, process.env.JWT_SECRET, (err, authData) => {
      console.log(authData, req.params.Id);
        if(err){
            logger.error('token not decode')
            res.status(403).json({success:false,msg:'you need to login'});
        }else{
            if(authData._id == req.params.Id || authData.role == 1) {
                 next()
              }
            else{
                 logger.error('only user update own details')  
                 res.status(400).json({success:false,msg:'you are only edit your own details or admin'});
            }
         }
      });
}

exports.password_auth = (req,res,next)=>{
      logger.debug('inside password auth function')  
      const myToken = localStorage.getItem('myToken')
      jwt.verify(myToken, process.env.JWT_SECRET, (err, authData) => {
      console.log(authData, req.params.userId);
        if(err){
            logger.error('token not decode')
            res.status(403).json({success:false,msg:'you need to login'});
        }else{
            if(authData._id == req.params.userId) {
                 next()
              }
            else {
                logger.error('only user change own password')
                res.status(403).json({success:false,msg:'you are only change your own password'});
            }
         }
      });
   
}

exports.del_auth = (req,res,next)=>{
    logger.debug('inside user del auth function')
    const myToken = localStorage.getItem('myToken')
    jwt.verify(myToken, process.env.JWT_SECRET, (err, authData) => {
      if(err){
          logger.error('token not decode')
          res.status(403).json({success:false,msg:'you need to login'});
      }else{
          if(authData.role === 1) {
               next()
            }
          else {
              logger.error('only admin remove to user')
              res.status(403).json({success:false,msg:'only admin can remove to user'});
          }
       }
    });
 
}

exports.admin_auth = (req,res,next)=>{
    logger.debug('inside admin auth function')
    const myToken = localStorage.getItem('myToken')
    jwt.verify(myToken, process.env.JWT_SECRET, (err, authData) => {
      if(err){
          logger.error('token not decode')
          res.status(403).json({success:false,msg:'you need to login'});
      }else{
          if(authData.role === 1) {
               next()
            }
          else {
              logger.error('you are not authorize')
              res.status(403).json({success:false,msg:'you are not authorize'});
          }
       }
    });
}




