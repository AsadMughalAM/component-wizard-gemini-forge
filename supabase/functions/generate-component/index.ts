import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, componentName, description } = await req.json();
    
    if (!prompt || !componentName) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: prompt and componentName are required',
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not configured in environment');
      return new Response(JSON.stringify({ 
        error: 'GEMINI_API_KEY not configured. Please add your Gemini API key to the Edge Function secrets.',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating component with Gemini API...');

    const systemPrompt = `You are an expert React component architect specializing in creating next-generation, production-ready components. Generate highly professional, sophisticated React TypeScript components that represent the cutting edge of modern web development.

## CRITICAL REQUIREMENTS:

### Modern Architecture Patterns:
- Use functional components with advanced React patterns (custom hooks, compound components, render props when appropriate)
- Implement proper TypeScript with strict types, generics, and utility types
- Follow composition over inheritance principles
- Use advanced React patterns like forwardRef, memo, and context when beneficial

### Design System Integration:
- ONLY use semantic design tokens from CSS variables (--primary, --secondary, --accent, --muted, --background, etc.)
- Never use direct colors like 'bg-blue-500' - always use semantic tokens like 'bg-primary'
- Implement comprehensive variant systems using class-variance-authority (cva)
- Create responsive designs that work flawlessly on all devices

### Advanced Animations:
- Use sophisticated CSS animations, transitions, and transforms
- Implement micro-interactions and delightful hover states
- Add entrance/exit animations with proper timing functions
- Use CSS custom properties for dynamic animations
- Consider using framer-motion for complex animations when appropriate

### Accessibility Excellence:
- Full ARIA compliance with proper roles, labels, and descriptions
- Keyboard navigation support with focus management
- Screen reader optimization
- Color contrast compliance
- Reduced motion preferences respect

### Performance Optimization:
- Implement proper memoization where beneficial
- Use efficient event handlers and avoid unnecessary re-renders
- Optimize for bundle size and runtime performance
- Implement proper error boundaries when complex

### Code Quality Standards:
- Write self-documenting code with clear naming conventions
- Add comprehensive TypeScript interfaces and types
- Include proper JSDoc comments for complex logic
- Follow SOLID principles and clean code practices
- Implement proper error handling and edge cases

### Modern UX Patterns:
- Implement loading states, skeleton screens, and empty states
- Add proper feedback for user interactions
- Use modern layout techniques (CSS Grid, Flexbox, Container Queries)
- Implement smooth state transitions and visual feedback

### Component Structure:
- Export both the component and its types
- Provide customizable props with sensible defaults
- Implement proper prop drilling solutions when needed
- Create reusable, composable component APIs

## OUTPUT FORMAT:
Generate ONLY the complete component code with proper imports. The component should be immediately usable in a production application. Include all necessary TypeScript types and interfaces within the same file.

## EXAMPLE QUALITY INDICATORS:
- Uses advanced TypeScript features (generics, utility types, conditional types)
- Implements sophisticated animation systems
- Follows modern React patterns and best practices
- Provides excellent developer experience with clear APIs
- Demonstrates professional-grade error handling
- Shows attention to performance and accessibility details

Create a component that would impress senior developers and could be used as a reference implementation for modern React development.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nComponent Name: ${componentName}\nDescription: ${description}\nDetailed Prompt: ${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      let errorMessage = `Gemini API error (${response.status})`;
      if (response.status === 400) {
        errorMessage = 'Invalid request to Gemini API. Please check your prompt.';
      } else if (response.status === 401) {
        errorMessage = 'Invalid Gemini API key. Please check your API key configuration.';
      } else if (response.status === 403) {
        errorMessage = 'Access denied to Gemini API. Please check your API key permissions.';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      }
      
      return new Response(JSON.stringify({ 
        error: errorMessage,
        success: false 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Unexpected Gemini API response format:', data);
      return new Response(JSON.stringify({ 
        error: 'Gemini API returned unexpected response format',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const generatedCode = data.candidates[0]?.content?.parts[0]?.text || '';

    // Clean up the code (remove markdown formatting if present)
    const cleanCode = generatedCode
      .replace(/```typescript\n?/g, '')
      .replace(/```tsx\n?/g, '')
      .replace(/```javascript\n?/g, '')
      .replace(/```jsx\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return new Response(JSON.stringify({ 
      generatedCode: cleanCode,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-component function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});