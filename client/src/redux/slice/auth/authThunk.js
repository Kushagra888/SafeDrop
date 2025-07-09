// src/features/auth/authThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../config/axiosInstance';

// REGISTER
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/users/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: 'Registration failed' });
    }
  }
);

// LOGIN
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/users/login', credentials);
      if (!response.data || !response.data.token) {
        throw new Error('Invalid response from server');
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: 'Login failed' });
    }
  }
);

// UPDATE USER
export const updateUser = createAsyncThunk(
  'auth/update',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      await axiosInstance.put(`/api/users/user/${userId}`, userData);
      const response = await axiosInstance.get(`/api/users/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Update error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: 'Update failed' });
    }
  }
);

// DELETE USER
export const deleteUser = createAsyncThunk(
  'auth/delete', 
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/api/users/user/${userId}`);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return response.data;
    } catch (error) {
      console.error('Delete error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: 'Delete failed' });
    }
  }
);

// GET USER
export const getUser = createAsyncThunk(
  'auth/getUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/users/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: 'Failed to get user data' });
    }
  }
);

// LOGOUT
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.get('/api/users/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error.response?.data || error.message);
      return rejectWithValue({ error: 'Logout failed' });
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ userId, currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/users/password/${userId}`, {
        currentPassword,
        newPassword
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Password change failed' });
    }
  }
);





