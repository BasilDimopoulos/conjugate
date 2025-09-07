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

// {
//   "id": "quest_intro",
//   "title": "The Old Forest",
//   "startSceneId": "scene1",
//   "scenes": [
//     {
//       "id": "scene1",
//       "dialogues": [
//         {
//           "id": "d1",
//           "character": {
//             "id": "npc_1",
//             "name": "Old Man",
//             "image": "oldman.png"
//           },
//           "text": "Hello, traveler. The forest ahead is dangerous."
//           "imageUrl" : "image.ping"
//         }
//       ],
//       "playerChoices": [
//         {
//           "text": "Thanks for the warning.",
//           "nextSceneId": "scene2"
//         },
//         {
//           "text": "I can handle myself.",
//           "nextSceneId": "scene3"
//         }
//       ]
//     },
//     {
//       "id": "scene2",
//       "dialogues": [
//         {
//           "id": "d2",
//           "character": {
//             "id": "npc_1",
//             "name": "Old Man",
//             "image": "oldman.png"
//           },
//           "text": "Stay safe, then."
//         }
//       ],
//       "playerChoices": []
//     },
//     {
//       "id": "scene3",
//       "dialogues": [
//         {
//           "id": "d3",
//           "character": {
//             "id": "npc_1",
//             "name": "Old Man",
//             "image": "oldman.png"
//           },
//           "text": "Very well. May fortune be with you."
//         }
//       ],
//       "playerChoices": []
//     }
//   ]
// }
