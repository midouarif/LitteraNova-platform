# LittéraNova — Plateforme Littéraire IA

LittéraNova est une plateforme éducative innovante conçue pour réinventer l'enseignement et l'apprentissage de la littérature. Elle intègre un lecteur interactif, un assistant basé sur l'Intelligence Artificielle, et un système d'évaluation complet permettant de lier l'étude des œuvres aux activités pédagogiques.

Ce projet a été développé dans le cadre d'un Projet de Fin d'Études.

---

## 🚀 Technologies

- **Frontend** : Next.js 14+ (App Router), React, Tailwind CSS
- **Backend & Base de données** : Supabase (PostgreSQL), Supabase Auth, Row Level Security (RLS)
- **Stockage** : Supabase Storage (fichiers PDF)
- **UI/UX** : Composants sur-mesure (Glassmorphism, Bento grids), icônes Lucide React

---

## 👥 Rôles et Permissions

La plateforme repose sur un système d'authentification robuste avec **3 rôles distincts**. Chaque utilisateur possède un tableau de bord et des droits d'accès spécifiques protégés par Middleware et RLS.

### 🎓 1. L'Étudiant (`student`)
L'étudiant est l'utilisateur principal de la plateforme. Il y vient pour lire, apprendre et s'évaluer.

**Ce qu'il peut faire :**
- S'inscrire et se connecter librement à la plateforme.
- Consulter le **Catalogue des Œuvres** (Bibliothèque) ajouté par les enseignants.
- **Lecteur Interactif** : 
  - Lire les œuvres (extraction de texte depuis PDF).
  - Surligner des passages importants et ajouter des annotations personnelles.
  - Utiliser l'**Assistant IA** pour expliquer un passage, traduire, ou résumer un extrait directement depuis le lecteur.
- **Activités Pédagogiques** :
  - Participer à des Quiz / QCM liés à des œuvres spécifiques.
  - Soumettre ses réponses et obtenir une correction et une note automatique.
- **Tableau de Bord** : Suivre sa progression de lecture (pourcentage d'avancement) et consulter la moyenne de ses notes (historique des quiz).

### 👨‍🏫 2. L'Enseignant (`teacher`)
L'enseignant est le créateur de contenu. Il alimente la plateforme pour ses étudiants.

**Ce qu'il peut faire :**
- **Gestion de la Bibliothèque** : Ajouter de nouvelles œuvres (upload de PDF, titre, auteur, catégorie).
- **Création d'Activités** : Créer des quiz ou des QCM liés à des chapitres ou des œuvres spécifiques.
- **Gestion des Évaluations** :
  - Définir le barème (points par question) et les bonnes réponses.
  - Publier ou dépublier une activité pour la rendre visible ou invisible aux étudiants.
- **Tableau de Bord** : 
  - Consulter les statistiques globales des étudiants qui interagissent avec ses œuvres.
  - Voir la note moyenne obtenue sur les activités qu'il a créées.

### 🛡️ 3. L'Administrateur (`admin`)
L'administrateur garantit le bon fonctionnement et la sécurité globale de la plateforme.

**Ce qu'il peut faire :**
- **Gestion des Rôles** : Transformer n'importe quel compte Étudiant en compte Enseignant ou Administrateur.
- **Modération des Utilisateurs** : Supprimer définitivement un utilisateur de la base de données.
- **Modération du Contenu** : Visualiser l'intégralité du catalogue d'œuvres et d'activités (peu importe le créateur) et supprimer n'importe quel contenu jugé inapproprié.
- **Statistiques Globales** : Visualiser les compteurs totaux de la plateforme (nombre d'inscrits, d'œuvres, d'activités).

---

## 🗺️ Architecture et Pages (Routing)

L'application utilise l'App Router de Next.js pour une séparation claire des espaces.

### Pages Publiques
- `/` : **Landing Page** (Page d'accueil premium avec présentation des fonctionnalités).
- `/login` : Page de connexion.
- `/signup` : Page d'inscription (crée un profil `student` par défaut).

### Espaces Protégés (Dashboards)

**Espace Étudiant (`/dashboard/student`)**
- `/dashboard/student` : Accueil étudiant (Progression de lecture, Résultats récents).
- `/dashboard/student/library` : Bibliothèque (catalogue complet des œuvres).
- `/dashboard/student/read/[id]` : Lecteur interactif de l'œuvre (avec Surlignage, Notes, et Assistant IA).
- `/dashboard/student/activities` : Liste des quiz disponibles.
- `/dashboard/student/activities/[id]` : Interface de passage d'un quiz.

**Espace Enseignant (`/dashboard/teacher`)**
- `/dashboard/teacher` : Accueil enseignant (Moyenne de classe, statistiques des étudiants actifs).
- `/dashboard/teacher/works` : Liste des œuvres ajoutées par l'enseignant.
- `/dashboard/teacher/works/new` : Formulaire d'ajout d'une nouvelle œuvre (Upload PDF).
- `/dashboard/teacher/activities` : Gestion des quiz (Création, Publication/Dépublication).
- `/dashboard/teacher/activities/new` : Interface de création de quiz (Ajout dynamique de questions, options et points).

**Espace Administrateur (`/dashboard/admin`)**
- `/dashboard/admin` : Panneau de contrôle central.
  - Onglet **Utilisateurs** : Changement des rôles et suppression de comptes.
  - Onglet **Contenus** : Modération et suppression globale des œuvres et activités.

---

## 🛠️ Installation et Déploiement

### Prérequis
- Node.js (v18+)
- Un projet Supabase (URL et clef anonyme)

### Lancement en local
1. Cloner le projet.
2. Installer les dépendances : `npm install`
3. Configurer les variables d'environnement dans un fichier `.env.local` :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clef_anonyme
   GEMINI_API_KEY=votre_clef_api_gemini
   GEMINI_MODEL=gemini-3.6-flash
   ```
4. Démarrer le serveur de développement : `npm run dev`
5. Ouvrir `http://localhost:3000`

### Déploiement
Le projet est configuré pour être déployé nativement sur **Vercel** (`npm run build` validé). Assurez-vous d'ajouter les variables d'environnement Supabase dans les paramètres de votre projet Vercel avant de déployer.
