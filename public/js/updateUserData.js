import axios from 'axios';
import errorController from '../../controllers/errorController';
import { showAlert } from './alert';

export const updateData = async (data) => {
  try {

    const res = await axios.patch(
      'http://127.0.0.1:3000/api/v1/users/updateMe',
      data
    );

    console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', 'datra updated');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    console.log(err);
  }
};
export const updatePassword = async (
  oldPassword,
  newPassword,
  confirmPassword
) => {
  console.log(oldPassword, newPassword, confirmPassword);
  try {
    const res = await axios.patch(
      'http://127.0.0.1:3000/api/v1/users/changePassword',
      {
        oldPassword,
        newPassword,
        confirmPassword,
      }
    );

    console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', 'datra updated');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    console.log(err);
  }
};
