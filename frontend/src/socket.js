
import io from 'socket.io-client';

let sockets = {};

export function initSocket(role, callback, namespace = '/don-hang', maDoUong = null) {
  if (sockets[namespace]) {
    sockets[namespace].disconnect();
    sockets[namespace] = null;
  }

  sockets[namespace] = io(`http://localhost:5000${namespace}`, {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 5000,
    forceNew: true,
  });

  const socket = sockets[namespace];

  socket.on('connect', () => {
    console.log(`Connected to Socket.IO server on ${namespace} as ${role}`);
    const maNguoiDung = role === 'user' ? localStorage.getItem('ma_nguoi_dung') : null;
    console.log('Joining with data:', { role, ma_nguoi_dung: maNguoiDung, ma_do_uong: maDoUong });
    socket.emit('join', { role, ma_nguoi_dung: maNguoiDung, ma_do_uong: maDoUong });
  });

  socket.on('connect_error', (error) => {
    console.error(`Socket connection error on ${namespace}:`, error);
  });

  socket.on('disconnect', (reason) => {
    console.log(`Disconnected from Socket.IO server on ${namespace}:`, reason);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log(`Reconnected to ${namespace} after ${attemptNumber} attempts`);
    const maNguoiDung = role === 'user' ? localStorage.getItem('ma_nguoi_dung') : null;
    socket.emit('join', { role, ma_nguoi_dung: maNguoiDung, ma_do_uong: maDoUong });
  });

  socket.off('don_hang_moi');
  socket.off('cap_nhat_don_hang');
  socket.off('xoa_don_hang');
  socket.off('thong_bao_moi');
  socket.off('binh_luan_moi');
  socket.off('xoa_binh_luan');

  if (namespace === '/don-hang') {
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
  } else if (namespace === '/thong-bao') {
    socket.on('thong_bao_moi', (data) => {
      console.log('Received thong_bao_moi:', data);
      callback('thong_bao_moi', data);
    });
  } else if (namespace === '/binh-luan') {
    socket.on('binh_luan_moi', (data) => {
      console.log('Received binh_luan_moi:', data);
      callback('new', data);
    });
    socket.on('xoa_binh_luan', (data) => {
      console.log('Received xoa_binh_luan:', data);
      callback('delete', data);
    });
  }

  if (!socket.connected) {
    socket.connect();
  }
}

export function disconnectSocket(namespace = '/don-hang') {
  if (sockets[namespace] && sockets[namespace].connected) {
    sockets[namespace].disconnect();
    sockets[namespace] = null;
    console.log(`Disconnected from ${namespace}`);
  }
}
