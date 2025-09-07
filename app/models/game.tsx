export interface Character {
  id: string;           
  name: string;           
  imageUrl: string;          
}

export interface Dialogue {
  id: string;            
  character: Character;   
  text: string;           
}

export interface PlayerChoice {
  text: string;           
  nextSceneId: string;    
  condition?: string;    
  effects?: string[];    
}

export interface Scene {
  id: string;                    
  dialogues?: Dialogue[];          
  playerChoices?: PlayerChoice[];  
  imageUrl: string;          
}

export interface Scenario {
  id: string;
  title: string;
  scenes: Scene[];
  startSceneId: string;
}

export interface StoryLog {
  keyMoments: string[]; // store concise descriptions of events
  summary: string; // cumulative story summary
}

interface SceneLog {
  dialog: Dialogue[]
}

//Example of chapter gen
//inputs
// Current Log, world and character log
// Generates Setting and Goals for the next scene

//Example for Scene Gen
// With goals for the scene and the setting and the world knowledge nd log, generate at least 8 dialogue moments
// Character response, either dialogue response or action
// Check if scene objectives are met and if not regenerate and repeat. 