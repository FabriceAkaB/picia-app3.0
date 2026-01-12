# Picia Admin Tool (Step 1)

Système de tri photo sportif - Interface Opérateur (MVP)

## Pré-requis
- Node.js (v18+)

## Installation
1. Aller dans le dossier du projet :
   ```bash
   cd picia-app
   ```
2. Installer les dépendances :
   ```bash
   npm install
   ```

## Lancement
1. Démarrer le serveur de développement :
   ```bash
   npm run dev
   ```
2. Ouvrir le navigateur sur [http://localhost:3000](http://localhost:3000).

## Utilisation (Workflow)
1. **Créer un match** : Entrez un titre (ex: "U15 Match A") et une date, puis cliquez sur "Créer".
2. **Accéder au match** : Cliquez sur la carte du match créé.
3. **Importer des photos** : 
   - Cliquez sur "Importer photos (Zip)".
   - Sélectionnez le fichier `sample-data/sample_photos.zip` (généré automatiquement) ou votre propre zip de photos.
   - Attendez la fin de l'upload.
4. **Générer les clusters** : Cliquez sur le bouton jaune "Lancer génération Clusters (Mock)".
5. **Revue** :
   - Naviguez dans les clusters générés.
   - Utilisez les boutons "Valider", "Exclure", "À revoir" pour chaque cluster.
   - Rafraîchissez la page pour vérifier que vos choix sont sauvegardés.

## Structure du projet
- `app/` : Code source Next.js (Pages & API)
  - `admin/` : Pages de l'interface admin
  - `api/` : Endpoints API (Matches, Upload, Clusters)
- `lib/` : Utilitaires (Connexion DB)
- `data/` : Base de données SQLite (`picia.db`) et stockage fichiers (`matches/{id}/...`)
- `sample-data/` : Contient `sample_photos.zip` pour tester.
