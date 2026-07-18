import ChatMessage from '../models/ChatMessage.model.js';
import Trip from '../models/Trip.model.js';
import User from '../models/User.model.js';

export const registerChatHandlers = (io, socket) => {
  // Join room for a trip
  socket.on('join_chat_room', async ({ tripId }) => {
    try {
      // Validate membership in the trip
      const trip = await Trip.findOne({
        _id: tripId,
        $or: [{ passengerId: socket.userId }, { driverId: socket.userId }],
      });

      if (!trip) {
        socket.emit('chat_error', { message: 'Unauthorized or invalid trip ID' });
        return;
      }

      socket.join(`trip_chat:${tripId}`);
      console.log(`💬 Socket ${socket.userId} joined trip chat: ${tripId}`);

      // Fetch message history
      const history = await ChatMessage.find({ tripId }).sort({ createdAt: 1 }).limit(100);
      socket.emit('chat_history', history);
    } catch (error) {
      socket.emit('chat_error', { message: error.message });
    }
  });

  // Send message to trip room
  socket.on('send_message', async ({ tripId, text }) => {
    try {
      const trip = await Trip.findOne({
        _id: tripId,
        $or: [{ passengerId: socket.userId }, { driverId: socket.userId }],
      });

      if (!trip) {
        socket.emit('chat_error', { message: 'Unauthorized or invalid trip ID' });
        return;
      }

      const user = await User.findById(socket.userId);

      const msg = await ChatMessage.create({
        tripId,
        senderId: socket.userId,
        senderName: user ? user.name : 'Unknown',
        message: text,
      });

      io.to(`trip_chat:${tripId}`).emit('new_message', msg);
    } catch (error) {
      socket.emit('chat_error', { message: error.message });
    }
  });

  // Leave trip room
  socket.on('leave_chat_room', ({ tripId }) => {
    socket.leave(`trip_chat:${tripId}`);
    console.log(`💬 Socket ${socket.userId} left trip chat: ${tripId}`);
  });
};

export default { registerChatHandlers };
