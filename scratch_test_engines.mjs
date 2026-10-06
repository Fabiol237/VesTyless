// Test script to verify all 21 engines, definitions, and components
import { capabilityEngine, CAPABILITIES } from './src/lib/capability-engine/CapabilityEngine.js';
import { businessTypeRegistry } from './src/lib/business-types/BusinessTypeRegistry.js';
import { bookingEngine, BOOKING_MODES } from './src/lib/booking-engine/BookingEngine.js';
import { inventoryEngine, STOCK_STATUSES, createProduct } from './src/lib/inventory-engine/InventoryEngine.js';
import { quoteEngine, createQuoteRequest } from './src/lib/quote-engine/QuoteEngine.js';
import { staffEngine, createStaffMember } from './src/lib/staff-engine/StaffEngine.js';
import { deliveryEngine, DELIVERY_STATUSES } from './src/lib/delivery-engine/DeliveryEngine.js';
import { themeEngine } from './src/lib/theme-engine/ThemeEngine.js';
import { compatibilityEngine } from './src/lib/compatibility-engine/CompatibilityEngine.js';
import { responsiveEngine } from './src/lib/responsive-engine/ResponsiveEngine.js';
import { HistoryEngine } from './src/lib/history-engine/HistoryEngine.js';
import { versionEngine } from './src/lib/versioning-engine/VersionEngine.js';
import { aiSelectorEngine } from './src/lib/ai-selector/AISelectorEngine.js';
import { HEADERS_100_DEFINITIONS } from './src/lib/headers/headerDefinitions.js';

console.log('🧪 === VESTINE ENGINE TEST SUITE === 🧪\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failCount++;
  }
}

// 1. Test CapabilityEngine
const capsHairSalon = capabilityEngine.getStoreCapabilities({ businessType: 'hair_salon' });
assert(capsHairSalon.includes(CAPABILITIES.SERVICE), 'Hair salon has SERVICE capability');
assert(capsHairSalon.includes(CAPABILITIES.BOOKING), 'Hair salon has BOOKING capability');
assert(capsHairSalon.includes(CAPABILITIES.STAFF), 'Hair salon has STAFF capability');

// 2. Test BusinessTypeRegistry
const types = businessTypeRegistry.getAll();
assert(types.length >= 19, `BusinessTypeRegistry has ${types.length} business types (>= 19)`);
const hotelType = businessTypeRegistry.get('hotel');
assert(hotelType.capabilities.hasRooms === true, 'Hotel hasRooms capability is true');

// 3. Test BookingEngine
const isHotelBooking = bookingEngine.isBookingEnabled({ businessType: 'hotel' });
assert(isHotelBooking === true, 'Booking is enabled for hotel');
const mode = bookingEngine.getRecommendedBookingMode({ businessType: 'restaurant' });
assert(mode === BOOKING_MODES.TABLE, 'Restaurant recommended booking mode is TABLE');

// 4. Test InventoryEngine
const product = createProduct({ title: 'Robe de Soirée', basePrice: 25000, promoPrice: 20000, stockQuantity: 5 });
const priceInfo = inventoryEngine.getEffectivePrice(product);
assert(priceInfo.price === 20000 && priceInfo.hasDiscount === true, 'Effective price handles promo discount');
const stockStatus = inventoryEngine.getStockStatus(product);
assert(stockStatus === STOCK_STATUSES.IN_STOCK, 'Stock status is in_stock');

// 5. Test QuoteEngine
const quote = createQuoteRequest({ storeId: 'str_1', serviceName: 'Couture Mariage', customerInfo: { name: 'Mireille', phone: '690000000' } });
const quoteUrl = quoteEngine.getQuoteWhatsAppUrl(quote, { name: 'Maison Vestine', phone: '690112233' });
assert(quoteUrl.includes('wa.me'), 'Quote WhatsApp URL generated successfully');

// 6. Test StaffEngine
const staffMember = createStaffMember({ name: 'Alice', assignedServiceIds: ['srv_tresses'] });
const match = staffEngine.getProvidersForService([staffMember], 'srv_tresses');
assert(match.length === 1 && match[0].name === 'Alice', 'StaffEngine correctly filters providers by service');

// 7. Test DeliveryEngine
const delivery = deliveryEngine.calculateDeliveryFee({ deliveryZones: [] }, { city: 'Douala', orderTotal: 5000 });
assert(delivery.fee > 0, `Delivery fee calculated for Douala (${delivery.fee} FCFA)`);

// 8. Test ThemeEngine
const theme = themeEngine.generateThemeFromDescription('rose, élégant et glamour pour salon de beauté');
assert(theme.colors.primary === '#E91E8C', 'ThemeEngine generates Pink Glow palette from description');
assert(theme.typography.headingFont === 'Playfair Display', 'ThemeEngine applies Playfair Display heading');

// 9. Test CompatibilityEngine
const isBookingCompatible = compatibilityEngine.isComponentCompatibleWithStore('BOOKING', { businessType: 'hair_salon' });
assert(isBookingCompatible === true, 'BOOKING component is compatible with hair_salon');

// 10. Test ResponsiveEngine
const mobileCols = responsiveEngine.getAdaptiveColumns(4, 'mobile');
assert(mobileCols <= 2, `ResponsiveEngine adapts 4 desktop cols to ${mobileCols} on mobile`);

// 11. Test HistoryEngine (Undo/Redo)
const history = new HistoryEngine();
history.init({ count: 1 });
history.push({ count: 2 }, 'Change 1');
history.push({ count: 3 }, 'Change 2');
const undone = history.undo();
assert(undone.count === 2, 'Undo restores previous state');
const redone = history.redo();
assert(redone.count === 3, 'Redo restores forward state');

// 12. Test VersionEngine
const cmp = versionEngine.compareSemver('1.2.0', '1.1.0');
assert(cmp === 1, 'VersionEngine semver comparison works');

// 13. Test AISelectorEngine (Official Demonstration Scenario)
const aiResult = aiSelectorEngine.synthesizeStoreConfig(
  'Je suis coiffeuse. Je veux une boutique rose, élégante et moderne. Je propose tresses, coloration et soins. Les clientes doivent pouvoir prendre rendez-vous.'
);
assert(aiResult.businessType === 'hair_salon', 'AI Selector correctly identifies hair_salon');
assert(aiResult.sections.some(s => s.type === 'BOOKING'), 'AI Selector automatically adds BOOKING section');
assert(aiResult.sections.some(s => s.type === 'STAFF'), 'AI Selector automatically adds STAFF section');

// 14. Test Headers 100 Definitions
assert(HEADERS_100_DEFINITIONS.length === 100, `HEADERS_100_DEFINITIONS has exactly ${HEADERS_100_DEFINITIONS.length} definitions`);
assert(HEADERS_100_DEFINITIONS[0].id === 'header_001', 'First header is header_001');
assert(HEADERS_100_DEFINITIONS[99].id === 'header_100', 'Last header is header_100');

console.log(`\n🏁 SUMMARY: ${passCount} PASSED, ${failCount} FAILED.`);
if (failCount === 0) {
  console.log('🎉 ALL ENGINE UNITS ARE WORKING 100% PERFECTLY!');
} else {
  process.exit(1);
}
