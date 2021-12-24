const express = require('express');
const router = express.Router();
const { msg_save,msg_list,grp_msg_list,grp_add,list_member,add_other_mem,update_grp } = require("../controllers/conversation")

router.get('/create_group/:userId',list_member)
router.get('/conversation_list/:sId/:rId',msg_list) 
router.get('/grp_conversation_list/:userId/:roomId',grp_msg_list)
router.post('/add_conversation/:userId',msg_save)
router.post('/create_group',grp_add)
router.get('/add_other_member',add_other_mem)
router.put('/update_group_info/:grpId',update_grp)


module.exports = router;