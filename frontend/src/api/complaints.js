import client from './client';

export const getComplaints = async () => {
  const response = await client.get('/complaints');
  return response.data;
};

export const getComplaintsMap = async () => {
  const response = await client.get('/complaints/map');
  return response.data;
};

export const getComplaint = async (code) => {
  const response = await client.get(`/complaints/${code}`);
  return response.data;
};

export const createComplaint = async (formData) => {
  const response = await client.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const submitRepair = async (code, formData) => {
  const response = await client.post(`/complaints/${code}/repair-submission`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getVerification = async (code) => {
  const response = await client.get(`/complaints/${code}/verification`);
  return response.data;
};

export const approveComplaint = async (code) => {
  const response = await client.patch(`/complaints/${code}/approve`);
  return response.data;
};

export const login = async (email, password) => {
  const response = await client.post('/auth/login', { email, password });
  return response.data;
};

export const signup = async (data) => {
  const response = await client.post('/auth/signup', data);
  return response.data;
};

export const getMe = async () => {
  const response = await client.get('/auth/me');
  return response.data;
};

export const getPendingApprovals = async () => {
  const response = await client.get('/approvals/pending');
  return response.data;
};

export const getAllUsers = async () => {
  const response = await client.get('/admin/users');
  return response.data;
};

export const approveUser = async (userId) => {
  const response = await client.patch(`/approvals/${userId}/approve`);
  return response.data;
};

export const rejectUser = async (userId) => {
  const response = await client.patch(`/approvals/${userId}/reject`);
  return response.data;
};

