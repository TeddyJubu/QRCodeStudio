/**
 * Service Worker Registration Utility
 * Handles service worker registration and communication
 */

export interface ServiceWorkerMessage {
  type: string;
  data?: any;
}

export interface CacheInfo {
  [cacheName: string]: {
    count: number;
    size: number;
  };
}

export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported = 'serviceWorker' in navigator;

  constructor() {
    if (this.isSupported) {
      this.register();
    }
  }

  /**
   * Register the service worker
   */
  async register(): Promise<void> {
    if (!this.isSupported) {
      console.warn('[Service Worker] Service workers are not supported in this browser');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[Service Worker] Registration successful with scope:', this.registration.scope);

      // Handle controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[Service Worker] Controller changed');
        window.location.reload();
      });

      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this));
    } catch (error) {
      console.error('[Service Worker] Registration failed:', error);
    }
  }

  /**
   * Unregister the service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      console.log('[Service Worker] Unregistration successful:', result);
      this.registration = null;
      return result;
    } catch (error) {
      console.error('[Service Worker] Unregistration failed:', error);
      return false;
    }
  }

  /**
   * Send message to service worker
   */
  async sendMessage(message: ServiceWorkerMessage): Promise<any> {
    if (!this.registration?.active) {
      console.warn('[Service Worker] No active service worker found');
      return null;
    }

    return new Promise(resolve => {
      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = event => {
        resolve(event.data);
      };

      this.registration!.active!.postMessage(message, [messageChannel.port2]);
    });
  }

  /**
   * Cache QR code data
   */
  async cacheQRCode(data: any): Promise<void> {
    await this.sendMessage({
      type: 'CACHE_QR_CODE',
      data,
    });
  }

  /**
   * Clear all caches
   */
  async clearCache(): Promise<void> {
    await this.sendMessage({
      type: 'CLEAR_CACHE',
    });
  }

  /**
   * Get cache information
   */
  async getCacheInfo(): Promise<CacheInfo> {
    const response = await this.sendMessage({
      type: 'GET_CACHE_INFO',
    });
    return response || {};
  }

  /**
   * Skip waiting and activate new service worker
   */
  async skipWaiting(): Promise<void> {
    await this.sendMessage({
      type: 'SKIP_WAITING',
    });
  }

  /**
   * Check for updates
   */
  async checkForUpdate(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      await this.registration.update();
      return true;
    } catch (error) {
      console.error('[Service Worker] Update check failed:', error);
      return false;
    }
  }

  /**
   * Handle messages from service worker
   */
  private handleMessage(event: MessageEvent): void {
    const { type, data } = event.data;

    switch (type) {
      case 'CACHE_UPDATED':
        console.log('[Service Worker] Cache updated:', data);
        // Dispatch custom event for UI updates
        window.dispatchEvent(new CustomEvent('sw-cache-updated', { detail: data }));
        break;

      case 'OFFLINE_READY':
        console.log('[Service Worker] Offline ready');
        window.dispatchEvent(new CustomEvent('sw-offline-ready'));
        break;

      default:
        console.log('[Service Worker] Unknown message type:', type);
    }
  }

  /**
   * Check if service worker is registered
   */
  isRegistered(): boolean {
    return this.registration !== null;
  }

  /**
   * Get current service worker registration
   */
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }
}

// Export singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

// React hook for service worker management
export function useServiceWorker() {
  const isRegistered = serviceWorkerManager.isRegistered();

  const cacheQRCode = async (data: any) => {
    await serviceWorkerManager.cacheQRCode(data);
  };

  const clearCache = async () => {
    await serviceWorkerManager.clearCache();
  };

  const getCacheInfo = async () => {
    return await serviceWorkerManager.getCacheInfo();
  };

  const checkForUpdate = async () => {
    return await serviceWorkerManager.checkForUpdate();
  };

  return {
    isRegistered,
    cacheQRCode,
    clearCache,
    getCacheInfo,
    checkForUpdate,
  };
}
