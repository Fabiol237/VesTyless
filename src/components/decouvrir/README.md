# 📖 Documentation de la Page « Découvrir VesTyle »

Cette page d'expérience immersive `/decouvrir` propose un parcours interactif de 8 scènes épinglées à l'écran grâce à GSAP ScrollTrigger et Lenis.

---

## 🎨 Comment Modifier les Textes ou l'Ordre des Scènes

Chaque scène est isolée dans son propre composant au sein du dossier `src/components/decouvrir/` :

1. `Scene1Door.js` : Scène 1 — « Ta boutique, dans ta poche »
2. `Scene2Shelf.js` : Scène 2 — « Entre, regarde »
3. `Scene3VisualSearch.js` : Scène 3 — « Une photo, et tu trouves »
4. `Scene4Negotiation.js` : Scène 4 — « Négocie comme dans une discussion »
5. `Scene5VoiceAI.js` : Scène 5 — « Parle, il comprend »
6. `Scene6GroupBuy.js` : Scène 6 — « Achète à plusieurs, profite des ventes flash »
7. `Scene7MobilePayment.js` : Scène 7 — « Paie avec ton Mobile Money »
8. `Scene8FinalCTA.js` : Scène 8 — Final & Bouton « Crée ta boutique »

---

### 📝 Modifier un texte
Ouvrez le composant de la scène souhaitée (ex: `Scene1Door.js`) et mettez à jour le titre `<h2>` ou le sous-titre `<p>`.

### 🔄 Changer l'ordre des scènes
Dans `src/app/decouvrir/DynamicController.js`, réorganisez simplement le tableau `scenes` :

```js
const scenes = [
  <Scene1Door key="1" ... />,
  <Scene2Shelf key="2" ... />,
  // Modifier l'ordre ici
];
```

---

## ⚖️ Performance & Impact sur le Poids du Bundle

- **Approche** : Importation dynamique côté client (`import('gsap')`, `import('lenis')`).
- **Poids ajouté** : ~35 Ko gzippé (nettement inférieur au plafond strict de 120 Ko gzippé).
- **Accessibilité** : Respect automatique de `prefers-reduced-motion` avec rendu vertical sans animation pour le confort d'accessibilité.
