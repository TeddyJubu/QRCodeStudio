/**
 * Dynamic import utilities for optimized code splitting
 */
import React from 'react';

// Preloading strategies
export const preloadStrategy = {
  // Preload when user hovers over a trigger
  hover: 'hover',
  // Preload when component is in viewport
  viewport: 'viewport',
  // Preload after initial render
  idle: 'idle',
  // Preload when network is idle
  networkIdle: 'networkIdle',
} as const;

type PreloadStrategy = keyof typeof preloadStrategy;

// Dynamic import with error handling and loading states
export function createDynamicImport<T>(
  importFn: () => Promise<{ default: React.ComponentType<any> }>,
  options: {
    fallback?: React.ComponentType;
    errorFallback?: React.ComponentType<{ error: Error }>;
    preloadStrategy?: PreloadStrategy;
  } = {}
): React.LazyExoticComponent<React.ComponentType<any>> {
  const { errorFallback, preloadStrategy: strategy } = options;

  // Preload based on strategy
  if (strategy === 'idle') {
    // Use requestIdleCallback for non-critical imports
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        importFn().catch(console.error);
      });
    }
  }

  return React.lazy(() =>
    importFn().catch((error: Error) => {
      console.error('Dynamic import failed:', error);

      // Return a module with a default component that shows the error
      if (errorFallback) {
        const ErrorComponent = errorFallback;
        return Promise.resolve({
          default: (props: any) => React.createElement(ErrorComponent, { error, ...props }),
        }) as Promise<{ default: React.ComponentType<any> }>;
      }

      // Default error component
      return Promise.resolve({
        default: () =>
          React.createElement(
            'div',
            { className: 'p-4 border border-red-200 rounded-lg bg-red-50' },
            React.createElement(
              'h3',
              { className: 'text-red-800 font-medium' },
              'Failed to load component'
            ),
            React.createElement(
              'p',
              { className: 'text-red-600 text-sm mt-1' },
              'Please refresh the page and try again.'
            )
          ),
      }) as Promise<{ default: React.ComponentType<any> }>;
    })
  );
}

// Intersection Observer for viewport-based preloading
export function setupViewportPreload(
  triggerElement: HTMLElement,
  importFn: () => Promise<any>,
  options: IntersectionObserverInit = {}
): () => void {
  if (typeof window === 'undefined') return () => {};

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          importFn().catch(console.error);
          observer.unobserve(triggerElement);
        }
      });
    },
    {
      rootMargin: '100px', // Start loading 100px before element is visible
      threshold: 0.1,
      ...options,
    }
  );

  observer.observe(triggerElement);

  return () => observer.disconnect();
}

// Hover-based preloading
export function setupHoverPreload(
  triggerElement: HTMLElement,
  importFn: () => Promise<any>,
  delay: number = 200
): () => void {
  if (typeof window === 'undefined') return () => {};

  let timeoutId: NodeJS.Timeout;

  const handleMouseEnter = () => {
    timeoutId = setTimeout(() => {
      importFn().catch(console.error);
    }, delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutId);
  };

  triggerElement.addEventListener('mouseenter', handleMouseEnter);
  triggerElement.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    clearTimeout(timeoutId);
    triggerElement.removeEventListener('mouseenter', handleMouseEnter);
    triggerElement.removeEventListener('mouseleave', handleMouseLeave);
  };
}

// Network-aware preloading
export function setupNetworkAwarePreload(importFn: () => Promise<any>): void {
  if (typeof window === 'undefined') return;

  const checkNetworkAndPreload = () => {
    const connection = (navigator as any).connection;

    // Only preload on good connections
    if (
      !connection ||
      (connection.effectiveType !== 'slow-2g' &&
        connection.effectiveType !== '2g' &&
        !connection.saveData)
    ) {
      importFn().catch(console.error);
    }
  };

  // Check when network becomes idle
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(checkNetworkAndPreload);
  } else {
    // Fallback: setTimeout
    setTimeout(checkNetworkAndPreload, 2000);
  }
}

// Component wrapper for dynamic imports with preloading
export function DynamicComponent<T extends Record<string, any>>({
  importFn,
  errorFallback,
  preloadStrategy,
  ...props
}: {
  importFn: () => Promise<{ default: React.ComponentType<T> }>;
  errorFallback?: React.ComponentType<{ error: Error }>;
  preloadStrategy?: PreloadStrategy;
} & T) {
  const LazyComponent = createDynamicImport<T>(importFn, {
    errorFallback,
    preloadStrategy,
  });

  return React.createElement(LazyComponent, props);
}
