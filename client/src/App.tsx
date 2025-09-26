import React, { Suspense, lazy } from 'react';
import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PersistenceProvider } from '@/contexts/PersistenceContext';
import { performanceMonitor } from './lib/performance';

// Lazy load pages with code splitting
const Home = lazy(() => import('@/pages/Home'));
const NotFound = lazy(() => import('@/pages/not-found'));

// Loading component for lazy-loaded routes
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  // Initialize performance monitoring
  React.useEffect(() => {
    if (import.meta.env.PROD || import.meta.env.DEV) {
      // Performance monitoring is initialized automatically
      // when the performanceMonitor singleton is created
      console.log('[Performance] Monitoring initialized');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <PersistenceProvider>
            <Toaster />
            <Router />
          </PersistenceProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
