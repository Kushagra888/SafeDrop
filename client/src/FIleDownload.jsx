import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "./config/axiosInstance";
import { toast } from "react-toastify";
import { differenceInDays, formatDistanceToNow } from "date-fns";

// pages/FileDownload.js
const FileDownload = () => {
  const { code } = useParams();
  const [fileData, setFileData] = useState(null);
  const [password, setPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/api/files/shared/${code}`);
        setFileData(res.data);
        
        // Check if file is expired
        if (res.data.hasExpiry && res.data.expiresAt) {
          const expiryDate = new Date(res.data.expiresAt);
          if (expiryDate < new Date()) {
            setIsExpired(true);
            setError('This file has expired and is no longer available');
          }
        }
        
        if (res.data.isPasswordProtected) {
          setShowPasswordPrompt(true);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Error fetching file');
        console.error('Error fetching file:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, [code]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast.error('Please enter the password');
      return;
    }
    
    try {
      setVerifying(true);
      setError('');
      
      const res = await axiosInstance.post(`/api/files/verify-password`, {
        fileId: fileData.id,
        password,
      });
      
      // Update file data with full details returned after verification
      setFileData(res.data);
      setShowPasswordPrompt(false);
      toast.success('Password verified successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Incorrect password');
      toast.error(err.response?.data?.error || 'Incorrect password');
    } finally {
      setVerifying(false);
    }
  };

  const handleDownload = async () => {
    if (isExpired) {
      toast.error('This file has expired');
      return;
    }
    
    if (fileData.isPasswordProtected && showPasswordPrompt) {
      toast.error('Please enter the password first');
      return;
    }
    
    try {
      setDownloading(true);
      setError('');

      const response = await axiosInstance({
        method: 'post',
        url: `/api/files/download/${fileData.id}`,
        responseType: 'blob',
        data: fileData.isPasswordProtected ? { password } : {},
        headers: {
          'Accept': '*/*'  // Accept any content type
        }
      });

      // Get content type from response
      const contentType = response.headers['content-type'] || fileData.type || 'application/octet-stream';
      
      // Create a blob with the correct content type
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header or use the file name
      const contentDisposition = response.headers['content-disposition'];
      let filename = fileData.name;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
          filename = decodeURIComponent(filename);
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Download started');
    } catch (err) {
      console.error('Download error:', err);
      const errorMessage = err.response?.data instanceof Blob 
        ? await err.response.data.text() 
        : err.response?.data?.error || 'Download failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setDownloading(false);
    }
  };

  const getFileIcon = (type) => {
    if (!type) return '📄';
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎬';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('spreadsheet') || type.includes('excel')) return '📊';
    if (type.includes('presentation') || type.includes('powerpoint')) return '📊';
    if (type.includes('zip') || type.includes('compressed')) return '🗜️';
    return '📁';
  };

  const getExpiryInfo = () => {
    if (!fileData?.hasExpiry || !fileData?.expiresAt) return null;
    
    const expiryDate = new Date(fileData.expiresAt);
    const daysLeft = differenceInDays(expiryDate, new Date());
    
    if (daysLeft < 0) {
      return (
        <div className="text-red-600 text-sm flex items-center">
          <span className="mr-1">⚠️</span> Expired
        </div>
      );
    } else if (daysLeft === 0) {
      return (
        <div className="text-orange-600 text-sm flex items-center">
          <span className="mr-1">⚠️</span> Expires today
        </div>
      );
    } else {
      return (
        <div className="text-green-600 text-sm flex items-center">
          <span className="mr-1">⏱️</span> Expires in {daysLeft} days
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-t-4 border-b-4 border-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading file information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <h1 className="text-2xl font-bold mb-1">SafeDrop</h1>
          <p className="text-sm text-blue-100">Secure File Sharing</p>
        </div>
        
        {error && !fileData ? (
          <div className="p-6 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <a 
              href="/" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </a>
          </div>
        ) : fileData && isExpired ? (
          <div className="p-6 text-center">
            <div className="text-5xl mb-4">⏱️</div>
            <h2 className="text-xl font-bold text-red-600 mb-2">File Expired</h2>
            <p className="text-gray-600 mb-6">This file is no longer available as it has expired.</p>
            <a 
              href="/" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </a>
          </div>
        ) : fileData && showPasswordPrompt ? (
          <div className="p-6">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="text-5xl mb-4">🔒</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Password Protected</h2>
              <p className="text-gray-600 text-center mb-2">
                This file is protected. Please enter the password to access it.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{getFileIcon(fileData.type)}</span>
                <span className="truncate max-w-[200px]">{fileData.name}</span>
              </div>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={verifying}
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center"
                disabled={verifying}
              >
                {verifying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : "Access File"}
              </button>
            </form>
          </div>
        ) : fileData && (
          <div className="p-6">
            <div className="flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="text-5xl mb-4">{getFileIcon(fileData.type)}</div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">{fileData.name}</h2>
                <div className="flex justify-center items-center space-x-3 text-sm text-gray-500">
                  <span>{fileData.type?.split('/').pop().toUpperCase() || 'FILE'}</span>
                  <span>•</span>
                  <span>
                    {fileData.size > 1024*1024
                      ? `${(fileData.size / (1024 * 1024)).toFixed(2)} MB`
                      : `${(fileData.size / 1024).toFixed(2)} KB`}
                  </span>
                </div>
                
                <div className="mt-2 flex justify-center">
                  {getExpiryInfo()}
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  Shared {formatDistanceToNow(new Date(fileData.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleDownload}
                disabled={downloading || isExpired}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting Download...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download File
                  </>
                )}
              </button>
              
              <div className="text-center">
                <a 
                  href="/" 
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Return to Home
                </a>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-gray-50 p-4 text-center text-xs text-gray-500 border-t">
          &copy; {new Date().getFullYear()} SafeDrop. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default FileDownload;    