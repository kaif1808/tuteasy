// Simple toast utility to replace sonner
export const toast = {
  success: (message: string) => {
    // For now, use alert - in a real app you'd implement a proper toast system
    console.log('✅ Success:', message);
    alert(`Success: ${message}`);
  },
  error: (message: string) => {
    console.error('❌ Error:', message);
    alert(`Error: ${message}`);
  },
  info: (message: string) => {
    console.log('ℹ️ Info:', message);
    alert(`Info: ${message}`);
  }
}; 