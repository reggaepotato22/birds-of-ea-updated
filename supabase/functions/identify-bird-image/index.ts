import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    console.log('Identifying bird from image...');

    const reggie_API_KEY = Deno.env.get('reggie_API_KEY');
    if (!reggie_API_KEY) {
      throw new Error('reggie_API_KEY is not configured');
    }

    const response = await fetch('https://ai.gateway.reggie.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${reggie_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert ornithologist specializing in East African birds. Your task is to identify birds from photographs.

East African birds include species from Kenya, Tanzania, Uganda, Rwanda, Burundi, Ethiopia, Somalia, and surrounding regions. Common species include:
- African Fish Eagle - Large raptor with white head, chestnut body
- Lilac-breasted Roller - Colorful with lilac breast, turquoise wings
- Superb Starling - Iridescent blue-green with orange belly
- Grey-crowned Crane - Tall with golden crown of feathers
- Secretary Bird - Long-legged, eagle-like head, terrestrial raptor
- Marabou Stork - Large, bald-headed stork
- Yellow-billed Stork - White with yellow bill
- African Jacana - Long-toed water bird
- Hammerkop - Brown with distinctive crest
- Sacred Ibis - White with black head and neck
- Various Barbets, Hornbills, Turacos, and many more

When analyzing a bird image, provide:
1. The most likely bird species (common name and scientific name)
2. Confidence level (0-1 scale)
3. Key identifying features you observed
4. Alternative possibilities if confidence is not very high
5. Habitat and behavior information
6. Conservation status if relevant

Respond in JSON format:
{
  "birdName": "Common Name (Scientific Name)",
  "confidence": 0.9,
  "keyFeatures": ["Feature 1", "Feature 2"],
  "alternatives": ["Alternative 1", "Alternative 2"],
  "habitat": "Brief habitat description",
  "conservation": "Conservation status",
  "facts": "Interesting facts"
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please identify this East African bird from the image.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let result = data.choices[0].message.content;
    
    console.log('Bird identification result:', result);

    // Remove markdown code fences if present
    result = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Try to parse as JSON
    let parsedResult;
    try {
      parsedResult = JSON.parse(result);
    } catch (e) {
      console.error('JSON parse error:', e);
      parsedResult = {
        birdName: "Unable to parse result",
        confidence: 0.5,
        keyFeatures: [],
        alternatives: [],
        habitat: result,
        conservation: "Unknown",
        facts: ""
      };
    }

    return new Response(
      JSON.stringify(parsedResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in identify-bird-image function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});