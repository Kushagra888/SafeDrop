import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserFiles, deleteFile, downloadFile, verifyFilePassword, generateQR } from "../../redux/slice/file/fileThunk";
import { formatDistanceToNowStrict, differenceInDays } from "date-fns";
import { toast } from "react-toastify";
import { MdOutlineContentCopy, MdOutlineQrCode } from 'react-icons/md';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { RiLockPasswordLine } from 'react-icons/ri';
import { AiOutlineDownload, AiOutlineDelete, AiOutlineShareAlt } from 'react-icons/ai';
import { CiTimer } from 'react-icons/ci';

const FileShow = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { files } = useSelector((state) => state.file);
  const [shareFile, setShareFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(null);
  const [sharingFile, setSharingFile] = useState(null);
  const [password, setPassword] = useState("");
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  
  const menuRef = React.useRef(null);
  const modalRef = React.useRef(null);

  // Add confirmation modal state
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, fileId: null });

  useEffect(() => {
    const fetchUserFiles = async () => {
      try {
        setLoading(true);
        // Make sure we're using the correct user ID property
        const userId = user?.id || user?._id;
        if (userId) {
          console.log('Fetching files for user ID:', userId);
          await dispatch(getUserFiles(userId)).unwrap();
        }
      } catch (error) {
        console.error('Error fetching user files:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserFiles();
    
    // Refresh files every minute
    const intervalId = setInterval(fetchUserFiles, 60000);
    
    return () => clearInterval(intervalId);
  }, [user, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowShareModal(false);
        setShowQRModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleShare = (url) => {
    return {
      copy: () => {
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      },
      whatsapp: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank');
      },
      email: () => {
        window.open(`mailto:?body=${encodeURIComponent(url)}`, '_blank');
      }
    };
  };
  
  const handleDeleteFile = async (fileId) => {
    if (!fileId) {
      toast.error("Invalid file");
      return;
    }

    try {
      setLoading(true);
      await dispatch(deleteFile(fileId)).unwrap();
      
      // Refresh the file list
      const userId = user?.id || user?._id;
      if (userId) {
        await dispatch(getUserFiles(userId)).unwrap();
      }
      
      toast.success("File deleted successfully");
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error?.message || "Failed to delete file");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file) => {
    if (file.isPasswordProtected && !downloadingFile) {
      setDownloadingFile(file);
      setPassword("");
      setPasswordModal(true);
      return;
    }

    try {
      setLoading(true);
      console.log('Downloading file:', { 
        fileId: file.id || file._id, 
        hasPassword: !!password,
        name: file.name
      });
      
      await dispatch(downloadFile({ 
        fileId: file.id || file._id,
        password: password || undefined
      })).unwrap();
      
      // Reset states after successful download
      setDownloadingFile(null);
      setPasswordModal(false);
      setPassword("");
      toast.success("Download started");
    } catch (error) {
      console.error('Download error:', error);
      if (error?.error === 'Password required' || error?.error === 'Incorrect password') {
        setPasswordModal(true);
        if (error?.error === 'Incorrect password') {
          toast.error("Incorrect password");
        }
      } else {
        toast.error(error?.error || "Download failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShareClick = async (file) => {
    if (file.isPasswordProtected) {
      setSharingFile(file);
      return;
    }
    setShareFile(file);
  };

  const handleVerifyAndShare = async () => {
    try {
      await dispatch(verifyFilePassword({ 
        fileId: sharingFile.id || sharingFile._id,
        password
      })).unwrap();
      
      setShareFile(sharingFile);
      setSharingFile(null);
      setPassword("");
    } catch (error) {
      toast.error(error?.error || "Incorrect password");
    }
  };

  const handleGenerateQR = async (file) => {
    try {
      setQrLoading(true);
      setQrCodeFile(file);
      const fileId = file.id || file._id;
      
      console.log('Generating QR code for file:', fileId);
      const qrCodeBlobUrl = await dispatch(generateQR(fileId)).unwrap();
      
      if (qrCodeBlobUrl) {
        setQrCodeUrl(qrCodeBlobUrl);
        setQrLoading(false);
      } else {
        throw new Error('Failed to generate QR code');
      }
    } catch (error) {
      console.error('QR generation error:', error);
      toast.error('Failed to generate QR code');
      setQrLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${qrCodeFile?.name || 'file'}_qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileTypeIcon = (type) => {
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

  // Get the full file URL
  const getFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:6600'}${path}`;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
    else return (bytes / 1073741824).toFixed(2) + ' GB';
  };

  const getFileIcon = () => {
    const fileType = files[0]?.type.split('/')[0];
    
    switch (fileType) {
      case 'image':
        return '/image-icon.svg';
      case 'video':
        return '/video-icon.svg';
      case 'audio':
        return '/audio-icon.svg';
      case 'application':
        if (files[0]?.type.includes('pdf')) return '/pdf-icon.svg';
        if (files[0]?.type.includes('word') || files[0]?.type.includes('doc')) return '/doc-icon.svg';
        if (files[0]?.type.includes('excel') || files[0]?.type.includes('sheet')) return '/xls-icon.svg';
        return '/file-icon.svg';
      default:
        return '/file-icon.svg';
    }
  };

  const handleShareLink = () => {
    if (files[0] && files[0].shortUrl) {
      navigator.clipboard.writeText(files[0].shortUrl);
      toast.success('Link copied to clipboard!');
    } else {
      toast.error('Share link not available');
    }
    
    setShowMenu(false);
    setShowShareModal(true);
  };

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `qrcode-${files[0]?.name || 'file'}.png`;
      document.body.appendChild(link);
      
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!downloadingFile) {
      toast.error("No file selected for download");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter the password");
      return;
    }

    await handleDownload(downloadingFile);
  };

  // Add confirmation handler
  const confirmDelete = (fileId) => {
    setDeleteConfirmation({ show: true, fileId });
  };

  const formatExpiryDate = (file) => {
    if (!file.hasExpiry || !file.expiresAt) {
      return "N/A";
    }
    const expiryDate = new Date(file.expiresAt);
    const now = new Date();
    if (expiryDate < now) {
      return "Expired";
    }
    return formatDistanceToNowStrict(expiryDate, { addSuffix: true });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Your uploaded files</h3>
        </div>
        
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
        ) : files && files.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Downloads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files?.map((file) => (
                  <tr key={file.id || file._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getFileTypeIcon(file.type)}</span>
                        <div>
                          <div className="flex items-center text-sm font-medium text-gray-900">
                            <span className="truncate max-w-xs">{file.name}</span>
                            {file.isPasswordProtected && (
                              <RiLockPasswordLine 
                                className="ml-2 text-gray-500 flex-shrink-0" 
                                size={16}
                                title="Password Protected"
                              />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{file.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {calculateSize(file.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        file.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {file.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.downloadedContent || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {file.hasExpiry && file.expiresAt && (
                          <CiTimer className="mr-2" size={16} />
                        )}
                        {file.hasExpiry && file.expiresAt ? (
                          <span className={`${
                            new Date(file.expiresAt) < new Date() ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {formatDistanceToNowStrict(new Date(file.expiresAt), { addSuffix: true })}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(file.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleDownload(file)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Download"
                          disabled={loading}
                        >
                          Download
                        </button>
                        <button
                          onClick={() => handleShareClick(file)}
                          className="text-purple-600 hover:text-purple-800"
                          title="Share"
                          disabled={loading}
                        >
                          Share
                        </button>
                        <button
                          onClick={() => confirmDelete(file.id || file._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-100">
            <div className="text-5xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No files uploaded yet</h3>
            <p className="text-gray-500 mb-6">Upload files to share them securely</p>
          </div>
        )}
      </div>

      {/* Password Modal for Sharing */}
      {sharingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Enter Password to Share</h3>
              <button
                onClick={() => {
                  setSharingFile(null);
                  setPassword("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password Required
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter file password"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setSharingFile(null);
                    setPassword("");
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyAndShare}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Verify & Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share File</h3>
              <button
                onClick={() => setShareFile(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">{getFileTypeIcon(shareFile.type)}</span>
                  <span className="font-medium truncate">{shareFile.name}</span>
                </div>
                {shareFile.isPasswordProtected && (
                  <div className="text-sm text-yellow-600 flex items-center">
                    <span className="mr-1">🔒</span>
                    Password protected
                  </div>
                )}
                {shareFile.hasExpiry && shareFile.expiresAt && (
                  <div className="text-sm text-gray-600">
                    Expires: {new Date(shareFile.expiresAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Share Link
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareFile.shortUrl}
                    readOnly
                    className="flex-1 p-2 border rounded-lg bg-gray-50"
                  />
                  <button
                    onClick={() => handleShare(shareFile.shortUrl).copy()}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleShare(shareFile.shortUrl).whatsapp()}
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
                >
                  <span>Share on WhatsApp</span>
                </button>
                <button
                  onClick={() => handleShare(shareFile.shortUrl).email()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <span>Share via Email</span>
                </button>
                <button
                  onClick={() => handleGenerateQR(shareFile)}
                  className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 col-span-2 flex items-center justify-center"
                >
                  <span className="mr-2">📱</span>
                  <span>Generate QR Code</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrCodeFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">QR Code for File</h3>
              <button
                onClick={() => {
                  setQrCodeFile(null);
                  setQrCodeUrl("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <p className="mb-2 text-gray-600">
                  Scan this QR code to download <strong>{qrCodeFile.name}</strong>
                </p>
                
                {qrLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
                  </div>
                ) : qrCodeUrl ? (
                  <div className="flex flex-col items-center">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code" 
                      className="border border-gray-200 rounded-lg max-w-[200px] max-h-[200px] mb-4" 
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={downloadQRCode}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Download QR Code
                      </button>
                      <button
                        onClick={() => {
                          setQrCodeFile(null);
                          setQrCodeUrl("");
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-red-500 py-8">
                    Failed to generate QR code
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {passwordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Password Required</h2>
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Password
                </label>
                
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter file password"
                  className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordModal(false);
                    setPassword('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? "Downloading..." : "Download"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4">
            <h3 className="text-xl font-semibold text-red-600">Delete File</h3>
            <p className="text-gray-600">
              Are you sure you want to delete this file? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmation({ show: false, fileId: null })}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteFile(deleteConfirmation.fileId);
                  setDeleteConfirmation({ show: false, fileId: null });
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileShow;
