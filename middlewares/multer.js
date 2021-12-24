const multer = require('multer')
const maxSize = 10000 // 10000 bytes = 10kb

const storage = multer.diskStorage({
        destination:function(req,file,cb){
            cb(null,'./profile_img')
        },
        filename:function(req,file,cb){
            cb(null,file.originalname+'-'+Date.now())
        },
})
 
 const upload = multer({
        storage:storage,
        limits: { fileSize: maxSize },
        fileFilter:(req, file, cb)=>{
            if(!file.mimetype.match(/jpe|jpeg|png|gif$i/)) {
                cb(new Error('Only jpeg and png file support'),false)
                return
            }
            cb(null,true)
        },
})

module.exports = upload;