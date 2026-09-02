# Design Brief — Plateforme Littéraire
## Identité visuelle verrouillée (à partir de l'écran de connexion)

---

## 1. Palette — NE PAS CHANGER

```css
--ink:         #1C2430   /* panneaux sombres, texte principal */
--ink-soft:    #2A3444   /* dégradé secondaire sur fond sombre */
--paper:       #EFE6D3   /* fond général de l'app (clair) */
--paper-card:  #FAF4E6   /* cartes, surfaces élevées */
--garnet:      #8B2E2E   /* accent principal — boutons, liens, focus */
--garnet-dark: #6E2222   /* état hover/actif du garnet */
--brass:       #B8935A   /* accent secondaire — labels, détails, métadonnées */
--ink-text:    #2E2A24   /* texte de contenu sur fond clair */
--paper-faint: #DED2B8   /* bordures, séparateurs, champs inactifs */
```

**Règle simple :** ink/paper = structure, garnet = action, brass = détail/métadonnée. Ne jamais introduire une 4e couleur d'accent.

---

## 2. Typographie — NE PAS CHANGER

| Rôle | Police | Usage |
|---|---|---|
| Titres, citations, moments "littéraires" | **Newsreader** (serif, italique disponible) | Titres de section, noms d'œuvres, citations |
| Interface, corps de texte, formulaires | **IBM Plex Sans** | Boutons, labels visibles, paragraphes |
| Métadonnées, étiquettes, code/mono | **IBM Plex Mono** | Numéros, dates, tags, timestamps, petites majuscules |

---

## 3. La distinction clé : Connexion = classique, App = moderne

L'écran de connexion est **l'unique endroit** où le motif "fiche/carte de bibliothèque papier" (perforation, ligne pointillée, tampon encré) apparaît dans sa forme la plus littérale. C'est un moment d'accueil, pas le langage permanent de toute l'app.

**Pour tous les autres écrans (dashboards, lecteur, quiz, admin) :**

### À garder de l'identité classique
- La palette exacte (garnet/brass/ink/paper)
- Newsreader pour les titres et le contenu littéraire (noms d'œuvres, citations, extraits)
- IBM Plex Mono pour les métadonnées discrètes (dates, %, chapitre X/Y)
- Un accent brass ponctuel (jamais dominant) pour signaler un détail curatorial

### À moderniser (par rapport à l'écran de connexion)
- **Pas de texture "vieux papier"** (pas de grain, pas de radial-gradient sépia) — fonds plats ou très légers dégradés
- **Pas de tampon, pas de perforation, pas de ligne pointillée** ailleurs — ces éléments sont la signature *unique* du login
- **Coins plus doux** : rayon 8–12px sur les cartes (vs 2–3px très "carte d'archive" du login)
- **Ombres plus contemporaines** : ombres douces et diffuses plutôt que le style "carte posée sur papier"
- **Densité d'information plus élevée** : les dashboards ont besoin de grilles, tableaux, graphiques — structure claire, espacement généreux mais fonctionnel, pas décoratif
- **Composants UI standards modernisés** : boutons avec radius ~8px (pas 2px), inputs avec fond légèrement teinté plutôt que simple soulignement, badges/pills pour les statuts (lu/non lu, publié/brouillon, etc.)

### Le fil conducteur
Pense "maison d'édition contemporaine qui a un beau design system" plutôt que "reconstitution d'une fiche cartonnée." Le login te dit "ceci est une bibliothèque sérieuse" ; le reste de l'app te dit "ceci est un outil que j'utilise tous les jours."

---

## 4. Composants à définir ensuite (dans cet ordre)

1. Dashboard étudiant (progression, œuvres en cours, activités à faire)
2. Lecteur interactif (texte + surlignage + panneau annotations + bouton Assistant IA)
3. Carte "œuvre" pour la bibliothèque (grille/liste)
4. Dashboard enseignant (liste étudiants, stats, création d'activité)
5. Composants de quiz (question MCQ, feedback correct/incorrect)

---

## 5. Note pour Antigravity / l'agent qui code

Quand tu génères une nouvelle interface pour cette plateforme :
- Utilise **uniquement** les couleurs de la section 1 (copie les variables CSS telles quelles)
- Utilise **uniquement** les 3 polices de la section 2
- Applique la section 3 : reste moderne/fonctionnel, garde le login comme seul écran "classique/tactile"
- Si tu dois choisir un radius, une ombre ou un espacement et que ce document ne le précise pas, choisis l'option la plus sobre et fonctionnelle plutôt que décorative
