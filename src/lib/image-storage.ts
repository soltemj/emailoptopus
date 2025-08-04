// Utility functions for image storage and handling

export const saveImageToStorage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const dataUrl = reader.result as string;
      
      // Store in localStorage with a unique key
      const imageKey = `uploaded_image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        localStorage.setItem(imageKey, dataUrl);
        resolve(dataUrl);
      } catch (error) {
        console.error('Error saving image to localStorage:', error);
        reject(new Error('Failed to save image'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };
    
    reader.readAsDataURL(file);
  });
};

export const validateImageFile = (file: File): string | null => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return 'Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)';
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return 'El archivo es demasiado grande. Máximo 5MB permitido.';
  }
  
  return null; // No error
};

export const resizeImage = (file: File, maxWidth: number = 800, maxHeight: number = 600): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convert to base64 with quality compression
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(dataUrl);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};