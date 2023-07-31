import '@babel/polyfill';
import { login, logout } from './login';
import { updateData, updatePassword } from './updateUserData';

let email, password;
document.querySelector('.form--login')?.addEventListener('submit', (e) => {
  e.preventDefault();
  email = document.getElementById('email').value;
  password = document.getElementById('password').value;
  console.log('hi i am gay', email, password);
  login(email, password);
});

document.querySelector('.nav__el--logout')?.addEventListener('click', logout);

document.querySelector('.form-user-data')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData();
  form.append('email', document.getElementById('email').value);
  form.append('name', document.getElementById('name').value);
  form.append('photo', document.getElementById('photo').files[0]);

  updateData(form);
});
document
  .querySelector('.form-user-password')
  ?.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log(document.querySelector('.btn--save-password'));
    document.querySelector('.btn--save-password').textContent = 'updating...';
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    await updatePassword(oldPassword, newPassword, confirmPassword);

    document.getElementById('oldPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';

    document.querySelector('.btn--save-password').textContent = 'save password';
  });
