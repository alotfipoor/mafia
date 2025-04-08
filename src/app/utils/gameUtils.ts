import { v4 as uuidv4 } from 'uuid';
import { 
  CAPO_ROLES, 
  CLASSIC_ROLES, 
  ZODIAC_ROLES, 
  JACK_ROLES, 
  GameState, 
  Player, 
  Role, 
  ScenarioType 
} from '../models/types';

export const assignRoles = (playerNames: string[], scenario: ScenarioType): Player[] => {
  if (scenario === 'capo') {
    return assignCapoRoles(playerNames);
  } else if (scenario === 'zodiac') {
    return assignZodiacRoles(playerNames);
  } else if (scenario === 'jack') {
    return assignJackRoles(playerNames);
  } else {
    return assignClassicRoles(playerNames);
  }
};

const assignCapoRoles = (playerNames: string[]): Player[] => {
  const numPlayers = playerNames.length;
  
  // Validate number of players
  if (numPlayers < 12 || numPlayers > 13) {
    throw new Error('Capo scenario requires 12-13 players');
  }
  
  // Define how many of each role
  const roleDistribution: Record<string, number> = {
    donMafia: 1,
    wizard: 1,
    executioner: 1,
    informant: 1,
    detective: 1,
    suspect: 1,
    blacksmith: 1,
    herbalist: 1,
    heir: 1,
    villageChief: 1,
    citizen: numPlayers - 10, // Remaining players as simple citizens
  };
  
  return assignRolesFromDistribution(playerNames, CAPO_ROLES, roleDistribution);
};

const assignClassicRoles = (playerNames: string[]): Player[] => {
  const numPlayers = playerNames.length;
  
  // Validate number of players
  if (numPlayers < 6) {
    throw new Error('Classic scenario requires at least 6 players');
  }
  
  // Roughly one third of players are mafia
  const numMafia = Math.floor(numPlayers / 3);
  
  // Define how many of each role
  const roleDistribution: Record<string, number> = {
    donMafia: 1,
    mafia: numMafia - 1, // Regular mafia members
    detective: 1,
    doctor: 1,
    citizen: numPlayers - (numMafia + 2), // Remaining players as simple citizens
  };
  
  return assignRolesFromDistribution(playerNames, CLASSIC_ROLES, roleDistribution);
};

const assignZodiacRoles = (playerNames: string[]): Player[] => {
  const numPlayers = playerNames.length;
  
  // Validate number of players
  if (numPlayers < 9 || numPlayers > 12) {
    throw new Error('Zodiac scenario requires 9-12 players');
  }
  
  // Define how many of each role
  const roleDistribution: Record<string, number> = {
    alCapone: 1,
    illusionist: 1,
    bomber: 1,
    zodiac: 1,
    protector: 1,
    ocean: 1,
    gunsmith: 1,
    professional: 1,
    detective: 1,
    doctor: 1,
    citizen: numPlayers - 10, // Remaining players as simple citizens
  };
  
  // If we have fewer than 11 players, start removing roles
  if (numPlayers < 11) {
    roleDistribution.bomber = 0;
    roleDistribution.citizen += 1;
  }
  
  if (numPlayers < 10) {
    roleDistribution.illusionist = 0;
    roleDistribution.citizen += 1;
  }
  
  return assignRolesFromDistribution(playerNames, ZODIAC_ROLES, roleDistribution);
};

const assignJackRoles = (playerNames: string[]): Player[] => {
  const numPlayers = playerNames.length;
  
  // Validate number of players
  if (numPlayers < 9 || numPlayers > 12) {
    throw new Error('Jack scenario requires 9-12 players');
  }
  
  // Define how many of each role
  const roleDistribution: Record<string, number> = {
    godfather: 1,
    saulGoodman: 1,
    matador: 1,
    jackSparrow: 1,
    drWatson: 1,
    leon: 1,
    citizenKane: 1,
    constantine: 1,
    citizen: numPlayers - 8, // Remaining players as simple citizens
  };
  
  // If we have fewer than required players, adjust roles
  if (numPlayers < 11) {
    roleDistribution.matador = 0;
    roleDistribution.citizen += 1;
  }
  
  if (numPlayers < 10) {
    roleDistribution.constantine = 0;
    roleDistribution.citizen += 1;
  }
  
  return assignRolesFromDistribution(playerNames, JACK_ROLES, roleDistribution);
};

const assignRolesFromDistribution = (
  playerNames: string[], 
  roleDefinitions: Record<string, Role>, 
  distribution: Record<string, number>
): Player[] => {
  // Create array of role keys based on distribution
  const roleKeys: string[] = [];
  Object.entries(distribution).forEach(([role, count]) => {
    for (let i = 0; i < count; i++) {
      roleKeys.push(role);
    }
  });
  
  // Shuffle roles
  shuffleArray(roleKeys);
  
  // Assign roles to players
  return playerNames.map((name, index) => ({
    id: uuidv4(),
    name,
    role: roleDefinitions[roleKeys[index]],
    isAlive: true,
  }));
};

export const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const createNewGame = (playerNames: string[], scenario: ScenarioType): GameState => {
  const players = assignRoles(playerNames, scenario);
  
  // Initialize base game state
  const gameState: GameState = {
    scenario,
    players,
    phase: 'setup',
    round: 0,
    gameLog: [`Game started with ${playerNames.length} players in ${scenario} scenario.`],
  };
  
  // Initialize scenario-specific state
  if (scenario === 'zodiac') {
    // For Zodiac scenario, initialize Professional and Protector with vests
    players.forEach(player => {
      if (player.role.name === 'Professional') {
        player.hasVest = true;
      }
    });
    
    gameState.zodiacScenario = {
      roleInquiriesLeft: 2,
      bombActive: false,
    };
  }
  
  if (scenario === 'jack') {
    // For Jack scenario, initialize Godfather and Leon with vests
    players.forEach(player => {
      if (player.role.name === 'Godfather' || player.role.name === 'Leon') {
        player.hasVest = true;
      }
      
      // Initialize Jack with empty cursed array
      if (player.role.name === 'Jack Sparrow') {
        player.hasCursed = [];
      }
    });
    
    gameState.jackScenario = {
      revealedJack: false,
      beautifulMindUsed: false,
      lastActionCards: {}
    };
  }
  
  return gameState;
};

export const saveGame = (gameState: GameState): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mafiaGameState', JSON.stringify(gameState));
  }
};

export const loadGame = (): GameState | null => {
  if (typeof window !== 'undefined') {
    const savedState = localStorage.getItem('mafiaGameState');
    return savedState ? JSON.parse(savedState) : null;
  }
  return null;
}; 