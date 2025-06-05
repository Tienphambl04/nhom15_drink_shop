import io from 'socket.io-client';

let sockets = {};

export function initSocket(role, callback, namespace = '/don-hang', options = {}) {
  if (sockets[namespace]) {
    sockets[namespace].disconnect();
    sockets[namespace] = null;
  }

  sockets[namespace] = io(`http://localhost:5000${namespace}`, {
    reconnection: options.reconnectOptions?.reconnection ?? true,
    reconnectionAttempts: options.reconnectOptions?.reconnectionAttempts ?? 3,
    reconnectionDelay: options.reconnectOptions?.reconnectionDelay ?? 5000,
    reconnectionDelayMax: 10000,
    randomizationFactor: 0.5,
    timeout: 15000,
    transports: ['websocket', 'polling'],
    auth: {
      token: role === 'user' ? localStorage.getItem('token') : null,
    },
  });

  const socket = sockets[namespace];

  socket.on('connect', () => {
    console.log(`Kết nối Socket.IO thành công trên ${namespace} với vai trò ${role}`);
    const maNguoiDung = role === 'user' ? localStorage.getItem('ma_nguoi_dung') : null;
    socket.emit('join', { role, ma_nguoi_dung: maNguoiDung });
    if (options.onConnect) options.onConnect();
  });

  socket.on('connect_error', (error) => {
    console.error(`Lỗi kết nối Socket.IO trên ${namespace}:`, error.message);
    if (options.onError) options.onError(error);
  });

  socket.on('disconnect', (reason) => {
    console.log(`Ngắt kết nối Socket.IO trên ${namespace}: ${reason}`);
    if (options.onDisconnect) options.onDisconnect();
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log(`Kết nối lại Socket.IO thành công trên ${namespace} sau ${attemptNumber} lần thử`);
    const maNguoiDung = role === 'user' ? localStorage.getItem('ma_nguoi_dung') : null;
    socket.emit('join', { role, ma_nguoi_dung: maNguoiDung });
  });

  socket.on('reconnect_failed', () => {
    console.error(`Hết số lần thử kết nối lại Socket.IO trên ${namespace}`);
  });

  socket.off('don_hang_moi');
  socket.off('cap_nhat_don_hang');
  socket.off('xoa_don_hang');
  socket.off('thong_bao_moi');
  socket.off('binh_luan_moi');
  socket.off('binh_luan_xoa');

  if (namespace === '/don-hang') {
    socket.on('don_hang_moi', (data) => {
      console.log('Nhận don_hang_moi:', data);
      callback('new', data);
    });
    socket.on('cap_nhat_don_hang', (data) => {
      console.log('Nhận cap_nhat_don_hang:', data);
      callback('update', data);
    });
    socket.on('xoa_don_hang', (data) => {
      console.log('Nhận xoa_don_hang:', data);
      callback('delete', data);
    });
  } else if (namespace === '/thong-bao') {
    socket.on('thong_bao_moi', (data) => {
      console.log('Nhận thong_bao_moi:', data);
      callback('thong_bao_moi', data);
    });
  } else if (namespace === '/binh-luan') {
    socket.on('binh_luan_moi', (data) => {
      console.log('Nhận binh_luan_moi:', data);
      callback('binh_luan_moi', data);
    });
    socket.on('binh_luan_xoa', (data) => {
      console.log('Nhận binh_luan_xoa:', data);
      callback('binh_luan_xoa', data);
    });
  }

  return socket;
}

export function disconnectSocket(namespace = '/don-hang') {
  if (sockets[namespace]) {
    sockets[namespace].disconnect();
    sockets[namespace] = null;
    console.log(`Đã ngắt kết nối socket trên ${namespace}`);
  }
}