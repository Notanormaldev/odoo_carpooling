import Trip from '../models/Trip.model.js';
import { getRedisClient } from '../config/redis.js';

export const registerTrackingHandlers = (io, socket) => {
  // Join location room
  socket.on('join_tracking_room', async ({ tripId }) => {
    try {
      const trip = await Trip.findOne({
        _id: tripId,
        $or: [{ passengerId: socket.userId }, { driverId: socket.userId }],
      });

      if (!trip) {
        socket.emit('tracking_error', { message: 'Unauthorized or invalid trip ID' });
        return;
      }

      socket.join(`trip_tracking:${tripId}`);
      console.log(`📍 Socket ${socket.userId} joined trip tracking room: ${tripId}`);

      // Fetch last known location from Redis cache
      const redis = getRedisClient();
      const lastLoc = await redis.get(`trip_loc:${tripId}`);
      if (lastLoc) {
        socket.emit('location_update', JSON.parse(lastLoc));
      }
    } catch (error) {
      socket.emit('tracking_error', { message: error.message });
    }
  });

  // Update location (sent by driver only)
  socket.on('update_driver_location', async ({ tripId, lat, lng, speed, bearing }) => {
    try {
      // Validate that socket user is the driver for this trip
      const trip = await Trip.findOne({ _id: tripId, driverId: socket.userId });
      if (!trip) {
        socket.emit('tracking_error', { message: 'Only the driver can update location' });
        return;
      }

      const locPayload = {
        tripId,
        lat,
        lng,
        speed: speed || 0,
        bearing: bearing || 0,
        timestamp: new Date().toISOString(),
      };

      // Cache location in Redis
      const redis = getRedisClient();
      await redis.setex(`trip_loc:${tripId}`, 3600, JSON.stringify(locPayload)); // cache for 1 hour

      // Relay location update to all passengers in the room
      io.to(`trip_tracking:${tripId}`).emit('location_update', locPayload);
    } catch (error) {
      socket.emit('tracking_error', { message: error.message });
    }
  });

  // Leave location room
  socket.on('leave_tracking_room', ({ tripId }) => {
    socket.leave(`trip_tracking:${tripId}`);
    console.log(`📍 Socket ${socket.userId} left trip tracking room: ${tripId}`);
  });
};

export default { registerTrackingHandlers };
