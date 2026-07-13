'use client';
export default function SpacerBlock({ config = {} }) {
  const { height = 60, bgColor = 'transparent' } = config;
  return <div style={{ height: `${height}px`, background: bgColor, display: 'block' }} />;
}
