export const guiPhanHoi = async (data) => {
  const res = await fetch('http://localhost:5000/api/lien-he', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Gửi thất bại');
  return res.json();
};

export const layDanhSachPhanHoi = async () => {
  const res = await fetch('http://localhost:5000/api/lien-he');
  return res.json();
};

export const capNhatDaDoc = async (maLienHe) => {
  const res = await fetch(`http://localhost:5000/api/lien-he/${maLienHe}`, {
    method: 'PATCH',
  });
  return res.json();
};