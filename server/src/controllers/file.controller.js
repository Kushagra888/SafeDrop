import { File } from '../models/file.models.js';
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import shortid from "shortid";
import QRCode from "qrcode";
import { User } from '../models/user.models.js';
import path from "path";
import { saveFile, getFile, deleteFile as deleteFileFromStorage, getFileUrl } from '../utils/fileStorage.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from "uuid";
import { createReadStream, createWriteStream } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadFiles = async (req, res) => {
  console.log('Upload request received:', { files: req.files?.length || 0, body: req.body });
  
  if (!req.files || req.files.length === 0) {
    console.error('No files in request');
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const { isPasswordProtected, password, hasExpiry, expiresAt, userId } = req.body;
  
  try {
    const savedFiles = [];
    const user = await User.findByPk(userId);
    
    if (!user) {
      console.error('User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    for (const file of req.files) {
      const originalName = file.originalname;
      const extension = path.extname(originalName);
      const uniqueSuffix = shortid.generate();
      
      const finalFileName = `${originalName.replace(/\s+/g, '_')}_${uniqueSuffix}${extension}`;
      const shortCode = shortid.generate();

      console.log('Processing file:', {
        originalName,
        finalFileName,
        type: file.mimetype,
        size: file.size
      });

      // Save file to local storage
      const filePath = await saveFile(file.buffer, finalFileName);

      // Determine expiry date
      let expiryDate = null;
      if (hasExpiry === 'true') {
        if (expiresAt && expiresAt.includes('T')) {
          // ISO format date string
          expiryDate = new Date(expiresAt);
        } else {
          // Hours from now
          const hours = parseInt(expiresAt) || 168; // Default to 7 days (168 hours)
          expiryDate = new Date(Date.now() + hours * 3600000);
        }
        console.log('Setting expiry date:', expiryDate);
      }

      const fileObj = {
        path: filePath,
        name: originalName, // Store original name for display
        type: file.mimetype,
        size: file.size,
        hasExpiry: hasExpiry === 'true',
        expiresAt: expiryDate,
        status: 'active',
        shortUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/f/${shortCode}`,
        shortCode: shortCode,
        createdBy: userId,
        isPasswordProtected: isPasswordProtected === 'true',
        downloadedContent: 0
      };

      if (isPasswordProtected === 'true' && password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        fileObj.password = hashedPassword;
        console.log('Password protection enabled for file');
      }

      console.log('Creating file record:', {
        name: fileObj.name,
        type: fileObj.type,
        size: fileObj.size,
        isProtected: fileObj.isPasswordProtected,
        hasExpiry: fileObj.hasExpiry
      });

      const newFile = await File.create(fileObj);
      savedFiles.push(newFile);

      // Update user stats
      await User.update(
        {
          totalUploads: sequelize.literal('totalUploads + 1'),
          imageCount: file.mimetype.startsWith('image/') 
            ? sequelize.literal('imageCount + 1') 
            : sequelize.col('imageCount'),
          videoCount: file.mimetype.startsWith('video/') 
            ? sequelize.literal('videoCount + 1') 
            : sequelize.col('videoCount'),
          documentCount: file.mimetype.startsWith('application/') 
            ? sequelize.literal('documentCount + 1') 
            : sequelize.col('documentCount')
        },
        { where: { id: userId } }
      );
    }

    console.log('Files uploaded successfully:', savedFiles.length);
    return res.status(201).json({
      message: "Files uploaded successfully",
      fileIds: savedFiles.map(f => f.id),
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "File upload failed", error: error.message });
  }
};

const downloadFile = async (req, res) => {
  const { fileId } = req.params;
  // Get password from either query params (GET) or body (POST)
  const password = req.query.password || req.body.password;
  
  console.log('Download request received:', { 
    fileId,
    hasPassword: !!password,
    method: req.method,
    contentType: req.headers['content-type']
  });
  
  try {
    const file = await File.findByPk(fileId);
    if (!file) {
      console.error('File not found:', fileId);
      return res.status(404).json({ error: 'File not found' });
    }

    console.log('File found:', {
      id: file.id,
      name: file.name,
      isPasswordProtected: file.isPasswordProtected,
      hasExpiry: file.hasExpiry,
      status: file.status
    });

    if (file.status !== 'active') {
      console.error('File not active:', file.status);
      return res.status(403).json({ error: 'This file is not available for download' });
    }

    if (file.hasExpiry && file.expiresAt && new Date(file.expiresAt) < new Date()) {
      console.error('File expired:', file.expiresAt);
      await File.update({ status: 'expired' }, { where: { id: fileId } });
      return res.status(410).json({ error: 'This file has expired' });
    }

    if (file.isPasswordProtected) {
      console.log('Password protected file, verifying password');
      if (!password) {
        console.error('No password provided for protected file');
        return res.status(401).json({ error: 'Password required' });
      }

      const isMatch = await bcrypt.compare(password, file.password);
      if (!isMatch) {
        console.error('Incorrect password provided');
        return res.status(403).json({ error: 'Incorrect password' });
      }
      console.log('Password verified successfully');
    }

    // Get the file name from the path
    const fileName = path.basename(file.path);
    
    // Define uploads directory - handle both development and production environments
    const uploadsDir = process.env.NODE_ENV === 'production' 
      ? path.join(process.cwd(), 'uploads') 
      : path.join(__dirname, '../../uploads');
      
    const absolutePath = path.join(uploadsDir, fileName);

    console.log('File path:', {
      fileName,
      uploadsDir,
      absolutePath,
      exists: fs.existsSync(absolutePath)
    });

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      console.error('File not found on server:', absolutePath);
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', file.type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);

    // Stream the file
    const fileStream = createReadStream(absolutePath);
    fileStream.pipe(res);

    // Update download count after successful stream
    fileStream.on('end', async () => {
      try {
        await File.update(
          { downloadedContent: sequelize.literal('downloadedContent + 1') },
          { where: { id: fileId } }
        );
        
        // Update user stats if file was created by a user
        if (file.createdBy) {
          await User.update(
            { totalDownloads: sequelize.literal('totalDownloads + 1') },
            { where: { id: file.createdBy } }
          );
        }
      } catch (error) {
        console.error('Error updating download count:', error);
      }
    });

    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming file' });
      }
    });
  } catch (error) {
    console.error("Download error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Download failed' });
    }
  }
};

const deleteFile = async (req, res) => {
  const { fileId } = req.params;

  try {
    const file = await File.findByPk(fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete file from local storage
    try {
      await deleteFileFromStorage(file.path);
      console.log(`File deleted from storage: ${file.path}`);
    } catch (err) {
      console.error(`Error deleting file from storage: ${err.message}`);
      // Continue with database deletion even if file deletion fails
    }
    
    // Delete file record from database
    await File.destroy({ where: { id: fileId } });

    return res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateFileStatus = async (req, res) => {
  const { fileId } = req.params;
  const { status } = req.body;

  try {
    const file = await File.findByPk(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    await File.update({ status }, { where: { id: fileId } });
    
    const updatedFile = await File.findByPk(fileId);
    return res.status(200).json(updatedFile);
  } catch (error) {
    console.error("Update status error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateFileExpiry = async (req, res) => {
  const { fileId, expiresAt } = req.body;
  
  try {
    const file = await File.findByPk(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    let expiryDate;
    if (typeof expiresAt === 'string' && expiresAt.includes('T')) {
      // ISO format date string
      expiryDate = new Date(expiresAt);
    } else {
      // Hours from now
      const hours = parseInt(expiresAt) || 168; // Default to 7 days
      expiryDate = new Date(Date.now() + hours * 3600000);
    }
    
    await File.update(
      { 
        hasExpiry: true,
        expiresAt: expiryDate
      },
      { where: { id: fileId } }
    );
    
    const updatedFile = await File.findByPk(fileId);
    return res.status(200).json(updatedFile);
  } catch (error) {
    console.error("Update expiry error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateFilePassword = async (req, res) => {
  const { fileId, password } = req.body;
  
  try {
    const file = await File.findByPk(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await File.update(
      {
        isPasswordProtected: true,
        password: hashedPassword
      },
      { where: { id: fileId } }
    );
    
    const updatedFile = await File.findByPk(fileId);
    return res.status(200).json(updatedFile);
  } catch (error) {
    console.error("Update password error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const searchFiles = async (req, res) => {
  const { query } = req.query;
  
  try {
    const files = await File.findAll({
      where: {
        name: {
          [Op.like]: `%${query}%`
        }
      }
    });
    
    return res.status(200).json(files);
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const showUserFiles = async (req, res) => {
  const { userId } = req.query;
  
  try {
    const files = await File.findAll({
      where: { createdBy: userId }
    });
    
    return res.status(200).json(files);
  } catch (error) {
    console.error("Show files error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getFileDetails = async (req, res) => {
  const { fileId } = req.params;
  
  try {
    const file = await File.findByPk(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    return res.status(200).json(file);
  } catch (error) {
    console.error("Get file details error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const generateShareShortenLink = async (req, res) => {
  const { fileId } = req.body;
  
  try {
    const file = await File.findByPk(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    return res.status(200).json(file);
  } catch (error) {
    console.error("Generate link error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const sendLinkEmail = async (req, res) => {
  const { fileId, email } = req.body;
  
  try {
    const file = await File.findByPk(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Create a test account if no SMTP configuration
    let testAccount = await nodemailer.createTestAccount();
    
    // Create transporter
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || testAccount.user,
        pass: process.env.SMTP_PASS || testAccount.pass,
      },
    });
    
    // Send email
    let info = await transporter.sendMail({
      from: '"SafeDrop" <no-reply@safedrop.com>',
      to: email,
      subject: "File Shared With You",
      text: `Someone shared a file with you: ${file.shortUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>File Shared With You</h2>
          <p>Someone shared a file with you using SafeDrop.</p>
          <p><strong>File Name:</strong> ${file.name}</p>
          <p><strong>Size:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
          <a href="${file.shortUrl}" style="display: inline-block; background: linear-gradient(to right, #3182ce, #805ad5); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download File</a>
          ${file.hasExpiry && file.expiresAt ? 
            `<p style="margin-top: 20px; font-size: 12px; color: #666;">This link will expire on ${new Date(file.expiresAt).toLocaleString()}</p>` : 
            ''}
          ${file.isPasswordProtected ? 
            `<p style="margin-top: 10px; font-size: 12px; color: #666;">This file is password protected. Please contact the sender for the password.</p>` : 
            ''}
        </div>
      `
    });
    
    console.log("Email sent:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    
    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error("Send email error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const generateQR = async (req, res) => {
  const { fileId } = req.params;
  
  try {
    const file = await File.findByPk(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const qrCode = await QRCode.toBuffer(file.shortUrl);
    
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': qrCode.length
    });
    
    res.end(qrCode);
  } catch (error) {
    console.error("Generate QR error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getDownloadCount = async (req, res) => {
  const { fileId } = req.params;
  
  try {
    const file = await File.findByPk(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    return res.status(200).json({ count: file.downloadedContent });
  } catch (error) {
    console.error("Get download count error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const resolveShareLink = async (req, res) => {
  const { code } = req.params;
  
  try {
    const file = await File.findOne({
      where: { shortCode: code }
    });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    if (file.hasExpiry && file.expiresAt && new Date(file.expiresAt) < new Date()) {
      return res.status(410).json({ error: 'This file has expired' });
    }
    
    // Don't expose password hash
    const fileData = {
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      isPasswordProtected: file.isPasswordProtected,
      hasExpiry: file.hasExpiry,
      expiresAt: file.expiresAt,
      status: file.status,
      shortUrl: file.shortUrl,
      createdAt: file.createdAt,
      downloadedContent: file.downloadedContent || 0
    };
    
    return res.status(200).json(fileData);
  } catch (error) {
    console.error("Resolve link error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const verifyFilePassword = async (req, res) => {
  const { fileId, password } = req.body;
  
  try {
    const file = await File.findByPk(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    if (!file.isPasswordProtected) {
      return res.status(400).json({ error: 'File is not password protected' });
    }
    
    if (!file.password) {
      return res.status(500).json({ error: 'Password data missing' });
    }
    
    const isMatch = await bcrypt.compare(password, file.password);
    
    if (!isMatch) {
      return res.status(403).json({ error: 'Incorrect password' });
    }
    
    // Return file details without sensitive data
    const fileData = {
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      path: file.path,
      isPasswordProtected: file.isPasswordProtected,
      hasExpiry: file.hasExpiry,
      expiresAt: file.expiresAt,
      status: file.status,
      shortUrl: file.shortUrl,
      createdAt: file.createdAt,
      downloadedContent: file.downloadedContent || 0
    };
    
    return res.status(200).json(fileData);
  } catch (error) {
    console.error("Verify password error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getUserFiles = async (req, res) => {
  try {
    console.log('Getting files for user:', req.user);
    
    if (!req.user || !req.user.userId) {
      console.error('No user ID in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const files = await File.findAll({
      where: { createdBy: req.user.userId },
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`Found ${files.length} files for user ${req.user.userId}`);
    return res.status(200).json(files);
  } catch (error) {
    console.error("Get user files error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export {
  uploadFiles,
  downloadFile,
  deleteFile,
  updateFileStatus,
  getFileDetails,
  generateShareShortenLink,
  sendLinkEmail,
  updateFileExpiry,
  updateFilePassword,
  searchFiles,
  showUserFiles,
  generateQR,
  getDownloadCount,
  resolveShareLink,
  verifyFilePassword,
  getUserFiles
};