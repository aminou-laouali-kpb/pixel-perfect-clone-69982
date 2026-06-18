export const QUIZ_DATA = [
  {
    id: 1,
    question: "Un prospect te demande : 'Est-ce que KPB prend des frais ?' Quelle est la bonne réponse ?",
    options: [
      "Non, KPB est totalement gratuit pour tout le monde",
      "KPB perçoit des honoraires uniquement après confirmation de l'admission — ces frais sont distincts de l'acompte de l'école",
      "KPB prend 50% des frais de scolarité",
      "C'est confidentiel, je ne peux pas répondre"
    ],
    correct: 1,
    explanation: "Les honoraires KPB sont post-admission et séparés des frais d'école. Ne jamais dire 'gratuit' ni confondre avec l'acompte école."
  },
  {
    id: 2,
    question: "Le visa d'un étudiant que tu as parrainé est refusé. Que lui arrive-t-il pour l'acompte versé à l'école ?",
    options: [
      "Il est perdu — aucun remboursement possible",
      "Il est remboursé à 50% selon les conditions",
      "L'acompte école est remboursé à 100% — c'est garanti par nos partenariats",
      "Ça dépend de l'école, rien n'est garanti"
    ],
    correct: 2,
    explanation: "100% remboursé en cas de refus visa. C'est un argument clé à toujours mentionner pour rassurer tes filleuls."
  },
  {
    id: 3,
    question: "Dans quelles destinations KPB accompagne-t-il principalement les étudiants ?",
    options: [
      "France uniquement",
      "France et Canada uniquement",
      "Europe uniquement",
      "France, Allemagne, Espagne, Maroc, Turquie, Canada, Dubaï et USA principalement"
    ],
    correct: 3,
    explanation: "KPB est multi-destinations. Chaque étudiant est orienté selon son profil, budget et objectif."
  },
  {
    id: 4,
    question: "Quand ton parrainage est-il officiellement validé et ta commission calculée ?",
    options: [
      "Dès que l'étudiant envoie un message à KPB",
      "Dès qu'il remplit le formulaire de pré-inscription KPB",
      "Quand l'étudiant est admis dans une école partenaire ET paie ses frais de scolarité via KPB",
      "Quand l'étudiant arrive dans le pays d'accueil et commence ses cours"
    ],
    correct: 2,
    explanation: "Admission confirmée + frais de scolarité payés = parrainage validé. C'est à cette étape que la commission est due."
  },
  {
    id: 5,
    question: "Un ami hésitant te dit 'Je préfère candidater directement, sans intermédiaire'. Meilleure réponse ?",
    options: [
      "Dans ce cas, tu n'as pas besoin de nous",
      "Je comprends. Avec KPB tu as un accompagnement de bout en bout, un réseau d'écoles partenaires et un suivi visa — des avantages difficiles à obtenir seul",
      "Je te promets une bourse si tu passes par KPB",
      "Insister jusqu'à ce qu'il change d'avis"
    ],
    correct: 1,
    explanation: "Vends la valeur ajoutée : réseau, suivi, structure. Pas de pression, pas de fausses promesses."
  }
];

export const QUIZ_MIN_SCORE = 4; // minimum to pass
