import { showAlert } from './alert';
import axios from 'axios';

export const signup = async (name, email, password, confirmPassword) => {
  console.log(23);
  const result = await axios.post('/api/v1/users/signup', {
    name,
    email,
    password,
    passwordConfirm: confirmPassword,
  });
  if ( result.data.status === 'pending') {
    document.querySelector('.uniqueheader').innerHTML = 'Verify Your Email';
    const form = document.querySelector('.form--signup');
    form.remove();
    
  }
};
