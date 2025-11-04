// ===== PROJECTS DATA =====
const projectsData = [
    // Stage TAL
    {
        title: "Stage TAL - LAB-STICC Brest",
        category: "ai",
        categoryName: "IA/ML",
        description: "Etude de l'explicabilité des comportements collectifs auto-organisés de robots grâce aux Large Language Models. Travail sur Unity (projet Artuisis), OLLAMA, C#, Python, LLM, RAG, Chainlit. Compétences : LLM local, prompts et base de donnée RAG personnalisée, Tokenisation, embedding, chunks et Transformers.",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=300&fit=crop",
        tags: ["Unity", "LLM", "Python", "C#", "RAG", "OLLAMA", "Chainlit"],
        githubUrl: "#",
        demoUrl: "#"
    },

    // Stage Crédit Agricole
    {
        title: "Stage - Crédit Agricole",
        category: "web",
        categoryName: "Web",
        description: "Mise en place d'une application de pilotage des reportings avec un front-end en Angular et un back-end en Java. Environnement de travail : International (en lien avec les équipes de Singapour), Agile, DevOps - CI/CD, Green IT, Cloud interne (Kubernetes).",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop",
        tags: ["Angular", "Java", "Oracle SQL", "Kubernetes", "DevOps", "CI/CD"],
        githubUrl: "#",
        demoUrl: "#"
    },

    // Projet Unity - Jeu RPG
    {
        title: "La Tombe Du Dragon - Jeu RPG Unity",
        category: "vr",
        categoryName: "Unity/Jeux",
        description: "Création d'un jeu vidéo RPG en utilisant Unity et des assets gratuits. Projet personnel de développement de jeu vidéo.",
        image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&h=300&fit=crop",
        tags: ["Unity", "C#", "RPG", "Game Dev"],
        githubUrl: "#",
        demoUrl: "#"
    },

    // Projet Contrôleur Arduino
    {
        title: "Contrôleur Arduino pour SuperTuxKart",
        category: "robotics",
        categoryName: "Robotique",
        description: "Capteurs Arduino assemblés pour créer un contrôleur original (assemblage sur un vélo) pour jouer à SuperTuxKart. Projet hardware-software innovant.",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=300&fit=crop",
        tags: ["Arduino", "C++", "Capteurs", "Hardware"],
        githubUrl: "#",
        demoUrl: "#"
    },

    // Projet escapeW@b
    {
        title: "escapeW@b",
        category: "web",
        categoryName: "Web",
        description: "Utilisation du framework CodeIgniter 4 et conception d'une petite base de données en MariaDB. Projet universitaire de développement web.",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop",
        tags: ["CodeIgniter 4", "PHP", "MariaDB", "MVC"],
        githubUrl: "#",
        demoUrl: "#"
    },

    // Projet monchienmepate.fr
    {
        title: "monchienmepate.fr",
        category: "web",
        categoryName: "Web",
        description: "Application web développée en PHP avec Bootstrap et base de données SQL. Fonctionnalités : chat, système de réservation, etc.",
        image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=500&h=300&fit=crop",
        tags: ["PHP", "Bootstrap", "SQL", "Chat"],
        githubUrl: "#",
        demoUrl: "#"
    },

    // Simulation ENT Java
    {
        title: "Simulation ENT en Java",
        category: "web",
        categoryName: "Application",
        description: "Simulation d'un ENT en Java 19 en équipe de 3. Banc de tests, interface graphique avec JavaFX. Projet universitaire collaboratif.",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop",
        tags: ["Java", "JavaFX", "Tests", "Travail d'équipe"],
        githubUrl: "#",
        demoUrl: "#"
    },

    // Générateur d'éléments graphiques
    {
        title: "Générateur d'éléments graphiques",
        category: "web",
        categoryName: "Application",
        description: "Application permettant de gérer et générer des éléments graphiques pour créer des petites animations avec l'interface IHM codée en Swing.",
        image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=500&h=300&fit=crop",
        tags: ["Java", "Swing", "IHM", "Animations"],
        githubUrl: "#",
        demoUrl: "#"
    },

    // Chat réseau local
    {
        title: "Chat réseau local",
        category: "web",
        categoryName: "Application",
        description: "Application permettant de connecter plusieurs utilisateurs sur un chat partagé en réseau local. Projet de programmation réseau.",
        image: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=500&h=300&fit=crop",
        tags: ["Java", "Réseau", "Socket", "Chat"],
        githubUrl: "#",
        demoUrl: "#"
    },

    // Projet compilation
    {
        title: "Projet Compilation - Jflex & JavaCup",
        category: "ai",
        categoryName: "Compilation",
        description: "Programme en Jflex et JavaCup qui reconnaissait un langage défini. Projet universitaire de compilation et analyse syntaxique.",
        image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=500&h=300&fit=crop",
        tags: ["Jflex", "JavaCup", "Compilation", "Analyse syntaxique"],
        githubUrl: "#",
        demoUrl: "#"
    }
];

// ===== STATISTICS DATA =====
const statsData = {
    projects: projectsData.length,
    technologies: 20,
    experience: 2,
    commits: 500
};

// ===== EXPORT DATA =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { projectsData, statsData };
}
