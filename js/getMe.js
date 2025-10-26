export const getMe = async () => {
  const res = await fetch('http://localhost:3000/api/user/me', {
    headers: {
      'token': localStorage.getItem('token')
    }
  });
  const data = await res.json();
  return data;
};