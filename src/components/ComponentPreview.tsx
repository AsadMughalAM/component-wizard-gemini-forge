import React, { useEffect, useState, useCallback } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Code2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ComponentPreviewProps {
  code: string;
}

const ComponentPreview: React.FC<ComponentPreviewProps> = ({ code }) => {
  const [PreviewComponent, setPreviewComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string>('');
  const [hasExternalDeps, setHasExternalDeps] = useState<boolean>(false);

  const checkForExternalDependencies = useCallback((code: string) => {
    const externalDeps = [
      'framer-motion',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'lucide-react',
      '@radix-ui',
      'react-hook-form',
      'zod',
      '@hookform/resolvers',
      'cva',
      'motion'
    ];
    
    return externalDeps.some(dep => 
      code.includes(`from '${dep}'`) || 
      code.includes(`from "${dep}"`) ||
      code.includes(`import ${dep}`) ||
      code.includes(`require('${dep}')`) ||
      code.includes(`require("${dep}")`) ||
      code.includes(`} from '${dep}'`) ||
      code.includes(`} from "${dep}"`)
    );
  }, []);

  const extractComponentInfo = useCallback((code: string) => {
    // Extract component name
    const componentMatch = code.match(/(?:const|function)\s+(\w+)\s*[=\(]/);
    const componentName = componentMatch ? componentMatch[1] : 'GeneratedComponent';
    
    // Extract description from comments or JSDoc
    const descriptionMatch = code.match(/\/\*\*(.*?)\*\//s) || code.match(/\/\/(.*?)$/m);
    const description = descriptionMatch ? descriptionMatch[1].replace(/\*/g, '').trim() : null;
    
    // Extract props interface
    const propsMatch = code.match(/interface\s+\w*Props\s*\{([^}]+)\}/s);
    const props = propsMatch ? propsMatch[1] : null;
    
    return { componentName, description, props };
  }, []);

  const createMockPreview = useCallback((code: string) => {
    const { componentName, description } = extractComponentInfo(code);
    
    return () => (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
            <Code2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-xl">{componentName}</CardTitle>
          <CardDescription>
            {description || 'This component uses external dependencies that cannot be previewed in the sandbox environment.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Dependencies detected:</strong>
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['framer-motion', 'class-variance-authority'].map((dep) => (
                code.includes(dep) && (
                  <span key={dep} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {dep}
                  </span>
                )
              ))}
            </div>
          </div>
          <Alert>
            <ExternalLink className="h-4 w-4" />
            <AlertDescription className="text-left">
              <strong>Preview Limitation:</strong> This component requires external libraries that aren't available in the preview environment. 
              The generated code is fully functional when used in your project.
            </AlertDescription>
          </Alert>
          <div className="text-xs text-muted-foreground">
            💡 Copy the code to use this component in your project
          </div>
        </CardContent>
      </Card>
    );
  }, [extractComponentInfo]);

  const createSimpleComponent = useCallback((code: string) => {
    try {
      // Clean up the code by removing imports and exports
      let cleanCode = code
        .replace(/import[^;]+;/g, '') // Remove import statements
        .replace(/export\s+default\s+/, '') // Remove export default
        .replace(/export\s+\{[^}]+\}\s*;?/g, '') // Remove named exports
        .trim();

      // Extract component name if it's a function declaration
      const componentMatch = cleanCode.match(/(?:const|function)\s+(\w+)\s*[=\(]/);
      const componentName = componentMatch ? componentMatch[1] : 'GeneratedComponent';

      // If it's an arrow function assignment, wrap it properly
      if (cleanCode.includes('const ') && cleanCode.includes(' = ')) {
        cleanCode = cleanCode.replace(/const\s+\w+\s*=\s*/, '');
      }

      // Replace common external dependencies with mock implementations
      cleanCode = cleanCode
        .replace(/cva\([^)]+\)/g, '"inline-flex items-center justify-center"') // Mock cva
        .replace(/motion\.\w+/g, 'div') // Replace motion components with div
        .replace(/className=\{[^}]+\}/g, 'className="p-4 rounded-lg bg-primary/10 text-primary"') // Simplify dynamic classNames
        .replace(/\{[^}]*\.\.\.[^}]*\}/g, '{}'); // Remove spread operators

      // Create a safe evaluation environment with React and common components
      const evalContext = {
        React,
        useState: React.useState,
        useEffect: React.useEffect,
        useCallback: React.useCallback,
        useMemo: React.useMemo,
        Fragment: React.Fragment,
      };

      // Create the component function
      const componentFunction = new Function(
        'React', 'useState', 'useEffect', 'useCallback', 'useMemo', 'Fragment',
        `
        try {
          ${cleanCode.includes('return') ? `return ${cleanCode}` : `return function ${componentName}() { ${cleanCode} }`}
        } catch (error) {
          throw new Error('Component execution error: ' + error.message);
        }
        `
      );

      const component = componentFunction(
        evalContext.React,
        evalContext.useState,
        evalContext.useEffect,
        evalContext.useCallback,
        evalContext.useMemo,
        evalContext.Fragment
      );

      return component;
    } catch (error: any) {
      throw new Error(`Component creation failed: ${error.message}`);
    }
  }, []);

  useEffect(() => {
    if (!code.trim()) {
      setPreviewComponent(null);
      setError('');
      setHasExternalDeps(false);
      return;
    }

    const hasExternalDependencies = checkForExternalDependencies(code);
    setHasExternalDeps(hasExternalDependencies);

    try {
      setError('');
      
      if (hasExternalDependencies) {
        // Show mock preview for components with external dependencies
        const MockComponent = createMockPreview(code);
        setPreviewComponent(() => MockComponent);
      } else {
        // Try to render simple components without external dependencies
        const Component = createSimpleComponent(code);
        setPreviewComponent(() => Component);
      }
    } catch (error: any) {
      console.error('Preview error:', error);
      setError(error.message || 'Failed to render component preview');
      setPreviewComponent(null);
    }
  }, [code, checkForExternalDependencies, createMockPreview, createSimpleComponent]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Preview Error:</strong> {error}
            <br />
            <span className="text-xs mt-2 block">
              The component might contain complex syntax that can't be previewed safely.
            </span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!PreviewComponent) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="animate-pulse mb-2">🔄</div>
          <p>Preparing preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <div className="p-4 bg-background rounded-lg border h-full overflow-auto">
        <div className="text-xs text-muted-foreground mb-4 pb-2 border-b">
          {hasExternalDeps 
            ? 'Mock Preview (External dependencies detected)' 
            : 'Live Preview (Limited functionality)'}
        </div>
        <div className="flex items-center justify-center min-h-[200px]">
          <React.Suspense fallback={<div className="animate-pulse">Loading...</div>}>
            <ErrorBoundary>
              <PreviewComponent />
            </ErrorBoundary>
          </React.Suspense>
        </div>
      </div>
    </div>
  );
};

// Error boundary component to catch runtime errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component preview error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Runtime Error:</strong> The component encountered an error while rendering.
            <br />
            <span className="text-xs mt-2 block">
              {this.state.error?.message || 'Unknown error occurred'}
            </span>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ComponentPreview;