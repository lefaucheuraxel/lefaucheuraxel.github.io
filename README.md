# Portfolio d'Axel Le Faucheur

Portfolio personnel statique, en français, avec présentation du profil, des compétences, des projets, du parcours et des moyens de contact.

## Fichiers

- `index.html` : contenu et structure des sections.
- `portfolio.css` : styles, palette bleue et mises en page responsives.
- `portfolio.js` : navigation, filtres de projets, animations légères et statistiques.
- `projects.js` : données des projets affichés.
- `CV_2026.pdf` : CV téléchargeable.
- `CV_2026.png` : aperçu du CV dans la section Profil.
- `convert_cv.py` : recrée l'aperçu PNG depuis la première page du PDF. Requiert `pypdfium2`.

## Lancer le site

Ouvrir `index.html` dans un navigateur, ou démarrer un serveur statique :

```powershell
python -m http.server 8000
```

Puis ouvrir `http://localhost:8000`.

La page charge Bootstrap 5 et les polices depuis des CDN; une connexion Internet est nécessaire pour ces ressources.

## Mise à jour du contenu

- Modifier le profil et les sections dans `index.html`.
- Ajouter ou modifier un projet dans `projects.js`.
- Ajuster la palette et les points de rupture dans `portfolio.css`.
