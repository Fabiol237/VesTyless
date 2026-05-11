const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function simulate() {
  const storeId = '3dbf4d4e-2a2e-4316-996e-7d3780766e06'; // Store ID trouvé
  
  console.log('--- SIMULATION DE NOTIFICATION ---');
  
  const { data, error } = await supabase
    .from('notifications')
    .insert([
      {
        store_id: storeId,
        title: 'Simulation de Vente 🛍️',
        message: `Félicitations ! Vous avez une nouvelle commande simulée de 15 500 F à ${new Date().toLocaleTimeString('fr-FR')}.`,
        type: 'ORDER',
        is_read: false
      }
    ])
    .select();

  if (error) {
    console.error('Erreur lors de l\'insertion:', error);
  } else {
    console.log('Notification insérée avec succès !');
    console.log('ID:', data[0].id);
    console.log('Vérifiez votre dashboard (la pastille rouge du menu notifications).');
  }
}

simulate();
