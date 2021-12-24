const mongoose = require("mongoose");
const schema = mongoose.Schema

const grpSchema = new schema({
   room_id:{
       type:String
   },
   text_msg:{
       type:String  //text_msg wali field normal msg or img dono k liye same h
   },
   senderId:{
       type:String
   },
   senderName:{
       type:String
   },
   current_time:{
       type:String
   },
   msg_type:{
       type:String  //img or text(type of msg)
   }
},{timestamps:true})

module.exports = mongoose.model("grp_conversation", grpSchema);
