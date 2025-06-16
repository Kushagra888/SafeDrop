import React, { useRef, useState } from "react";
import "./FileUploader.css";
import { useDispatch, useSelector } from "react-redux";
import { uploadFile } from "../../../redux/slice/file/fileThunk";
import { toast } from "react-toastify";
import { addDays, format } from "date-fns";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/avi',
  'video/mov',
  'video/mkv',
  'application/pdf'
];

const FileUploader = () => {
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.file);
  const { user } = useSelector((state) => state.auth);

  const [files, setFiles] = useState([]);
  const [enablePassword, setEnablePassword] = useState(false);
  const [password, setPassword] = useState("");
  
  const [enableExpiry, setEnableExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (file) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error(`File type not supported: ${file.name}`);
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large (max 10MB): ${file.name}`);
      return false;
    }

    return true;
  };

  const handleExpiryToggle = (checked) => {
    setEnableExpiry(checked);
    
    if (checked && !expiryDate) {
      const defaultDate = addDays(new Date(), 7);
      setExpiryDate(format(defaultDate, "yyyy-MM-dd'T'HH:mm"));
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleFiles = (fileList) => {
    const validFiles = Array.from(fileList).filter(validateFile);
    
    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) added!`);
    }
  };

  const handleFileInputChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("dragover");
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("dragover");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("dragover");
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    toast.info("File removed");
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one file to upload.");
      return;
    }

    if (enablePassword && !password.trim()) {
      toast.error("Please enter a password or disable password protection.");
      return;
    }

    if (enableExpiry && !expiryDate) {
      toast.error("Please set an expiry date or disable expiry.");
      return;
    }

    if (enableExpiry && new Date(expiryDate) <= new Date()) {
      toast.error("Expiry date must be in the future.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      
      // Append each file
      files.forEach(file => {
        formData.append("files", file);
      });
      
      // Append user ID
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      formData.append("userId", user.id);
      
      // Append password protection settings
      formData.append("isPasswordProtected", String(enablePassword));
      if (enablePassword) {
        formData.append("password", password);
      }
      
      // Append expiry settings
      formData.append("hasExpiry", String(enableExpiry));
      if (enableExpiry) {
        formData.append("expiresAt", new Date(expiryDate).toISOString());
      }
      
      await dispatch(uploadFile(formData)).unwrap();
      
      setUploadProgress(100);
      toast.success("Files uploaded successfully!");
      
      // Reset form
      setFiles([]);
      setEnablePassword(false);
      setPassword("");
      setEnableExpiry(false);
      setExpiryDate("");
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error?.message || "Upload failed. Please try again.");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Upload Files</h1>
        <p className="text-gray-600">Drag & drop files or click to browse</p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isUploading ? "opacity-50 pointer-events-none" : "hover:bg-blue-50 hover:border-blue-400"
        }`}
        onClick={handleBrowseClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="text-5xl mb-3">📁</div>
        <div className="text-xl font-medium text-gray-700 mb-1">Drop files here</div>
        
        <div className="text-sm text-gray-500 mb-4">
          Supported formats: JPG, PNG, PDF, MP4, MOV, AVI, MKV (Max 10MB)
        </div>
        
        <button
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
          onClick={(e) => {
            e.stopPropagation();
            handleBrowseClick();
          }}
          disabled={isUploading}
        >
          Browse Files
        </button>
        
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept=".jpg,.jpeg,.webp,.png,.mp4,.avi,.mov,.mkv,.mk3d,.mks,.mka,.pdf"
          onChange={handleFileInputChange}
          disabled={isUploading}
          style={{ display: 'none' }}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium text-gray-700 mb-3">Selected Files</h3>
          
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{file.type.startsWith('image/') ? '🖼️' : '📄'}</span>
                  
                  <div>
                    <div className="font-medium text-gray-700">{file.name}</div>
                    <div className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                  disabled={isUploading}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-3">Security Options</h3>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center cursor-pointer">
                <div className="mr-3 text-gray-700">Password Protection</div>
                
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={enablePassword}
                    onChange={(e) => setEnablePassword(e.target.checked)}
                    disabled={isUploading}
                  />
                  <div className={`block w-10 h-6 rounded-full ${enablePassword ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${enablePassword ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </label>
            </div>
            
            {enablePassword && (
              <div className="mt-3">
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isUploading}
                />
              </div>
            )}
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center cursor-pointer">
                <div className="mr-3 text-gray-700">Set Expiry Date</div>
                
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={enableExpiry}
                    onChange={(e) => handleExpiryToggle(e.target.checked)}
                    disabled={isUploading}
                  />
                  <div className={`block w-10 h-6 rounded-full ${enableExpiry ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${enableExpiry ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </label>
            </div>
            
            {enableExpiry && (
              <div className="mt-3">
                <input
                  type="datetime-local"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isUploading}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-3">Upload Summary</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Files:</span>
              <span className="font-medium">{files.length}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Total Size:</span>
              <span className="font-medium">
                {(totalSize / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Password Protected:</span>
              <span className="font-medium">{enablePassword ? "Yes" : "No"}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Expires:</span>
              <span className="font-medium">
                {enableExpiry ? new Date(expiryDate).toLocaleDateString() : "Never"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isUploading && (
        <div className="mt-6">
          <div className="mb-2 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Uploading...</span>
            <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <div className="mt-6 text-right">
        <button
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
          onClick={handleUpload}
          disabled={isUploading || files.length === 0}
        >
          {isUploading ? "Uploading..." : "Upload Files"}
        </button>
      </div>
    </div>
  );
};

export default FileUploader;

