export interface Question {
  id: number
  question: string
  answers: string[]
  correct: number // index of correct answer (0-3)
  value: number   // leads value
  explanation: string
}

export const questions: Question[] = [
  {
    id: 1,
    question: "Temps moyen passé sur un site web classique ?",
    answers: ["15 secondes", "53 secondes", "2 minutes", "5 minutes"],
    correct: 1, // 53 secondes
    value: 100,
    explanation: "53 secondes en moyenne - et si on pouvait tripler ce temps ?"
  },
  {
    id: 2,
    question: "Taux de conversion moyen d'un site vitrine ?",
    answers: ["0.5%", "2.3%", "5%", "10%"],
    correct: 1, // 2.3%
    value: 1000,
    explanation: "2.3% en moyenne - l'interactivité peut le multiplier par 3-5x"
  },
  {
    id: 3,
    question: "Secteur avec le plus fort ROI sur l'engagement interactif ?",
    answers: ["BTP", "Finance", "Formation", "Retail"],
    correct: 2, // Formation
    value: 10000,
    explanation: "Formation : Quiz + certification = +340% conversion"
  },
  {
    id: 4,
    question: "Budget moyen pour transformer un site classique en interactif ?",
    answers: ["2-3K€", "5-7K€", "10-15K€", "20K€+"],
    correct: 1, // 5-7K€
    value: 100000,
    explanation: "5-7K€ en moyenne - ROI récupéré en 3-6 mois"
  },
  {
    id: 5,
    question: "Stratégie #1 pour multiplier l'engagement client en 2025 ?",
    answers: ["Plus de publicité", "Expériences interactives", "Prix plus bas", "Plus de contenu"],
    correct: 1, // Expériences interactives
    value: 1000000,
    explanation: "L'engagement bat le volume à tous les coups !"
  }
]