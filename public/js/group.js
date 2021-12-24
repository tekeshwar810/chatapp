
var socket = io.connect();

function checkCheckbox() {
    const group_name = document.getElementById('group_input').value
    const group_ids = []
   
    var checkboxes = document.getElementsByClassName("myCheck1");
    for(var i = 0; i < checkboxes.length; i++){
       if(checkboxes[i].checked){
                 group_ids.push(checkboxes[i].value)
           }
      }
      const grp = {}
      grp.group_name = group_name
      grp.group_ids = group_ids

    if(group_ids.length < 2){
        document.getElementById("grp_err").innerHTML = "Select at list two person"
        setTimeout(() => {
            document.getElementById("grp_err").innerHTML = " "      
        }, 2000);
    }else if( group_name.length === 0){
        document.getElementById("grp_err").innerHTML = "Please enter the group name"
        setTimeout(() => {
            document.getElementById("grp_err").innerHTML = " "         
        }, 2000);
        
    }else{
        console.log('api run')
            axios.post("/api/create_group",grp)
            .then((resp)=>{
                const input = document.getElementById('group_input')
                input.value = " "
                document.getElementById("grp_msg").innerHTML = resp.data.msg
                
            }).catch((err)=>{
                console.log(err)
            })
    }
}

