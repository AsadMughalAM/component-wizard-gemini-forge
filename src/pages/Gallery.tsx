import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Code, Heart, Copy } from 'lucide-react';

const Gallery = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Mock data for components
  const components = [
    {
      id: 1,
      name: 'Hero Section',
      description: 'Modern hero section with gradient background and animations',
      author: 'John Doe',
      likes: 24,
      tags: ['Hero', 'Landing', 'Gradient'],
      preview: '/api/placeholder/400/300'
    },
    {
      id: 2,
      name: 'Pricing Cards',
      description: 'Elegant pricing cards with hover effects and GSAP animations',
      author: 'Jane Smith', 
      likes: 18,
      tags: ['Pricing', 'Cards', 'Animation'],
      preview: '/api/placeholder/400/300'
    },
    {
      id: 3,
      name: 'Contact Form',
      description: 'Beautiful contact form with form validation and smooth transitions',
      author: 'Mike Johnson',
      likes: 31,
      tags: ['Form', 'Contact', 'Validation'],
      preview: '/api/placeholder/400/300'
    },
    {
      id: 4,
      name: 'Feature Grid',
      description: '3D feature grid with Spline integration and scroll triggers',
      author: 'Sarah Wilson',
      likes: 42,
      tags: ['Features', '3D', 'Spline'],
      preview: '/api/placeholder/400/300'
    },
    {
      id: 5,
      name: 'Dashboard Stats',
      description: 'Interactive dashboard with animated charts and metrics',
      author: 'Tom Brown',
      likes: 36,
      tags: ['Dashboard', 'Charts', 'Analytics'],
      preview: '/api/placeholder/400/300'
    },
    {
      id: 6,
      name: 'Product Showcase',
      description: 'Product showcase with 360° view and smooth animations',
      author: 'Lisa Davis',
      likes: 28,
      tags: ['Product', 'Showcase', '360°'],
      preview: '/api/placeholder/400/300'
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
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Component Gallery</h1>
            <p className="text-muted-foreground">
              Discover and use amazing components created by the community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {components.map((component) => (
              <Card key={component.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-3 flex items-center justify-center">
                    <div className="text-6xl opacity-20">🎨</div>
                  </div>
                  <CardTitle className="text-lg">{component.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {component.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {component.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">
                      by {component.author}
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Heart className="h-3 w-3" />
                      <span>{component.likes}</span>
                    </div>
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
        </div>
      </div>
    </div>
  );
};

export default Gallery;