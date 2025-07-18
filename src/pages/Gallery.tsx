import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Code, Heart, Copy, Plus } from 'lucide-react';
import { useComponents } from '@/hooks/useComponents';

const Gallery = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { components, loading: componentsLoading } = useComponents();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || componentsLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Components</h1>
              <p className="text-muted-foreground">
                Components you've created with AI
              </p>
            </div>
            <Button onClick={() => navigate('/builder')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Component
            </Button>
          </div>

          {components.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">No components yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first component with AI to see it here
              </p>
              <Button onClick={() => navigate('/builder')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Component
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {components.map((component) => (
              <Card key={component.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-3 flex items-center justify-center">
                    <div className="text-6xl opacity-20">⚛️</div>
                  </div>
                  <CardTitle className="text-lg">{component.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {component.description || 'AI-generated React component'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-4">
                    <Badge variant="secondary" className="text-xs">
                      React
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      TypeScript
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Tailwind
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">
                      Created {new Date(component.created_at).toLocaleDateString()}
                    </span>
                    <Badge variant={component.is_public ? "default" : "secondary"}>
                      {component.is_public ? "Public" : "Private"}
                    </Badge>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="mr-1 h-3 w-3" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Code className="mr-1 h-3 w-3" />
                      Code
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gallery;