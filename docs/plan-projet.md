# Plateforme Littéraire IA — Plan de développement (v1, sans intégration IA)

## 1. Stack technique recommandé

| Couche | Choix | Pourquoi |
|---|---|---|
| Frontend | Next.js 14+ (App Router) | Routing par rôle facile, SSR, écosystème riche |
| UI | Tailwind CSS + shadcn/ui | Rapide à assembler avec l'aide de Claude Code |
| Backend / DB | Supabase (Postgres) | Auth intégrée, DB, storage, RLS (permissions) — tout-en-un |
| Auth | Supabase Auth | Email/password prêt à l'emploi, gestion de sessions |
| Hébergement | Vercel (front) + Supabase Cloud | Déploiement gratuit en tier étudiant, simple |
| Stockage fichiers | Supabase Storage | Pour couvertures d'œuvres, PDFs, audio plus tard |

> Alternative si tu préfères tout en JS custom sans Supabase : Next.js + Prisma + PostgreSQL + NextAuth. Plus de contrôle, plus de code à écrire. Pour un PFE, Supabase = gain de temps énorme.

---

## 2. Modèle de données (schéma de base)

```sql
-- Utilisateurs (étendu depuis Supabase auth.users)
profiles
  id (uuid, ref auth.users)
  full_name
  role            -- 'student' | 'teacher' | 'admin'
  created_at

-- Bibliothèque
works                     -- œuvres/ouvrages
  id
  title
  author
  category          -- roman, poésie, théâtre, article, mémoire, thèse...
  description
  cover_url
  created_by (teacher/admin)
  created_at

chapters
  id
  work_id (fk -> works)
  title
  order_index
  content_text      -- texte du chapitre (ou content_url si fichier séparé)

-- Lecture / progression
reading_progress
  id
  student_id (fk -> profiles)
  work_id
  chapter_id
  last_position     -- ex: % ou offset dans le texte
  updated_at

annotations
  id
  student_id
  chapter_id
  type              -- 'highlight' | 'note' | 'bookmark'
  text_selection    -- texte surligné / position (start_offset, end_offset)
  note_content      -- si type = note
  created_at

-- Activités pédagogiques
activities
  id
  teacher_id
  work_id
  chapter_id
  title
  type              -- 'mcq' | 'true_false' | 'open'
  published (bool)
  created_at

questions
  id
  activity_id (fk -> activities)
  question_text
  options (jsonb)   -- pour mcq: ["a", "b", "c", "d"]
  correct_answer
  points

submissions
  id
  student_id
  activity_id
  answers (jsonb)
  score
  submitted_at
  graded (bool)     -- pour les questions ouvertes à corriger manuellement
```

**Notes clés :**
- `role` sur `profiles` pilote tout le routage et les permissions (RLS Supabase).
- Les tables sont volontairement simples — on ajoutera `ai_interactions` plus tard, quand l'API sera branchée (juste besoin de `id, student_id, chapter_id, type, prompt, response, created_at`).

---

## 3. Placeholder Assistant IA (sans API pour l'instant)

Pour que l'UI soit prête mais sans coût API :

- Un bouton flottant ou une barre latérale "Assistant IA" visible dans le lecteur.
- Au clic → ouvre un panneau avec les options (Expliquer, Résumer, Vocabulaire, Traduire).
- La réponse peut être **mockée** pour l'instant :
  ```js
  // Placeholder — à remplacer par l'appel API réel plus tard
  const mockAIResponse = async (passage, type) => {
    await new Promise(r => setTimeout(r, 800)); // simulate loading
    return `[Réponse simulée pour "${type}"] Ceci sera remplacé par la vraie réponse de l'IA.`;
  };
  ```
- Ça te permet de finaliser toute l'UX (design du panneau, historique des questions, loading state) sans dépenser un centime, et le jour où l'API est prête, tu remplaces juste `mockAIResponse` par le vrai `fetch`.

---

## 4. Ordre de développement recommandé (par sprints)

### Sprint 1 — Fondations
- Setup Next.js + Supabase + Tailwind/shadcn
- Table `profiles` + Auth (inscription/connexion)
- Routing par rôle (student/teacher/admin) + protection des routes
- Layout de base pour chaque dashboard (vide pour l'instant)

### Sprint 2 — Bibliothèque
- CRUD `works` + `chapters` (côté teacher/admin)
- Page catalogue côté étudiant (liste, recherche, filtres par catégorie)
- Page détail d'une œuvre

### Sprint 3 — Lecteur interactif
- Affichage du texte par chapitre, navigation entre chapitres
- Surlignage de texte (sélection → sauvegarde dans `annotations`)
- Notes personnelles + signets
- Barre de progression de lecture (`reading_progress`)

### Sprint 4 — Assistant IA (placeholder)
- Panneau latéral / popup avec les boutons fonctionnels (Expliquer, Résumer, etc.)
- Réponses mockées + UI de chargement/historique
- Structure prête pour brancher l'API plus tard

### Sprint 5 — Activités pédagogiques
- Interface teacher : créer/éditer un quiz (MCQ, vrai/faux, questions ouvertes)
- Publication d'une activité liée à un chapitre
- Interface student : répondre à un quiz, soumission, correction auto (MCQ/VF)

### Sprint 6 — Tableaux de bord
- Dashboard étudiant : progression, résultats, historique
- Dashboard enseignant : liste des étudiants, statistiques par activité, taux de réussite

### Sprint 7 — Administration
- Gestion des utilisateurs (créer teacher/admin, désactiver comptes)
- Gestion des catégories/contenus

### Sprint 8 — Finitions
- Responsive, gestion des erreurs, tests de bout en bout
- Déploiement (Vercel + Supabase)
- Préparation démo / soutenance

---

## 5. Ce que Claude Code peut faire quasi seul vs ce qui demande ton attention

**Quasi automatisable (donne juste le schéma + la feature demandée) :**
- CRUD complet (works, chapters, activities, questions)
- Formulaires + validation
- Dashboards avec stats simples
- Auth + routing par rôle

**Demande tes décisions produit avant de coder :**
- UX exacte du surlignage (comment on stocke/restaure une sélection de texte fiable)
- Ce qui différencie "note" et "annotation" dans ton UI
- Le format exact d'une question ouverte (correction manuelle vs auto)
- Le design du panneau Assistant IA (position, comportement au scroll, historique ou pas)

---

## 6. Prochaine étape suggérée

Commencer par le Sprint 1 : je peux te donner un prompt structuré à donner à Claude Code pour initialiser le projet (structure de dossiers, schéma Supabase, pages d'auth) si tu veux démarrer tout de suite.
