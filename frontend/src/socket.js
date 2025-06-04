// socket.js - Fixed version
import io from 'socket.io-client';

let socket = null;

export function initSocket(role, callback) {
  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  // Create new socket connection
  socket = io('http://localhost:5000/don-hang', {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 5000,
    forceNew: true,
  });

  // Wait for connection to be established
  socket.on('connect', () => {
    console.log(`Connected to Socket.IO server as ${role}`);
    const maNguoiDung = role === 'user' ? localStorage.getItem('ma_nguoi_dung') : null;
    console.log('Joining with data:', { role, ma_nguoi_dung: maNguoiDung });
    socket.emit('join', { role, ma_nguoi_dung: maNguoiDung });
  });

  // Add connection error handling
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected from Socket.IO server:', reason);
  });

  // Handle reconnection
  socket.on('reconnect', (attemptNumber) => {
    console.log('Reconnected after', attemptNumber, 'attempts');
    const maNguoiDung = role === 'user' ? localStorage.getItem('ma_nguoi_dung') : null;
    socket.emit('join', { role, ma_nguoi_dung: maNguoiDung });
  });

  // Remove all previous listeners to avoid duplicates
  socket.off('don_hang_moi');
  socket.off('cap_nhat_don_hang');
  socket.off('xoa_don_hang');

  // Event listeners
  socket.on('don_hang_moi', (data) => {
    console.log('Received don_hang_moi:', data);
    callback('new', data);
  });

  socket.on('cap_nhat_don_hang', (data) => {
    console.log('Received cap_nhat_don_hang:', data);
    callback('update', data);
  });

  socket.on('xoa_don_hang', (data) => {
    console.log('Received xoa_don_hang:', data);
    callback('delete', data);
  });

  // Force connection if not connected
  if (!socket.connected) {
    socket.connect();
  }
}

export function disconnectSocket() {
  if (socket && socket.connected) {
    socket.disconnect();
    socket = null;
  }
}
