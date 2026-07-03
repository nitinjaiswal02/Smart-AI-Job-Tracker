import api from './axios.js';

export const createOrder = () => api.post('/payment/create-order');
export const verifyPayment = (data) => api.post('/payment/verify', data);