import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SITE_URL = 'https://gifhub.app';
const SUPABASE_URL = "https://adkeofgstlxdrfsffciu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFka2VvZmdzdGx4ZHJmc2ZmY2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NzM5MzQsImV4cCI6MjA2NjI0OTkzNH0.oMUUeRctsOTVZvsWQi0TyYnpsqJucWEePnMCl_J_WA0";

const generateSitemap = async () => {
  console.log('Generating sitemap...');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static pages
  const staticPages = [
    '/', '/about', '/contact', '/advertise', 
    '/privacy-policy', '/terms-of-service', '/submit', '/search'
  ];

  staticPages.forEach(page => {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}${page}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <priority>${page === '/' ? '1.0' : '0.8'}</priority>\n`;
    xml += `  </url>\n`;
  });

  // Dynamic pages (GIFs, Categories, Tags)
  const { data: gifs } = await supabase.from('gifs').select('slug, created_at').eq('is_approved', true);
  gifs?.forEach((gif) => {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/gif/${gif.slug}</loc>\n`;
    xml += `    <lastmod>${new Date(gif.created_at).toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  });

  const { data: categories } = await supabase.from('categories').select('slug, created_at');
  categories?.forEach((category) => {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/category/${category.slug}</loc>\n`;
    xml += `    <lastmod>${new Date(category.created_at).toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += `  </url>\n`;
  });

  const { data: tags } = await supabase.from('tags').select('slug, created_at');
  tags?.forEach((tag) => {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/tag/${tag.slug}</loc>\n`;
    xml += `    <lastmod>${new Date(tag.created_at).toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <priority>0.5</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;

  fs.writeFileSync('public/sitemap.xml', xml);
  console.log('Sitemap generated successfully and saved to public/sitemap.xml');
};

generateSitemap();