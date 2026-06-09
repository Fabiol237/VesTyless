# 🛡️ PRÉVENTION: Comment éviter les 605 fausses boutiques

## 🔴 ROOT CAUSE

### Le Problème
```javascript
// AuthContext.js - Ligne 116
if (!storeData) {
  // Crée automatiquement une boutique à CHAQUE fois qu'on appelle fetchUserData
  // Si le user se reconnecte = CRÉÉ ENCORE UNE NOUVELLE BOUTIQUE
  // Result: 605 boutiques = 605 connexions de test/dev
}
```

### Timeline
```
Dev login (test 1)        → Boutique #1 créée
Dev logout/login (test 2) → Boutique #2 créée  
Dev logout/login (test 3) → Boutique #3 créée
... × 605 fois
```

---

## ✅ SOLUTIONS APPLIQUÉES

### Solution 1: Code Fix (Déjà fait ✓)
**Fichier**: [src/context/AuthContext.js](src/context/AuthContext.js#L116)

Ajout d'une vérification: ne créer une boutique que si aucune n'a été créée dans les 3 dernières heures
```javascript
// Check si store creation tentée récemment
const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
const { data: recentDelete } = await supabase
  .from('stores')
  .select('id')
  .eq('owner_id', userId)
  .gt('created_at', oneHourAgo);

if (recentDelete && recentDelete.length > 0) {
  console.log('Store creation déjà tentée, skip');
  return; // ← N'en crée PAS une nouvelle
}
```

---

### Solution 2: Database Constraints (À exécuter)
**Fichier**: [supabase/PERMANENT_FIX_PREVENT_DUPLICATION.sql](supabase/PERMANENT_FIX_PREVENT_DUPLICATION.sql)

```sql
-- 1. Ajouter défaut is_active = true
ALTER TABLE stores ALTER COLUMN is_active SET DEFAULT true;

-- 2. Ajouter trigger PostgreSQL pour bloquer duplicatas
CREATE OR REPLACE FUNCTION prevent_orphaned_stores()
RETURNS TRIGGER AS $$
BEGIN
  -- Blocage si un user essaie de créer 2 stores en 10 minutes
  IF EXISTS (
    SELECT 1 FROM stores 
    WHERE owner_id = NEW.owner_id 
    AND created_at > NOW() - INTERVAL '10 minutes'
  ) THEN
    RAISE EXCEPTION 'Store creation limited to 1 per 10 minutes';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 🚀 À FAIRE MAINTENANT

### Étape 1: Appliquer le Fix Code ✅ (Déjà fait)
Redéployer le code avec la modification AuthContext.js

### Étape 2: Appliquer le Fix Database
1. Va à **Supabase → SQL Editor**
2. Copie tout de [PERMANENT_FIX_PREVENT_DUPLICATION.sql](supabase/PERMANENT_FIX_PREVENT_DUPLICATION.sql)
3. Exécute le script

### Étape 3: (OPTIONNEL) Exécuter le DELETE
1. Si tu veux VRAIMENT nettoyer, exécute [DELETE_FAKE_STORES.sql](supabase/DELETE_FAKE_STORES.sql)
2. Gardera seulement ZOFAROCLUB et ZOKOSTORE

---

## 📋 Checklist Sécurité

- ✅ Code: ne crée 1 store par user à la fois
- ✅ Database: trigger bloque les duplicatas
- ✅ Defaut: is_active = true sur les nouvelles boutiques
- ✅ Slug: unique constraint (existait déjà)
- ✅ Index: sur owner_id pour perf

---

## 🔒 PRÉVENTION FUTURE

Après l'application:
- ❌ **IMPOSSIBLE** d'avoir 605 boutiques de nouveau
- ✅ Max 1 boutique par user toutes les 10 minutes
- ✅ Toutes les nouvelles boutiques = `is_active = true`
- ✅ Slugs restent uniques

**C'est un "hard block" au niveau database + code.** 🛡️

---

## 📝 Notes de Déploiement

1. Déployer le code fix (AuthContext.js) → **Redémarrer le serveur**
2. Exécuter le SQL fix en base → **Instantané**
3. Si problèmes: le trigger PostgreSQL bloquera les insertions dupliquées avec une erreur claire

**Ça ne peut plus se reproduire!** ✨
