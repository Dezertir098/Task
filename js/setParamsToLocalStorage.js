const params = new URLSearchParams(location.search);
const token = params.get('token');
const savedToken = localStorage.getItem('token');

if (!token && savedToken) {
  location.href = '/index.html';
}

if (token) {
  localStorage.setItem('token', token);
  location.href = '/index.html';
}