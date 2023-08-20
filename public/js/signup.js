import { showAlert } from './alert';
import axios from 'axios';

export const signup = async (name, email, password, confirmPassword) => {
  try {
    const result = await axios.post('/api/v1/users/signup', {
      name,
      email,
      password,
      passwordConfirm: confirmPassword,
    });
    if (result.data.status === 'pending') {
      document.querySelector('.uniqueheader').innerHTML = 'Verify Your Email';
      const form = document.querySelector('.form--signup');
      form.remove();
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};
export const forgotPassword = async (email) => {
  try {
    const result = await axios.post('api/v1/users/forgotPassword', {
      email,
    });

    if (result.data.status === 'success') {
      console.log('mom?');
      document.querySelector('.heading-secondary').innerHTML =
        'a Token was send to your email';
      const form = document.querySelector('.form');
      form.remove();
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};
export const resetPassword = async (password, confirmPassword, token) => {
  try {
    console.log('why not?');
    const result = await axios.patch(`/api/v1/users/resetPassword/${token}`, {
      password,
      passwordConfirm: confirmPassword,
    });
    console.log(result);
    if (result.data.status === 'success') {
      showAlert('success', 'Changed Your Password Successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};
