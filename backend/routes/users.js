const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// Protect all routes after this middleware
router.use(authController.protect);

router.get('/', userController.getAllUsers);
router.get('/friends', userController.getFriends);
router.get('/:id', userController.getUser);

router.patch('/', userController.updateUser);
router.post('/send-request/:id', userController.sendFriendRequest);
router.post('/accept-request/:id', userController.acceptFriendRequest);
router.post('/reject-request/:id', userController.rejectFriendRequest);

router.delete('/', userController.deleteUser);

module.exports = router;
