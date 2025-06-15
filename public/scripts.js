const API_URL = 'http://localhost:5000/api/todos';
const AUTH_URL = 'http://localhost:5000/api/auth';

// Kiểm tra trạng thái đăng nhập
function checkAuth() {
  const token = localStorage.getItem('token');
  if (token) {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('todo-section').style.display = 'block';
    fetchTodos();
  } else {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('todo-section').style.display = 'none';
  }
}

// Lấy và hiển thị todos
async function fetchTodos() {
  try {
    const token = localStorage.getItem('token');
    console.log('Fetching todos with token:', token);
    const response = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
    const todos = await response.json();
    console.log('Todos fetched:', todos);
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';
    if (todos.length === 0) {
      todoList.innerHTML = '<li>Không có công việc nào.</li>';
    } else {
      todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
          <span>${todo.title || 'No title'}</span>
          <div>
            <button class="toggle-btn">Toggle</button>
            <button class="delete-btn">Delete</button>
          </div>
        `;
        const toggleBtn = li.querySelector('.toggle-btn');
        toggleBtn.addEventListener('click', () => toggleTodo(todo._id, !todo.completed));
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteTodo(todo._id));
        todoList.appendChild(li);
      });
    }
  } catch (err) {
    console.error('Lỗi khi lấy todos:', err.message);
    if (err.message.includes('401')) {
      alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      localStorage.removeItem('token');
      checkAuth();
    } else {
      alert('Không thể tải danh sách todos. Vui lòng thử lại.');
    }
  }
}

// Thêm todo mới
async function addTodo(title) {
  try {
    const token = localStorage.getItem('token');
    console.log('Adding todo with token:', token, 'Title:', title);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title })
    });
    if (!response.ok) throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
    const data = await response.json();
    console.log('Todo added, response:', data);
    await fetchTodos();
  } catch (err) {
    console.error('Lỗi khi thêm todo:', err.message);
    if (err.message.includes('401')) {
      alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      localStorage.removeItem('token');
      checkAuth();
    } else {
      alert('Không thể thêm todo. Vui lòng thử lại.');
    }
  }
}

// Chuyển đổi trạng thái todo
async function toggleTodo(id, completed) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ completed })
    });
    if (!response.ok) throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
    await fetchTodos();
  } catch (err) {
    console.error('Lỗi khi cập nhật todo:', err.message);
    if (err.message.includes('401')) {
      alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      localStorage.removeItem('token');
      checkAuth();
    } else {
      alert('Không thể cập nhật todo. Vui lòng thử lại.');
    }
  }
}

// Xóa todo
async function deleteTodo(id) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
    await fetchTodos();
  } catch (err) {
    console.error('Lỗi khi xóa todo:', err.message);
    if (err.message.includes('401')) {
      alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      localStorage.removeItem('token');
      checkAuth();
    } else {
      alert('Không thể xóa todo. Vui lòng thử lại.');
    }
  }
}

// Đăng ký
async function register(username, password) {
  try {
    const response = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
    const data = await response.json();
    localStorage.setItem('token', data.token);
    checkAuth();
  } catch (err) {
    console.error('Lỗi khi đăng ký:', err.message);
    alert('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
  }
}

// Đăng nhập
async function login(username, password) {
  try {
    const response = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
    const data = await response.json();
    localStorage.setItem('token', data.token);
    checkAuth();
  } catch (err) {
    console.error('Lỗi khi đăng nhập:', err.message);
    alert('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
  }
}

// Đăng xuất
function logout() {
  localStorage.removeItem('token');
  checkAuth();
  alert('Đã đăng xuất thành công.');
}

// Xử lý sự kiện submit form xác thực
document.getElementById('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!username || !password) {
    alert('Vui lòng nhập đầy đủ tên người dùng và mật khẩu.');
    return;
  }
  if (e.submitter.id === 'register-btn') {
    await register(username, password);
  } else if (e.submitter.id === 'login-btn') {
    await login(username, password);
  }
});

// Xử lý sự kiện submit form todo
document.getElementById('todo-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('todo-input');
  const title = input.value.trim();
  if (title) {
    await addTodo(title);
    input.value = '';
  } else {
    alert('Vui lòng nhập tiêu đề todo.');
  }
});

// Xử lý sự kiện logout
document.getElementById('logout-btn').addEventListener('click', logout);

// Kiểm tra trạng thái đăng nhập khi tải trang
document.addEventListener('DOMContentLoaded', checkAuth);