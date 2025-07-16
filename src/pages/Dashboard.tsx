import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, Download, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Mock user components
  const userComponents = [
    {
      id: 1,
      name: 'My Hero Section',
      description: 'Custom hero section for my portfolio',
      created: '2024-01-15',
      isPublic: true,
      views: 45
    },
    {
      id: 2,
      name: 'Contact Form',
      description: 'Contact form with validation',
      created: '2024-01-10',
      isPublic: false,
      views: 12
    },
    {
      id: 3,
      name: 'Feature Cards',
      description: 'Animated feature cards',
      created: '2024-01-08',
      isPublic: true,
      views: 78
    }
  ];

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your created components and track their performance
              </p>
            </div>
            <Button onClick={() => navigate('/builder')}>
              <Plus className="mr-2 h-4 w-4" />
              New Component
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl font-bold">3</CardTitle>
                <CardDescription>Total Components</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl font-bold">135</CardTitle>
                <CardDescription>Total Views</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl font-bold">2</CardTitle>
                <CardDescription>Public Components</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Components List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Components</CardTitle>
              <CardDescription>
                Components you've created with the AI builder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userComponents.map((component) => (
                  <div key={component.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">{component.name}</h3>
                        <Badge variant={component.isPublic ? "default" : "secondary"}>
                          {component.isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {component.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {component.created}
                        </div>
                        <div className="flex items-center">
                          <Eye className="mr-1 h-3 w-3" />
                          {component.views} views
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {userComponents.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4 opacity-20">🎨</div>
                    <h3 className="text-lg font-semibold mb-2">No components yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start creating amazing components with our AI builder
                    </p>
                    <Button onClick={() => navigate('/builder')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Component
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;