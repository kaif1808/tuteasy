import { useCallback } from 'react';

export interface ToastOptions {
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

// Simple toast implementation - in a real app you might use a library like react-hot-toast
export const useToast = () => {
  const showToast = useCallback(({ title, description, type = 'info', duration = 5000 }: ToastOptions) => {
    // For now, we'll use a simple alert - this should be replaced with a proper toast component
    const message = description ? `${title}\n${description}` : title;
    
    if (type === 'error') {
      alert(`❌ ${message}`);
    } else if (type === 'success') {
      alert(`✅ ${message}`);
    } else if (type === 'warning') {
      alert(`⚠️ ${message}`);
    } else {
      alert(`ℹ️ ${message}`);
    }
    
    // In a real implementation, you would show a proper toast notification
    console.log(`Toast [${type}]: ${title}`, description);
  }, []);

  return { showToast };
}; 