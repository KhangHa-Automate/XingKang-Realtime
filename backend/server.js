require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socket = require('socket.io');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chats');

const app = express();
const server = http.createServer(app);
const io = socket(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);

app.use((err, req, res, next) => {
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
console.log('>> Server starting ...');
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

io.on('connection', (socket) => {
  console.log('>> Socket connected: ', socket.id);
  
  // Khi client kết nối
  socket.on('joinRoom', ({ userId }) => {
    console.log('>> JoinRoom: ', userId);
    socket.join(userId); // Mỗi user vào một room riêng biệt
    console.log('>> User joined room: ', userId);
    console.log('>> Current rooms: ', Array.from(socket.rooms));
  });

  socket.on('sendMessage', ({ senderId, receiverId, message }) => {
    // Khi nhận được tin nhắn từ client, gửi lại cho người nhận
    console.log('>> SendMessage received: ', { senderId, receiverId, message });
    console.log('>> Sending to room: ', receiverId);
    
    // Kiểm tra xem receiver có online không
    const receiverRoom = io.sockets.adapter.rooms.get(receiverId);
    if (receiverRoom) {
      console.log('>> Receiver is online, sending message');
      io.to(receiverId).emit('receiveMessage', { senderId, message });
      console.log('>> Message sent to room: ', receiverId);
    } else {
      console.log('>> Receiver is offline: ', receiverId);
    }
  });

  socket.on('disconnect', () => {
    // Xử lý khi client ngắt kết nối (nếu cần)
    console.log('>> Disconnect: ', socket.id);
  });
});
