import '@babel/polyfill';
import { login, logout } from './login';

import { signup, forgotPassword, resetPassword } from './signup';
import { updateData, updatePassword } from './updateUserData';

console.log('why this is kosa hi mom');
document.getElementById('form--login')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  login(email, password);
});

document.querySelector('.form--signup')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  signup(name, email, password, confirmPassword);
});

document.querySelector('.nav__el--logout')?.addEventListener('click', logout);

document.querySelector('.form-user-data')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData();
  form.append('email', document.getElementById('email').value);
  form.append('name', document.getElementById('name').value);
  form.append('password', document.getElementById('password').value);
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

document.getElementById('forgot-password')?.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('nice boobs');
  const email = document.getElementById('email').value;
  forgotPassword(email);
});
document.getElementById('reset-password')?.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('nice ass');
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const token = window.location.href.split('/')[4];

  resetPassword(password, confirmPassword, token);
});
