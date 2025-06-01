// Gọi API backend đăng ký user
export async function registerUser(data) {
  try {
    const res = await fetch('http://localhost:5000/api/users/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}
// Gọi API backend đăng nhập user
export async function loginUser(data) {
  try {
    const res = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}
