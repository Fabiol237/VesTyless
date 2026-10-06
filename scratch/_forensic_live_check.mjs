/**
 * Live Registry Verification — FORENSIC READ-ONLY
 * Exécuté depuis le répertoire du projet, ne modifie aucun fichier projet.
 */
import { adaptStoreToBusinessProfile } from './src/lib/business-profile/businessProfileAdapter.js';
import { compositionEngine } from './src/lib/composition-engine/CompositionEngine.js';
import { createIntentDescriptor } from './src/lib/composition-engine/compositionRules.js';
import { ComponentRegistry } from './src/lib/component-registry/ComponentRegistry.js';
import { CAPABILITIES } from './src/lib/capability-engine/CapabilityEngine.js';

function checkSection(s) {
  const def = ComponentRegistry.resolve(s.componentId);
  const resolved = def !== null && typeof def.renderer === 'function';
  const status = resolved ? 'RESOLVED' : 'FAIL';
  const rendererType = def ? typeof def.renderer : 'null';
  console.log(`  ${s.componentId.padEnd(20)} -> ${status} | renderer: ${rendererType}`);
  return resolved;
}

let allPass = true;

// ─────────────────────────────────────────────────────────────────────────
// TARO
// ─────────────────────────────────────────────────────────────────────────
console.log('\n=== TARO LIVE RESOLUTION ===');
const taroStore = {
  id: 'store_taro', name: 'Taro Sauce Jaune', slug: 'taro',
  business_type: 'restaurant', city: 'Yaounde', whatsapp: '237699112233',
  description: 'Taro sauce jaune traditionnel.'
};
const taroProducts = [
  { id: 'p1', name: 'Plat de Taro Royal', price: 4500, is_active: true },
  { id: 'p2', name: 'Portion Peau de Boeuf', price: 1500, is_active: true },
];
const taroProfile = adaptStoreToBusinessProfile(taroStore, taroProducts);
const taroIntent = createIntentDescriptor({ intent: 'SELL_FOOD', businessType: 'restaurant' });
const taroComp = compositionEngine.composeWithIntent(taroProfile, taroIntent);
for (const s of taroComp.sections) {
  if (!checkSection(s)) allPass = false;
}

// ─────────────────────────────────────────────────────────────────────────
// COIFFURE
// ─────────────────────────────────────────────────────────────────────────
console.log('\n=== COIFFURE LIVE RESOLUTION ===');
const hairStore = {
  id: 'store_hair', name: 'Nathalie Coiffure Afro', slug: 'hair',
  business_type: 'service', city: 'Douala', whatsapp: '237677889900',
  services: [
    { id: 's1', title: 'Tresses Knotless', price: 15000, duration: '3h30' },
    { id: 's2', title: 'Pose Locks', price: 20000, duration: '2h' },
  ],
};
const hairProfile = adaptStoreToBusinessProfile(hairStore);
const hairIntent = createIntentDescriptor({ intent: 'SERVICE_PROVIDER', businessType: 'service' });
const hairComp = compositionEngine.composeWithIntent(hairProfile, hairIntent);
for (const s of hairComp.sections) {
  if (!checkSection(s)) allPass = false;
}

// ─────────────────────────────────────────────────────────────────────────
// CHAUSSURES
// ─────────────────────────────────────────────────────────────────────────
console.log('\n=== CHAUSSURES LIVE RESOLUTION ===');
const shoeStore = {
  id: 'store_shoes', name: 'Kicks & Sneakers 237', slug: 'shoes',
  business_type: 'product', city: 'Yaounde', whatsapp: '237655001122',
  categories: ['Baskets', 'Mocassins', 'Sandales'],
};
const shoes = [
  { id: 'sh1', name: 'Sneakers Air Pulse', price: 35000, is_active: true },
  { id: 'sh2', name: 'Mocassins Cuir', price: 45000, is_active: true },
];
const shoeProfile = adaptStoreToBusinessProfile(shoeStore, shoes);
const shoeComp = compositionEngine.compose(shoeProfile, { archetype: 'commerce' });
for (const s of shoeComp.sections) {
  if (!checkSection(s)) allPass = false;
}

console.log('\nLIVE_REGISTRY_RESOLUTION = ' + (allPass ? 'PASS' : 'FAIL'));

// ─────────────────────────────────────────────────────────────────────────
// DATA-FIRST : tout vide
// ─────────────────────────────────────────────────────────────────────────
console.log('\n=== DATA-FIRST EMPTY ===');
const emptyStore = { id: 'store_empty', name: 'Boutique Vide', slug: 'vide', business_type: 'product' };
const emptyProfile = adaptStoreToBusinessProfile(emptyStore);
emptyProfile.identity.phone = '';
emptyProfile.identity.whatsapp = '';
emptyProfile.identity.address = '';
emptyProfile.identity.city = '';
const emptyComp = compositionEngine.compose(emptyProfile, {
  customFamilies: ['HEADER','HERO','PRODUCT','SERVICE','GALLERY','TESTIMONIAL','FAQ','CONTACT','FOOTER'],
  enabledCapabilities: [
    CAPABILITIES.CONTACT, CAPABILITIES.PRODUCT, CAPABILITIES.SERVICE,
    CAPABILITIES.GALLERY, CAPABILITIES.REVIEWS, CAPABILITIES.FAQ
  ],
  filterEmptySections: false,
});

const forbidden = ['Slide 1', 'Produit #1', 'Nouveaute #1', 'Lorem', 'Demo', 'Test Product', 'Sample'];
const jsonStr = JSON.stringify(emptyComp);
let fakefound = false;
for (const f of forbidden) {
  if (jsonStr.includes(f)) {
    console.log('FAKE_FOUND: ' + f);
    fakefound = true;
  }
}
if (!fakefound) console.log('FAKE_DATA_IN_EMPTY_COMPOSITION = NONE');

const contactSec = emptyComp.sections.find(s => s.family === 'CONTACT');
console.log('contact.phone = "' + (contactSec?.config?.phone ?? 'N/A') + '"');
console.log('contact.whatsapp = "' + (contactSec?.config?.whatsapp ?? 'N/A') + '"');
console.log('contact.address = "' + (contactSec?.config?.address ?? 'N/A') + '"');
console.log('contact.showPhone = ' + contactSec?.config?.showPhone);
console.log('contact.showAddress = ' + contactSec?.config?.showAddress);

const productSec = emptyComp.sections.find(s => s.family === 'PRODUCT');
const gallerySec = emptyComp.sections.find(s => s.family === 'GALLERY');
const testimonialSec = emptyComp.sections.find(s => s.family === 'TESTIMONIAL');
const faqSec = emptyComp.sections.find(s => s.family === 'FAQ');

console.log('product.isEmpty = ' + productSec?.isEmpty + ' | state = ' + productSec?.state);
console.log('gallery.isEmpty = ' + gallerySec?.isEmpty + ' | config.images = ' + JSON.stringify(gallerySec?.config?.images));
console.log('testimonial.isEmpty = ' + testimonialSec?.isEmpty);
console.log('faq.isEmpty = ' + faqSec?.isEmpty + ' | config.items = ' + JSON.stringify(faqSec?.config?.items));

// ─────────────────────────────────────────────────────────────────────────
// CATALOGUE
// ─────────────────────────────────────────────────────────────────────────
console.log('\n=== CATALOGUE ===');
const total = ComponentRegistry.count();
console.log('Total registered: ' + total);
const allComps = ComponentRegistry.getAll();
console.log('IDs sorted: ' + allComps.map(c => c.id).sort().join(', '));

// ─────────────────────────────────────────────────────────────────────────
// CAROUSEL_001
// ─────────────────────────────────────────────────────────────────────────
console.log('\n=== CAROUSEL_001 ===');
const carouselDef = ComponentRegistry.resolve('carousel_001');
console.log('registered: ' + (carouselDef !== null));
console.log('type: ' + carouselDef?.type);
console.log('variant: ' + carouselDef?.variant);
const taroFamilies = taroComp.sections.map(s => s.family);
const hairFamilies = hairComp.sections.map(s => s.family);
const shoeFamilies = shoeComp.sections.map(s => s.family);
const carouselActive =
  taroFamilies.includes('CAROUSEL') ||
  hairFamilies.includes('CAROUSEL') ||
  shoeFamilies.includes('CAROUSEL');
console.log('CAROUSEL in TARO/COIFFURE/CHAUSSURES compositions: ' + carouselActive);
console.log('FAKE_DATA_ACTIVE_COMPOSITION = ' + (carouselActive ? 'YES (PROBLEM)' : 'NO'));
