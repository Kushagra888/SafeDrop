import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define uploads directory - handle both development and production environments
const uploadsDir = process.env.NODE_ENV === 'production' 
  ? path.join(process.cwd(), 'uploads') 
  : path.join(__dirname, '../../uploads');

console.log('Using uploads directory:', uploadsDir);

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory:', uploadsDir);
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Save a file to local storage
 * @param {Buffer} fileBuffer - The file buffer
 * @param {String} fileName - The file name
 * @returns {Promise<String>} - The file path
 */
export const saveFile = async (fileBuffer, fileName) => {
  try {
    // Create a safe file name
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = path.join(uploadsDir, safeName);
    
    console.log('Saving file to:', filePath);
    
    // Write file to disk
    await fs.promises.writeFile(filePath, fileBuffer);
    
    // Return the relative path to be stored in the database
    return `/uploads/${safeName}`;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }
};

/**
 * Get a file from local storage
 * @param {String} filePath - The relative file path (e.g., /uploads/file.jpg)
 * @returns {Promise<Buffer>} - The file buffer
 */
export const getFile = async (filePath) => {
  try {
    // Convert relative path to absolute path
    const fileName = path.basename(filePath);
    const absolutePath = path.join(uploadsDir, fileName);
    
    console.log('Reading file from:', absolutePath);
    
    // Read file from disk
    return await fs.promises.readFile(absolutePath);
  } catch (error) {
    console.error('Error reading file:', error);
    throw new Error('File not found');
  }
};

/**
 * Delete a file from local storage
 * @param {String} filePath - The relative file path (e.g., /uploads/file.jpg)
 * @returns {Promise<Boolean>} - True if successful
 */
export const deleteFile = async (filePath) => {
  try {
    // Convert relative path to absolute path
    const fileName = path.basename(filePath);
    const absolutePath = path.join(uploadsDir, fileName);
    
    console.log('Deleting file:', absolutePath);
    
    // Check if file exists
    if (fs.existsSync(absolutePath)) {
      // Delete file
      await fs.promises.unlink(absolutePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('File deletion failed');
  }
};

/**
 * Get a file URL for download
 * @param {String} filePath - The relative file path
 * @returns {String} - The file URL
 */
export const getFileUrl = (filePath) => {
  // For local development, we can just return the path
  // In production, this would be a full URL
  return filePath;
};

export default {
  saveFile,
  getFile,
  deleteFile,
  getFileUrl
}; 