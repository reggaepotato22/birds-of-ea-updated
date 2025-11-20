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
    const { audioBase64 } = await req.json();
    
    console.log('Received audio data, length:', audioBase64?.length);

    if (!audioBase64) {
      throw new Error('No audio data provided');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const reggie_API_KEY = Deno.env.get('reggie_API_KEY');
    
    if (!OPENAI_API_KEY || !reggie_API_KEY) {
      throw new Error('API keys not configured');
    }

    // First, transcribe the audio using Whisper
    const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
    
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    console.log('Transcribing audio with Whisper...');

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.error('Whisper API error:', transcriptionResponse.status, errorText);
      throw new Error(`Whisper API error: ${transcriptionResponse.status}`);
    }

    const transcription = await transcriptionResponse.json();
    const audioDescription = transcription.text;
    
    console.log('Transcribed audio:', audioDescription);

    // Now identify the bird based on the transcription
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
            content: `You are an expert ornithologist specializing in East African birds. Your task is to identify birds based on audio descriptions of their calls and songs. 
            
East African birds include species from Kenya, Tanzania, Uganda, Rwanda, Burundi, Ethiopia, Somalia, and surrounding regions. Common species include:
- African Fish Eagle
- Lilac-breasted Roller
- Superb Starling
- Grey-crowned Crane
- Secretary Bird
- Marabou Stork
- Yellow-billed Stork
- African Jacana
- Hammerkop
- Sacred Ibis
- White-headed Barbet
- Red-and-yellow Barbet
- D'Arnaud's Barbet
- Eastern Yellow-billed Hornbill
- Von der Decken's Hornbill
- Speckled Mousebird
- White-bellied Go-away-bird
- Ross's Turaco
- And many more species

When given a description of bird sounds, provide:
1. The most likely bird species (common name and scientific name)
2. Confidence level (high, medium, or low)
3. Brief description of why you identified this bird
4. Alternative possibilities if confidence is not high
5. Interesting facts about the bird

Respond in JSON format:
{
  "birdName": "Common Name (Scientific Name)",
  "confidence": 0.85,
  "reasoning": "Brief explanation",
  "alternatives": ["Alternative 1", "Alternative 2"],
  "facts": "Interesting facts about the bird"
}`
          },
          {
            role: 'user',
            content: `Identify this bird based on its sound: ${audioDescription}`
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

    // Try to parse as JSON, otherwise return as text
    let parsedResult;
    try {
      parsedResult = JSON.parse(result);
    } catch (e) {
      console.error('JSON parse error:', e);
      parsedResult = {
        birdName: "Unable to parse result",
        confidence: 0.5,
        reasoning: result,
        alternatives: [],
        facts: ""
      };
    }

    return new Response(
      JSON.stringify(parsedResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in identify-bird-audio function:', error);
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