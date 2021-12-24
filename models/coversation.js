const mongoose = require("mongoose");
const schema = mongoose.Schema

const conversationSchema = new schema({
   senderId:{
       type:String
   },
   senderName:{
       type:String
   },
   recieverId:{
       type:String
   },
   reciverName:{
       type:String
   },
   text_msg:{
       type:String //text_msg field (img_base64 and msg jo normal text h dono k liye same h)
   },
   current_time:{
       type:String,
       default:""
   },
   msg_type:{
       type:String,
       default:""
   },
   file_s:{
       type:String,
       default:""
   },
   file_name:{
       type:String,
       default:""
   }

},{timestamps:true})

module.exports = mongoose.model("conversation", conversationSchema);
