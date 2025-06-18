// src/features/file/fileThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "../../../config/axiosInstance";

// Basic config
axios.defaults.withCredentials = true;

// UPLOAD FILE
export const uploadFile = createAsyncThunk(
  "file/upload",
  async (formData, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // You can dispatch an action here to update the progress if needed
        }
      };

      const response = await axiosInstance.post("/api/files/upload", formData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        "Upload failed"
      );
    }
  }
);

// GET FILE DETAILS
export const getFileDetails = createAsyncThunk("file/getDetails", async (fileId, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/files/getFileDetails/${fileId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// DELETE FILE
export const deleteFile = createAsyncThunk(
  "file/delete",
  async (fileId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/api/files/${fileId}`);
      return fileId; // Return the fileId for the reducer to remove it from state
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        "Failed to delete file"
      );
    }
  }
);

// UPDATE FILE STATUS (active/expired)
export const updateFileStatus = createAsyncThunk("file/updateStatus", async ({ fileId, status }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`/files/update/${fileId}`, { status });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// GENERATE SHORT LINK
export const generateShareShortenLink = createAsyncThunk("file/generateShortLink", async ({ fileId }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/files/generateShareShortenLink", { fileId });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// SEND LINK VIA EMAIL
export const sendLinkEmail = createAsyncThunk("file/sendLinkEmail", async ({ fileId, email }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/files/sendLinkEmail", { fileId, email });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// UPDATE EXPIRY
export const updateFileExpiry = createAsyncThunk("file/updateExpiry", async ({ fileId, expiresAt }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/files/updateFileExpiry", { fileId, expiresAt });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// UPDATE PASSWORD
export const updateFilePassword = createAsyncThunk("file/updatePassword", async ({ fileId, password }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/files/updateFilePassword", { fileId, password });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// SEARCH FILES
export const searchFiles = createAsyncThunk("file/search", async (query, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/files/searchFiles?query=${query}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// SHOW USER FILES
export const showUserFiles = createAsyncThunk("file/showUserFiles", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get("/files/showUserFiles");
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// GENERATE QR
export const generateQR = createAsyncThunk(
  "file/generateQR",
  async (fileId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/files/${fileId}/qr`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      return url;
    } catch (error) {
      console.error("QR generation error:", error);
      return rejectWithValue(error.response?.data || { error: "QR generation failed" });
    }
  }
);

// GET DOWNLOAD COUNT
export const getDownloadCount = createAsyncThunk("file/downloadCount", async (fileId, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/files/getDownloadCount/${fileId}`);
    return { fileId, count: res.data.count };
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// RESOLVE SHORT LINK
export const resolveShareLink = createAsyncThunk(
  "file/resolveShareLink",
  async (code, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/files/shared/${code}`);
      return response.data;
    } catch (error) {
      console.error("Share link resolution error:", error);
      return rejectWithValue(error.response?.data || { error: "Failed to resolve link" });
    }
  }
);

// VERIFY PASSWORD
export const verifyFilePassword = createAsyncThunk(
  "file/verifyPassword",
  async ({ fileId, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/files/verify-password", {
        fileId,
        password,
      });
      
      return response.data;
    } catch (error) {
      console.error("Password verification error:", error);
      return rejectWithValue(error.response?.data || { error: "Verification failed" });
    }
  }
);

// get User files
export const getUserFiles = createAsyncThunk(
  "file/getUserFiles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/files/user-files");
      return response.data;
    } catch (error) {
      console.error("Get files error:", error);
      return rejectWithValue(error.response?.data || { error: "Failed to fetch files" });
    }
  }
);

// DOWNLOAD FILE
export const downloadFile = createAsyncThunk(
  "file/download",
  async ({ fileId, password }, { rejectWithValue }) => {
    try {
      // Create the URL with password as query parameter if provided
      const downloadUrl = `/api/files/download/${fileId}${password ? `?password=${password}` : ''}`;
      
      // Make the request with proper headers and response type
      const response = await axiosInstance.get(downloadUrl, {
        responseType: 'blob',
        headers: {
          'Accept': '*/*'
        }
      });

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'download';
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/g.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
          // Decode the filename
          try {
            filename = decodeURIComponent(filename);
          } catch {
            // If decoding fails, use the filename as is
          }
        }
      }

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream' 
      });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      return { fileId };
    } catch (error) {
      // Handle error responses
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const parsed = JSON.parse(text);
          return rejectWithValue(parsed);
        } catch {
          return rejectWithValue({ error: text || 'Download failed' });
        }
      }
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        return rejectWithValue({ error: 'Password required' });
      }
      if (error.response?.status === 403) {
        return rejectWithValue({ error: 'Incorrect password' });
      }
      
      return rejectWithValue({ 
        error: error.response?.data?.error || 
              error.response?.data?.message || 
              error.message || 
              'Download failed' 
      });
    }
  }
);
