document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginButton');
  
    loginBtn.addEventListener('click', async () => {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      try {
        const response = await fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
  
        const data = await response.json();
  
        if (data.success) {
          alert('Inicio de sesión exitoso');
          const role = data.user.rol;
          if (role === 'Padre') {
            window.location.href = '/parents.html';
          } else if (role === 'Maestro') {
            window.location.href = '/teachers.html';
          } else if (role === 'Administrativo') {
            window.location.href = '/admin.html';
          } else {
            alert('Rol desconocido');
          }
        } else {
          alert('Credenciales incorrectas');
        }
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        alert('Hubo un problema al conectarse al servidor.');
      }
    });
  });
