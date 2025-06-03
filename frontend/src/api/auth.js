export async function registerUser(data) {
  try {
    const res = await fetch('http://localhost:5000/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

export async function loginUser(data) {
  try {
    const res = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (result.success && result.token && result.user && result.user.ma_nguoi_dung) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('ma_nguoi_dung', result.user.ma_nguoi_dung);
      localStorage.setItem('vai_tro', result.user.vai_tro); // Thêm vai_tro để đồng bộ với Login.jsx
      localStorage.setItem('ho_ten', result.user.ho_ten); // Thêm ho_ten để đồng bộ
      return result;
    } else {
      return {
        success: false,
        message: result.message || 'Không nhận được thông tin người dùng hoặc token',
      };
    }
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

export function getToken() {
  return localStorage.getItem('token');
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('ma_nguoi_dung');
  localStorage.removeItem('vai_tro');
  localStorage.removeItem('ho_ten');
}

export async function updateProfile(data, token) {
  try {
    const res = await fetch('http://localhost:5000/api/users/update-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

export async function changePassword(data, token) {
  try {
    const res = await fetch('http://localhost:5000/api/users/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}