import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// IMPORTANT: Replace this with your actual production domain
const SITE_URL = 'https://gifhub.app'; 

const generateSitemap = async (supabase: any) => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static pages
  const staticPages = [
    '/',
    '/about',
    '/contact',
    '/advertise',
    '/privacy-policy',
    '/terms-of-service',
    '/submit',
    '/search',
  ];

  staticPages.forEach(page => {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}${page}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <priority>${page === '/' ? '1.0' : '0.8'}</priority>\n`;
    xml += `  </url>\n`;
  });

  // GIFs
  const { data: gifs } = await supabase
    .from('gifs')
    .select('slug, created_at')
    .eq('is_approved', true);

  gifs?.forEach((gif: any) => {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/gif/${gif.slug}</loc>\n`;
    xml += `    <lastmod>${new Date(gif.created_at).toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  });

  // Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, created_at');

  categories?.forEach((category: any) => {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/category/${category.slug}</loc>\n`;
    xml += `    <lastmod>${new Date(category.created_at).toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += `  </url>\n`;
  });

  // Tags
  const { data: tags } = await supabase
    .from('tags')
    .select('slug, created_at');

  tags?.forEach((tag: any) => {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/tag/${tag.slug}</loc>\n`;
    xml += `    <lastmod>${new Date(tag.created_at).toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <priority>0.5</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;
  return xml;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const sitemap = await generateSitemap(supabase);

    return new Response(sitemap, {
      headers: { ...corsHeaders, 'Content-Type': 'application/xml; charset=utf-8' },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})