import { Mistral } from "@mistralai/mistralai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { messages, storeId, tts = false } = await req.json();

    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "MISTRAL_API_KEY manquante dans la configuration." },
        { status: 500 }
      );
    }

    // ── Charger les produits réels depuis Supabase (côté serveur) ──
    let productCatalog = [];
    if (storeId) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const { data: products } = await supabase
          .from("products")
          .select("id, name, description, price, stock_quantity, image_url")
          .eq("store_id", storeId)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(60);

        if (products) productCatalog = products;
      } catch (dbErr) {
        console.warn("[Chat API] Erreur chargement produits BD:", dbErr.message);
      }
    }

    // ── Construire le catalogue structuré pour le prompt ──
    const catalogStr =
      productCatalog.length > 0
        ? productCatalog
            .map(
              (p) =>
                `ID:${p.id} | "${p.name}" | Prix: ${Math.round(p.price).toLocaleString()} FCFA | Stock: ${
                  p.stock_quantity > 0
                    ? `${p.stock_quantity} disponible(s)`
                    : "⚠️ ÉPUISÉ"
                }${p.description ? ` | Desc: ${p.description.slice(0, 100)}` : ""}${
                  p.image_url ? ` | image: ${p.image_url}` : " | image: null"
                }`
            )
            .join("\n")
        : "Aucun produit disponible actuellement.";

    // ── Récupérer le system prompt du client (infos boutique) ──
    const clientSystemMsg = messages.find((m) => m.role === "system");
    const chatMessages = messages.filter((m) => m.role !== "system");

    // ── Construire le system prompt enrichi (serveur) ──
    const systemContent = `${clientSystemMsg?.content || "Tu es un assistant IA de boutique en ligne."}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATALOGUE TEMPS RÉEL — ${productCatalog.length} produit(s) chargé(s) depuis la base de données :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${catalogStr}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TES CAPACITÉS (actions que tu peux effectuer) :
1. Répondre aux questions sur les produits, prix, disponibilité
2. Ajouter des produits au panier du client
3. Calculer le total de plusieurs articles
4. Passer une commande (après avoir collecté le nom + téléphone du client)
5. Rediriger le client vers son panier

━━━ FORMAT DE RÉPONSE OBLIGATOIRE ━━━
Tu DOIS TOUJOURS répondre en JSON valide avec exactement ce format :
{
  "content": "ton message en français à afficher au client",
  "actions": []
}

ACTIONS DISPONIBLES dans le tableau "actions" :

[Ajouter au panier]
{ "type": "add_to_cart", "product": { "id": "PRODUCT_ID_EXACT_DU_CATALOGUE", "name": "nom exact", "price": PRIX_NUMERIQUE, "store_id": "${storeId || ""}", "image_url": "URL_OU_NULL" }, "quantity": QUANTITE_ENTIERE_MIN_1 }

[Passer une commande — SEULEMENT si tu as nom ET téléphone confirmés]
{ "type": "place_order", "customer_name": "prénom nom complet", "customer_phone": "numéro de téléphone" }

[Afficher le panier]
{ "type": "show_cart" }

RÈGLES STRICTES :
- Réponds UNIQUEMENT en JSON valide. Zéro texte avant ou après.
- Utilise les IDs EXACTS du catalogue ci-dessus, jamais inventés.
- Si un produit est "ÉPUISÉ", informe le client et n'ajoute pas au panier.
- Pour place_order : demande d'abord le nom puis le téléphone si tu ne les as pas.
- N'inclus "place_order" que si tu as les DEUX informations dans la conversation.
- QUANTITÉ : Si le client demande "ajoute 7 couteaux", utilise la propriété "quantity": 7 dans l'action add_to_cart. La quantité est TOUJOURS un nombre entier >= 1.
- Tu peux combiner plusieurs actions dans le tableau (ex: add_to_cart avec quantity 5 + show_cart).
- Sois chaleureux, précis et concis en français. Réponses courtes et directes.`;

    // ── Appel Mistral ──
    const client = new Mistral({ apiKey });

    const formattedMessages = [
      { role: "system", content: systemContent },
      ...chatMessages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const response = await client.chat.complete({
      model: "mistral-small-latest",
      messages: formattedMessages,
      maxTokens: 500,
      temperature: 0.3,
      responseFormat: { type: "json_object" },
    });

    const rawContent =
      response.choices[0]?.message?.content ||
      '{"content":"Désolé, je n\'ai pas pu générer une réponse.","actions":[]}';

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      // Si le JSON est invalide, retourner le texte brut sans actions
      parsed = { content: rawContent.replace(/^\{|\}$/g, "").trim(), actions: [] };
    }

    return NextResponse.json({
      content: parsed.content || "Désolé, je n'ai pas pu répondre correctement.",
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      audioBase64: null,
    });
  } catch (error) {
    console.error("[Chat API - Mistral] Erreur:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
