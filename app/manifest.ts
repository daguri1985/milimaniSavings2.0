import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Milimani Brothers Savings Portal',
    short_name: 'Milimani Savings',
    description: 'Track member contributions, audit financial reports, and manage savings.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0f172a', // Slate-900 background
    theme_color: '#059669', // Emerald-600 theme
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192 512x512 1024x1024',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-1024x1024.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}