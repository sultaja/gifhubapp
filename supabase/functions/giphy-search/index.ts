import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()
    const GIPHY_API_KEY = Deno.env.get('GIPHY_API_KEY')

    if (!GIPHY_API_KEY) {
      throw new Error('GIPHY_API_KEY is not set in environment variables.')
    }

    if (!query) {
      return new Response(JSON.stringify({ error: 'Search query is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const giphyUrl = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=24&offset=0&rating=g&lang=en`

    const giphyResponse = await fetch(giphyUrl)
    if (!giphyResponse.ok) {
      const errorBody = await giphyResponse.text();
      console.error("Giphy API Error:", errorBody);
      throw new Error(`Giphy API request failed with status ${giphyResponse.status}`)
    }

    const giphyData = await giphyResponse.json()

    return new Response(JSON.stringify(giphyData.data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error(error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})