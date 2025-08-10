
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
// @ts-ignore - types declared in src/types/babel-standalone.d.ts
import * as Babel from '@babel/standalone';
interface ComponentPreviewProps {
  code: string;
}

const ComponentPreview: React.FC<ComponentPreviewProps> = ({ code }) => {
  const [PreviewComponent, setPreviewComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const createComponentFromCode = useCallback((code: string) => {
    try {
      // Clean the code - remove imports and exports
      let cleanCode = code
        .replace(/import\s+.*?from\s+['"][^'"]*['"];?\s*/g, '')
        .replace(/export\s+(default\s+)?/g, '')
        .replace(/export\s*\{[^}]*\}\s*;?\s*/g, '')
        .trim();

      // Create comprehensive context with all available dependencies
      const componentContext = {
        React,
        useState: React.useState,
        useEffect: React.useEffect,
        useCallback: React.useCallback,
        useMemo: React.useMemo,
        useRef: React.useRef,
        Fragment: React.Fragment,
        
        // Styling utilities
        cva,
        cn,
        
        // All Lucide icons
        ...LucideIcons,
        
        // UI Components
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
        
        // Enhanced motion components with proper animation support
        motion: {
          div: React.forwardRef<HTMLDivElement, any>((props, ref) => {
            const { 
              initial, 
              animate, 
              whileHover, 
              whileTap, 
              transition, 
              variants,
              ...rest 
            } = props;
            
            const [isHovered, setIsHovered] = useState(false);
            const [isTapped, setIsTapped] = useState(false);
            
            // Calculate styles based on animation props
            const getAnimationStyles = () => {
              let styles: React.CSSProperties = { ...rest.style };
              
              // Apply initial styles
              if (initial) {
                if (initial.opacity !== undefined) styles.opacity = initial.opacity;
                if (initial.scale !== undefined) styles.transform = `scale(${initial.scale})`;
                if (initial.y !== undefined) styles.transform = `translateY(${initial.y}px)`;
                if (initial.x !== undefined) styles.transform = `translateX(${initial.x}px)`;
              }
              
              // Apply animate styles (override initial)
              if (animate) {
                if (animate.opacity !== undefined) styles.opacity = animate.opacity;
                if (animate.scale !== undefined) styles.transform = `scale(${animate.scale})`;
                if (animate.y !== undefined) styles.transform = `translateY(${animate.y}px)`;
                if (animate.x !== undefined) styles.transform = `translateX(${animate.x}px)`;
              }
              
              // Apply hover styles
              if (isHovered && whileHover) {
                if (whileHover.scale !== undefined) {
                  styles.transform = `scale(${whileHover.scale})`;
                }
                if (whileHover.opacity !== undefined) {
                  styles.opacity = whileHover.opacity;
                }
              }
              
              // Apply tap styles
              if (isTapped && whileTap) {
                if (whileTap.scale !== undefined) {
                  styles.transform = `scale(${whileTap.scale})`;
                }
              }
              
              return styles;
            };
            
            return (
              <div 
                ref={ref} 
                {...rest}
                style={getAnimationStyles()}
                className={cn(
                  rest.className,
                  "transition-all duration-300 ease-out",
                  whileHover && "cursor-pointer"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                  setIsHovered(false);
                  setIsTapped(false);
                }}
                onMouseDown={() => setIsTapped(true)}
                onMouseUp={() => setIsTapped(false)}
              />
            );
          }),
          button: React.forwardRef<HTMLButtonElement, any>((props, ref) => {
            const { initial, animate, whileHover, whileTap, transition, ...rest } = props;
            return (
              <button 
                ref={ref} 
                {...rest}
                className={cn(
                  rest.className,
                  "transition-all duration-200",
                  whileHover && "hover:scale-105",
                  whileTap && "active:scale-95"
                )}
              />
            );
          }),
          span: React.forwardRef<HTMLSpanElement, any>((props, ref) => {
            const { initial, animate, whileHover, whileTap, transition, ...rest } = props;
            return <span ref={ref} {...rest} className={cn(rest.className, "transition-all duration-200")} />;
          }),
          p: React.forwardRef<HTMLParagraphElement, any>((props, ref) => <p ref={ref} {...props} />),
          h1: React.forwardRef<HTMLHeadingElement, any>((props, ref) => <h1 ref={ref} {...props} />),
          h2: React.forwardRef<HTMLHeadingElement, any>((props, ref) => <h2 ref={ref} {...props} />),
          h3: React.forwardRef<HTMLHeadingElement, any>((props, ref) => <h3 ref={ref} {...props} />),
          section: React.forwardRef<HTMLElement, any>((props, ref) => <section ref={ref} {...props} />),
        },
        
        // Framer Motion utilities
        AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        
        // Design tokens using CSS variables
        designTokens: {
          primary: 'hsl(var(--primary))',
          secondary: 'hsl(var(--secondary))',
          accent: 'hsl(var(--accent))',
          muted: 'hsl(var(--muted))',
          background: 'hsl(var(--background))',
          foreground: 'hsl(var(--foreground))',
        },
      };

      // Extract component name for better error handling
      const componentMatch = cleanCode.match(/(?:const|function)\s+(\w+)/);
      const componentName = componentMatch ? componentMatch[1] : 'GeneratedComponent';

      // Prepare code (determine expression or wrap)
      let executableCode = cleanCode;

      // Detect common patterns
      const trimmed = cleanCode.trim();
      const assignMatch = trimmed.match(/^(?:const|let|var)\s+\w+\s*=\s*([\s\S]+)$/);
      const isBareArrow = /^\(?[\w\s,{}\[\]:?=]*\)?\s*=>/.test(trimmed);
      const hasVarDeclForName = new RegExp(`^(?:[\s\S]*?)(?:const|let|var)\\s+${componentName}\\s*=`).test(trimmed);

      if (assignMatch) {
        // const Comp = () => (...)
        executableCode = assignMatch[1].trim();
      } else if (isBareArrow) {
        // Bare arrow function expression: () => (...)
        executableCode = trimmed;
      } else if (cleanCode.includes('function ')) {
        // Function declaration - wrap and return the identifier
        executableCode = `(() => { ${cleanCode}; return ${componentName}; })()`;
      } else if (hasVarDeclForName) {
        // Variable declaration somewhere in the code - wrap and return the identifier
        executableCode = `(() => { ${cleanCode}; return ${componentName}; })()`;
      }

      // Transform TSX/JSX to plain JS using Babel so evaluation won't choke on '<' or TS
      try {
        const transformed = Babel.transform(executableCode, {
          presets: [
            ['typescript', { isTSX: true, allExtensions: true }],
            ['react', { runtime: 'classic' }],
          ],
          filename: 'ComponentPreview.tsx',
        }).code || '';
        executableCode = transformed;
      } catch (e) {
        console.error('Babel transform failed:', e);
        throw e as any;
      }

      // Create the evaluation function
      const paramNames = Object.keys(componentContext);
      const paramValues = Object.values(componentContext);
      
      const evaluationFunction = new Function(
        ...paramNames,
        `
        "use strict";
        try {
          const component = ${executableCode};
          if (typeof component !== 'function') {
            throw new Error('Generated code must return a React component function');
          }
          return component;
        } catch (error) {
          console.error('Component evaluation failed:', error);
          throw error;
        }
        `
      );

      // Execute and get the component
      const component = evaluationFunction(...paramValues);
      
      if (typeof component !== 'function') {
        throw new Error('Invalid component: expected a function');
      }
      
      return component;
      
    } catch (error: any) {
      console.error('Component creation error:', error);
      throw new Error(`Failed to create component: ${error.message}`);
    }
  }, []);

  useEffect(() => {
    if (!code.trim()) {
      setPreviewComponent(null);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const Component = createComponentFromCode(code);
      setPreviewComponent(() => Component);
    } catch (error: any) {
      console.error('Preview generation failed:', error);
      setError(`Preview Error: ${error.message}`);
      setPreviewComponent(null);
    } finally {
      setIsLoading(false);
    }
  }, [code, createComponentFromCode]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Preview Error:</strong> {error}
            <br />
            <span className="text-xs mt-2 block opacity-75">
              The component contains syntax that cannot be safely previewed. The generated code is still valid for use in your project.
            </span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading || !PreviewComponent) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Rendering component...</p>
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
            Real-time Render
          </Badge>
        </div>
        
        <div className="flex items-center justify-center min-h-[300px] bg-gradient-to-br from-background to-muted/20 rounded-lg border-2 border-dashed border-muted p-8">
          <React.Suspense fallback={
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm">Loading component...</p>
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

// Enhanced Error Boundary
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
    console.error('Component preview runtime error:', {
      error: error.message,
      stack: error.stack,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Runtime Error:</strong> The component encountered an error while rendering.
            <br />
            <span className="text-xs mt-2 block opacity-75">
              {this.state.error?.message || 'Component failed to render properly'}
            </span>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ComponentPreview;
