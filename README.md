# Firefox Auto Theme Switcher

Une extension Firefox qui change automatiquement la couleur du thème du navigateur en fonction de l'URL visitée.

## Fonctionnalités

- Changement automatique de la couleur du thème en fonction de l'URL active
- Interface utilisateur simple pour configurer les associations URL/couleurs
- Sauvegarde automatique des préférences
- Page d'options complète pour gérer toutes les règles
- Retour automatique au thème par défaut pour les sites non configurés

## Installation

1. Ouvrez Firefox et accédez à `about:debugging`
2. Cliquez sur "Ce Firefox" dans le menu de gauche
3. Cliquez sur "Charger un module temporaire"
4. Sélectionnez le fichier `manifest.json` de ce projet

Pour une installation permanente :
1. Compressez tous les fichiers du projet en .zip
2. Renommez l'extension du fichier en .xpi
3. Ouvrez Firefox et accédez à `about:addons`
4. Cliquez sur la roue dentée et sélectionnez "Installer un module depuis un fichier"
5. Sélectionnez le fichier .xpi créé

## Utilisation

1. Cliquez sur l'icône de l'extension dans la barre d'outils
2. Pour ajouter une nouvelle règle :
   - Entrez l'URL du site (ou un motif)
   - Sélectionnez une couleur
   - Cliquez sur "Ajouter"
3. Les règles existantes peuvent être modifiées ou supprimées depuis la page d'options

## Structure du projet

- `manifest.json` : Configuration de l'extension
- `background.js` : Logique principale de l'extension
- `popup.html/js` : Interface rapide de configuration
- `options.html/js` : Interface complète de gestion
- `storage.js` : Gestion de la persistance des données
- `icons/` : Icônes de l'extension

## Développement

Pour contribuer au projet :

1. Clonez le dépôt
2. Installez les dépendances : `npm install`
3. Effectuez vos modifications
4. Testez l'extension en local
5. Soumettez une pull request

## Licence

MIT 