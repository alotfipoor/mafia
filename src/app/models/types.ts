export type ScenarioType = 'capo' | 'classic' | 'zodiac' | 'jack';

export type Role = {
  name: string;
  team: 'mafia' | 'citizen' | 'independent';
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
  isBlocked?: boolean;         // For Illusionist/Matador ability
  hasVest?: boolean;           // For Professional/Leon
  hasCursed?: string[];        // For Jack Sparrow's cursed targets
  canUseAbility?: boolean;     // For tracking one-time abilities
  hasBomb?: boolean;           // For Bomber's target
  bombCode?: number;           // For Bomber's defuse code
  convertedToMafia?: boolean;  // For Saul Goodman's ability
};

export type GameState = {
  scenario: ScenarioType;
  players: Player[];
  phase: 'setup' | 'night' | 'day' | 'voting' | 'results';
  round: number;
  gameLog: string[];
  zodiacScenario?: {
    roleInquiriesLeft: number;  // Number of times players can check eliminated players' roles
    bombActive: boolean;        // If a bomb is currently active
    bombTarget?: string;        // ID of player with bomb
    bombCode?: number;          // Defuse code for bomb
  };
  jackScenario?: {
    nightAction?: 'shot' | 'sixthSense' | 'recruit';  // Track which Mafia night action was used
    revealedJack?: boolean;     // Whether Jack has been revealed
    beautifulMindUsed?: boolean; // Whether Beautiful Mind card was used
    lastActionCards?: {         // Track used Last Action cards
      silenceOfTheLambs?: boolean;
      silencedPlayers?: string[];
      identityReveal?: boolean;
      beautifulMind?: boolean;
      handcuffs?: boolean;
      handcuffedPlayer?: string;
      faceSwap?: boolean;
      duel?: boolean;
    };
  };
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

export const ZODIAC_ROLES: Record<string, Role> = {
  alCapone: {
    name: 'Al Capone',
    team: 'mafia',
    description: 'Mafia leader. Shows up negative to Detective inquiry.',
    ability: 'If shot by Professional, exits the game.'
  },
  illusionist: {
    name: 'Illusionist',
    team: 'mafia',
    description: 'Blocks another player\'s ability for 24 hours.',
    ability: 'Can\'t target same person two nights in a row.',
  },
  bomber: {
    name: 'Bomber',
    team: 'mafia',
    description: 'Places a bomb once per game on any player.',
    ability: 'Picks a number 1-4 for the bomb defuse code.',
  },
  zodiac: {
    name: 'Zodiac',
    team: 'independent',
    description: 'Serial killer playing solo.',
    ability: 'Shoots every even night. Dies if shoots Protector. Cannot be revealed during inquiry.',
  },
  protector: {
    name: 'Protector',
    team: 'citizen',
    description: 'Protects the town from Zodiac.',
    ability: 'If shot by Zodiac, Zodiac dies. If bombed, receives the defuse code silently.',
  },
  ocean: {
    name: 'Ocean',
    team: 'citizen',
    description: 'Can awaken two citizens across two nights.',
    ability: 'If awakens Mafia or Zodiac, dies the next day.',
  },
  gunsmith: {
    name: 'Gunsmith',
    team: 'citizen',
    description: 'Gives 1-2 random guns each night.',
    ability: 'Guns can be either real or fake - recipients don\'t know which.',
  },
  professional: {
    name: 'Professional',
    team: 'citizen',
    description: 'Sharpshooter who targets Mafia members.',
    ability: 'If shoots a citizen, dies. Has one protective vest.',
  },
  detective: {
    name: 'Detective',
    team: 'citizen',
    description: 'Checks players at night.',
    ability: 'Al Capone returns a negative result.',
  },
  doctor: {
    name: 'Doctor',
    team: 'citizen',
    description: 'Can save players at night.',
    ability: 'Two saves during first three nights, one per night afterward. Can save self once.',
  },
  citizen: {
    name: 'Citizen',
    team: 'citizen',
    description: 'Regular citizen with no night role.',
    ability: 'Contributes during day discussions and voting.',
  },
};

export const JACK_ROLES: Record<string, Role> = {
  godfather: {
    name: 'Godfather',
    team: 'mafia',
    description: 'Leader of the Mafia. Immune to Leon\'s first shot.',
    ability: 'Picks night target and has Sixth Sense ability.'
  },
  saulGoodman: {
    name: 'Saul Goodman',
    team: 'mafia',
    description: 'Once per game, converts a Simple Citizen into Mafia.',
    ability: 'Activates only after another Mafia is eliminated.',
  },
  matador: {
    name: 'Matador',
    team: 'mafia',
    description: 'Wakes with Mafia. Blocks a player\'s night action.',
    ability: 'Blocked player sees a red X during their wake phase.',
  },
  jackSparrow: {
    name: 'Jack Sparrow',
    team: 'independent',
    description: 'Must win alone. Cannot be eliminated by night shots or voting.',
    ability: 'Each night, curses a player. Can only be eliminated by Beautiful Mind card.',
  },
  drWatson: {
    name: 'Dr. Watson',
    team: 'citizen',
    description: 'Can save one player per night.',
    ability: 'Can save self once per game.',
  },
  leon: {
    name: 'Leon',
    team: 'citizen',
    description: 'Professional shooter targeting Mafia.',
    ability: 'If shoots a Citizen, dies instantly. Has one vest.',
  },
  citizenKane: {
    name: 'Citizen Kane',
    team: 'citizen',
    description: 'Once per game, reveals a Mafia if guess is correct.',
    ability: 'Moderator exposes the Mafia next morning.',
  },
  constantine: {
    name: 'Constantine',
    team: 'citizen',
    description: 'Once per game, revives an eliminated player.',
    ability: 'Revived player loses all abilities.',
  },
  citizen: {
    name: 'Simple Citizen',
    team: 'citizen',
    description: 'No night action.',
    ability: 'Helps during the day by observing and voting wisely.',
  },
}; 