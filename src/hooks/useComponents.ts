import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Component {
  id: string;
  name: string;
  description: string | null;
  prompt: string;
  generated_code: string;
  is_public: boolean;
  preview_image_url: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useComponents = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchComponents = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setComponents(data || []);
    } catch (error: unknown) {
      console.error('Error fetching components:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch components',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveComponent = async (componentData: {
    name: string;
    description?: string;
    prompt: string;
    generated_code: string;
    is_public?: boolean;
  }) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('components')
      .insert({
        ...componentData,
        user_id: user.id,
        is_public: componentData.is_public || false,
      })
      .select()
      .single();

    if (error) throw error;
    
    setComponents(prev => [data, ...prev]);
    return data;
  };

  const deleteComponent = async (id: string) => {
    const { error } = await supabase
      .from('components')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    setComponents(prev => prev.filter(c => c.id !== id));
  };

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  return {
    components,
    loading,
    saveComponent,
    deleteComponent,
    refetch: fetchComponents,
  };
};