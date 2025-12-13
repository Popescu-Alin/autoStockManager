/**
 * Utility functions for image processing
 */

/**
 * Converts a File or Blob to a base64 string
 * @param file - The File or Blob to convert
 * @returns Promise that resolves to a base64 string (data URL format: "data:image/png;base64,...")
 */
export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64 string'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Converts a File or Blob to a base64 string without the data URL prefix
 * @param file - The File or Blob to convert
 * @returns Promise that resolves to a base64 string (without "data:image/png;base64," prefix)
 */
export function fileToBase64String(file: File | Blob): Promise<string> {
  return fileToBase64(file).then((dataUrl) => {
    // Remove the data URL prefix (e.g., "data:image/png;base64,")
    const base64String = dataUrl.split(',')[1];
    return base64String;
  });
}

/**
 * Converts multiple Files or Blobs to base64 strings
 * @param files - Array of Files or Blobs to convert
 * @returns Promise that resolves to an array of base64 strings
 */
export function filesToBase64(files: (File | Blob)[]): Promise<string[]> {
  return Promise.all(files.map((file) => fileToBase64(file)));
}

/**
 * Converts multiple Files or Blobs to base64 strings without data URL prefix
 * @param files - Array of Files or Blobs to convert
 * @returns Promise that resolves to an array of base64 strings (without prefix)
 */
export function filesToBase64String(files: (File | Blob)[]): Promise<string[]> {
  return Promise.all(files.map((file) => fileToBase64String(file)));
}
