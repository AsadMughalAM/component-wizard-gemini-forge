import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Code, 
  Palette, 
  Zap, 
  ArrowRight, 
  Check,
  Layers,
  Wand2,
  Rocket
} from 'lucide-react';
import { gsap } from 'gsap';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP animations
    const ctx = gsap.context(() => {
      gsap.from('.hero-title', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out'
      });
      
      gsap.from('.hero-subtitle', {
        duration: 1,
        y: 30,
        opacity: 0,
        delay: 0.2,
        ease: 'power3.out'
      });
      
      gsap.from('.hero-buttons', {
        duration: 1,
        y: 30,
        opacity: 0,
        delay: 0.4,
        ease: 'power3.out'
      });

      gsap.from('.feature-card', {
        duration: 0.8,
        y: 50,
        opacity: 0,
        stagger: 0.1,
        delay: 0.6,
        ease: 'power3.out'
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: Wand2,
      title: 'AI-Powered Generation',
      description: 'Describe your component and watch Gemini AI create beautiful React code with animations',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Layers,
      title: 'GSAP Animations',
      description: 'Professional scroll-triggered animations and smooth transitions powered by GSAP',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Code,
      title: '3D Integration',
      description: 'Seamlessly integrate Spline 3D graphics into your React components',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Palette,
      title: 'Design System',
      description: 'Components follow modern design principles with customizable themes',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Zap,
      title: 'Live Preview',
      description: 'See your components come to life in real-time with instant previews',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Rocket,
      title: 'Export Ready',
      description: 'Download production-ready code that works seamlessly in any React project',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  const benefits = [
    'Generate components in seconds, not hours',
    'Professional animations with GSAP',
    '3D graphics integration with Spline',
    'Modern design system included',
    'Production-ready code export',
    'Community gallery of components'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 pt-20 pb-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="hero-title mb-6 px-4 py-2 text-sm font-medium">
              ✨ Powered by AI, GSAP & Spline
            </Badge>
            
            <h1 className="hero-title text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Build React Components
              <br />
              <span className="text-foreground">with AI Magic</span>
            </h1>
            
            <p className="hero-subtitle text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Describe your vision and watch our AI create stunning React components with 
              professional animations, 3D graphics, and production-ready code.
            </p>
            
            <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => user ? navigate('/builder') : navigate('/auth')}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Building
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => navigate('/gallery')}
              >
                <Palette className="mr-2 h-5 w-5" />
                View Gallery
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Everything You Need to Create
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Professional tools and AI assistance to build components that stand out
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="feature-card group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-0 bg-background/80 backdrop-blur">
                  <CardHeader>
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white w-fit mb-4`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-12">
              Why Choose Component Creator?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3 text-left">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Transform Your Development?
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Join thousands of developers who are building faster with AI-powered components
              </p>
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => user ? navigate('/builder') : navigate('/auth')}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
