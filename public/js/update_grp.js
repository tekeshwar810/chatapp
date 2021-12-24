const grp_detail = sessionStorage.getItem('receiverDetails')
const grpObj = JSON.parse(grp_detail)

document.getElementById("update_grp_input").value =  grpObj.reName

function update_group () {
    const update_grp_name = document.getElementById('update_grp_input').value
    const group_ids = []
   
    var checkboxes = document.getElementsByClassName("myCheck2");
    for(var i = 0; i < checkboxes.length; i++){
       if(checkboxes[i].checked){
                 group_ids.push(checkboxes[i].value)
           }
      }
     if( update_grp_name.length === 0){
        document.getElementById("grp_err").innerHTML = "Please enter the group name"
        setTimeout(() => {
            document.getElementById("grp_err").innerHTML = " "         
        }, 1000);
        
    }else{
            const grp = {}
            grp.group_name = update_grp_name
            grp.group_ids = group_ids
   
            console.log(grp,'update api run',grpObj._id)
            axios.put(`/api/update_group_info/${grpObj._id}`,grp)
            .then((resp)=>{
                const input = document.getElementById('update_grp_input')
                input.value = " "
                document.getElementById("grp_msg").innerHTML = resp.data.msg
                
            }).catch((err)=>{
                console.log(err)
            })
    }
}