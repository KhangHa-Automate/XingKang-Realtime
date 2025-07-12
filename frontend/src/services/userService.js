import api from '../api/axiosConfig';
export const getAllUsers = async () => {
  return api.get('/users');
};
export const sendFriendRequest = async (userId) => {
  return api.post(`/users/send-request/${userId}`);
};
export const getFriends = async () => {
  return api.get('/users/friends');
};