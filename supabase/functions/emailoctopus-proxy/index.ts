import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('EmailOctopus proxy function called');
    
    const requestBody = await req.json();
    console.log('Request body:', requestBody);
    
    const { endpoint, method = 'GET', body } = requestBody;
    
    const API_KEY = Deno.env.get('EMAILOCTOPUS_API_KEY') || 'eo_1b95b7a03a24aca9e1d1a70af5cdbb3bb20830db389187ffe1fdc00fa87f1218';
    const BASE_URL = 'https://emailoctopus.com/api/1.6';
    
    // Construir URL completa con API key siempre en query string
    const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${API_KEY}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }
    
    
    console.log(`Making request to: ${url}`);
    const response = await fetch(url, options);
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`EmailOctopus API error (${response.status}):`, errorText);
      
      // Log more details for debugging
      console.error('Request details:', {
        url,
        method,
        body,
        endpoint
      });
      
      return new Response(
        JSON.stringify({ 
          error: `EmailOctopus API error: ${response.status} - ${errorText.substring(0, 200)}`,
          details: {
            status: response.status,
            endpoint,
            method
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status,
        }
      );
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    
    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in emailoctopus-proxy:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});