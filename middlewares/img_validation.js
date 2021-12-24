const upload = require("../middlewares/multer")
const multer = require('multer')
const logger = require("../logger");

exports.image_validation = (req, res, next) => {
    upload.single('profile_pic')(req,res,(err)=>{
        if (err instanceof multer.MulterError) {
             logger.error('image size error')   
             res.status(400).json({msg:"Max image size 10kb allowed!"});
        }
        else if(err){
            logger.error('image type error')               
            res.status(400).json({success:false,msg:err.message})
        }
        else{
            next()
        }
   })
};
  