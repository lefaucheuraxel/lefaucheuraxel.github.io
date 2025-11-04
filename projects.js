// ===== PROJECTS DATA =====
const projectsData = [
    // VR/AR Projects
    {
        title: "Navigation 3D en Réalité Virtuelle",
        category: "vr",
        categoryName: "VR/AR",
        description: "Application VR complète de navigation 3D développée avec Unity et XR Interaction Toolkit. Implémentation de téléportation, locomotion continue et interactions immersives.",
        image: "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=500&h=300&fit=crop",
        tags: ["Unity", "C#", "XR Toolkit", "VR"],
        githubUrl: "#",
        demoUrl: "#"
    },
    {
        title: "Interaction 3D Immersive",
        category: "vr",
        categoryName: "VR/AR",
        description: "Système d'interaction 3D avancé permettant la manipulation d'objets virtuels avec retour haptique. Utilisation de contrôleurs VR et gestures naturelles.",
        image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=500&h=300&fit=crop",
        tags: ["Unity", "XR", "Haptics", "3D"],
        githubUrl: "#",
        demoUrl: "#"
    },
    {
        title: "Projet Réalité Augmentée",
        category: "vr",
        categoryName: "VR/AR",
        description: "Application AR mobile permettant la visualisation et l'interaction avec des modèles 3D dans l'environnement réel. Tracking spatial et reconnaissance d'images.",
        image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=500&h=300&fit=crop",
        tags: ["Unity", "AR Foundation", "Mobile", "Computer Vision"],
        githubUrl: "#",
        demoUrl: "#"
    },
    {
        title: "Modélisation 3D Interactive",
        category: "vr",
        categoryName: "VR/AR",
        description: "Outil de modélisation 3D en temps réel pour la création et modification d'environnements virtuels. Interface intuitive et rendu haute qualité.",
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&h=300&fit=crop",
        tags: ["Unity", "3D Modeling", "Shaders", "Real-time"],
        githubUrl: "#",
        demoUrl: "#"
    },

    // Robotics Projects
    {
        title: "Simulation Robot Panda avec PyBullet",
        category: "robotics",
        categoryName: "Robotique",
        description: "Simulation complète du robot Panda Franka Emika avec PyBullet. Implémentation de la cinématique inverse, planification de trajectoire et préhension d'objets.",
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&h=300&fit=crop",
        tags: ["Python", "PyBullet", "Robotics", "IK"],
        githubUrl: "#",
        demoUrl: "#"
    },
    {
        title: "Contrôleur Arduino pour SuperTuxKart",
        category: "robotics",
        categoryName: "Robotique",
        description: "Développement d'un contrôleur physique avec Arduino et capteurs pour jouer à SuperTuxKart. Interface hardware-software avec communication série.",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=300&fit=crop",
        tags: ["Arduino", "C++", "Sensors", "Gaming"],
        githubUrl: "#",
        demoUrl: "#"
    },
    {
        title: "Grasping TP - Préhension Robotique",
        category: "robotics",
        categoryName: "Robotique",
        description: "Algorithmes de préhension pour robots manipulateurs. Détection d'objets, calcul de points de préhension optimaux et exécution de mouvements.",
        image: "https://images.unsplash.com/photo-1563207153-f403bf289096?w=500&h=300&fit=crop",
        tags: ["Python", "Computer Vision", "Grasping", "ML"],
        githubUrl: "#",
        demoUrl: "#"
    },

    // AI/ML Projects
    {
        title: "IEVA - Système d'IA Procédurale",
        category: "ai",
        categoryName: "IA/ML",
        description: "Système d'intelligence artificielle pour la génération procédurale de contenu. Utilisation de réseaux de neurones et algorithmes génétiques.",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=300&fit=crop",
        tags: ["Python", "TensorFlow", "Neural Networks", "Procedural"],
        githubUrl: "#",
        demoUrl: "#"
    },
    {
        title: "Analyse Statistique avec Jupyter",
        category: "ai",
        categoryName: "IA/ML",
        description: "Notebooks Jupyter pour l'analyse statistique avancée et la visualisation de données. Machine learning et data science.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop",
        tags: ["Python", "Jupyter", "Pandas", "Matplotlib"],
        githubUrl: "#",
        demoUrl: "#"
    },
    {
        title: "Computer Vision pour Robotique",
        category: "ai",
        categoryName: "IA/ML",
        description: "Système de vision par ordinateur pour la détection et le tracking d'objets en temps réel. Intégration avec systèmes robotiques.",
        image: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=500&h=300&fit=crop",
        tags: ["Python", "OpenCV", "YOLO", "Deep Learning"],
        githubUrl: "#",
        demoUrl: "#"
    },

    // Web Projects
    {
        title: "Application Web Interactive",
        category: "web",
        categoryName: "Web",
        description: "Application web full-stack moderne avec React et Node.js. Interface utilisateur responsive et animations fluides.",
        image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=500&h=300&fit=crop",
        tags: ["React", "Node.js", "MongoDB", "Express"],
        githubUrl: "#",
        demoUrl: "#"
    },
    {
        title: "Mon Chien Me Pâte",
        category: "web",
        categoryName: "Web",
        description: "Application web ludique et interactive. Développement frontend avec animations CSS et JavaScript avancées.",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop",
        tags: ["JavaScript", "HTML5", "CSS3", "Animations"],
        githubUrl: "#",
        demoUrl: "#"
    },
    {
        title: "Portfolio 3D avec Three.js",
        category: "web",
        categoryName: "Web",
        description: "Portfolio interactif en 3D utilisant Three.js. Expérience immersive avec modèles 3D et animations WebGL.",
        image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=500&h=300&fit=crop",
        tags: ["Three.js", "WebGL", "JavaScript", "3D"],
        githubUrl: "#",
        demoUrl: "#"
    },
    {
        title: "Dashboard Analytics",
        category: "web",
        categoryName: "Web",
        description: "Tableau de bord analytique avec visualisations de données en temps réel. Charts interactifs et interface moderne.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop",
        tags: ["Vue.js", "D3.js", "Charts", "Real-time"],
        githubUrl: "#",
        demoUrl: "#"
    },

    // Additional Projects
    {
        title: "Expérience Interactive 3D",
        category: "vr",
        categoryName: "VR/AR",
        description: "Expérience immersive combinant VR et web technologies. Environnement 3D interactif accessible via navigateur.",
        image: "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=500&h=300&fit=crop",
        tags: ["WebXR", "Three.js", "VR", "WebGL"],
        githubUrl: "#",
        demoUrl: "#"
    },
    {
        title: "Système de Navigation Autonome",
        category: "robotics",
        categoryName: "Robotique",
        description: "Algorithmes de navigation autonome pour robots mobiles. SLAM, path planning et obstacle avoidance.",
        image: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=500&h=300&fit=crop",
        tags: ["ROS", "Python", "SLAM", "Navigation"],
        githubUrl: "#",
        demoUrl: "#"
    },
    {
        title: "Générateur de Contenu IA",
        category: "ai",
        categoryName: "IA/ML",
        description: "Outil de génération de contenu basé sur l'IA. Utilisation de modèles de langage et génération d'images.",
        image: "https://images.unsplash.com/photo-1676277791608-ac52b084c6c2?w=500&h=300&fit=crop",
        tags: ["Python", "GPT", "Stable Diffusion", "AI"],
        githubUrl: "#",
        demoUrl: "#"
    },
    {
        title: "API REST Scalable",
        category: "web",
        categoryName: "Web",
        description: "API REST haute performance avec architecture microservices. Documentation complète et tests automatisés.",
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&h=300&fit=crop",
        tags: ["Node.js", "Express", "Docker", "Microservices"],
        githubUrl: "#",
        demoUrl: "#"
    }
];

// ===== STATISTICS DATA =====
const statsData = {
    projects: projectsData.length,
    technologies: 25,
    experience: 3,
    commits: 1500
};

// ===== EXPORT DATA =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { projectsData, statsData };
}
