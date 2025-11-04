# CV en Ligne Interactif 🚀

Un site web CV moderne et interactif avec des animations JavaScript sophistiquées et Bootstrap 5.

## ✨ Fonctionnalités

- **Design Moderne** : Interface élégante avec dégradés et effets visuels
- **Animations Fluides** : Animations AOS, particules interactives, effets de scroll
- **Responsive** : S'adapte parfaitement à tous les écrans (mobile, tablette, desktop)
- **Sections Complètes** :
  - Hero section avec effet de typing
  - À propos avec informations personnelles
  - Compétences techniques avec barres de progression animées
  - Portfolio de projets avec filtres interactifs
  - Expérience et formation avec timeline
  - Formulaire de contact
- **Interactivité** : 
  - Navigation smooth scroll
  - Filtres de projets dynamiques
  - Bouton retour en haut
  - Effets hover sophistiqués

## 🛠️ Technologies Utilisées

- **HTML5** : Structure sémantique
- **CSS3** : Animations et transitions avancées
- **JavaScript** : Interactivité et animations
- **Bootstrap 5** : Framework CSS responsive
- **Particles.js** : Effet de particules en arrière-plan
- **AOS** : Animations on scroll
- **Typed.js** : Effet de machine à écrire

## 📁 Structure du Projet

```
CVEnLigne/
├── index.html          # Page principale
├── styles.css          # Styles personnalisés
├── script.js           # JavaScript principal
├── projects.js         # Données des projets
├── CV_2025.pdf         # CV téléchargeable
└── README.md           # Documentation
```

## 🚀 Utilisation

1. **Ouvrir le site** : Double-cliquez sur `index.html` ou ouvrez-le dans votre navigateur
2. **Personnaliser** :
   - Modifiez vos informations dans `index.html`
   - Ajoutez vos projets dans `projects.js`
   - Personnalisez les couleurs dans `styles.css` (variables CSS)
   - Remplacez `CV_2025.pdf` par votre CV

## 🎨 Personnalisation

### Couleurs
Modifiez les variables CSS dans `styles.css` :
```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    --accent-color: #ec4899;
    /* ... */
}
```

### Projets
Ajoutez vos projets dans `projects.js` :
```javascript
{
    title: "Nom du Projet",
    category: "vr", // vr, robotics, web, ai
    categoryName: "VR/AR",
    description: "Description du projet",
    image: "url-de-l-image",
    tags: ["Tag1", "Tag2"],
    githubUrl: "lien-github",
    demoUrl: "lien-demo"
}
```

### Compétences
Modifiez les compétences dans `index.html` section `#skills` :
```html
<div class="skill-item">
    <div class="skill-header">
        <span>Nom de la compétence</span>
        <span class="skill-percentage">90%</span>
    </div>
    <div class="progress">
        <div class="progress-bar" data-progress="90"></div>
    </div>
</div>
```

## 📱 Responsive Design

Le site est entièrement responsive et s'adapte à :
- 📱 Mobile (< 768px)
- 📱 Tablette (768px - 992px)
- 💻 Desktop (> 992px)

## 🌟 Animations Incluses

- Particules interactives en arrière-plan
- Effet de typing sur le titre principal
- Animations au scroll (fade, slide)
- Barres de progression animées
- Cartes flottantes
- Transitions fluides
- Effets hover sophistiqués

## 📝 Sections à Personnaliser

1. **Hero Section** : Nom, titre, description
2. **À Propos** : Photo, bio, informations
3. **Compétences** : Langages, frameworks, outils
4. **Projets** : Portfolio complet
5. **Expérience** : Parcours professionnel et académique
6. **Contact** : Email, téléphone, localisation, réseaux sociaux

## 🔗 Liens Utiles

- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.3/)
- [AOS Animation Library](https://michalsnik.github.io/aos/)
- [Particles.js](https://vincentgarreau.com/particles.js/)
- [Typed.js](https://mattboldt.com/demos/typed-js/)

## 📄 Licence

Ce projet est libre d'utilisation pour votre CV personnel.

## 🤝 Support

Pour toute question ou amélioration, n'hésitez pas à me contacter !

---

**Fait avec ❤️ et beaucoup de JavaScript**
