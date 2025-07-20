import React, { useEffect, useState, useCallback } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ComponentPreviewProps {
  code: string;
}

const ComponentPreview: React.FC<ComponentPreviewProps> = ({ code }) => {
  const [PreviewComponent, setPreviewComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string>('');

  const createComponent = useCallback((code: string) => {
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

      // Create a safe evaluation environment with React and common components
      const evalContext = {
        React,
        useState: React.useState,
        useEffect: React.useEffect,
        useCallback: React.useCallback,
        useMemo: React.useMemo,
        Fragment: React.Fragment,
        // Add more hooks as needed
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
      return;
    }

    try {
      setError('');
      const Component = createComponent(code);
      setPreviewComponent(() => Component);
    } catch (error: any) {
      console.error('Preview error:', error);
      setError(error.message || 'Failed to render component preview');
      setPreviewComponent(null);
    }
  }, [code, createComponent]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Preview Error:</strong> {error}
            <br />
            <span className="text-xs mt-2 block">
              The component might use external dependencies or contain syntax that can't be previewed safely.
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
          Live Preview (Limited functionality - external deps may not work)
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