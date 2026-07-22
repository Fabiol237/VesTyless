'use client';
import { useState, useCallback } from 'react';
import { useBuilder, MODULE_DEFINITIONS, BUSINESS_TYPES, SECTOR_CATEGORIES } from '@/context/BuilderContext';
import MistralBuilderChat from '@/components/MistralBuilderChat';
import StoreAdvisorPanel from '@/components/StoreAdvisorPanel';
import StoreVersionHistory from '@/components/StoreVersionHistory';
import StoreTemplatesPanel from '@/components/StoreTemplatesPanel';
import PortfolioManager from './PortfolioManager';
import CatalogueManager from './CatalogueManager';
import RestaurantManager from './RestaurantManager';
import ServicesManager from './ServicesManager';

// ─── Icons SVG inline ─────────────────────────────────────────────────────
const I = {
  Plus:    ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  Trash:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Eye:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff:  ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>,
  Chevron: ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
  Back:    ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  Store:   ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M2 7h20"/></svg>,
  Sparkle: ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
  Grip:    ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>,
  Check:   ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Settings:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
};

// ─── Thèmes visuels (même que paramètres boutique) ──────────────────────
import { THEMES as VISUAL_THEMES } from '@/app/boutique/[slug]/themes';

// ─── Styles utilitaires ───────────────────────────────────────────────────
const s = {
  label:  { color:'#54656f', fontSize:'10px', fontWeight:'700', letterSpacing:'0.07em', textTransform:'uppercase', display:'block', marginBottom:'5px' },
  input:  { width:'100%', padding:'9px 11px', borderRadius:'8px', border:'1.5px solid #d1d7db', background:'#fff', color:'#111b21', fontSize:'12px', outline:'none', fontFamily:'inherit', boxSizing:'border-box' },
  wrap:   { display:'flex', flexDirection:'column', gap:'12px' },
  iconBtn:{ width:'26px', height:'26px', borderRadius:'6px', border:'1px solid #d1d7db', background:'transparent', color:'#54656f', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0 },
  sep:    { borderTop:'1px solid #e9edef', paddingTop:'16px', marginTop:'4px' },
  section:{ marginBottom:'6px' },
  sLabel: { color:'#8696a0', fontSize:'9px', fontWeight:'800', letterSpacing:'0.1em', textTransform:'uppercase', display:'block', marginBottom:'8px' },
};

// ─── Composants de champs réutilisables ───────────────────────────────────
function Field({ label, value, onChange, type='text', placeholder='', hint='' }) {
  return (
    <div>
      <label style={s.label}>{label}</label>
      <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={s.input} />
      {hint && <p style={{ margin:'3px 0 0', fontSize:'10px', color:'#8696a0' }}>{hint}</p>}
    </div>
  );
}

function Textarea({ label, value, onChange, rows=3, hint='' }) {
  return (
    <div>
      <label style={s.label}>{label}</label>
      <textarea value={value||''} onChange={e=>onChange(e.target.value)} rows={rows}
        style={{ ...s.input, resize:'vertical', lineHeight:1.5 }} />
      {hint && <p style={{ margin:'3px 0 0', fontSize:'10px', color:'#8696a0' }}>{hint}</p>}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label style={s.label}>{label}</label>
      <select value={value||''} onChange={e=>onChange(e.target.value)} style={{ ...s.input, cursor:'pointer' }}>
        {options.map(o => (
          <option key={typeof o==='object'?o.value:o} value={typeof o==='object'?o.value:o}>
            {typeof o==='object'?o.label:o}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label, value, onChange, hint='' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'5px 0' }}>
      <div>
        <span style={{ fontSize:'12px', color:'#111b21', fontWeight:'600' }}>{label}</span>
        {hint && <p style={{ margin:'2px 0 0', fontSize:'10px', color:'#8696a0' }}>{hint}</p>}
      </div>
      <button onClick={()=>onChange(!value)} style={{
        width:'40px', height:'22px', borderRadius:'11px', border:'none', cursor:'pointer', flexShrink:0,
        background: value ? '#00a884' : '#d1d7db', transition:'background 0.2s', position:'relative',
      }}>
        <div style={{ width:'16px', height:'16px', borderRadius:'50%', background:'#fff', position:'absolute', top:'3px', left: value?'21px':'3px', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.3)' }} />
      </button>
    </div>
  );
}

function NumberField({ label, value, onChange, min=0, max=9999, unit='' }) {
  return (
    <div>
      <label style={s.label}>{label}</label>
      <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
        <input type="number" value={value||0} min={min} max={max} onChange={e=>onChange(Number(e.target.value))}
          style={{ ...s.input, flex:1 }} />
        {unit && <span style={{ fontSize:'11px', color:'#8696a0', flexShrink:0 }}>{unit}</span>}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <p style={{ color:'#54656f', fontSize:'10px', fontWeight:'800', letterSpacing:'0.08em', textTransform:'uppercase', margin:'18px 0 10px', paddingTop:'14px', borderTop:'1px solid #e9edef' }}>{children}</p>;
}

function AIButton({ onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading}
      style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'10px', color:'#008069', background:'#dcf8c6', border:'1px solid #25d366', borderRadius:'6px', padding:'3px 8px', cursor:'pointer', fontFamily:'inherit', marginTop:'4px', opacity: loading?0.6:1 }}>
      <I.Sparkle /> {loading ? 'Amélioration...' : 'Améliorer avec IA'}
    </button>
  );
}

// ─── CONFIGS PAR MODULE ───────────────────────────────────────────────────

// ── VITRINE ──────────────────────────────────────────────────────────────
function ConfigVitrine({ cfg, update, businessType, onAI, aiLoading }) {
  const isHotel = businessType==='hotel';
  const isFashion = businessType==='fashion';
  const isRestaurant = ['restaurant','cafe'].includes(businessType);

  return (
    <div style={s.wrap}>
      <Field label="Titre principal" value={cfg.headline} onChange={v=>update('headline',v)} placeholder="Bienvenue dans notre boutique" />
      <AIButton onClick={()=>onAI('headline',cfg.headline)} loading={aiLoading} />
      <Field label="Sous-titre" value={cfg.subheadline} onChange={v=>update('subheadline',v)} placeholder="Découvrez ce que nous proposons" />
      <AIButton onClick={()=>onAI('subheadline',cfg.subheadline)} loading={aiLoading} />

      <SectionTitle>⚡ Réglages rapides</SectionTitle>
      <Toggle label="Afficher la section de confiance" value={cfg.showBadges !== false} onChange={v=>update('showBadges',v)} />
      <Toggle label="Afficher les réseaux sociaux" value={cfg.showSocials !== false} onChange={v=>update('showSocials',v)} />
      <Toggle label="Afficher la note / avis" value={cfg.showRating !== false} onChange={v=>update('showRating',v)} />
      <Field label="Texte du bouton" value={cfg.ctaText} onChange={v=>update('ctaText',v)} placeholder="Découvrir" />
      <Select label="Destination du bouton" value={cfg.ctaLink} onChange={v=>update('ctaLink',v)}
        options={[
          {value:'catalogue',label:'Aller au catalogue'},
          {value:'reservation',label:'Réserver'},
          {value:'restaurant',label:'Voir le menu'},
          {value:'services',label:'Nos services'},
          {value:'contact',label:'Nous contacter'},
        ]} />

      <SectionTitle>Badges de confiance</SectionTitle>
      <Toggle label="Afficher les badges" value={cfg.showBadges} onChange={v=>update('showBadges',v)} />
      {cfg.showBadges && <>
        <Field label="Badge 1" value={cfg.badge1} onChange={v=>update('badge1',v)} />
        <Field label="Badge 2" value={cfg.badge2} onChange={v=>update('badge2',v)} />
        <Field label="Badge 3" value={cfg.badge3} onChange={v=>update('badge3',v)} />
      </>}

      <SectionTitle>Note & avis</SectionTitle>
      <Toggle label="Afficher la note" value={cfg.showRating} onChange={v=>update('showRating',v)} />
      {cfg.showRating && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
          <Field label="Note (ex: 4.9)" value={cfg.ratingValue} onChange={v=>update('ratingValue',v)} />
          <Field label="Nombre d'avis" value={cfg.ratingCount} onChange={v=>update('ratingCount',v)} />
        </div>
      )}

      <SectionTitle>Réseaux sociaux</SectionTitle>
      <Toggle label="Afficher les réseaux" value={cfg.showSocials} onChange={v=>update('showSocials',v)} />
      {cfg.showSocials && <>
        <Field label="WhatsApp (numéro)" value={cfg.whatsapp} onChange={v=>update('whatsapp',v)} placeholder="+221 77 000 00 00" />
        <Field label="Instagram (lien)" value={cfg.instagram} onChange={v=>update('instagram',v)} placeholder="https://instagram.com/..." />
        <Field label="Facebook (lien)" value={cfg.facebook} onChange={v=>update('facebook',v)} placeholder="https://facebook.com/..." />
        <Field label="TikTok (lien)" value={cfg.tiktok} onChange={v=>update('tiktok',v)} placeholder="https://tiktok.com/..." />
      </>}

      {isHotel && <>
        <SectionTitle>Spécifique Hôtel</SectionTitle>
        <Field label="Slogan hôtelier" value={cfg.hotelTagline} onChange={v=>update('hotelTagline',v)} placeholder="Votre home away from home" />
      </>}
      {isFashion && <>
        <SectionTitle>Spécifique Mode</SectionTitle>
        <Field label="Saison actuelle" value={cfg.season} onChange={v=>update('season',v)} placeholder="Collection Été 2025" />
      </>}
      {isRestaurant && <>
        <SectionTitle>Spécifique Restaurant</SectionTitle>
        <Field label="Spécialité / Cuisine" value={cfg.cuisine} onChange={v=>update('cuisine',v)} placeholder="Cuisine africaine & internationale" />
      </>}
    </div>
  );
}

// ── CATALOGUE ────────────────────────────────────────────────────────────
function ConfigCatalogue({ cfg, update, businessType, storeId }) {
  const isFashion = businessType==='fashion';
  const isGrocery = businessType==='grocery';

  return (
    <div style={s.wrap}>
      <SectionTitle>⚡ Réglages rapides</SectionTitle>
      <Select label="Disposition" value={String(cfg.gridCols||3)} onChange={v=>update('gridCols',Number(v))}
        options={[{value:'2',label:'2 colonnes'},{value:'3',label:'3 colonnes'},{value:'4',label:'4 colonnes'}]} />
      <Toggle label="Afficher les filtres" value={cfg.showFilters !== false} onChange={v=>update('showFilters',v)} />
      <Toggle label="Afficher le stock" value={cfg.showStock !== false} onChange={v=>update('showStock',v)} />
      <Toggle label="Activer le panier" value={cfg.allowCart !== false} onChange={v=>update('allowCart',v)} />
      <Toggle label="Liste de souhaits" value={cfg.allowWishlist !== false} onChange={v=>update('allowWishlist',v)} />
      <Field label="Devise" value={cfg.currency} onChange={v=>update('currency',v)} placeholder="XOF" />

      {isFashion && <>
        <SectionTitle>Mode & Vêtements</SectionTitle>
        <Toggle label="Afficher les tailles" value={cfg.showSizes} onChange={v=>update('showSizes',v)} />
        <Toggle label="Afficher les couleurs" value={cfg.showColors} onChange={v=>update('showColors',v)} />
        <Toggle label="Afficher la marque" value={cfg.showBrand} onChange={v=>update('showBrand',v)} />
      </>}

      {isGrocery && <>
        <SectionTitle>Épicerie</SectionTitle>
        <Toggle label="Afficher le poids/quantité" value={cfg.showWeight} onChange={v=>update('showWeight',v)} />
        <Toggle label="Livraison disponible" value={cfg.showDeliveryBadge} onChange={v=>update('showDeliveryBadge',v)} />
        <Field label="Texte livraison" value={cfg.deliveryText} onChange={v=>update('deliveryText',v)} />
      </>}

      <SectionTitle>États & Messages comportementaux</SectionTitle>
      <Select label="Comportement rupture de stock" value={cfg.outOfStockBehavior||'show_badge'} onChange={v=>update('outOfStockBehavior',v)}
        options={[
          {value:'show_badge',label:'Afficher un badge "Rupture"'},
          {value:'show_notify',label:'Afficher "Notifiez-moi"'},
          {value:'hide',label:'Masquer le produit'},
        ]} />
      <Field label="Message rupture de stock" value={cfg.outOfStockMessage} onChange={v=>update('outOfStockMessage',v)} placeholder="Rupture de stock" />
      {cfg.outOfStockBehavior==='show_notify' && <>
        <Toggle label="Activer notification" value={cfg.notifyMeEnabled} onChange={v=>update('notifyMeEnabled',v)} />
        <Field label="Texte bouton notification" value={cfg.notifyMeText} onChange={v=>update('notifyMeText',v)} />
      </>}
      <Field label="Badge réservé" value={cfg.reservedBadgeText} onChange={v=>update('reservedBadgeText',v)} placeholder="Réservé" />
      <Field label="Message catalogue vide" value={cfg.emptyMessage} onChange={v=>update('emptyMessage',v)} />

      <SectionTitle>Gestion des produits</SectionTitle>
      <CatalogueManager storeId={storeId} />
    </div>
  );
}

// ── RÉSERVATION ──────────────────────────────────────────────────────────
function ConfigReservation({ cfg, update, businessType }) {
  const days = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  const wh = cfg.workingHours || {};

  const updateDay = (day, field, val) => {
    update('workingHours', { ...wh, [day]: { ...wh[day], [field]: val } });
  };

  return (
    <div style={s.wrap}>
      <SectionTitle>⏰ Horaires d'ouverture par jour</SectionTitle>
      {days.map(day => {
        const dayConfig = wh[day] || { open: false, start:'09:00', end:'18:00' };
        return (
          <div key={day} style={{ background: dayConfig.open?'#f0fdf4':'#f8f9fa', borderRadius:'10px', padding:'10px 12px', border:`1px solid ${dayConfig.open?'#86efac':'#e9edef'}` }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: dayConfig.open?'10px':0 }}>
              <span style={{ fontSize:'12px', fontWeight:'700', color:'#111b21' }}>{day}</span>
              <Toggle label={dayConfig.open?'Ouvert':'Fermé'} value={dayConfig.open} onChange={v=>updateDay(day,'open',v)} />
            </div>
            {dayConfig.open && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                <div>
                  <label style={s.label}>Ouverture</label>
                  <input type="time" value={dayConfig.start} onChange={e=>updateDay(day,'start',e.target.value)} style={s.input} />
                </div>
                <div>
                  <label style={s.label}>Fermeture</label>
                  <input type="time" value={dayConfig.end} onChange={e=>updateDay(day,'end',e.target.value)} style={s.input} />
                </div>
              </div>
            )}
          </div>
        );
      })}

      <SectionTitle>📐 Créneaux & Capacité</SectionTitle>
      <Select label="Durée d'un créneau" value={String(cfg.slotDuration||60)} onChange={v=>update('slotDuration',Number(v))}
        options={[{value:'15',label:'15 min'},{value:'30',label:'30 min'},{value:'45',label:'45 min'},{value:'60',label:'1 heure'},{value:'90',label:'1h30'},{value:'120',label:'2 heures'},{value:'180',label:'3 heures'},{value:'240',label:'4 heures'}]} />
      <NumberField label="Temps tampon entre créneaux" value={cfg.bufferTime} onChange={v=>update('bufferTime',v)} unit="min" />
      <NumberField label="Personnes max par créneau" value={cfg.maxPerSlot} onChange={v=>update('maxPerSlot',v)} min={1} />
      <NumberField label="Réservable jusqu'à X jours à l'avance" value={cfg.maxDaysAhead} onChange={v=>update('maxDaysAhead',v)} unit="jours" />

      <SectionTitle>💳 Paiement</SectionTitle>
      <Toggle label="Paiement à la réservation" value={cfg.requirePayment} onChange={v=>update('requirePayment',v)} />
      {cfg.requirePayment && <>
        <NumberField label="Montant de l'acompte" value={cfg.depositAmount} onChange={v=>update('depositAmount',v)} />
        <Field label="Devise" value={cfg.currency} onChange={v=>update('currency',v)} />
      </>}

      <SectionTitle>📝 Informations client requises</SectionTitle>
      <Toggle label="Téléphone obligatoire" value={cfg.requirePhone} onChange={v=>update('requirePhone',v)} />
      <Toggle label="Email obligatoire" value={cfg.requireEmail} onChange={v=>update('requireEmail',v)} />
      <Toggle label="Note / Demande spéciale" value={cfg.requireNote} onChange={v=>update('requireNote',v)} />
      {cfg.requireNote && <Field label="Label du champ note" value={cfg.noteLabel} onChange={v=>update('noteLabel',v)} />}

      <SectionTitle>📲 Notifications</SectionTitle>
      <Toggle label="Notification WhatsApp" value={cfg.whatsappNotif} onChange={v=>update('whatsappNotif',v)} hint="Vous recevez un message WhatsApp à chaque réservation" />
      {cfg.whatsappNotif && <Field label="Votre numéro WhatsApp" value={cfg.whatsappNumber} onChange={v=>update('whatsappNumber',v)} placeholder="+221 77 000 00 00" />}

      <SectionTitle>💬 Messages configurables</SectionTitle>
      <Textarea label="✅ Message de confirmation" value={cfg.confirmationMessage} onChange={v=>update('confirmationMessage',v)} hint="Affiché après une réservation réussie" />
      <Textarea label="⚠️ Client déjà réservé" value={cfg.alreadyBookedMessage} onChange={v=>update('alreadyBookedMessage',v)} hint="Affiché si ce client a déjà une réservation active" />
      <Textarea label="❌ Créneau complet" value={cfg.fullSlotMessage} onChange={v=>update('fullSlotMessage',v)} hint="Affiché quand tous les créneaux sont pris" />
      <Textarea label="↩️ Message d'annulation" value={cfg.cancelMessage} onChange={v=>update('cancelMessage',v)} hint="Affiché après annulation par le client" />

      <SectionTitle>📋 Liste d'attente</SectionTitle>
      <Toggle label="Activer la liste d'attente" value={cfg.waitlistEnabled} onChange={v=>update('waitlistEnabled',v)} hint="Quand un créneau est complet, le client peut s'inscrire" />
      {cfg.waitlistEnabled && <Textarea label="Message liste d'attente" value={cfg.waitlistMessage} onChange={v=>update('waitlistMessage',v)} />}

      <SectionTitle>📜 Politique d'annulation</SectionTitle>
      <NumberField label="Délai d'annulation (heures)" value={cfg.cancelDeadlineHours} onChange={v=>update('cancelDeadlineHours',v)} unit="h avant" />
      <Textarea label="Texte de la politique" value={cfg.cancellationPolicy} onChange={v=>update('cancellationPolicy',v)} rows={4} />
    </div>
  );
}

// ── RESTAURANT / MENU ────────────────────────────────────────────────────
function ConfigRestaurant({ cfg, update, storeId }) {
  return (
    <div style={s.wrap}>
      <SectionTitle>🍽️ Affichage du menu</SectionTitle>
      <Toggle label="Afficher les catégories" value={cfg.showCategories} onChange={v=>update('showCategories',v)} />
      <Toggle label="Photos des plats" value={cfg.showImages} onChange={v=>update('showImages',v)} />
      <Toggle label="Allergènes" value={cfg.showAllergens} onChange={v=>update('showAllergens',v)} />
      <Toggle label="Calories" value={cfg.showCalories} onChange={v=>update('showCalories',v)} />
      <Field label="Devise" value={cfg.currency} onChange={v=>update('currency',v)} />

      <SectionTitle>🛵 Commandes & Livraison</SectionTitle>
      <Toggle label="Click & Collect (à emporter)" value={cfg.allowClickCollect} onChange={v=>update('allowClickCollect',v)} />
      {cfg.allowClickCollect && <Field label="Texte bouton emporter" value={cfg.clickCollectText} onChange={v=>update('clickCollectText',v)} />}
      <Toggle label="Livraison à domicile" value={cfg.deliveryEnabled} onChange={v=>update('deliveryEnabled',v)} />
      {cfg.deliveryEnabled && <>
        <NumberField label="Frais de livraison" value={cfg.deliveryFee} onChange={v=>update('deliveryFee',v)} />
        <Field label="Texte livraison" value={cfg.deliveryText} onChange={v=>update('deliveryText',v)} />
      </>}
      <Toggle label="Réservation de table" value={cfg.allowTableBooking} onChange={v=>update('allowTableBooking',v)} />
      {cfg.allowTableBooking && <Field label="Texte bouton réservation" value={cfg.tableBookingText} onChange={v=>update('tableBookingText',v)} />}
      <NumberField label="Commande minimum" value={cfg.minOrderAmount} onChange={v=>update('minOrderAmount',v)} unit={cfg.currency||'XOF'} />

      <SectionTitle>🏷️ Badges & Filtres</SectionTitle>
      <Toggle label="Filtre végétarien" value={cfg.showVegFilter} onChange={v=>update('showVegFilter',v)} />
      <Toggle label="Filtre épicé" value={cfg.showSpicyFilter} onChange={v=>update('showSpicyFilter',v)} />
      <Toggle label="Badge Populaire" value={cfg.showPopularBadge} onChange={v=>update('showPopularBadge',v)} />
      {cfg.showPopularBadge && <Field label="Texte badge populaire" value={cfg.popularBadgeText} onChange={v=>update('popularBadgeText',v)} />}

      <SectionTitle>💬 Messages</SectionTitle>
      <Textarea label="Confirmation commande" value={cfg.orderConfirmMessage} onChange={v=>update('orderConfirmMessage',v)} hint="Affiché après une commande réussie" />
      <Textarea label="Restaurant fermé" value={cfg.closedMessage} onChange={v=>update('closedMessage',v)} hint="Affiché quand vous êtes fermé" />
      <Field label="Horaires spéciaux (texte libre)" value={cfg.specialHours} onChange={v=>update('specialHours',v)} placeholder="Ouvert les jours fériés de 11h à 22h" />

      <SectionTitle>🗂️ Gestion du menu</SectionTitle>
      <RestaurantManager storeId={storeId} />
    </div>
  );
}

// ── SERVICES / CHAMBRES ──────────────────────────────────────────────────
function ConfigServices({ cfg, update, businessType, storeId }) {
  const isHotel = businessType==='hotel';
  const isBeauty = businessType==='beauty';

  return (
    <div style={s.wrap}>
      <SectionTitle>⚡ Réglages rapides</SectionTitle>
      <Select label="Disposition" value={cfg.layout||'cards'} onChange={v=>update('layout',v)}
        options={[{value:'cards',label:'Cartes'},{value:'list',label:'Liste'},{value:'grid',label:'Grille'}]} />
      <Toggle label="Afficher les tarifs" value={cfg.showPricing !== false} onChange={v=>update('showPricing',v)} />
      {cfg.showPricing && <Field label="Devise" value={cfg.currency} onChange={v=>update('currency',v)} />}
      <Toggle label="Afficher la durée" value={cfg.showDuration} onChange={v=>update('showDuration',v)} />
      <Toggle label="Afficher les images" value={cfg.showImages} onChange={v=>update('showImages',v)} />
      <Toggle label="Bouton de réservation" value={cfg.showBookingButton} onChange={v=>update('showBookingButton',v)} />
      {cfg.showBookingButton && <Field label="Texte bouton" value={cfg.bookingButtonText} onChange={v=>update('bookingButtonText',v)} />}

      {isHotel && <>
        <SectionTitle>🏨 Options Chambre/Hébergement</SectionTitle>
        <Toggle label="Capacité de la chambre" value={cfg.showRoomCapacity} onChange={v=>update('showRoomCapacity',v)} />
        <Toggle label="Équipements inclus" value={cfg.showAmenities} onChange={v=>update('showAmenities',v)} />
      </>}
      {isBeauty && <>
        <SectionTitle>💅 Options Salon</SectionTitle>
        <Toggle label="Spécialiste assigné" value={cfg.showSpecialist} onChange={v=>update('showSpecialist',v)} />
      </>}

      <SectionTitle>📲 Contact direct</SectionTitle>
      <Toggle label="Bouton WhatsApp" value={cfg.showWhatsappButton} onChange={v=>update('showWhatsappButton',v)} />
      {cfg.showWhatsappButton && <>
        <Field label="Texte bouton WhatsApp" value={cfg.whatsappText} onChange={v=>update('whatsappText',v)} />
        <Field label="Numéro WhatsApp" value={cfg.whatsappNumber} onChange={v=>update('whatsappNumber',v)} placeholder="+221 77 000 00 00" />
      </>}

      <SectionTitle>🏷️ Disponibilité</SectionTitle>
      <Toggle label="Badge disponibilité" value={cfg.showAvailabilityBadge} onChange={v=>update('showAvailabilityBadge',v)} />
      <Field label="Texte complet/indisponible" value={cfg.soldOutText} onChange={v=>update('soldOutText',v)} placeholder="Complet" />
      <Field label="Texte disponible" value={cfg.availableText} onChange={v=>update('availableText',v)} placeholder="Disponible" />

      <SectionTitle>🗂️ Gestion des services</SectionTitle>
      <ServicesManager storeId={storeId} />
    </div>
  );
}

// ── AVIS CLIENTS ─────────────────────────────────────────────────────────
function ConfigTestimonials({ cfg, update }) {
  return (
    <div style={s.wrap}>
      <Select label="Disposition" value={cfg.layout||'carousel'} onChange={v=>update('layout',v)}
        options={[{value:'carousel',label:'Carrousel'},{value:'grid',label:'Grille'},{value:'list',label:'Liste'}]} />
      <Toggle label="Afficher les étoiles" value={cfg.showStars} onChange={v=>update('showStars',v)} />
      <Toggle label="Badge avis vérifié" value={cfg.showVerifiedBadge} onChange={v=>update('showVerifiedBadge',v)} />
      {cfg.showVerifiedBadge && <Field label="Texte badge vérifié" value={cfg.verifiedText} onChange={v=>update('verifiedText',v)} />}
      <Toggle label="Permettre la soumission d'avis" value={cfg.allowSubmit} onChange={v=>update('allowSubmit',v)} />
      {cfg.allowSubmit && <>
        <Field label="Texte bouton" value={cfg.submitText} onChange={v=>update('submitText',v)} />
        <Toggle label="Modération avant publication" value={cfg.moderationEnabled} onChange={v=>update('moderationEnabled',v)} hint="Les avis sont validés avant d'être visibles" />
        {cfg.moderationEnabled && <Field label="Message modération" value={cfg.moderationMessage} onChange={v=>update('moderationMessage',v)} />}
      </>}
      <Field label="Message aucun avis" value={cfg.emptyMessage} onChange={v=>update('emptyMessage',v)} />
    </div>
  );
}

// ── CONTACT ──────────────────────────────────────────────────────────────
function ConfigContact({ cfg, update }) {
  return (
    <div style={s.wrap}>
      <SectionTitle>📍 Informations</SectionTitle>
      <Toggle label="Téléphone" value={cfg.showPhone} onChange={v=>update('showPhone',v)} />
      {cfg.showPhone && <Field label="Label téléphone" value={cfg.phoneLabel} onChange={v=>update('phoneLabel',v)} />}
      <Toggle label="Email" value={cfg.showEmail} onChange={v=>update('showEmail',v)} />
      {cfg.showEmail && <Field label="Label email" value={cfg.emailLabel} onChange={v=>update('emailLabel',v)} />}
      <Toggle label="Adresse" value={cfg.showAddress} onChange={v=>update('showAddress',v)} />
      {cfg.showAddress && <Field label="Label adresse" value={cfg.addressLabel} onChange={v=>update('addressLabel',v)} />}

      <SectionTitle>⏰ Horaires</SectionTitle>
      <Toggle label="Afficher les horaires" value={cfg.showHours} onChange={v=>update('showHours',v)} />
      {cfg.showHours && <Textarea label="Horaires (texte libre)" value={cfg.hours} onChange={v=>update('hours',v)} rows={4} placeholder="Lun–Ven : 9h–18h" />}

      <SectionTitle>📲 WhatsApp</SectionTitle>
      <Toggle label="Bouton WhatsApp" value={cfg.showWhatsapp} onChange={v=>update('showWhatsapp',v)} />
      {cfg.showWhatsapp && <>
        <Field label="Numéro WhatsApp" value={cfg.whatsappNumber} onChange={v=>update('whatsappNumber',v)} placeholder="+221 77 000 00 00" />
        <Field label="Texte bouton" value={cfg.whatsappText} onChange={v=>update('whatsappText',v)} />
      </>}

      <SectionTitle>📝 Formulaire de contact</SectionTitle>
      <Toggle label="Afficher le formulaire" value={cfg.showForm} onChange={v=>update('showForm',v)} />
      {cfg.showForm && <>
        <Field label="Titre du formulaire" value={cfg.formTitle} onChange={v=>update('formTitle',v)} />
        <Textarea label="Message de confirmation" value={cfg.confirmMessage} onChange={v=>update('confirmMessage',v)} hint="Affiché après l'envoi du message" />
      </>}

      <SectionTitle>🗺️ Carte</SectionTitle>
      <Toggle label="Afficher la carte" value={cfg.showMap} onChange={v=>update('showMap',v)} />
      {cfg.showMap && <Textarea label="URL intégration Google Maps (iframe src)" value={cfg.mapEmbedUrl} onChange={v=>update('mapEmbedUrl',v)} rows={2} />}
    </div>
  );
}

// ── NEWSLETTER ────────────────────────────────────────────────────────────
function ConfigNewsletter({ cfg, update }) {
  return (
    <div style={s.wrap}>
      <Field label="Titre" value={cfg.headline} onChange={v=>update('headline',v)} />
      <Field label="Sous-texte" value={cfg.subtext} onChange={v=>update('subtext',v)} />
      <Field label="Texte du bouton" value={cfg.buttonText} onChange={v=>update('buttonText',v)} />
      <Field label="Placeholder email" value={cfg.placeholder} onChange={v=>update('placeholder',v)} />
      <Toggle label="Afficher une offre incitative" value={cfg.showIncentive} onChange={v=>update('showIncentive',v)} />
      {cfg.showIncentive && <Field label="Texte de l'offre" value={cfg.incentive} onChange={v=>update('incentive',v)} placeholder="-10% sur votre prochaine commande" />}
      <SectionTitle>💬 Messages</SectionTitle>
      <Textarea label="Confirmation inscription" value={cfg.confirmMessage} onChange={v=>update('confirmMessage',v)} />
      <Textarea label="Déjà inscrit" value={cfg.alreadySubscribedMessage} onChange={v=>update('alreadySubscribedMessage',v)} />
    </div>
  );
}

// ── DEVIS ────────────────────────────────────────────────────────────────
function ConfigDevis({ cfg, update }) {
  return (
    <div style={s.wrap}>
      <Toggle label="Assistance IA" value={cfg.aiAssisted} onChange={v=>update('aiAssisted',v)} hint="L'IA aide à qualifier et structurer les demandes" />
      <Toggle label="Champ budget" value={cfg.showBudget} onChange={v=>update('showBudget',v)} />
      {cfg.showBudget && <Field label="Label budget" value={cfg.budgetLabel} onChange={v=>update('budgetLabel',v)} />}
      <Toggle label="Champ délai" value={cfg.showDeadline} onChange={v=>update('showDeadline',v)} />
      {cfg.showDeadline && <Field label="Label délai" value={cfg.deadlineLabel} onChange={v=>update('deadlineLabel',v)} />}
      <Toggle label="Description du projet" value={cfg.showProject} onChange={v=>update('showProject',v)} />
      {cfg.showProject && <Field label="Label description" value={cfg.projectLabel} onChange={v=>update('projectLabel',v)} />}
      <Toggle label="Téléphone obligatoire" value={cfg.requirePhone} onChange={v=>update('requirePhone',v)} />
      <Toggle label="Email obligatoire" value={cfg.requireEmail} onChange={v=>update('requireEmail',v)} />
      <SectionTitle>💬 Messages</SectionTitle>
      <Textarea label="Confirmation" value={cfg.confirmMessage} onChange={v=>update('confirmMessage',v)} />
      <Toggle label="Réponse automatique" value={cfg.autoReplyEnabled} onChange={v=>update('autoReplyEnabled',v)} />
      {cfg.autoReplyEnabled && <Textarea label="Texte réponse auto" value={cfg.autoReplyText} onChange={v=>update('autoReplyText',v)} />}
    </div>
  );
}

// ── BILLETTERIE ──────────────────────────────────────────────────────────
function ConfigBilletterie({ cfg, update }) {
  return (
    <div style={s.wrap}>
      <Toggle label="Compte à rebours" value={cfg.showCountdown} onChange={v=>update('showCountdown',v)} />
      <Toggle label="QR Code sur les billets" value={cfg.enableQR} onChange={v=>update('enableQR',v)} />
      <Toggle label="Billets restants" value={cfg.showRemainingTickets} onChange={v=>update('showRemainingTickets',v)} />
      <NumberField label="Max billets par commande" value={cfg.maxPerOrder} onChange={v=>update('maxPerOrder',v)} />
      <Field label="Devise" value={cfg.currency} onChange={v=>update('currency',v)} />
      <SectionTitle>📍 Infos événement</SectionTitle>
      <Toggle label="Détails de l'événement" value={cfg.showEventDetails} onChange={v=>update('showEventDetails',v)} />
      <Toggle label="Lieu / Venue" value={cfg.showVenue} onChange={v=>update('showVenue',v)} />
      <Toggle label="Code vestimentaire" value={cfg.showDressCode} onChange={v=>update('showDressCode',v)} />
      {cfg.showDressCode && <Field label="Code vestimentaire" value={cfg.dressCode} onChange={v=>update('dressCode',v)} placeholder="Tenue de soirée obligatoire" />}
      <SectionTitle>💬 Messages</SectionTitle>
      <Textarea label="Confirmation billet" value={cfg.confirmMessage} onChange={v=>update('confirmMessage',v)} />
      <Textarea label="Événement complet" value={cfg.soldOutMessage} onChange={v=>update('soldOutMessage',v)} />
      <Toggle label="Liste d'attente" value={cfg.waitlistEnabled} onChange={v=>update('waitlistEnabled',v)} />
      {cfg.waitlistEnabled && <Field label="Texte liste d'attente" value={cfg.waitlistText} onChange={v=>update('waitlistText',v)} />}
    </div>
  );
}

// ── PORTFOLIO ────────────────────────────────────────────────────────────
function ConfigPortfolio({ cfg, update, storeId }) {
  return (
    <div style={s.wrap}>
      <Select label="Disposition" value={cfg.layout||'masonry'} onChange={v=>update('layout',v)}
        options={[{value:'masonry',label:'Masonry (cascade)'},{value:'grid',label:'Grille uniforme'},{value:'carousel',label:'Carrousel'}]} />
      <Toggle label="Afficher les tags" value={cfg.showTags} onChange={v=>update('showTags',v)} />
      <Toggle label="Lightbox au clic" value={cfg.enableLightbox} onChange={v=>update('enableLightbox',v)} />
      <Toggle label="Mettre en avant un projet" value={cfg.showFeatured} onChange={v=>update('showFeatured',v)} />
      <Toggle label="Nom du client" value={cfg.showClientName} onChange={v=>update('showClientName',v)} />
      <Toggle label="Date de réalisation" value={cfg.showDate} onChange={v=>update('showDate',v)} />
      <Field label="Texte du bouton CTA" value={cfg.ctaText} onChange={v=>update('ctaText',v)} placeholder="Travailler avec nous" />
      <SectionTitle>🗂️ Gestion du portfolio</SectionTitle>
      <PortfolioManager storeId={storeId} />
    </div>
  );
}

// ── LIENS ────────────────────────────────────────────────────────────────
function ConfigLinks({ cfg, update }) {
  return (
    <div style={s.wrap}>
      <Select label="Style des boutons" value={cfg.buttonStyle||'pill'} onChange={v=>update('buttonStyle',v)}
        options={[{value:'pill',label:'Pilule (arrondi)'},{value:'rounded',label:'Carré arrondi'},{value:'square',label:'Carré'}]} />
      <Toggle label="Afficher les icônes" value={cfg.showIcons} onChange={v=>update('showIcons',v)} />
      <Toggle label="Animations" value={cfg.animated} onChange={v=>update('animated',v)} />
      <Toggle label="Afficher la bio" value={cfg.showBio} onChange={v=>update('showBio',v)} />
      {cfg.showBio && <Textarea label="Bio / Description courte" value={cfg.bio} onChange={v=>update('bio',v)} rows={3} />}
      <Toggle label="Avatar" value={cfg.showAvatar} onChange={v=>update('showAvatar',v)} />
    </div>
  );
}

// ─── Dispatcher de configuration par type de module ───────────────────────
function ModuleConfigFields({ module, onUpdate, onAI, aiLoading, storeId, businessType }) {
  const update = (key, val) => onUpdate(module.id, { [key]: val });
  const cfg = module.config || {};

  const props = { cfg, update, storeId, businessType, onAI, aiLoading };

  if (module.type === 'vitrine')     return <ConfigVitrine {...props} />;
  if (module.type === 'catalogue')   return <ConfigCatalogue {...props} />;
  if (module.type === 'lookbook')    return <ConfigCatalogue {...props} />;
  if (module.type === 'reservation') return <ConfigReservation {...props} />;
  if (module.type === 'restaurant')  return <ConfigRestaurant {...props} />;
  if (module.type === 'services')    return <ConfigServices {...props} />;
  if (module.type === 'testimonials')return <ConfigTestimonials {...props} />;
  if (module.type === 'contact')     return <ConfigContact {...props} />;
  if (module.type === 'newsletter')  return <ConfigNewsletter {...props} />;
  if (module.type === 'devis')       return <ConfigDevis {...props} />;
  if (module.type === 'billetterie') return <ConfigBilletterie {...props} />;
  if (module.type === 'portfolio')   return <ConfigPortfolio {...props} />;
  if (module.type === 'links')       return <ConfigLinks {...props} />;
  if (module.type === 'properties')  return <ConfigServices {...props} />;

  return (
    <div style={{ textAlign:'center', padding:'24px', color:'#54656f', fontSize:'12px' }}>
      <div style={{ fontSize:'28px', marginBottom:'8px' }}>{MODULE_DEFINITIONS[module.type]?.emoji}</div>
      Ce module se configure dans l'aperçu.
    </div>
  );
}

// ─── BuilderEditor principal ──────────────────────────────────────────────
export default function BuilderEditor({ storeId, onModulesUpdate, onThemeUpdate }) {
  const { state, addModule, removeModule, toggleModule, setActiveModule, setTheme, updateModuleConfig, updateModuleLabel, setBusinessType } = useBuilder();
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('design'); // 'design'|'ai'|'advisor'|'versions'|'templates'

  const activeModule = state.modules.find(m => m.id === editingModuleId);
  const currentBT = BUSINESS_TYPES[state.businessType];
  const p = '#7c3aed'; // Couleur de marque fixe pour l'interface de l'éditeur
  const activeVisualThemeId = state.themeConfig?._themeId || 'theme_00';

  const applyVisualTheme = async (vt) => {
    const newTheme = {
      ...state.themeConfig,
      primaryColor:   vt.primaryColor,
      accentColor:    vt.accentColor,
      secondaryColor: vt.bgColor,
      fontFamily:     vt.fontFamily,
      mode:           vt.mode,
      _themeId:       vt.id,
    };
    // 1. Mettre à jour le contexte local (affichage éditeur)
    setTheme(newTheme);
    // 2. Propager au preview en temps réel
    if (onThemeUpdate) onThemeUpdate(newTheme);
    // 3. Sauvegarder immédiatement en base
    if (storeId) {
      try {
        await fetch('/api/store/save-theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeId,
            theme_color:     vt.primaryColor,
            accent_color:    vt.accentColor,
            secondary_color: vt.bgColor,
            font_family:     vt.fontFamily,
            theme_mode:      vt.mode,
            shop_theme:      vt.id,
          }),
        });
      } catch (e) { console.error('[Theme save error]', e); }
    }
  };

  const improveWithAI = async (field, currentText) => {
    if (!currentText) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/improve-text', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentText, field, context: state.store?.description }),
      });
      const { improved } = await res.json();
      if (improved && activeModule) updateModuleConfig(activeModule.id, { [field]: improved });
    } catch (e) { console.error(e); }
    setAiLoading(false);
  };

  // ─── Modules disponibles selon secteur ───────────────────────────────
  const availableModules = state.businessType
    ? Object.values(MODULE_DEFINITIONS).filter(d => d.availableIn.includes(state.businessType))
    : Object.values(MODULE_DEFINITIONS);

  // ─── Vue de configuration d'un module ────────────────────────────────
  if (editingModuleId && activeModule) {
    const def = MODULE_DEFINITIONS[activeModule.type];
    return (
      <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#fff', overflow:'hidden' }}>
        {/* Header */}
        {currentBT && <div style={{ padding:'8px 16px', background:currentBT.gradient, display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
          <span style={{ fontSize:'16px' }}>{currentBT.emoji}</span>
          <span style={{ fontSize:'11px', fontWeight:'700', color:'#fff', letterSpacing:'0.05em' }}>{currentBT.label.toUpperCase()}</span>
        </div>}

        <div style={{ padding:'12px 14px', borderBottom:'1px solid #e9edef', flexShrink:0 }}>
          <button onClick={() => setEditingModuleId(null)}
            style={{ display:'flex', alignItems:'center', gap:'5px', color:'#54656f', background:'none', border:'none', cursor:'pointer', fontSize:'12px', fontFamily:'inherit', padding:'4px 0', marginBottom:'10px' }}>
            <I.Back /> Retour
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px', background:`${p}10`, borderRadius:'10px', border:`1px solid ${p}25` }}>
            <div style={{ fontSize:'22px' }}>{def?.emoji}</div>
            <div>
              <div style={{ color:'#111b21', fontWeight:'800', fontSize:'13px' }}>{activeModule.label}</div>
              <div style={{ color:'#54656f', fontSize:'10px' }}>{def?.description}</div>
            </div>
          </div>
          <div style={{ marginTop:'10px' }}>
            <label style={s.label}>Nom dans la navigation</label>
            <input value={activeModule.label} onChange={e=>updateModuleLabel(activeModule.id,e.target.value)} style={s.input} />
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'14px' }}>
          <ModuleConfigFields
            module={activeModule}
            onUpdate={updateModuleConfig}
            onAI={improveWithAI}
            aiLoading={aiLoading}
            storeId={storeId}
            businessType={state.businessType}
          />
        </div>
      </div>
    );
  }

  // ─── Vue principale : Secteur + Design + Modules ──────────────────────
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#fff', overflow:'hidden' }}>

      {/* Badge secteur actif */}
      {currentBT && (
        <div style={{ padding:'8px 16px', background:currentBT.gradient, display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
          <span style={{ fontSize:'16px' }}>{currentBT.emoji}</span>
          <span style={{ fontSize:'11px', fontWeight:'700', color:'#fff', letterSpacing:'0.05em' }}>{currentBT.label.toUpperCase()}</span>
        </div>
      )}

      {/* Onglets : Design | IA */}
      <div style={{ display:'flex', borderBottom:'1px solid #d1d7db', background:'#f0f2f5', padding:'0 8px', flexShrink:0, gap:'2px' }}>
        <button
          onClick={() => setActiveTab('design')}
          style={{
            display:'flex', alignItems:'center', gap:'5px', padding:'10px 11px',
            borderWidth:'0px', borderStyle:'none', borderColor:'transparent', background:'transparent', cursor:'pointer',
            fontFamily:'inherit', fontSize:'11px', fontWeight:'700',
            color: activeTab === 'design' ? p : '#8696a0',
            borderBottom: activeTab === 'design' ? `2px solid ${p}` : '2px solid transparent',
            marginBottom:'-1px', transition:'color 0.15s',
          }}>
          <I.Store /> Secteur & Design
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          style={{
            display:'flex', alignItems:'center', gap:'5px', padding:'10px 11px',
            borderWidth:'0px', borderStyle:'none', borderColor:'transparent', background:'transparent', cursor:'pointer',
            fontFamily:'inherit', fontSize:'11px', fontWeight:'700',
            color: activeTab === 'ai' ? '#7c3aed' : '#8696a0',
            borderBottom: activeTab === 'ai' ? '2px solid #7c3aed' : '2px solid transparent',
            marginBottom:'-1px', transition:'color 0.15s',
          }}>
          <I.Sparkle /> ✨ Mistral IA
        </button>
        <button
          onClick={() => setActiveTab('advisor')}
          style={{
            display:'flex', alignItems:'center', gap:'5px', padding:'10px 11px',
            borderWidth:'0px', borderStyle:'none', borderColor:'transparent', background:'transparent', cursor:'pointer',
            fontFamily:'inherit', fontSize:'11px', fontWeight:'700',
            color: activeTab === 'advisor' ? '#059669' : '#8696a0',
            borderBottom: activeTab === 'advisor' ? '2px solid #059669' : '2px solid transparent',
            marginBottom:'-1px', transition:'color 0.15s', whiteSpace:'nowrap',
          }}>
          🔍 Conseiller
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          style={{
            display:'flex', alignItems:'center', gap:'5px', padding:'10px 11px',
            borderWidth:'0px', borderStyle:'none', borderColor:'transparent', background:'transparent', cursor:'pointer',
            fontFamily:'inherit', fontSize:'11px', fontWeight:'700',
            color: activeTab === 'templates' ? '#7c3aed' : '#8696a0',
            borderBottom: activeTab === 'templates' ? '2px solid #7c3aed' : '2px solid transparent',
            marginBottom:'-1px', transition:'color 0.15s', whiteSpace:'nowrap',
          }}>
          🎨 Templates
        </button>
        <button
          onClick={() => setActiveTab('versions')}
          style={{
            display:'flex', alignItems:'center', gap:'5px', padding:'10px 11px',
            borderWidth:'0px', borderStyle:'none', borderColor:'transparent', background:'transparent', cursor:'pointer',
            fontFamily:'inherit', fontSize:'11px', fontWeight:'700',
            color: activeTab === 'versions' ? '#1e293b' : '#8696a0',
            borderBottom: activeTab === 'versions' ? '2px solid #1e293b' : '2px solid transparent',
            marginBottom:'-1px', transition:'color 0.15s', whiteSpace:'nowrap',
          }}>
          🕒 Versions
        </button>
      </div>

      {/* Panneau IA Mistral */}
      {activeTab === 'ai' && (
        <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <MistralBuilderChat
            storeId={storeId}
            onModulesUpdate={onModulesUpdate}
            onThemeUpdate={onThemeUpdate}
          />
        </div>
      )}

      {/* Panneau Conseiller IA */}
      {activeTab === 'advisor' && (
        <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <StoreAdvisorPanel
            storeId={storeId}
            onModulesUpdate={onModulesUpdate}
          />
        </div>
      )}

      {/* Panneau Templates */}
      {activeTab === 'templates' && (
        <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <StoreTemplatesPanel
            storeId={storeId}
            onModulesUpdate={onModulesUpdate}
            onThemeUpdate={onThemeUpdate}
          />
        </div>
      )}

      {/* Panneau Versions */}
      {activeTab === 'versions' && (
        <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <StoreVersionHistory
            storeId={storeId}
            onModulesUpdate={onModulesUpdate}
            onThemeUpdate={onThemeUpdate}
          />
        </div>
      )}

      <div style={{ flex:1, overflowY:'auto', padding:'14px', display: activeTab !== 'design' ? 'none' : 'block' }}>

        {/* ══ 1. SECTEUR ══════════════════════════════════════════════════ */}
        <p style={{ color:'#54656f', fontSize:'10px', fontWeight:'700', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'4px' }}>Type de business</p>
        <p style={{ color:'#8696a0', fontSize:'11px', marginBottom:'10px', lineHeight:1.5 }}>Choisissez votre secteur — chacun a ses propres pages et configurations.</p>

        {/* Groupes de secteurs */}
        {Object.entries(SECTOR_CATEGORIES).map(([catId, cat]) => {
          const catTypes = Object.values(BUSINESS_TYPES).filter(bt => bt.category === catId);
          if (catTypes.length === 0) return null;
          return (
            <div key={catId} style={{ marginBottom:'14px' }}>
              <p style={{ ...s.sLabel, color: cat.color }}>{cat.label}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                {catTypes.map(bt => {
                  const isActive = state.businessType === bt.id;
                  return (
                    <button key={bt.id}
                      onClick={() => {
                        if (!isActive && (state.modules.length === 0 || confirm(`Passer en mode "${bt.label}" ? Les modules seront remplacés.`))) {
                          setBusinessType(bt.id);
                        }
                      }}
                      style={{
                        display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px',
                        borderRadius:'10px', border:`2px solid ${isActive?'transparent':'#e9edef'}`,
                        background: isActive ? bt.gradient : '#f8f9fa',
                        cursor:'pointer', textAlign:'left', fontFamily:'inherit',
                        transition:'all 0.2s',
                      }}>
                      <div style={{ fontSize:'20px', flexShrink:0 }}>{bt.emoji}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:'800', fontSize:'12px', color: isActive?'#fff':'#111b21' }}>{bt.label}</div>
                        <div style={{ fontSize:'10px', color: isActive?'rgba(255,255,255,0.75)':'#8696a0', marginTop:'1px' }}>{bt.description}</div>
                      </div>
                      {isActive && <div style={{ width:'18px', height:'18px', borderRadius:'50%', background:'rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#fff' }}><I.Check /></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* ══ 2. DESIGN ═══════════════════════════════════════════════════ */}
        <div style={{ borderTop:'1px solid #e9edef', paddingTop:'18px', marginTop:'8px', marginBottom:'22px' }}>
          <p style={{ color:'#54656f', fontSize:'10px', fontWeight:'700', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'4px' }}>Design visuel</p>
          <p style={{ color:'#8696a0', fontSize:'11px', marginBottom:'12px', lineHeight:1.5 }}>6 designs disponibles pour tous les secteurs — mêmes que dans vos paramètres.</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            {VISUAL_THEMES.map(vt => {
              const isActive = activeVisualThemeId === vt.id;
              return (
                <button key={vt.id} onClick={() => applyVisualTheme(vt)}
                  style={{
                    border:`2px solid ${isActive?vt.primaryColor:'#e9edef'}`,
                    borderRadius:'12px', padding:0, cursor:'pointer', background:'#fff',
                    overflow:'hidden', transition:'all 0.2s', textAlign:'left', position:'relative',
                    boxShadow: isActive?`0 4px 16px ${vt.primaryColor}33`:'0 1px 4px rgba(0,0,0,0.04)',
                    transform: isActive?'scale(1.02)':'scale(1)',
                  }}>
                  {isActive && <div style={{ position:'absolute', top:6, right:6, zIndex:10, width:18, height:18, background:vt.primaryColor, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}><I.Check /></div>}
                  <div style={{ height:'48px', background:vt.previewGradient, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>{vt.emoji}</div>
                  <div style={{ padding:'8px 10px 10px' }}>
                    <div style={{ fontWeight:'800', fontSize:'10px', color:'#111b21', marginBottom:'2px' }}>{vt.name}</div>
                    <div style={{ fontSize:'9px', color:'#8696a0', lineHeight:1.4 }}>{vt.description}</div>
                  </div>
                  {isActive && <div style={{ height:'3px', background:vt.primaryColor }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ══ 3. MODULES ══════════════════════════════════════════════════ */}
        <div style={{ borderTop:'1px solid #e9edef', paddingTop:'18px' }}>
          <p style={{ color:'#54656f', fontSize:'10px', fontWeight:'700', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'10px' }}>
            Pages actives ({state.modules.length})
          </p>
          {state.modules.length === 0 && (
            <div style={{ textAlign:'center', padding:'24px', color:'#8696a0', fontSize:'12px', background:'#f8f9fa', borderRadius:'10px' }}>
              <div style={{ fontSize:'28px', marginBottom:'8px' }}>📭</div>
              Choisissez un secteur pour charger les pages adaptées.
            </div>
          )}
          <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
            {state.modules.map((mod) => {
              const def = MODULE_DEFINITIONS[mod.type];
              return (
                <div key={mod.id}
                  onClick={() => { setActiveModule(mod.id); setEditingModuleId(mod.id); }}
                  style={{
                    display:'flex', alignItems:'center', gap:'8px', padding:'10px 12px',
                    borderRadius:'10px', background: mod.is_active?'#fff':'#f8f9fa',
                    border:`1px solid ${mod.is_active?'#e9edef':'#d1d7db'}`,
                    cursor:'pointer', transition:'all 0.15s',
                    opacity: mod.is_active?1:0.5,
                  }}>
                  <div style={{ color:'#8696a0', flexShrink:0 }}><I.Grip /></div>
                  <div style={{ width:'28px', height:'28px', borderRadius:'8px', background:`${def?.color||'#6366f1'}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', flexShrink:0 }}>{def?.emoji||'📄'}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:'700', fontSize:'12px', color:'#111b21', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{mod.label}</div>
                    <div style={{ fontSize:'10px', color:'#8696a0' }}>{def?.description?.substring(0,40)}</div>
                  </div>
                  <div style={{ display:'flex', gap:'3px', flexShrink:0 }}>
                    <button onClick={e=>{e.stopPropagation();toggleModule(mod.id);}} style={s.iconBtn}>
                      {mod.is_active?<I.Eye/>:<I.EyeOff/>}
                    </button>
                    <button onClick={e=>{e.stopPropagation();removeModule(mod.id);}} style={{ ...s.iconBtn, color:'#ef4444', borderColor:'rgba(239,68,68,0.2)', background:'rgba(239,68,68,0.07)' }}>
                      <I.Trash/>
                    </button>
                    <div style={{ color:'#8696a0', display:'flex', alignItems:'center' }}><I.Chevron/></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ajouter des modules supplémentaires */}
          {state.businessType && availableModules.filter(d => !state.modules.some(m=>m.type===d.type)).length > 0 && (
            <div style={{ marginTop:'12px' }}>
              <p style={{ ...s.sLabel, marginBottom:'8px' }}>+ Ajouter des pages</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                {availableModules.filter(d => !state.modules.some(m=>m.type===d.type)).map(def => (
                  <button key={def.type} onClick={()=>addModule(def.type)}
                    style={{ display:'flex', alignItems:'center', gap:'5px', padding:'5px 10px', borderRadius:'999px', border:`1.5px solid ${def.color}40`, background:`${def.color}08`, color:def.color, cursor:'pointer', fontFamily:'inherit', fontSize:'11px', fontWeight:'700', transition:'all 0.15s' }}>
                    {def.emoji} {def.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
