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
