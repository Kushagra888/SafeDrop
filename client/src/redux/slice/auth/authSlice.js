// src/features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { registerUser, loginUser, logoutUser, updateUser, deleteUser, getUser } from './authThunk';
import { isDeprecatedAvatarUrl, getValidProfileImageUrl } from '../../../utils/profileImageHelper';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthError: (state) => {
      state.error = null;
    },
    
    updateUserData: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    }
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        
        // Fix deprecated profile image URLs
        const user = action.payload.user;
        if (user && isDeprecatedAvatarUrl(user.profilePic)) {
          user.profilePic = getValidProfileImageUrl(user);
        }
        
        state.user = user;
        state.token = action.payload.token;
        
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(user));
      })
      
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'registration failed';
      })

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        
        // Fix deprecated profile image URLs
        const user = action.payload.user;
        if (user && isDeprecatedAvatarUrl(user.profilePic)) {
          user.profilePic = getValidProfileImageUrl(user);
        }
        
        state.user = user;
        state.token = action.payload.token;
        
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(user));
      })
      
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'login failed';
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })

      // updateUser
      .addCase(updateUser.pending,(state)=>{
        state.loading=true;
        state.error=null;
      })
      .addCase(updateUser.fulfilled,(state,action)=>{
        state.loading=false;
        state.user=action.payload;
        // Update both user data and maintain the existing token
        const updatedUserData = {
          ...action.payload,
          token: state.token
        };
        localStorage.setItem('user',JSON.stringify(updatedUserData));
      })
      .addCase(updateUser.rejected,(state,action)=>{
          state.loading=false;
          state.error=action.payload?.error || 'Update failed';
      })
        // deleteUser
        .addCase(deleteUser.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(deleteUser.fulfilled,(state,action)=>{
            state.loading=false;
            state.user=null;
            state.isAuthenticated=false;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        })
        .addCase(deleteUser.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload?.error || 'Delete failed';
        })
        // getUser
        .addCase(getUser.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(getUser.fulfilled,(state,action)=>{
            state.loading=false;
            console.log(action.payload);
            
            // Fix deprecated profile image URLs
            const user = action.payload;
            if (user && isDeprecatedAvatarUrl(user.profilePic)) {
              user.profilePic = getValidProfileImageUrl(user);
            }
            
            state.user=user;
            
            // Update localStorage with fixed profile image
            if (user) {
              localStorage.setItem('user', JSON.stringify(user));
            }
        })
        .addCase(getUser.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload?.error || 'Get user failed';
        })
  }
});

export const { resetAuthError, updateUserData } = authSlice.actions;
export default authSlice.reducer;
