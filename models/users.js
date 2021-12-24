const mongoose = require("mongoose");
const schema = mongoose.Schema

const userSchema = new schema({
    name:{
        type:String,
    },
    email:{
        type:String,
    },
    password:{
        type:String
    },
    dob:{
        type:String
    },
    profile_pic:{
        type:String,
    },
    token:{
        type:String,
        default:""
    },
    role:{
        type:Number,
        default:0 //0= user and 1= admin
    },
    email_verify:{
        type:Boolean,
        default:false
    },
    email_verify_token:{
        type:String
    },
    check_login:{
        type:Boolean
    },
    status:{
        type:Boolean, // admin change the user status when user email successfully verfiy
        default:false 
    },
    social_id:{
        type:String //gmail or facebook unique id
    },
    social_type:{
        type:String // social login type ex gmail and facebook
    },
    group_ids:[{
        type:schema.Types.ObjectId,
        ref:"groups"
    }]


},{timestamps:true})

module.exports = mongoose.model("users", userSchema);
