const express = require('express');
const router = express.Router();

const {createReview, editReview, deleteReview, getReview} = require('../controller/Review')

const {auth} = require('../middlewear/auth');

router.post('/createreview',auth, createReview)
router.get('/getallreviews/:bookId', getReview)
router.put('/editreview',auth, editReview)
router.delete('/deletereview',auth, deleteReview)

module.exports = router;