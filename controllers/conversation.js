const conversation_modal = require("../models/coversation")
const group_modal = require("../models/group")
const grp_conversation = require("../models/group_conversation")
const userModal = require("../models/users")
var uniqid = require('uniqid');




exports.list_member = async (req,res)=>{
    const list = await userModal.find({role:0,_id:{$ne:req.params.userId}})
    res.render('add_member',{member_list:list,msg:''})
}   

exports.grp_msg_list = async (req,res)=>{
    const user_info = ()=>{
        userId = req.cookies.userId
        userName = req.cookies.userName
        var obj = {} 
        obj._id = userId
        obj.name = userName
        return obj
    }
    const userObj = user_info()
    let userL = req.cookies.user_list
    const grpInfo = await group_modal.findOne({room_id:req.params.roomId})    
    res.cookie("grp_info",grpInfo)
    const msgList = await grp_conversation.find({room_id:req.params.roomId})
    res.render("mychat",{msgList:msgList,user_list:userL,msg:userObj})
}

exports.msg_list = async (req,res)=>{
    const user_info = ()=>{
        userId = req.cookies.userId
        userName = req.cookies.userName
        var obj = {} 
        obj._id = userId
        obj.name = userName
        return obj
    }
    const userObj = user_info()
    let userL = req.cookies.user_list
    console.log(userL,'fsfsfsdf')
    const msgList = await conversation_modal
                        .find({$and:[{$or:[{senderId:req.params.sId ,recieverId:req.params.rId},
                        {senderId:req.params.rId ,recieverId:req.params.sId}]}]})
    res.render("mychat",{msgList:msgList,user_list:userL,msg:userObj})
}

exports.msg_save = async(req,res)=>{
    if(req.body.room_id === undefined){
    try{
    // if(req.body.msg_type ==='pdf'){
    //     let base64Path = req.body.text_msg
    //     console.log('pdf come')
    //     cloudenary.config({
    //         cloud_name: process.env.cloud_name,
    //         api_key: process.env.cloud_api_key,
    //         api_secret: process.env.cloud_api_secret
    //     });
    //     cloudenary.uploader.upload(base64Path, {resource_type: "raw" },  (err, result) => {
    //         if(err){
    //             console.log(err,'fsdf')
    //         }else{
    //         console.log(result)
    //         }
    //      })

            
    // }else{    
    let msgObj = new conversation_modal(req.body) 
       await msgObj.save()
       res.status(200).json({msg:'msg save success'})
    // }
    }catch(e){
       res.status(400).json({msg:'msg not save'})
     }
   }
   else{
    try{
        let grpMsgObj = new grp_conversation(req.body) 
        await grpMsgObj.save()
           res.status(200).json({msg:'group msg save success'})
        }catch(e){
           res.status(400).json({msg:'group msg not save'})
        }
   }
}

exports.grp_add = async (req,res)=>{
    const room_id = uniqid()
    const grp_creator_name = req.cookies.userName
    const grp_creator_id = req.cookies.userId
    const members_id = req.body.group_ids
    members_id.push(grp_creator_id)
    var member_info = await userModal.find({_id:members_id},{name:1})

    const grpObj = new group_modal({
        name:req.body.group_name,
        grp_creator_id:grp_creator_id,
        grp_creator_name:grp_creator_name,
        room_id:room_id
    })
    await grpObj.save()
    await Promise.all(member_info.map(async (obj) =>{
         await userModal.findOneAndUpdate({_id:obj._id},{$push:{group_ids:grpObj._id}})    
    })).then(async(resp)=>{
        grpObj.members_id = member_info
        await grpObj.save()
        res.status(200).json({sucess:true,msg:'Group Create Successfully'})
    }).catch((err)=>{
        res.status(400).json({sucess:false,msg:'group not create'})
    })
    
}

exports.add_other_mem = async(req,res)=>{
    const grp_info = req.cookies.grp_info
    const grpId = grp_info._id
    const info = await userModal.find({group_ids:{$ne:grpId}},{name:1})
    res.render('update_grp',{member_list:info})
    
}

exports.update_grp = async(req,res)=>{
   console.log(req.body,req.params.grpId,'dets')
  
   const grp_ids = req.body.group_ids
   if(grp_ids.length > 0) {
  
   var member_info = await userModal.find({_id:grp_ids},{name:1})
   console.log(member_info)
   await Promise.all(member_info.map(async (obj) =>{
        await userModal.findOneAndUpdate({_id:obj._id},{$push:{group_ids:req.params.grpId}})    
   })).then(async(resp)=>{
        update = {
            $set: {name: req.body.group_name},
            $push: {members_id: member_info}
          } 
       await group_modal.findOneAndUpdate({_id:req.params.grpId},update)
       res.status(200).json({sucess:true,msg:'Group Update Successfully'})
   }).catch((err)=>{
       res.status(400).json({sucess:false,msg:'group not update'})
   })
  }
  else{
    update = {
        $set: {name: req.body.group_name}
      } 
    await group_modal.findOneAndUpdate({_id:req.params.grpId},update)
    res.status(200).json({sucess:true,msg:'Group name Update Successfully'})
  }
}