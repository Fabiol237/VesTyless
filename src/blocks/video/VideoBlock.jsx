'use client';
export default function VideoBlock({ variant = 'contained', settings = {}, content = {}, theme = {} }) {
  const { bgColor = '#111827', borderRadius = 12, maxWidth = '4xl', ratio = '16/9', paddingTop = 60, paddingBottom = 60 } = settings;
  const { title = '', videoUrl = '', thumbnail = null } = content;
  const maxWidths = { sm: 480, md: 640, lg: 768, xl: 1024, '2xl': 1280, '3xl': 1536, '4xl': 1800, full: '100%' };
  const mw = maxWidths[maxWidth] || 1024;
  const ratioMap = { '16/9': 56.25, '4/3': 75, '1/1': 100, '9/16': 177.78 };
  const pb = ratioMap[ratio] || 56.25;

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch')) return `https://www.youtube.com/embed/${new URL(url).searchParams.get('v')}`;
    if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/')[1]}`;
    if (url.includes('vimeo.com/')) return `https://player.vimeo.com/video/${url.split('vimeo.com/')[1]}`;
    return url;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <section style={{ background: bgColor, paddingTop, paddingBottom }}>
      <div style={{ maxWidth: mw, margin: '0 auto', padding: '0 24px' }}>
        {title && <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: 24 }}>{title}</h2>}
        <div style={{ position: 'relative', paddingBottom: `${pb}%`, height: 0, borderRadius, overflow: 'hidden', background: '#000' }}>
          {embedUrl ? (
            <iframe src={embedUrl} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1f2937' }}>
              <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>▶</div>
                <div>Ajoutez une URL vidéo YouTube ou Vimeo</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
