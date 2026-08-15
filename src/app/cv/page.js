'use client';
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Briefcase, GraduationCap, Code, Award, ExternalLink, Send } from 'lucide-react';

export default function CVPage() {
  const [copied, setCopied] = useState(false);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('+237 674 15 17 28');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top right, #0f172a, #020617)',
      color: '#f8fafc',
      fontFamily: 'Inter, sans-serif',
      padding: '40px 20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        .cv-card {
          width: 100%;
          max-width: 960px;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .cv-header {
          position: relative;
          padding: 60px 48px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .avatar-container {
          position: relative;
          width: 160px;
          height: 160px;
          border-radius: 24px;
          overflow: hidden;
          border: 3px solid #6366f1;
          box-shadow: 0 12px 24px rgba(99, 102, 241, 0.3);
          flex-shrink: 0;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .name-title {
          font-family: 'Outfit', sans-serif;
        }

        .cv-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 40px;
          padding: 48px;
        }

        .sidebar-section {
          margin-bottom: 32px;
        }

        .section-title {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #818cf8;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 8px;
        }

        .skill-tag {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #cbd5e1;
          display: inline-block;
          margin: 4px;
          transition: all 0.2s;
        }

        .skill-tag:hover {
          background: rgba(99, 102, 241, 0.15);
          border-color: #6366f1;
          color: #fff;
          transform: translateY(-2px);
        }

        .exp-item {
          position: relative;
          padding-left: 24px;
          border-left: 2px solid rgba(99, 102, 241, 0.3);
          margin-bottom: 32px;
        }

        .exp-item::before {
          content: '';
          position: absolute;
          left: -7px;
          top: 4px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #6366f1;
          border: 2px solid #0f172a;
          box-shadow: 0 0 10px #6366f1;
        }

        .contact-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          border: none;
          color: #fff;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 10px 20px rgba(99, 102, 241, 0.25);
          text-decoration: none;
        }

        .contact-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 25px rgba(99, 102, 241, 0.35);
        }

        @media (max-width: 768px) {
          .cv-header {
            flex-direction: column;
            text-align: center;
            padding: 40px 24px;
          }
          .cv-grid {
            grid-template-columns: 1fr;
            padding: 32px 24px;
            gap: 32px;
          }
          .avatar-container {
            width: 130px;
            height: 130px;
          }
        }
      `}</style>

      <div className="cv-card">
        {/* Header */}
        <div className="cv-header">
          <div className="avatar-container">
            <img src="/avatar.png" alt="Profile avatar" className="avatar-img" />
          </div>
          <div>
            <h1 className="name-title" style={{ fontSize: '38px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Zoko Fabiol
            </h1>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#a5b4fc', margin: '0 0 16px 0' }}>
              Expert E-Commerce & Développeur d'Applications
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, maxWidth: '520px', lineHeight: 1.6 }}>
              Spécialiste dans la création et le déploiement de solutions e-commerce et de plateformes de vente performantes en temps réel. Passionné par l'innovation digitale et la création d'expériences web premium.
            </p>
          </div>
        </div>

        {/* Grid Body */}
        <div className="cv-grid">
          {/* Left Sidebar */}
          <div>
            {/* Contact */}
            <div className="sidebar-section">
              <div className="section-title">
                <Code size={16} /> Contact
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: '#cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Phone size={16} style={{ color: '#6366f1' }} />
                  <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={handleCopyPhone} title="Click to copy">
                    {copied ? 'Copié !' : '+237 674 15 17 28'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Mail size={16} style={{ color: '#6366f1' }} />
                  <a href="mailto:zokofabiol@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                    zokofabiol@gmail.com
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MapPin size={16} style={{ color: '#6366f1' }} />
                  <span>Cameroun</span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="sidebar-section">
              <div className="section-title">
                <Award size={16} /> Compétences
              </div>
              <div style={{ margin: '0 -4px' }}>
                <span className="skill-tag">E-Commerce</span>
                <span className="skill-tag">Next.js / React</span>
                <span className="skill-tag">Supabase</span>
                <span className="skill-tag">Node.js</span>
                <span className="skill-tag">TailwindCSS</span>
                <span className="skill-tag">Base de données</span>
                <span className="skill-tag">UI/UX Premium</span>
                <span className="skill-tag">Gestion de Projet</span>
              </div>
            </div>

            {/* Certifications */}
            <div className="sidebar-section">
              <div className="section-title">
                <GraduationCap size={16} /> Langues
              </div>
              <div style={{ fontSize: '13px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>• Français (Natif)</div>
                <div>• Anglais (Professionnel)</div>
              </div>
            </div>
          </div>

          {/* Right Main Content */}
          <div>
            {/* Experience */}
            <div style={{ marginBottom: '40px' }}>
              <div className="section-title">
                <Briefcase size={16} /> Expérience Professionnelle
              </div>

              <div className="exp-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>Développeur & Fondateur</h3>
                  <span style={{ fontSize: '12px', color: '#a5b4fc', fontWeight: '600' }}>2025 - Présent</span>
                </div>
                <div style={{ fontSize: '13px', color: '#818cf8', fontWeight: '600', marginBottom: '10px' }}>VesTyle Pro</div>
                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                  Conception et réalisation d'une plateforme de commerce en ligne sur-mesure intégrant la commande directe par WhatsApp, la gestion de catalogue et un éditeur visuel complet en temps réel.
                </p>
              </div>

              <div className="exp-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>Consultant Solutions Digitales</h3>
                  <span style={{ fontSize: '12px', color: '#a5b4fc', fontWeight: '600' }}>2023 - 2025</span>
                </div>
                <div style={{ fontSize: '13px', color: '#818cf8', fontWeight: '600', marginBottom: '10px' }}>Indépendant</div>
                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                  Accompagnement de commerçants et PME locales dans la numérisation de leurs activités de vente et la mise en œuvre de canaux de vente digitaux performants.
                </p>
              </div>
            </div>

            {/* Réalisations */}
            <div>
              <div className="section-title">
                <ExternalLink size={16} /> Projets Majeurs
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#fff', fontWeight: '700' }}>Plateforme VesTyle</h4>
                <p style={{ fontSize: '13.5px', color: '#94a3b8', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                  Générateur intelligent de boutiques en ligne intégrant des architectures multi-thèmes et des mécanismes de commande instantanée.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a href="https://wa.me/237674151728" target="_blank" rel="noreferrer" className="contact-btn">
                    <Send size={14} /> WhatsApp
                  </a>
                  <a href="mailto:zokofabiol@gmail.com" className="contact-btn" style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', boxShadow: 'none' }}>
                    Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
