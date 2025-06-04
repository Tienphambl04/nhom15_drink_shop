import io from 'socket.io-client';

const socket = io('http://localhost:5000/don-hang', {
  reconnection: true,
  reconnectionAttempts: 5,
});

export function initSocket(role, callback) {
  socket.on('connect', () => {
    console.log(`Connected to Socket.IO server as ${role}`);
    const maNguoiDung = role === 'user' ? localStorage.getItem('ma_nguoi_dung') : null;
    socket.emit('join', { role, ma_nguoi_dung: maNguoiDung });
  });

  socket.on('don_hang_moi', (data) => {
    callback('new', data);
  });

  socket.on('cap_nhat_don_hang', (data) => {
    callback('update', data);
  });

  socket.on('xoa_don_hang', (data) => {
    callback('delete', data);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from Socket.IO server');
  });
}

export function disconnectSocket() {
  socket.disconnect();
}