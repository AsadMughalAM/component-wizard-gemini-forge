import React, { useEffect, useState, useCallback } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Code2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

interface ComponentPreviewProps {
  code: string;
}

const ComponentPreview: React.FC<ComponentPreviewProps> = ({ code }) => {
  const [PreviewComponent, setPreviewComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string>('');
  const [hasExternalDeps, setHasExternalDeps] = useState<boolean>(false);

  const checkForUnsupportedDependencies = useCallback((code: string) => {
    // We can handle most dependencies now, so only mark truly unsupported ones
    const unsupportedDeps = [
      'react-hook-form',
      'zod',
      '@hookform/resolvers'
    ];
    
    return unsupportedDeps.some(dep => 
      code.includes(`from '${dep}'`) || 
      code.includes(`from "${dep}"`) ||
      code.includes(`} from '${dep}'`) ||
      code.includes(`} from "${dep}"`)
    );
  }, []);

  const createActualComponent = useCallback((code: string) => {
    try {
      // Remove imports and exports more thoroughly
      let cleanCode = code
        .replace(/import\s+.*?from\s+['"][^'"]*['"];?\s*/g, '')
        .replace(/export\s+(default\s+)?/g, '')
        .replace(/export\s*\{[^}]*\}\s*;?\s*/g, '')
        .trim();

      // Extract component name - handle various patterns
      const componentMatch = cleanCode.match(/(?:const|function)\s+(\w+)\s*[=\(]/) ||
                           cleanCode.match(/(\w+)\s*=\s*\([^)]*\)\s*=>/);
      const componentName = componentMatch ? componentMatch[1] : 'GeneratedComponent';

      // Handle different component patterns
      if (cleanCode.includes('const ') && cleanCode.includes(' = ')) {
        // Arrow function component
        cleanCode = cleanCode.replace(/const\s+\w+\s*=\s*/, '');
      } else if (cleanCode.includes('function ')) {
        // Function declaration - keep as is
      }

      // If no return statement, wrap in a function
      if (!cleanCode.includes('return') && !cleanCode.includes('=>')) {
        cleanCode = `() => { return ${cleanCode}; }`;
      }

      // Create comprehensive evaluation context with all available dependencies
      const evalContext = {
        React,
        useState: React.useState,
        useEffect: React.useEffect,
        useCallback: React.useCallback,
        useMemo: React.useMemo,
        useRef: React.useRef,
        Fragment: React.Fragment,
        
        // class-variance-authority
        cva,
        
        // Utils
        cn,
        
        // Lucide icons - make all icons available
        ...LucideIcons,
        
        // Common UI components
        Button,
        Card,
        CardContent,
        CardDescription,
        CardHeader,
        CardTitle,
        Badge,
        Separator,
        Alert,
        AlertDescription,
        
        // Enhanced framer-motion mock components with proper animation support
        motion: {
          div: React.forwardRef<HTMLDivElement, any>((props, ref) => {
            const { initial, animate, whileHover, whileTap, transition, ...rest } = props;
            return (
              <div 
                ref={ref} 
                {...rest}
                className={cn(
                  rest.className,
                  whileHover && "hover:scale-105 transition-transform duration-200",
                  animate?.scale && "animate-pulse"
                )}
                style={{
                  ...rest.style,
                  ...(animate?.opacity !== undefined && { opacity: animate.opacity }),
                  ...(animate?.scale !== undefined && { transform: `scale(${animate.scale})` }),
                  ...(animate?.y !== undefined && { transform: `translateY(${animate.y}px)` }),
                  ...(animate?.x !== undefined && { transform: `translateX(${animate.x}px)` }),
                }}
              />
            );
          }),
          span: React.forwardRef<HTMLSpanElement, any>((props, ref) => {
            const { initial, animate, whileHover, transition, ...rest } = props;
            return <span ref={ref} {...rest} className={cn(rest.className, whileHover && "hover:scale-105 transition-transform")} />;
          }),
          button: React.forwardRef<HTMLButtonElement, any>((props, ref) => {
            const { initial, animate, whileHover, whileTap, transition, ...rest } = props;
            return (
              <button 
                ref={ref} 
                {...rest}
                className={cn(
                  rest.className,
                  whileHover && "hover:scale-105 transition-transform duration-200",
                  whileTap && "active:scale-95"
                )}
              />
            );
          }),
          p: React.forwardRef<HTMLParagraphElement, any>((props, ref) => <p ref={ref} {...props} />),
          h1: React.forwardRef<HTMLHeadingElement, any>((props, ref) => <h1 ref={ref} {...props} />),
          h2: React.forwardRef<HTMLHeadingElement, any>((props, ref) => <h2 ref={ref} {...props} />),
          h3: React.forwardRef<HTMLHeadingElement, any>((props, ref) => <h3 ref={ref} {...props} />),
          section: React.forwardRef<HTMLElement, any>((props, ref) => <section ref={ref} {...props} />),
          article: React.forwardRef<HTMLElement, any>((props, ref) => <article ref={ref} {...props} />),
          header: React.forwardRef<HTMLElement, any>((props, ref) => <header ref={ref} {...props} />),
          footer: React.forwardRef<HTMLElement, any>((props, ref) => <footer ref={ref} {...props} />),
          nav: React.forwardRef<HTMLElement, any>((props, ref) => <nav ref={ref} {...props} />)
        },
        
        // Additional framer-motion utilities
        useReducedMotion: () => false,
        AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        
        // Design tokens with actual CSS variables
        designTokens: {
          primary: 'var(--primary)',
          secondary: 'var(--secondary)',
          accent: 'var(--accent)',
          muted: 'var(--muted)',
          background: 'var(--background)',
          shadow: 'var(--shadow)',
        },
      };

      // Create parameter list and arguments for the function
      const paramNames = Object.keys(evalContext);
      const paramValues = Object.values(evalContext);

      // Create the component function with proper context and better error handling
      const componentFunction = new Function(
        ...paramNames,
        `
        try {
          "use strict";
          
          // Check if it's already a component function
          if (typeof (${cleanCode}) === 'function') {
            return (${cleanCode});
          }
          
          // Try to evaluate as component definition
          let component;
          ${cleanCode.includes('return') && !cleanCode.includes('function') && !cleanCode.includes('=>') 
            ? `component = function ${componentName}() { ${cleanCode} };`
            : `component = ${cleanCode.includes('return') ? `function ${componentName}() { ${cleanCode} }` : cleanCode}`
          }
          
          // Ensure it's a valid React component
          if (typeof component !== 'function') {
            throw new Error('Generated code is not a valid React component function');
          }
          
          return component;
        } catch (error) {
          console.error('Component evaluation error:', error);
          console.log('Clean code:', \`${cleanCode}\`);
          throw new Error('Component evaluation failed: ' + error.message);
        }
        `
      );

      // Execute with context
      const component = componentFunction(...paramValues);
      
      // Validate the component
      if (typeof component !== 'function') {
        throw new Error('Generated component is not a valid React component');
      }
      
      return component;
    } catch (error: any) {
      console.error('Component creation error:', error);
      throw new Error(`Failed to create component: ${error.message}`);
    }
  }, []);

  const extractComponentInfo = useCallback((code: string) => {
    // Extract component name
    const componentMatch = code.match(/(?:const|function)\s+(\w+)\s*[=\(]/);
    const componentName = componentMatch ? componentMatch[1] : 'GeneratedComponent';
    
    // Extract description from comments or JSDoc
    const descriptionMatch = code.match(/\/\*\*(.*?)\*\//s) || code.match(/\/\/(.*?)$/m);
    const description = descriptionMatch ? descriptionMatch[1].replace(/\*/g, '').trim() : null;
    
    return { componentName, description };
  }, []);

  const createMockComponent = useCallback((code: string) => {
    const { componentName, description } = extractComponentInfo(code);
    
    return () => (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
            <Code2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-xl">{componentName}</CardTitle>
          <CardDescription>
            {description || 'This component uses complex dependencies that cannot be fully previewed.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Alert>
            <ExternalLink className="h-4 w-4" />
            <AlertDescription className="text-left">
              <strong>Preview Limitation:</strong> Some advanced features may not work in the preview environment. 
              The generated code is fully functional when used in your project.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }, [extractComponentInfo]);

  useEffect(() => {
    if (!code.trim()) {
      setPreviewComponent(null);
      setError('');
      setHasExternalDeps(false);
      return;
    }

    const hasUnsupportedDeps = checkForUnsupportedDependencies(code);
    setHasExternalDeps(hasUnsupportedDeps);

    try {
      setError('');
      
      // Always create the actual component - no more fallbacks
      const Component = createActualComponent(code);
      setPreviewComponent(() => Component);
      
    } catch (error: any) {
      console.error('Preview error:', error);
      console.log('Failed code:', code);
      
      // Only show error, no fallback
      setError(`Component render failed: ${error.message}`);
      setPreviewComponent(null);
    }
  }, [code, checkForUnsupportedDependencies, createActualComponent]);

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
      <div className="p-6 bg-background rounded-lg border h-full overflow-auto">
        <div className="flex items-center justify-between mb-6 pb-3 border-b">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-foreground">Live Preview</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {hasExternalDeps ? 'Enhanced Mock' : 'Real-time Render'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-center min-h-[300px] bg-gradient-to-br from-background to-muted/30 rounded-lg border-2 border-dashed border-muted p-8">
          <React.Suspense fallback={
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm">Rendering component...</p>
            </div>
          }>
            <ErrorBoundary>
              <div className="w-full h-full flex items-center justify-center">
                <PreviewComponent />
              </div>
            </ErrorBoundary>
          </React.Suspense>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Interactive preview with full styling and animations
          </p>
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