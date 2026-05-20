import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File): Promise<File | Blob> => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
    initialQuality: 0.8
  };
  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Compression error:', error);
    return file; // Fallback to original
  }
};

export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isSafari = () => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export const safeNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};
