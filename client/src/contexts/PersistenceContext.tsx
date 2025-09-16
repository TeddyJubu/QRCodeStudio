import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { QRCodeOptions } from '@/components/QRCodePreview';
import type { QrCode, Template, UserPreferences } from '@shared/schema';

export interface SavedQRCode extends Omit<QrCode, 'options'> {
  options: QRCodeOptions;
}

export interface SavedTemplate extends Omit<Template, 'options'> {
  config: QRCodeOptions;
}

interface PersistenceContextType {
  // QR Code History
  savedQRCodes: SavedQRCode[];
  saveQRCode: (name: string, options: QRCodeOptions) => Promise<void>;
  deleteQRCode: (id: string) => Promise<void>;
  isLoadingQRCodes: boolean;

  // Templates
  templates: SavedTemplate[];
  publicTemplates: SavedTemplate[];
  saveTemplate: (name: string, description: string, options: QRCodeOptions, isPublic?: boolean) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  useTemplate: (templateId: string) => Promise<void>;
  isLoadingTemplates: boolean;

  // User Preferences
  preferences: UserPreferences | null;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  isLoadingPreferences: boolean;
}

const PersistenceContext = createContext<PersistenceContextType | null>(null);

export function usePersistence() {
  const context = useContext(PersistenceContext);
  if (!context) {
    throw new Error('usePersistence must be used within a PersistenceProvider');
  }
  return context;
}

interface PersistenceProviderProps {
  children: ReactNode;
}

export function PersistenceProvider({ children }: PersistenceProviderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // QR Codes Query
  const { 
    data: savedQRCodes = [], 
    isLoading: isLoadingQRCodes 
  } = useQuery({
    queryKey: ['/api/qr-codes'],
    select: (data: QrCode[]) => data.map(qr => ({
      ...qr,
      options: qr.options as QRCodeOptions
    }))
  });

  // Templates Queries
  const { 
    data: templates = [], 
    isLoading: isLoadingUserTemplates 
  } = useQuery({
    queryKey: ['/api/templates'],
    select: (data: Template[]) => data.map(template => ({
      ...template,
      config: template.options as QRCodeOptions
    }))
  });

  const { 
    data: publicTemplates = []
  } = useQuery({
    queryKey: ['/api/templates', 'public'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/templates?public=true');
      return await res.json();
    },
    select: (data: Template[]) => data.map(template => ({
      ...template,
      config: template.options as QRCodeOptions
    }))
  });

  const isLoadingTemplates = isLoadingUserTemplates;

  // User Preferences Query
  const { 
    data: preferences = null, 
    isLoading: isLoadingPreferences 
  } = useQuery({
    queryKey: ['/api/preferences'],
    retry: false, // Don't retry if preferences don't exist yet
    select: (data: unknown) => data as UserPreferences | null
  });

  // Helper function to determine content type
  const getContentType = (data: string): string => {
    if (data.startsWith('http://') || data.startsWith('https://')) return 'url';
    if (data.startsWith('WIFI:')) return 'wifi';
    if (data.startsWith('BEGIN:VCARD')) return 'vcard';
    if (data.startsWith('mailto:')) return 'email';
    return 'text';
  };

  // QR Code Mutations
  const saveQRCodeMutation = useMutation({
    mutationFn: async ({ name, options }: { name: string; options: QRCodeOptions }) => {
      const res = await apiRequest('POST', '/api/qr-codes', {
        title: name,
        data: options.data,
        contentType: getContentType(options.data),
        options
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qr-codes'] });
      toast({
        title: 'QR Code Saved',
        description: 'Your QR code has been saved to your history.',
      });
    },
    onError: () => {
      toast({
        title: 'Save Failed',
        description: 'Failed to save QR code. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const deleteQRCodeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/qr-codes/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qr-codes'] });
      toast({
        title: 'QR Code Deleted',
        description: 'The QR code has been removed from your history.',
      });
    },
    onError: () => {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete QR code. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Template Mutations
  const saveTemplateMutation = useMutation({
    mutationFn: async ({ name, description, options, isPublic }: { 
      name: string; 
      description: string; 
      options: QRCodeOptions; 
      isPublic?: boolean; 
    }) => {
      const res = await apiRequest('POST', '/api/templates', {
        name,
        description,
        options: options,
        isPublic: isPublic || false
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/templates', 'public'] });
      toast({
        title: 'Template Saved',
        description: 'Your template has been saved successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Save Failed',
        description: 'Failed to save template. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/templates/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/templates', 'public'] });
      toast({
        title: 'Template Deleted',
        description: 'The template has been deleted successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete template. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const useTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const res = await apiRequest('POST', `/api/templates/${templateId}/use`);
      return await res.json();
    },
    onSuccess: () => {
      // Refetch templates to update usage counts
      queryClient.invalidateQueries({ queryKey: ['/api/templates', 'public'] });
    }
  });

  // User Preferences Mutations
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<UserPreferences>) => {
      if (preferences) {
        const res = await apiRequest('PUT', '/api/preferences', updates);
        return await res.json();
      } else {
        const res = await apiRequest('POST', '/api/preferences', {
          theme: 'light',
          autoSave: false,
          defaultDownloadFormat: 'png',
          ...updates
        });
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/preferences'] });
      toast({
        title: 'Preferences Updated',
        description: 'Your preferences have been saved.',
      });
    },
    onError: () => {
      toast({
        title: 'Update Failed',
        description: 'Failed to update preferences. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const value: PersistenceContextType = {
    // QR Code History
    savedQRCodes,
    saveQRCode: async (name: string, options: QRCodeOptions) => {
      await saveQRCodeMutation.mutateAsync({ name, options });
    },
    deleteQRCode: async (id: string) => {
      await deleteQRCodeMutation.mutateAsync(id);
    },
    isLoadingQRCodes,

    // Templates
    templates,
    publicTemplates,
    saveTemplate: async (name: string, description: string, options: QRCodeOptions, isPublic = false) => {
      await saveTemplateMutation.mutateAsync({ name, description, options, isPublic });
    },
    deleteTemplate: async (id: string) => {
      await deleteTemplateMutation.mutateAsync(id);
    },
    useTemplate: async (templateId: string) => {
      await useTemplateMutation.mutateAsync(templateId);
    },
    isLoadingTemplates,

    // User Preferences
    preferences,
    updatePreferences: async (updates: Partial<UserPreferences>) => {
      await updatePreferencesMutation.mutateAsync(updates);
    },
    isLoadingPreferences
  };

  return (
    <PersistenceContext.Provider value={value}>
      {children}
    </PersistenceContext.Provider>
  );
}