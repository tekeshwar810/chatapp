const cloudenary = require('cloudinary').v2
cloudenary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.cloud_api_key,
    api_secret: process.env.cloud_api_secret
   });

let users = []
const add_user = (userId,socketId,userName)=>{
    if(users.length === 0){
        users.push({userId,socketId,userName})
    }else{
        const userIndex = users.findIndex((user)=> user.userId === userId)
        console.log(userIndex)
        if(userIndex === -1){
            users.push({userId,socketId,userName})
        }else{
            users.splice(userIndex,1)
            users.push({userId,socketId,userName})
        }
    }
}

const send_msg = (reId)=>{
    const result = users.find((user)=> user.userId === reId)
    return result
}

const onlineUser = (reId)=>{
    const result = users.find((user)=> user.userId === reId)
    return result
}

const remove_user = (socketId) =>{
    const remove = users.findIndex((user)=> user.socketId === socketId)
    users.splice(remove,1)
}

function chat(io){
    io.on('connection', (socket) => {
        console.log('sokect connected...')
        socket.on("addUser",(userId,userName)=>{

            add_user(userId,socket.id,userName)
            console.log(users)
            
        })

        socket.on("join_room",(roomId=>{
            socket.join(roomId)
            io.to(socket.id).emit("room_msg",'you are join the room',roomId)
        }))    

        socket.on("online_user",(userid,reId)=>{
                const online_Obj = {}
                users.forEach((ele)=>{
                online_Obj.reId = ele.userId
                online_Obj.status = 'Online'
                io.emit("get_online_user",online_Obj)
                })
        })

        socket.on("sendMsg",(sn,userId,re_name,re_id,msg,current_time)=>{
            const data = send_msg(re_id)
            const reObj = {}
            reObj.senderName = sn
            reObj.msg = msg
            if(data != undefined){
            io.to(data.socketId).emit("getMsg",sn,msg,userId,current_time)
            }
        })

        socket.on("sendImg",(sn,userId,re_name,re_id,img_base64,current_time)=>{
            const data = send_msg(re_id)
            const reObj = {}
            reObj.senderName = sn
            reObj.img = img_base64
            if(data != undefined){
               io.to(data.socketId).emit("getImg",sn,img_base64,userId,current_time)
            }
        })

        socket.on("send_pdf_doc",(sn,userId,re_name,re_id,url,current_time,file_s,file_ext,file_name)=>{
           console.log('fsd',url)
            const data = send_msg(re_id)
            const reObj = {}
            reObj.senderName = sn
            reObj.img = url
         
            if(data != undefined){
               io.to(data.socketId).emit("get_pdf_doc",sn,url,userId,current_time,file_s,file_ext,file_name)
            }
        })

        socket.on("group_send_msg",(sn,roomId,msg)=>{
            socket.to(roomId).emit('group_get_msg',sn,roomId,msg) // Socket.to('room-name').emit() send the data which connect the same room but not get the data own
        })

        socket.on("group_send_img",(sn,roomId,img_base64)=>{
            socket.to(roomId).emit('group_get_img',sn,roomId,img_base64) 
        })

        socket.on("doc_upload_url",(stream,doc_Base64)=>{
            console.log(stream,doc_Base64,'zip file come')
        // cloudenary.uploader.upload(doc_Base64, {resource_type: "raw" },(err,result) => {
        //     if(err){
        //         console.log(err)
        //     }else{
        //         let doc_url = result.url
        //         console.log(doc_url,result)
        //         const data = send_msg(userId)
        //         io.to(data.socketId).emit("get_doc_url",doc_url,loderID)
        //     }
        //  })
        })

        socket.on("Typing",(userid,reId)=>{
            const getData = users.find((user)=> user.userId === reId)
            console.log(getData,'ttt')
            if(getData){
                const obj = {
                    txt:'typing...',
                    blank:' ',
                    userid:userid
                }
                io.to(getData.socketId).emit('Typing_Msg',obj)
            }
        })
        const gry_not = (grp_ids)=>{
            const grp_Obj = users.filter((e)=>{
                return grp_ids.includes(e.userId)
             })
             return grp_Obj
        }
        socket.on('disconnect',()=>{
            const r_user = remove_user(socket.id)
            const status = " "
            io.emit('offline_user',status)
        })
        
    });
   
    // {
    // io.on('connect', (Socket) => { 
    //     Socket.emit('userid',Socket.id)
    //     Socket.broadcast.emit('message',`this user connect now ${Socket.id}`) // when user connect socket then send other user msg but not send message  own

    //     Socket.on('msg',(data)=>{ //Socket.on() recieve the data from frontend 
    //         console.log(data)
    //         io.emit('msg',data+'send') //io.emit() send the data from backend
    //     })

    //     Socket.on('send-msg',(Msg,room)=>{
    //         console.log(Socket.id)
    //         if(room === ""){
    //             Socket.broadcast.emit('send-msg',Msg) // Socket.broadcast.emit() send the data all connect user but not send own
    //         }else{
    //             console.log(Msg,room,'runfds') 
    //             Socket.to(room).emit('send-msg',Msg) // Socket.to('room-name').emit() send the data which connect the same room but not get the data own
    //             // io.to('room-name').emit() send the data which connect the same room but get data own
    //         }
    //     })
    //     Socket.on('room-join',(name_room)=>{
    //         Socket.join(name_room)
    //         io.emit('room-join',name_room)
    //     })

    //     Socket.on('Typing',(obj)=>{
    //         console.log(obj)
    //         Socket.to(obj.room_name).emit('Typing',obj,Socket.id)
            
    //     })

    //     Socket.on('disconnect',()=>{
    //         io.emit('message',`this user left the chat :- ${Socket.id}`)
    //     })
    // }); 
    // }
}

module.exports = chat