const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.get('/', chatController.getConversations);
router.get('/:id', chatController.getMessages);
router.post('/:id', chatController.saveMessage);

module.exports = router;
