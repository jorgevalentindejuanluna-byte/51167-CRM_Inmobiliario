export type ToastType = 'success' | 'error' | 'warning' | 'info';

export function showToast(message: string, type: ToastType = 'info') {
  if (typeof document === 'undefined') return;

  const containerId = 'crm-toast-container';
  let container = document.getElementById(containerId);
  
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.position = 'fixed';
    container.style.bottom = '24px';
    container.style.right = '24px';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '12px';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  
  const colors = {
    success: 'var(--color-success, #4caf50)',
    error: 'var(--color-error, #f44336)',
    warning: 'var(--color-warning, #ff9800)',
    info: 'var(--color-primary, #2196f3)'
  };
  
  const icons = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
  };

  toast.style.backgroundColor = 'var(--color-surface-high, #1e1e1e)';
  toast.style.color = 'var(--color-text-primary, #e0e0e0)';
  toast.style.padding = '14px 24px 14px 20px';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '12px';
  toast.style.minWidth = '300px';
  toast.style.borderLeft = `5px solid ${colors[type]}`;
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(20px)';
  toast.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

  toast.innerHTML = `
    <span class="material-symbols-outlined" style="color: ${colors[type]}; font-size: 24px;">${icons[type]}</span>
    <span style="font-weight: 500; font-size: 14px; font-family: var(--font-inter, sans-serif); color: var(--color-text-primary);">${message}</span>
  `;

  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  // Remove after 3.5s
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px) scale(0.95)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}
