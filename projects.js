// ===== PROJECTS DATA =====
const projectsData = [
    // Mission actuelle - Comparateur de données augmenté par IA (Crédit Agricole CIB 2026)
    {
        title: "Plateforme de comparaison de données augmentée par IA",
        category: "ai",
        categoryName: "Data / IA",
        featured: true,
        description: "Application dédiée à la comparaison et à la validation de données techniques dans les bases S3, le dictionnaire de données et le code GitLab, augmentée par IA (agents & LLM). Architecture distribuée avec traitement Spark et intégration MCP chez Crédit Agricole CIB.",
        image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&h=400&fit=crop",
        tags: ["Java 21", "Spark", "GitLab API", "GraphQL", "Oracle", "MCP", "LLM", "Python 3.14"],
        githubUrl: "#",
        demoUrl: "#"
    },

    // Stage TAL - LAB-STICC Brest (IA / LLM)
    {
        title: "Explicabilité de robots par LLM - LAB-STICC",
        category: "ai",
        categoryName: "IA / LLM",
        featured: true,
        description: "Étude de l'explicabilité des comportements collectifs auto-organisés de robots grâce aux Large Language Models. Mise en place de LLM locaux, bases RAG personnalisées, tokenisation, embeddings et Transformers sur le projet Artuisis.",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
        tags: ["Unity", "OLLAMA", "LLM", "RAG", "LangChain", "Chainlit", "C#", "Python"],
        githubUrl: "#",
        demoUrl: "#"
    },

    // Projet Unity - Jeu RPG
    {
        title: "La Tombe Du Dragon - Jeu RPG Unity",
        category: "vr",
        categoryName: "Unity / Jeux",
        description: "Création d'un jeu vidéo RPG complet en utilisant Unity et des assets gratuits. Projet personnel couvrant game design, gameplay et intégration d'assets.",
        image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&h=400&fit=crop",
        tags: ["Unity", "C#", "RPG", "Game Dev"],
        githubUrl: "#",
        demoUrl: "#"
    },

    // Projet Contrôleur Arduino
    {
        title: "Contrôleur Arduino pour SuperTuxKart",
        category: "robotics",
        categoryName: "Robotique",
        description: "Capteurs Arduino assemblés pour créer un contrôleur original (monté sur un vélo) permettant de jouer à SuperTuxKart. Projet hardware-software innovant mêlant électronique et programmation.",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
        tags: ["Arduino", "C++", "Capteurs", "Hardware"],
        githubUrl: "#",
        demoUrl: "#"
    },

    // Projet escapeW@b
    {
        title: "escapeW@b",
        category: "web",
        categoryName: "Web",
        description: "Application web réalisée avec le framework CodeIgniter 4 et une base de données MariaDB. Projet universitaire mettant en œuvre le pattern MVC.",
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop",
        tags: ["CodeIgniter 4", "PHP", "MariaDB", "MVC"],
        githubUrl: "#",
        demoUrl: "#"
    },

    // Projet monchienmepate.fr
    {
        title: "monchienmepate.fr",
        category: "web",
        categoryName: "Web",
        description: "Site web développé en PHP avec Bootstrap et base de données SQL, intégrant un ChatBot (API OLLAMA), un système de réservation et de chat.",
        image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop",
        tags: ["PHP", "Bootstrap", "SQL", "ChatBot", "OLLAMA"],
        githubUrl: "#",
        demoUrl: "https://monchienmepate.fr"
    },

    // Projet calyenergity.free.nf
    {
        title: "calyenergity.free.nf",
        category: "web",
        categoryName: "Web",
        description: "Site web dynamique développé en PHP avec Bootstrap et base de données SQL, intégrant un ChatBot (API OLLAMA), un système de réservation et de chat. Projet jumeau de monchienmepate.fr.",
        image: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=600&h=400&fit=crop",
        tags: ["PHP", "Bootstrap", "SQL", "ChatBot", "OLLAMA"],
        githubUrl: "#",
        demoUrl: "https://calyenergity.free.nf"
    },

    // Simulation ENT Java
    {
        title: "Simulation d'un ENT en Java",
        category: "app",
        categoryName: "Application",
        description: "Simulation d'un Environnement Numérique de Travail en Java 19 réalisée en équipe. Banc de tests complet et interface graphique développée avec JavaFX.",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
        tags: ["Java", "JavaFX", "Tests", "Travail d'équipe"],
        githubUrl: "#",
        demoUrl: "#"
    },

    // Générateur d'éléments graphiques
    {
        title: "Générateur d'animations graphiques",
        category: "app",
        categoryName: "Application",
        description: "Application permettant de gérer et générer des éléments graphiques pour créer de petites animations, avec une interface IHM développée en Swing.",
        image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop",
        tags: ["Java", "Swing", "IHM", "Animations"],
        githubUrl: "#",
        demoUrl: "#"
    },

    // Chat réseau local
    {
        title: "Chat réseau local multi-utilisateurs",
        category: "app",
        categoryName: "Application",
        description: "Application permettant de connecter plusieurs utilisateurs sur un chat partagé en réseau local. Projet de programmation réseau utilisant les sockets Java.",
        image: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=600&h=400&fit=crop",
        tags: ["Java", "Réseau", "Socket", "Chat"],
        githubUrl: "#",
        demoUrl: "#"
    },

    // Projet compilation
    {
        title: "Analyseur syntaxique - Jflex & JavaCup",
        category: "app",
        categoryName: "Compilation",
        description: "Programme développé en Jflex et JavaCup capable de reconnaître un langage défini. Projet universitaire de compilation et d'analyse lexicale et syntaxique.",
        image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&h=400&fit=crop",
        tags: ["Jflex", "JavaCup", "Compilation", "Analyse syntaxique"],
        githubUrl: "#",
        demoUrl: "#"
    }
];

// ===== STATISTICS DATA =====
const statsData = {
    projects: projectsData.length,
    technologies: 30,
    experience: 3,
    commits: 500
};

// ===== EXPORT DATA =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { projectsData, statsData };
}
