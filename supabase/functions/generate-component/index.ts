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

    const systemPrompt = `You are an expert React component generator. Generate high-quality, production-ready React TypeScript components with beautiful animations and modern design patterns.

Requirements:
- Use TypeScript
- Use Tailwind CSS with semantic tokens (primary, secondary, accent, etc.)
- Include smooth animations using CSS transitions or framer-motion
- Make components responsive
- Use modern React patterns (hooks, functional components)
- Include proper TypeScript types
- Use shadcn/ui components when appropriate
- Make the design beautiful and modern

Generate ONLY the component code, no explanations.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
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
      const error = await response.text();
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
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