export async function getUsers(token) {
  try {
    const res = await fetch('http://localhost:5000/api/admin/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

export async function resetUserPassword(userId, data, token) {
  try {
    const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/reset-password`, {
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

export async function toggleUserStatus(userId, token) {
  try {
    const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/toggle-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

export async function deleteUser(userId, token) {
  try {
    const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

export async function addUser(data, token) {
  try {
    const res = await fetch('http://localhost:5000/api/admin/users', {
      method: 'POST',
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