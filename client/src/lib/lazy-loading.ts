/**
 * Lazy loading utilities for images and components
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';

// Intersection Observer based lazy loading for images
export function useLazyImage(
  src: string,
  options: IntersectionObserverInit = {}
): [string, React.RefObject<HTMLImageElement>, boolean] {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before element is visible
        threshold: 0.1,
        ...options,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, options]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setIsLoaded(false);
    setImageSrc('');
  }, []);

  useEffect(() => {
    const img = imgRef.current;
    if (img) {
      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);
    }

    return () => {
      if (img) {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
      }
    };
  }, [handleLoad, handleError]);

  return [imageSrc, imgRef, isLoaded];
}

// Lazy image component with loading states
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  placeholder?: string;
  fallback?: string;
  loadingComponent?: React.ComponentType;
  errorComponent?: React.ComponentType;
}

export function LazyImage({
  src,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y0ZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  fallback,
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  alt,
  className = '',
  ...props
}: LazyImageProps) {
  const [imageSrc, imgRef, isLoaded] = useLazyImage(src);
  const [hasError, setHasError] = useState(false);
  const [internalIsLoaded, setInternalIsLoaded] = useState(false);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  const handleLoad = useCallback(() => {
    setInternalIsLoaded(true);
  }, []);

  if (hasError && fallback) {
    return React.createElement('img', { src: fallback, alt, className, ...props });
  }

  if (hasError && ErrorComponent) {
    return React.createElement(ErrorComponent);
  }

  if (!imageSrc && LoadingComponent) {
    return React.createElement(LoadingComponent);
  }

  return React.createElement(
    React.Fragment,
    null,
    !isLoaded &&
      !imageSrc &&
      React.createElement('img', {
        src: placeholder,
        alt: '',
        className: `blur-sm ${className}`,
        style: { position: 'absolute', top: 0, left: 0 },
        'aria-hidden': 'true',
      }),
    React.createElement('img', {
      ref: imgRef,
      src: imageSrc || placeholder,
      alt,
      className: `${className} ${!internalIsLoaded ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`,
      onLoad: handleLoad,
      onError: handleError,
      loading: 'lazy',
      ...props,
    })
  );
}

// Progressive image loading with blur-up effect
interface ProgressiveImageProps {
  src: string;
  placeholderSrc?: string;
  alt: string;
  className?: string;
}

export function ProgressiveImage({
  src,
  placeholderSrc,
  alt,
  className = '',
}: ProgressiveImageProps) {
  const [imgSrc, setImgSrc] = useState(placeholderSrc || '');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImgSrc(src);
      setIsLoaded(true);
    };
    img.onerror = () => {
      setIsLoaded(false);
    };
  }, [src]);

  return React.createElement(
    'div',
    {
      className: `relative overflow-hidden ${className}`,
    },
    React.createElement('img', {
      src: imgSrc,
      alt,
      className: `w-full h-full object-cover transition-all duration-500 ${
        isLoaded ? 'blur-0' : 'blur-sm'
      }`,
    }),
    !isLoaded &&
      React.createElement(
        'div',
        {
          className: 'absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center',
        },
        React.createElement(
          'div',
          {
            className: 'text-gray-400 text-sm',
          },
          'Loading...'
        )
      )
  );
}

// Lazy component wrapper with intersection observer
interface LazyComponentProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
}

export function LazyComponent({
  children,
  placeholder,
  rootMargin = '50px',
  threshold = 0.1,
}: LazyComponentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Small delay to ensure smooth loading
          setTimeout(() => {
            setIsVisible(true);
          }, 100);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [rootMargin, threshold]);

  return React.createElement(
    'div',
    { ref },
    isVisible
      ? children
      : placeholder ||
          React.createElement('div', {
            className: 'min-h-[100px] bg-gray-100 animate-pulse',
          })
  );
}

// Hook for lazy loading QR code generation
export function useLazyQRCode() {
  const [isQRCodeReady, setIsQRCodeReady] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Small delay to ensure smooth loading
          setTimeout(() => {
            setIsQRCodeReady(true);
          }, 100);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    if (qrCodeRef.current) {
      observer.observe(qrCodeRef.current);
    }

    return () => {
      if (qrCodeRef.current) {
        observer.unobserve(qrCodeRef.current);
      }
    };
  }, []);

  return { isQRCodeReady, qrCodeRef };
}
