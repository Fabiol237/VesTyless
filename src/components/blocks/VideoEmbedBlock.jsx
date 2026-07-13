'use client';
import { useState } from 'react';

function getVideoId(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return { type: 'youtube', id: yt[1] };
  const vi = url.match(/vimeo\.com\/(\d+)/);
  if (vi) return { type: 'vimeo', id: vi[1] };
  return { type: 'direct', id: url };
}

export default function VideoEmbedBlock({ config = {}, theme = {} }) {
  const {
    title = '',
    videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail = '',
    autoPlay = false,
    muted = true,
    showControls = true,
    borderRadius = 12,
    maxWidth = '4xl',
    bgColor = '#111827',
    paddingTop = 60,
    paddingBottom = 60,
  } = config;

  const [playing, setPlaying] = useState(autoPlay);
  const video = getVideoId(videoUrl);
  const maxWidths = { sm: '480px', md: '640px', lg: '800px', xl: '960px', '2xl': '1120px', '3xl': '1280px', '4xl': '100%', full: '100%' };

  let embedSrc = '';
  if (video?.type === 'youtube') {
    embedSrc = `https://www.youtube.com/embed/${video.id}?autoplay=${playing ? 1 : 0}&mute=${muted ? 1 : 0}&controls=${showControls ? 1 : 0}&rel=0`;
  } else if (video?.type === 'vimeo') {
    embedSrc = `https://player.vimeo.com/video/${video.id}?autoplay=${playing ? 1 : 0}&muted=${muted ? 1 : 0}&controls=${showControls ? 1 : 0}`;
  }

  return (
    <section style={{ background: bgColor, paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}>
      <div style={{ maxWidth: maxWidths[maxWidth] || '100%', margin: '0 auto', padding: '0 24px' }}>
        {title && (
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: '800', color: '#fff', margin: '0 0 28px' }}>{title}</h2>
        )}
        <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: `${borderRadius}px`, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
          {playing && embedSrc ? (
            <iframe
              src={embedSrc}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div
              onClick={() => setPlaying(true)}
              style={{
                position: 'absolute', inset: 0, cursor: 'pointer',
                background: thumbnail ? `url(${thumbnail}) center/cover` : 'linear-gradient(135deg,#1f2937,#374151)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                transition: 'transform 0.2s',
              }}>
                <div style={{ width: 0, height: 0, borderLeft: '28px solid #111827', borderTop: '18px solid transparent', borderBottom: '18px solid transparent', marginLeft: '6px' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
