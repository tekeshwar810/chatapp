const clear_storage = ()=>{
    sessionStorage.removeItem("receiverDetails")
    
}

const grp_edit = ()=>{
        var x = document.getElementById("menu");
        if (x.style.display === "none") {
          x.style.display = "block";
        } else {
          x.style.display = "none";
        }
}

const attach_files = ()=>{
      var y= document.getElementById('attach_f')
        if (y.style.display === "none") {
            y.style.display = "block";
          } else {
            y.style.display = "none";
          }
}

const getTime = ()=>{
    const t = new Date()
    const hrs = t.getHours()
    const min = t.getMinutes()
    return new_time = hrs+":"+min
}

const private = (sName,sid,reName,reid,msg,msg_type,current_time,file_s,file_name)=>{ //msg perameter text_msg and img_base64 dono ki liye same h
    var obj = {}
    if(msg_type === 'img' || msg_type === 'text'){
    obj.senderId = sid
    obj.recieverId = reid
    obj.senderName = sName
    obj.reciverName = reName
    obj.text_msg = msg
    obj.current_time = current_time
    obj.msg_type = msg_type
    }else{
    obj.senderId = sid
    obj.recieverId = reid
    obj.senderName = sName
    obj.reciverName = reName
    obj.text_msg = msg
    obj.current_time = current_time
    obj.msg_type = msg_type
    obj.file_s = file_s
    obj.file_name = file_name
    }
    return obj
}

const save_msg = (sName,sid,reName,reid,msg,msg_type,file_s,file_name)=>{ //msg perameter text_msg and img_base64 dono or doc url ki liye same h
    const reciever = sessionStorage.getItem("receiverDetails")
    reinfo = JSON.parse(reciever)
    const current_time = getTime()
    const private_msg = private(sName,sid,reName,reid,msg,msg_type,current_time,file_s,file_name)
    axios.post(`/api/add_conversation/${private_msg.senderId}`,private_msg)
    .then((resp)=>{
        console.log(resp,'msg save successfully')
    }).catch((err)=>{
        console.log(err)
    })
  
}

const grp = (sName,roomId,msg,msg_type,sid,current_time)=>{
    var grp_obj = {}
    grp_obj.senderId = sid
    grp_obj.senderName = sName
    grp_obj.room_id = roomId
    grp_obj.text_msg = msg
    grp_obj.current_time = current_time
    grp_obj.msg_type = msg_type
    return grp_obj
}

const grp_save_msg = (sName,roomId,msg,msg_type,sid)=>{  //grp me bhi msg wala perameter text or img ke liye same h
    console.log('grup function run')
    const reciever = sessionStorage.getItem("receiverDetails")
    reinfo = JSON.parse(reciever)
    const current_time = getTime()
    const grp_msg = grp(sName,roomId,msg,msg_type,sid,current_time)
    axios.post(`/api/add_conversation/${grp_msg.senderId}`,grp_msg)
    .then((resp)=>{
        console.log(resp,'group msg save successfully')
    }).catch((err)=>{
        console.log(err)
    })
  
}

const LI = document.querySelectorAll('LI')
LI.forEach((li)=>{
     li.addEventListener('click',(e)=>{
         console.log(e,li.dataset.ele)
        const userDetail = JSON.parse(li.dataset.ele)
        const userId = document.getElementById('userId').innerText
        if(userDetail.room_id === undefined){
        const recObj = {}
        recObj.reId = userDetail._id
        recObj.reName = userDetail.name
        const re = JSON.stringify(recObj)
        sessionStorage.setItem("receiverDetails",re)
        }else{
        const recObj = {}
        recObj.room_id = userDetail.room_id
        recObj.members = userDetail.members_id
        recObj.reName = userDetail.name
        recObj.creator = userDetail.grp_creator_name
        recObj.creator_id = userDetail.grp_creator_id
        recObj._id = userDetail._id
        const re = JSON.stringify(recObj)
        sessionStorage.setItem("receiverDetails",re)
        }

    })
})


var socket = io.connect();

if(socket != undefined){
    
    console.log('Connected to socket...');
    socket.on('connect', () =>{
        // import { ss } from 'socket.io-stream'
// stream = ss.createStream()
        const reciever = sessionStorage.getItem("receiverDetails")
        reinfo = JSON.parse(reciever)
        const userid = document.getElementById('userId').innerHTML
        const userName = document.getElementById('userName').innerHTML
        console.log(userid,userName)
        socket.emit("addUser",userid,userName)

        if(reinfo != null){
            document.getElementById("attach_file").innerHTML = `<i class="fa fa-paperclip" aria-hidden="true"></i>`
            if(reinfo.room_id === undefined){
              document.getElementById('other_user').innerHTML = reinfo.reName
              socket.emit("online_user",userid,reinfo.reId)
            }else{
                const ary1 = []
                const ary2 = []
                document.getElementById('other_user').innerHTML = reinfo.reName
                const member_ary = reinfo.members
                member_ary.map((member)=>{
                    if(member._id === userid){
                        ary1.push(' '+'You')
                      
                    }else{
                        ary2.push(' '+member.name)  
                    }
                })

                console.log(ary1.concat(ary2))
                if(userid === reinfo.creator_id){
                    document.getElementById('edit').innerHTML = `<i class="fa fa-ellipsis-v" aria-hidden="true"></i>`
                }else{
                    document.getElementById('edit').innerHTML = " "
                }
                document.getElementById('create').innerHTML = `(Group Created By ${reinfo.creator})`
               
                document.getElementById('grp_member').innerHTML = ary1.concat(ary2)
                socket.emit("join_room",reinfo.room_id)
                socket.on("room_msg",(msg,roomId)=>{
                })
            }
        }else{
            console.log('detail null')
        }

        socket.on("get_online_user",(online_Obj)=>{
            if(reinfo.reId === online_Obj.reId){
                document.getElementById('Online').innerHTML = online_Obj.status
            }
        })

        socket.on("offline_user",(status)=>{
            document.getElementById('Online').innerHTML = status
        })

        socket.on("getMsg",(sn,msg,sid,current_time)=>{
            if(reinfo.reId === sid){
                const send_box = document.getElementById('chat-messages1')
                const divR = document.createElement('div')
                divR.classList.add('listMsg-2')
                divR.innerHTML = `<p id="txt_r" class="txt-msg2">${msg}<span class="Time" >${current_time}</span></p><br>`
                const sendMsg = send_box.appendChild(divR)
            }
        })

        socket.on("getImg",(sn,img_base64,sid,current_time)=>{
            if(reinfo.reId === sid){
                const send_box = document.getElementById('chat-messages1')
                const divRImg = document.createElement('div')
                divRImg.classList.add('listImg-2')
                divRImg.innerHTML = `<p class="img-msg2"><img src="${img_base64}" alt="" width="100px" height="100px"><span class="Time_img" >${current_time}</span><p>`
                const sendMsg = send_box.appendChild(divRImg)
            }

        })

        socket.on("get_pdf_doc",(sn,url,sid,current_time,file_s,file_ext,file_name)=>{
            console.log('get pdf doc run')
            if(reinfo.reId === sid){
                console.log('runijjf',url)
                const send_box = document.getElementById('chat-messages1')
                const divRImg = document.createElement('div')
                divRImg.classList.add('listDoc-2')
                divRImg.innerHTML = `<div align="center" class="doc-msg2">
                <p class="doc_name_1">${file_name}</p><div class="hide_loder"><a href =${url}><i class="fa fa-download" aria-hidden="true"></i></a></div>
                <div class="doc_info_1"><span class="doc_size"><i class="fas fa-circle"></i>${file_s} KB<i class="fas fa-circle"></i>${file_ext}</span><span class="doc_time">${current_time}</span></div>
                </div>`
                const sendMsg = send_box.appendChild(divRImg)
            }
        })
       
        socket.on("group_get_msg",(sn,roomId,msg)=>{
            if(reinfo.room_id === roomId){
                const current_time = getTime()
                console.log(roomId,msg,'reciver')
                const send_box = document.getElementById('chat-messages1')
                const divR = document.createElement('div')
                divR.classList.add('listMsg-2')
                divR.innerHTML =   `<p class="grp_rec">${sn}</p>
                                    <p id="txt_r" class="txt-msg2">${msg}<span class="Time" >${current_time}</span></p><br>`
                const sendMsg = send_box.appendChild(divR)
            }
        })

        socket.on("group_get_img",(sn,roomId,img_base64)=>{
            if(reinfo.room_id === roomId){
                const current_time = getTime()
                const send_box = document.getElementById('chat-messages1')
                const divRImg = document.createElement('div')
                divRImg.classList.add('listImg-2')
                divRImg.innerHTML =   `<p class="grp_rec">${sn}</p>
                                       <p class="img-msg2"><img src="${img_base64}" alt="No Preview" width="100px" height="100px"><span class="Time_img" >${current_time}</span><p>`
                const sendMsg = send_box.appendChild(divRImg)
            }
        })

        socket.on("Typing_Msg",(obj)=>{
            const reciever = sessionStorage.getItem("receiverDetails")
            const reinfo = JSON.parse(reciever)
            if(reinfo.reId === obj.userid){
                document.getElementById('typing').innerHTML = obj.txt
                setTimeout(() => {
                    document.getElementById('typing').innerHTML = obj.blank
               }, 3000);
            }
        })
       
    });
}else{
  console.log('socket not connected')
}

const sendMsg = ()=>{
    const chatMessages = document.querySelector('.chat-messages');
    const reciever = sessionStorage.getItem("receiverDetails")
    const reinfo = JSON.parse(reciever)
    if(reinfo != null){
    const redetails = sessionStorage.getItem("receiverDetails")
    const reobj = JSON.parse(redetails)
    const msg = document.getElementById('msg').value 
   
    const current_time = getTime()    
   
    const div = document.createElement('div')
    div.classList.add('listMsg-1')
    div.innerHTML = `<p id="txt_s" class="txt-msg1">${msg}<span class="Time" >${current_time}</span></p><br>`
    const send_box = document.getElementById('chat-messages1')

    const sendMsg = send_box.appendChild(div)
    document.getElementById('msg').value = '' 
    const sn = document.getElementById('userName').innerText   
    const userId = document.getElementById('userId').innerHTML
    
    var msg_type = "text"   
    if(reobj.room_id === undefined){
    socket.emit('sendMsg',sn,userId,reobj.reName,reobj.reId,msg,current_time) //s =sender r=reciver?
    save_msg(sn,userId,reobj.reName,reobj.reId,msg,msg_type)
    }else{
        socket.emit('group_send_msg',sn,reobj.room_id,msg)
         grp_save_msg(sn,reobj.room_id,msg,msg_type,userId)
    }
    }else{
        document.getElementById('msg').value = '' 
    }
}

const chooseImage = ()=>{
    document.getElementById('imageFile').click();
}

const chooseDoc = ()=>{
    document.getElementById('documentFile').click();
} 


const sendDoc = (event)=>{
    const file = event.files[0]
    // console.log(file.name,file)
    const file_size = (file.size/1024)
    const file_s = parseFloat(file_size).toFixed(2)
    const file_type = file.name
    const n_file_type = file_type.split(".")
    var file_ext = n_file_type.slice(-1)[0]
    
    const sn = document.getElementById('userName').innerText   
    const userId = document.getElementById('userId').innerHTML
    const reciever = sessionStorage.getItem("receiverDetails")
    const reinfo = JSON.parse(reciever)
    const current_time = getTime()  
   
    const reader = new FileReader()
    reader.addEventListener('load',function(){
        const doc_Base64 = reader.result
                 const sp = doc_Base64.split(';')      
        let loderID = Math.random().toString(36).substring(7); 
              
        if(file.type =="application/pdf"){
        const divImg = document.createElement('div')
        // <iframe src="${doc_Base64}" style ="pointer-events:none;object-fit:cover; overflow:hidden; overflow-x:hidden; overflow-y:hidden" width="105%"  scrolling="no" frameborder="0"></iframe>
            divImg.classList.add('listDoc-1')
            divImg.innerHTML = `<div align="center" class="doc-msg1">
                               <p class="doc_name">${file.name}</p><div id="${loderID}" class="loader"></div>
                               <div class="doc_info"><span class="doc_size"><i class="fas fa-circle"></i>${file_s} KB<i class="fas fa-circle"></i>${file_ext}</span><span class="doc_time">10:44</span></div>
                               <div>` 
            const send_box = document.getElementById('chat-messages1')
            const sendMsg = send_box.appendChild(divImg)

            
            socket.emit('doc_upload_url',loderID,doc_Base64,userId)
            socket.on('get_doc_url',(url,lodID)=>{
                var URL = url
                let loderId = document.getElementById(lodID)
                loderId.classList.remove("loader");
                loderId.classList.add('hide_loder')
                loderId.innerHTML =`<a href =${url}><i class="fa fa-download" aria-hidden="true"></i></a>`
                if(reinfo.room_id === undefined){ // send img privatlly
                     socket.emit('send_pdf_doc',sn,userId,reinfo.reName,reinfo.reId,URL,current_time,file_s,file_ext,file.name) //s =sender r=reciver?
                     save_msg(sn,userId,reinfo.reName,reinfo.reId,URL,file_ext,file_s,file.name)
                }else{ // send img in group
                    // socket.emit('group_send_img',sn,reinfo.room_id,img_base64)
                    // grp_save_msg(sn,reinfo.room_id,img_base64,msg_type,userId)
                }
            })
        }
        else{
            console.log('other doc')
            const divImg = document.createElement('div')
            divImg.classList.add('list_otherDoc-1')
            divImg.innerHTML = `<div class="Other-doc-msg1">
                               <p class="other_doc_name">${file.name}</p><div id="${loderID}" class="loader_other"></div>
                               <div class="other_doc_info"><span class="other_doc_size"><i class="fas fa-circle"></i>${file_s} KB<i class="fas fa-circle"></i>${file_ext}</span><span class="other_doc_time">10:44</span></div>
                               </div>`
            const send_box = document.getElementById('chat-messages1')
            const sendMsg = send_box.appendChild(divImg)
            console.log(doc_Base64)
            // socket.emit('doc_upload_url',loderID,file,userId)
            
            ss(this.socket).emit('doc_upload_url', this.stream, {
                captureType: 'documentBack',
                data: file,
            });

            socket.on('get_doc_url',(url,lodID)=>{
                var DOC_URL = url
                let lodId = document.getElementById(lodID)
                lodId.classList.remove("loader_other");
                lodId.classList.add('hide_other_loader')
                lodId.innerHTML =`<a href =${DOC_URL}><i class="fa fa-download" aria-hidden="true"></i></a>`
            })

        }
    })
    if(file){
        reader.readAsDataURL(file)
       
    }else{
        alert('file not come')
    }
}

function img_preview(color){
  let docPre = document.getElementById('doc_pre')
  docPre.style.display = "block"
  docPre.setAttribute("src",color)
}

function doc_download(doc){
  let docPre = document.getElementById('doc_pre')
  docPre.setAttribute("src",doc)
}

const sendImage = (event)=>{
    const file = event.files[0]
    console.log(file.size)
    if(!file.type.match("image.*")){
        alert('Please select only image file')
    }else{
            if(file.size > 100000){
                alert('Image send only less then 100 kb')
            }else{
        const reader = new FileReader()
        reader.addEventListener('load',function(){
            const img_base64 = reader.result
            const reciever = sessionStorage.getItem("receiverDetails")
            const reinfo = JSON.parse(reciever)
           
            if(reinfo != null){
            const current_time = getTime()     
            const chatImg = document.querySelector('.chat-messages');
            const divImg = document.createElement('div')
            divImg.classList.add('listImg-1')
            divImg.innerHTML = `<p class="img-msg1"><img src="${img_base64}" alt="No Preview" width="100px" height="100px"><span class="Time_img">${current_time}</span><p>`
            const send_box = document.getElementById('chat-messages1')
            const sendMsg = send_box.appendChild(divImg)
            

            const sn = document.getElementById('userName').innerText   
            const userId = document.getElementById('userId').innerHTML
            var msg_type = "img" 
            
            if(reinfo.room_id === undefined){ // send img privatlly
                socket.emit('sendImg',sn,userId,reinfo.reName,reinfo.reId,img_base64,current_time) //s =sender r=reciver?
                    save_msg(sn,userId,reinfo.reName,reinfo.reId,img_base64,msg_type)
                }else{ // send img in group
                    socket.emit('group_send_img',sn,reinfo.room_id,img_base64)
                    grp_save_msg(sn,reinfo.room_id,img_base64,msg_type,userId)
                }
             }

        },false);

        if(file){
            reader.readAsDataURL(file)
        }
    }
}
}
// var CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/sveltose/image/upload'
// var CLOUDINARY_UPLOAD_PRESET = 'voxzj2ou'

// function upload_cloud_file(file){
//     var File = file
//     var formData = new FormData()
//     formData.append('file',File)
//     formData.append('upload_preset',CLOUDINARY_UPLOAD_PRESET)
  
//     console.log(file,'run it')
  
//     axios({
//         url:CLOUDINARY_URL,
//         method:'POST',
//         data:formData
//     }).then((resp)=>{
//         console.log(resp)
//     }).catch((err)=>{
//         console.log(err)
//     })
// }

const typing = ()=>{
    const userid = document.getElementById('userId').innerHTML
    const reciever = sessionStorage.getItem("receiverDetails")
    const reinfo = JSON.parse(reciever)
    socket.emit("Typing",userid,reinfo.reId)
}

