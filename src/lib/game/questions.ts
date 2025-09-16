// src/lib/game/questions.ts - SETS MÉLANGÉS PROGRESSIFS AVEC SOURCES
export interface Question {
  id: number
  question: string
  answers: string[]
  correct: number // index of correct answer (0-3)
  value: number   // points (1 ou 2)
  explanation: string
  source: string
  sourceUrl: string
}

export interface QuestionSet {
  id: number
  name: string
  questions: Question[]
}

// SET A - Mix accessible avec progression douce
export const questionSetA: Question[] = [
  {
    id: 101,
    question: "Temps moyen passé par jour sur Internet par les Français ?",
    answers: ["2h40", "1h30", "3h20", "4h05"],
    correct: 0, // 2h40
    value: 1,
    explanation: "2h40 par jour en 2024 ! Les jeunes font même 4h21/jour. Et vous, combien de temps ?",
    source: "Médiamétrie 2024",
    sourceUrl: "https://www.mediametrie.fr/en/2024-year-internet"
  },
  {
    id: 102,
    question: "Pourcentage du trafic web qui se fait sur mobile ?",
    answers: ["45%", "60%", "75%", "85%"],
    correct: 1, // 60%
    value: 1,
    explanation: "60% du trafif mondial ! En France c'est même 63%. Votre site est-il mobile-friendly ?",
    source: "TekRevol Mobile Stats 2025",
    sourceUrl: "https://www.tekrevol.com/blogs/mobile-device-website-traffic-statistics/"
  },
  {
    id: 103,
    question: "Taux de conversion moyen d'un site e-commerce ?",
    answers: ["1,2%", "2,3%", "5,8%", "8,1%"],
    correct: 1, // 3,3%
    value: 1,
    explanation: "3,3% en France ! Mais les expériences interactives peuvent faire 10x mieux...",
    source: "Smart Insights E-commerce 2025",
    sourceUrl: "https://www.smartinsights.com/ecommerce/ecommerce-analytics/ecommerce-conversion-rates/"
  },
  {
    id: 104,
    question: "Que se passe-t-il si votre site met plus de 3 secondes à charger ?",
    answers: ["Rien", "10% partent", "30% partent", "53% partent"],
    correct: 3, // 53% partent
    value: 2,
    explanation: "53% abandonnent ! Chaque seconde compte. 1 seconde de plus = -7% de conversions",
    source: "HubSpot Page Load Time Study 2025",
    sourceUrl: "https://blog.hubspot.com/marketing/page-load-time-conversion-rates"
  },
  {
    id: 105,
    question: "ROI moyen d'un investissement en UX (expérience utilisateur) ?",
    answers: ["9,900%", "500%", "2,500%", "150%"],
    correct: 0, // 9,900%
    value: 2,
    explanation: "9,900% ! 1€ investi = 100€ de retour. L'UX n'est pas une dépense, c'est l'investissement le plus rentable !",
    source: "UXCam UX Statistics 2025",
    sourceUrl: "https://uxcam.com/blog/ux-statistics/"
  }
]

// SET B - Mix avec focus conversion et engagement  
export const questionSetB: Question[] = [
  {
    id: 201,
    question: "Combien utilisent l'IA (ChatGPT, etc.) chez les 15-24 ans en France ?",
    answers: ["25%", "54%", "78%", "89%"],
    correct: 1, // 54%
    value: 1,
    explanation: "54% des jeunes l'utilisent chaque mois ! Ça a triplé en 1 an. L'IA transforme tout",
    source: "Médiamétrie - Usage IA France 2024",
    sourceUrl: "https://siecledigital.fr/2025/02/17/usage-du-numerique-en-france-les-tendances-et-chiffres-2024-de-mediametrie/"
  },
  {
    id: 202,
    question: "Performance d'une vidéo interactive vs vidéo classique ?",
    answers: ["+300% d'engagement", "+50% d'engagement", "+150% d'engagement", "+25% d'engagement"],
    correct: 0, // +300%
    value: 1,
    explanation: "300% d'engagement en plus ! 85% plus susceptibles d'acheter vs 51% pour la vidéo classique",
    source: "Firework Interactive Video Study 2024",
    sourceUrl: "https://firework.com/blog/interactive-video-statistics"
  },
  {
    id: 203,
    question: "Taux de conversion d'un quiz interactif B2B ?",
    answers: ["8%", "15%", "40%", "65%"],
    correct: 2, // 40%
    value: 2,
    explanation: "40% de conversion start-to-lead ! vs 1,65% pour un site classique. 24x plus efficace !",
    source: "Interact Quiz Conversion Report 2025",
    sourceUrl: "https://www.tryinteract.com/blog/quiz-conversion-rate-report/"
  },
  {
    id: 204,
    question: "Croissance du marché AR/VR pour les entreprises d'ici 2034 ?",
    answers: ["x32 (370 milliards)", "x5 (55 milliards)", "x15 (175 milliards)", "x50 (575 milliards)"],
    correct: 0, // x32
    value: 2,
    explanation: "Multiplication par 32 ! De 11,5 à 370 milliards$. 91% des dirigeants planifient l'adoption",
    source: "Gartner AR/VR Revenue Projection 2024",
    sourceUrl: "https://www.gartner.com/en/documents/5179263"
  },
  {
    id: 205,
    question: "Combien d'utilisateurs ne reviennent jamais après une mauvaise expérience ?",
    answers: ["43%", "65%", "88%", "92%"],
    correct: 2, // 88%
    value: 2,
    explanation: "88% ne reviennent JAMAIS ! Une mauvaise UX = perdre définitivement 9 clients sur 10",
    source: "Maze UX Statistics 2025",
    sourceUrl: "https://maze.co/blog/ux-statistics/"
  }
]

// SET C - Mix technologies et impact business
export const questionSetC: Question[] = [
  {
    id: 301,
    question: "Amélioration des conversions avec la gamification ?",
    answers: ["+468%", "+125%", "+250%", "+50%"],
    correct: 0, // +468%
    value: 1,
    explanation: "468% d'amélioration ! 9,38% vs 1,65% pour un site classique. Les jeux, ça marche !",
    source: "LXA Hub Gamification Study 2023",
    sourceUrl: "https://www.lxahub.com/stories/gamification-in-marketing-stats-and-trends-for-2022"
  },
  {
    id: 302,
    question: "Efficacité de la formation en VR vs formation classique ?",
    answers: ["2x plus efficace", "4x plus efficace", "6x plus efficace", "10x plus efficace"],
    correct: 1, // 4x plus efficace
    value: 1,
    explanation: "4x plus rapide ! 80% de rétention après 1 an vs 20% pour la formation traditionnelle",
    source: "PwC VR Training Effectiveness Study",
    sourceUrl: "https://www.pwc.co.uk/services/technology/immersive-technologies/study-into-vr-training-effectiveness.html"
  },
  {
    id: 303,
    question: "Budget digital français : combien investis en 2024 ?",
    answers: ["2,1 milliards €", "4,8 milliards €", "7,2 milliards €", "9,6 milliards €"],
    correct: 1, // 4,8 milliards
    value: 1,
    explanation: "4,8 milliards € ! 46% du budget média total. Le digital explose (+7,7% de croissance)",
    source: "Blog du Modérateur - Chiffres Médiamétrie",
    sourceUrl: "https://www.blogdumoderateur.com/francais-usage-internet-chiffres-mediametrie-2025/"
  },
  {
    id: 304,
    question: "Impact de la personnalisation IA sur l'engagement client ?",
    answers: ["+15%", "+30%", "+45%", "+60%"],
    correct: 1, // +30%
    value: 2,
    explanation: "+30% d'engagement ! +20% de ventes directes. 96% des marketeurs confirment l'impact",
    source: "McKinsey Digital Customer Experience 2024",
    sourceUrl: "https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/enhancing-customer-experience-in-the-digital-age"
  },
  {
    id: 305,
    question: "Performance des CTAs (boutons) personnalisés vs génériques ?",
    answers: ["+202% de conversion", "+75% de conversion", "+125% de conversion", "+350% de conversion"],
    correct: 0, // +202%
    value: 2,
    explanation: "202% mieux ! La personnalisation révolutionne tout. Chaque détail compte",
    source: "HubSpot Marketing Statistics 2025",
    sourceUrl: "https://www.hubspot.com/marketing-statistics"
  }
]

// SET D - Mix engagement et tendances actuelles
export const questionSetD: Question[] = [
  {
    id: 401,
    question: "Part du temps mobile passée dans des apps vs navigateur web ?",
    answers: ["94% apps", "67% apps", "78% apps", "85% apps"],
    correct: 0, // 94% apps
    value: 1,
    explanation: "94% dans les apps ! Seulement 6% sur le web mobile. L'expérience app est reine",
    source: "Médiamétrie Usage Mobile France 2024",
    sourceUrl: "https://fr.themedialeader.com/internet-en-2024-des-usages-en-mutation-portes-par-le-mobile-et-lia-selon-mediametrie/"
  },
  {
    id: 402,
    question: "Augmentation du budget vidéo interactive prévue par les marketeurs ?",
    answers: ["45%", "88%", "67%", "72%"],
    correct: 1, // 88%
    value: 1,
    explanation: "88% vont augmenter ! La vidéo interactive devient incontournable. 4x plus de clics !",
    source: "Firework Interactive Video Report 2024",
    sourceUrl: "https://firework.com/blog/interactive-video-statistics"
  },
  {
    id: 403,
    question: "Croissance des entreprises avec une excellente expérience client ?",
    answers: ["25%", "+80% de revenus", "+45% de revenus", "+120% de revenus"],
    correct: 1, // +80%
    value: 2,
    explanation: "80% de revenus en plus ! Les entreprises 'CX top-quartile' écrasent la concurrence",
    source: "Forrester Customer Experience Index 2024",
    sourceUrl: "https://www.forrester.com/press-newsroom/forrester-2024-us-customer-experience-index/"
  },
  {
    id: 404,
    question: "Économies réalisées avec la formation VR vs formation classique ?",
    answers: ["30-70%", "15-25%", "50-80%", "10-20%"],
    correct: 0, // 30-70%
    value: 2,
    explanation: "30 à 70% d'économies ! Boeing : 90% d'amélioration qualité. ROI de 300% sur 5 ans",
    source: "Oberon Technologies VR Training ROI Study",
    sourceUrl: "https://www.oberontech.com/featured-offers/roi-of-virtual-reality-training/"
  },
  {
    id: 405,
    question: "Croissance prévue du marché UX design d'ici 2032 ?",
    answers: ["25% par an", "37% par an", "15% par an", "45% par an"],
    correct: 1, // 37% par an
    value: 2,
    explanation: "37% de croissance annuelle ! De 2,4 à 30 milliards$ d'ici 2030. L'UX explose",
    source: "MindInventory UI/UX Market Analysis 2025",
    sourceUrl: "https://www.mindinventory.com/blog/ui-ux-design-statistics/"
  }
]

// CONFIGURATION DES SETS
export const questionSets: QuestionSet[] = [
  {
    id: 1,
    name: "SET A",
    questions: questionSetA
  },
  {
    id: 2,
    name: "SET B", 
    questions: questionSetB
  },
  {
    id: 3,
    name: "SET C",
    questions: questionSetC
  },
  {
    id: 4,
    name: "SET D",
    questions: questionSetD
  }
]

// GESTIONNAIRE DE ROTATION AUTOMATIQUE
let currentSetIndex = 0

export const getCurrentQuestionSet = (): Question[] => {
  const questions = questionSets[currentSetIndex].questions
  currentSetIndex = (currentSetIndex + 1) % questionSets.length
  return questions
}

export const getCurrentSetName = (): string => {
  return questionSets[currentSetIndex].name
}

// LEGACY : Pour compatibilité
export const questions = getCurrentQuestionSet()