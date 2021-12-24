const mongoose = require("mongoose");
const schema = mongoose.Schema

const groupSchema = new schema({
    name:{
        type:String //this is group name
    },
    members_id:{
        type:Array
    },
    room_id:{
        type:String
    },
    grp_creator_id:{
        type:String
    },
    grp_creator_name:{
        type:String
    }
},{timestamps:true})

module.exports = mongoose.model("groups", groupSchema);
