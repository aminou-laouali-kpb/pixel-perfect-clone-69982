/**
 * Public quiz content only — no correct answers or explanations.
 * Scoring is authoritative in submit_quiz_attempt (Postgres).
 */
export type QuizQuestionPublic = {
  id: number;
  question: string;
  options: string[];
};

export const QUIZ_DATA: QuizQuestionPublic[] = [
  {
    id: 1,
    question:
      "Un prospect te demande : 'Est-ce que KPB prend des frais ?' Quelle est la bonne réponse ?",
    options: [
      "Non, KPB est totalement gratuit pour tout le monde",
      "KPB perçoit des honoraires uniquement après confirmation de l'admission — ces frais sont distincts de l'acompte de l'école",
      "KPB prend 50% des frais de scolarité",
      "C'est confidentiel, je ne peux pas répondre",
    ],
  },
  {
    id: 2,
    question:
      "Le visa d'un étudiant que tu as parrainé est refusé. Que lui arrive-t-il pour l'acompte versé à l'école ?",
    options: [
      "Il est perdu — aucun remboursement possible",
      "Il est remboursé à 50% selon les conditions",
      "L'acompte école est remboursé à 100% — c'est garanti par nos partenariats",
      "Ça dépend de l'école, rien n'est garanti",
    ],
  },
  {
    id: 3,
    question: "Dans quelles destinations KPB accompagne-t-il principalement les étudiants ?",
    options: [
      "France uniquement",
      "France et Canada uniquement",
      "Europe uniquement",
      "France, Allemagne, Espagne, Maroc, Turquie, Canada, Dubaï et USA principalement",
    ],
  },
  {
    id: 4,
    question: "Quand ton parrainage est-il officiellement validé et ta commission calculée ?",
    options: [
      "Dès que l'étudiant envoie un message à KPB",
      "Dès qu'il remplit le formulaire de pré-inscription KPB",
      "Quand l'étudiant est admis dans une école partenaire ET paie ses frais de scolarité via KPB",
      "Quand l'étudiant arrive dans le pays d'accueil et commence ses cours",
    ],
  },
  {
    id: 5,
    question:
      "Un ami hésitant te dit 'Je préfère candidater directement, sans intermédiaire'. Meilleure réponse ?",
    options: [
      "Dans ce cas, tu n'as pas besoin de nous",
      "Je comprends. Avec KPB tu as un accompagnement de bout en bout, un réseau d'écoles partenaires et un suivi visa — des avantages difficiles à obtenir seul",
      "Je te promets une bourse si tu passes par KPB",
      "Insister jusqu'à ce qu'il change d'avis",
    ],
  },
];

export const QUIZ_MIN_SCORE = 4;
