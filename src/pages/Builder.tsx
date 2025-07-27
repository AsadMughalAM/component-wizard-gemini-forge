import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ComponentPreview from '@/components/ComponentPreview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Eye, Sparkles, Download, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useComponents } from '@/hooks/useComponents';
import { supabase } from '@/integrations/supabase/client';
import Editor from '@monaco-editor/react';

const Builder = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveComponent } = useComponents();
  const [componentName, setComponentName] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a component description',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-component', {
        body: {
          prompt: prompt.trim(),
          componentName: componentName || 'GeneratedComponent',
          description: description || 'A generated React component'
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate component');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate component');
      }

      setGeneratedCode(data.generatedCode);
      
      toast({
        title: 'Success',
        description: 'Component generated successfully!',
      });
    } catch (error: unknown) {
      console.error('Generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate component';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!componentName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a component name',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await saveComponent({
        name: componentName,
        description: description || undefined,
        prompt,
        generated_code: generatedCode,
        is_public: false,
      });

      toast({
        title: 'Success',
        description: 'Component saved successfully!',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save component';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${componentName || 'component'}.tsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
            <h1 className="text-3xl font-bold mb-2">Component Builder</h1>
            <p className="text-muted-foreground">
              Describe your component and let AI generate beautiful React code with animations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Component Details
                </CardTitle>
                <CardDescription>
                  Provide details about the component you want to create
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Component Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., HeroSection, PricingCard"
                    value={componentName}
                    onChange={(e) => setComponentName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of your component"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt">AI Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe in detail what you want your component to look like, how it should behave, what animations it should have..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={8}
                  />
                </div>

                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Component
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Output Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Code className="mr-2 h-5 w-5" />
                    Generated Code
                  </span>
                  {generatedCode && (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving || !componentName.trim()}
                      >
                        <Save className="h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleDownload}
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="code" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="code">
                      <Code className="mr-2 h-4 w-4" />
                      Code
                    </TabsTrigger>
                    <TabsTrigger value="preview">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="code">
                    <div className="rounded-lg h-[500px] overflow-hidden">
                      {generatedCode ? (
                        <Editor
                          height="500px"
                          defaultLanguage="typescript"
                          value={generatedCode}
                          theme="vs-dark"
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            wordWrap: 'on',
                            fontSize: 14,
                            lineNumbers: 'on',
                            glyphMargin: false,
                            folding: false,
                            lineDecorationsWidth: 0,
                            lineNumbersMinChars: 3,
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-muted/30 rounded-lg text-muted-foreground">
                          Generate a component to see the code here
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="preview">
                    <div className="bg-muted/30 rounded-lg p-4 h-[500px] overflow-auto">
                      {generatedCode ? (
                        <ComponentPreview code={generatedCode} />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          Generate a component to see the preview here
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;