const express = require('express');
const router = express.Router();

const {createComment, editComment, deleteComment} = require('../controller/Comment')

const {auth} = require('../middlewear/auth');

router.post('/createcomment',auth, createComment)
router.put('/editcomment',auth, editComment)
router.delete('/deletecomment', auth, deleteComment)

module.exports = router;