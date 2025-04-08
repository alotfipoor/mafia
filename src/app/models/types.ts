export type ScenarioType = 'capo' | 'classic';

export type Role = {
  name: string;
  team: 'mafia' | 'citizen';
  description: string;
  ability?: string;
};

export type Player = {
  id: string;
  name: string;
  role: Role;
  isAlive: boolean;
  isSaved?: boolean;
  isRevealed?: boolean;
};

export type GameState = {
  scenario: ScenarioType;
  players: Player[];
  phase: 'setup' | 'night' | 'day' | 'voting' | 'results';
  round: number;
  gameLog: string[];
};

export const CAPO_ROLES: Record<string, Role> = {
  donMafia: {
    name: 'Don Mafia',
    team: 'mafia',
    description: 'Leader of the Mafia. Always appears negative to Detective.',
    ability: 'Holds an antidote and can recruit a Simple Citizen or Suspect to join the Mafia.',
  },
  wizard: {
    name: 'Wizard',
    team: 'mafia',
    description: 'Each night selects a citizen to redirect their ability to themselves.',
    ability: 'Makes citizens use their abilities on themselves.',
  },
  executioner: {
    name: 'Executioner',
    team: 'mafia',
    description: 'Can remove a player by correctly guessing their role.',
    ability: 'Role guess elimination (replaces regular Mafia shooting).',
  },
  informant: {
    name: 'Informant',
    team: 'mafia',
    description: 'Spy for Mafia. If awakened by Village Chief, appears as a Citizen.',
    ability: 'Deception when interacting with Village Chief.',
  },
  detective: {
    name: 'Detective',
    team: 'citizen',
    description: 'Can investigate one player each night to determine their team.',
    ability: 'Night inquiry (Don Mafia always appears negative).',
  },
  suspect: {
    name: 'Suspect',
    team: 'citizen',
    description: 'Simple citizen that appears as Mafia in Detective\'s inquiry.',
    ability: 'False positive result for Detective.',
  },
  blacksmith: {
    name: 'Blacksmith',
    team: 'citizen',
    description: 'Can save one player each night from elimination.',
    ability: 'Can save self once per game.',
  },
  herbalist: {
    name: 'Herbalist',
    team: 'citizen',
    description: 'Holds poison and antidote.',
    ability: 'Can poison players and administer antidote through majority vote.',
  },
  heir: {
    name: 'Heir',
    team: 'citizen',
    description: 'Initially immortal, first role awakened at introduction night.',
    ability: 'Can inherit abilities from Detective, Blacksmith, or Herbalist upon their elimination.',
  },
  villageChief: {
    name: 'Village Chief',
    team: 'citizen',
    description: 'Can secretly link with two citizens for protection.',
    ability: 'If Chief awakens a Mafia member (except Informant), the Chief and linked citizens are eliminated.',
  },
  citizen: {
    name: 'Simple Citizen',
    team: 'citizen',
    description: 'Regular citizen with no special abilities.',
    ability: 'Can be recruited by Don Mafia to join the Mafia team.',
  },
};

export const CLASSIC_ROLES: Record<string, Role> = {
  donMafia: {
    name: 'Don Mafia',
    team: 'mafia',
    description: 'Leader of the Mafia.',
    ability: 'Chooses who to eliminate each night',
  },
  mafia: {
    name: 'Mafia',
    team: 'mafia',
    description: 'Member of the Mafia team.',
    ability: 'Votes on who to eliminate each night',
  },
  detective: {
    name: 'Detective',
    team: 'citizen',
    description: 'Can investigate one player each night.',
    ability: 'Night inquiry',
  },
  doctor: {
    name: 'Doctor',
    team: 'citizen',
    description: 'Can save one player each night.',
    ability: 'Protection',
  },
  citizen: {
    name: 'Simple Citizen',
    team: 'citizen',
    description: 'Regular citizen.',
  },
}; 