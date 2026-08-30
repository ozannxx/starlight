const MESSAGES = [
  "Petit pas aujourd'hui, grand saut demain.",
  "La régularité bat l'intensité.",
  "Tu n'as pas besoin d'être parfait, juste constant.",
  "Une chose à la fois, parfaitement.",
  "Le meilleur moment pour commencer, c'était hier. Le deuxième, c'est maintenant.",
  "Progresser, c'est déjà gagner.",
  "Ton futur toi te remercie déjà.",
  "Moins de stress, plus de process.",
  "Chaque fiche faite = des points gagnés au contrôle.",
  "Sincèrement ? Tu gères.",
  "Focus sur l'essentiel, le reste suivra.",
  "Les distractions peuvent attendre. Tes objectifs, non.",
  "Un devoir de moins, un sourire de plus.",
  "Tu es exactement où tu dois être.",
  "Respire. Puis attaque la tâche n°1.",
  "Aujourd'hui est une bonne journée pour briller ✨",
];

export function dailyMessage(): string {
  const d = new Date();
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 864e5);
  return MESSAGES[dayOfYear % MESSAGES.length];
}