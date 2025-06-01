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
    return await res.json();
  } catch (error) {
    return { success: false, message: 'Lỗi kết nối server' };
  }
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