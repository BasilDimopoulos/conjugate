import { createStoryArcForUser } from '@/app/_services/init_story';
import { currentUser } from '@clerk/nextjs/server';
import { BiSolidRightArrowCircle } from 'react-icons/bi';

const storyDetails = {
  arc_id: 'year_one_shadows_wardstone',
  arc_name: 'Shadows of the Wardstone',
  focus_character: 'louis_dimos',
  themes: [
    'legacy',
    'identity',
    'trust and betrayal',
    'forbidden knowledge',
    'friendship',
    'secrecy',
  ],
  tone_style: {
    inspiration: 'Classic Hogwarts mystery with Gothic and suspense elements',
    blend: [
      'school life',
      'mystery',
      'psychological tension',
      'low-grade horror',
    ],
    ending_feel: 'resolution with unresolved danger',
  },
  series_context: 'first_in_series',
  acts: [
    {
      act_id: 'arrival',
      description:
        'Louis Dimos arrives at Hogwarts and is sorted into Slytherin, immediately becoming a focal point for curiosity and fear. His arrival is accompanied by small, uncanny incidents — a portrait goes silent when he passes, a basin of water ripples though there is no breeze — and his unsettling aura fuels rumors. He meets Mira Althaea (kind and perceptive), Kael Stormwind (ambitious and edge-cutting), Selene Nightshade (quietly inquisitive), Cassius Veyra (charismatic, hard to read), Nyssa Corvin (loyal but cautious), and Dorian Kade (skeptical, pragmatic). Professor McGonagall greets him with thin caution and formal constraints; Professor Drakonis watches him with more open scrutiny. Social tension is immediate: some classmates shun him, others are drawn, and whispered questions mount — is Louis dangerous, or simply different? The first mystery blooms as flickering, ghostly figures appear near him, prompting students to wonder whether his Elpithes gift is attracting spirits or drawing trouble.',
      key_events: [
        'Arrival at Platform and train ride: first sideways glances and hushed conversation',
        'Sorting into Slytherin; audible murmurs and divided reactions among students',
        'Introductions to Mira, Kael Stormwind, Selene Nightshade, Cassius Veyra, Nyssa Corvin, and Dorian Kade; social alliances and rivalries seeded',
        "Professor McGonagall's private admonition; Professor Drakonis files a watchful notation",
        'A corridor incident where ghostly flickers cluster around Louis, leading to student speculation',
      ],
      quests: [
        {
          quest_id: 'q_unseen_echoes',
          name: 'Unseen Echoes',
          objective:
            'Investigate the flickering ghostly figures that seem to appear around Louis and determine whether they are manifestations of his Elpithes gift or an external haunt',
          reward:
            "A shard of spectral wax imprinted with a sigil that hums faintly in Louis's presence (a clue for later investigations)",
        },
      ],
      powers: [],
      villain_options: [],
      completed: false,
    },
    {
      act_id: 'mystery',
      description:
        "Strange disturbances spread through the school: classrooms register unexplained surges, the Forbidden Forest's edge shows unnatural shadow movement, and several students report relic-whispers in dreams. Louis's latent abilities — Parseltongue, the Elpithes resonance, and jittery shadow instincts — surface unpredictably. Sometimes his instincts warn them of danger, other times they mislead, deepening mistrust. Friends begin to doubt his transparency as he hides discoveries to protect them; teachers debate whether to restrict his access to certain texts and areas. The castle itself seems restless: a stair refuses to move for a night, a portrait refuses to answer, and the library archives hum with unheard voices. The Whispering Tome is found but resists easy reading, hinting at wards and riddles that tie into deeper school protections.",
      key_events: [
        "Magical surges recorded in Charms and Defense classes; a teacher's wand sparks oddly near Louis",
        'A student dreams of a relic that whispers a single, cryptic word; several students report similar dreams',
        'Shadow-forms observed at the edge of the Forbidden Forest watching but not approaching',
        'Argument among friends as secrets and withheld findings fray trust',
        "Discovery of the glowing seer's journal (The Whispering Tome) whose ink shifts when read aloud",
      ],
      quests: [
        {
          quest_id: 'q_whispering_tome',
          name: 'The Whispering Tome',
          objective:
            "Decipher the glowing seer's journal to extract locations and riddles that point toward hidden wards and possible relic sites",
          reward:
            'A ciphered phrase and an inked sigil that unlocks restricted commentary in the Aegis archive',
        },
      ],
      powers: [
        {
          power_id: 'p_shadow_instinct',
          name: 'Shadow Instinct',
          effect:
            'A restless, sensory tug that alerts Louis to imminent magical danger or concealment; acts like an early-warning sense',
          risk: 'Signals can be vague or false; overreliance isolates Louis emotionally and can lead him into traps created by his own instincts',
        },
      ],
      villain_options: [],
      completed: false,
    },
    {
      act_id: 'conflict',
      description:
        "A villainous effort targets a hidden Hogwarts artifact — a wardstone foundational to old protections. Louis and his uneasy band rush to defend the wardstone but face an antagonist with insider knowledge and uncanny influence over relics. Tensions erupt within the group: Kael's impatience and ambition carve at trust; Cassius's ambiguous loyalties create suspicion; some faculty, including Drakonis, press for interrogation while McGonagall urges measured caution. Louis, under stress, inadvertently uses Parseltongue and a sudden Serpent Tongue echo to command a serpent ward, shocking friends and exposing a blood-linked capability the villain references by name. The antagonist's power briefly overwhelms the defenders, shattering part of the wardstone and forcing a retreat. The group survives but is fractured, and the villain escapes with missing pieces and more questions than answers.",
      key_events: [
        'Evidence discovered that the wardstone beneath an old wing has been tampered with',
        'A midnight defensive operation where students, aided by a few cautious professors, race to the wardstone chamber',
        "During the confrontation, the antagonist names a phrase tied to Louis's lineage, provoking a panicked Serpent Tongue reaction",
        'The wardstone is struck; emergency runes slow the collapse but a visible crack remains',
        'Villain withdraws amid chaos, taking artifact fragments or vital research notes',
      ],
      quests: [
        {
          quest_id: 'q_wardstone_watch',
          name: 'Wardstone Watch',
          objective:
            'Hold the cracked wardstone long enough to inscribe temporary stabilization runes and prevent a full collapse',
          reward:
            'Emergency stabilization runes and an imprint of the wardstone glyph that resonates with the prophecy fragment',
        },
      ],
      powers: [
        {
          power_id: 'p_serpent_tongue',
          name: 'Serpent Tongue',
          effect:
            'In moments of extreme emotion, Louis can command a serpent or serpent-like ward to obey a simple directive',
          risk: 'The effect is involuntary at first, terrifies onlookers, and suggests a hereditary connection that could be exploited by enemies',
        },
      ],
      villain_options: [
        {
          name: 'Order of the Silver Serpent',
          description:
            'A secretive faction that venerates serpentine bloodlines and seeks to reclaim Hogwarts relics tied to those lineages.',
        },
        {
          name: 'Shadowed One',
          description:
            'An anonymous manipulator who uses shadow-magic and relic whispers to weaken wards and sow discord within the school.',
        },
        {
          name: 'Forgotten Relics',
          description:
            'A cabal of relic-scholars willing to corrupt artifacts for study, motivated by knowledge and experimentation rather than outright conquest.',
        },
        {
          name: 'Selwyn Drakonis',
          description:
            'A watchful figure with ties to faculty whose probing interest in ancient wards masks secretive aims and resources.',
        },
        {
          name: 'Kael Stormshadow',
          description:
            'A darker reflection of Kael Stormwind — either an alias, a family shadow, or a rival with ties to outside factions whose ambition may have crossed into betrayal.',
        },
      ],
      completed: false,
    },
    {
      act_id: 'resolution',
      description:
        "The immediate assault is driven off and the wardstone's breach is temporarily held, but the villain flees having taken fragments and knowledge. Hogwarts resumes a cautious normalcy while invisible watchposts and tightened wards hum under the surface. Socially, Louis is more isolated — many students fear him after witnessing his Serpent Tongue; a small core of allies (notably Mira and Nyssa, with a reluctant Cassius) forms a secret pact to continue the search. Faculty debate his fate in tense, private councils: Drakonis advocates strict oversight and investigation, McGonagall pushes for mentorship and measured patience. A recovered prophecy fragment uncovered during a covert Echoes in the Dark search ties the wardstone to Louis's bloodline, hinting at a 'blood-key' and a sealed chamber beneath the school. The year ends with partial victory, growing mistrust, and a deeper mystery that promises return of the threat.",
      key_events: [
        'Villain retreats amid containment; students and staff assess damage and losses',
        "A tense faculty meeting where Louis's privileges and future at Hogwarts are debated",
        'Allies form a clandestine pact to continue their investigations over the break',
        "Recovery of a prophecy fragment referencing a 'blood-key' and a sealed chamber beneath Hogwarts",
        'The visible repairs are completed but covert wards and new watchpoints are established',
      ],
      quests: [
        {
          quest_id: 'q_echoes_in_the_dark',
          name: 'Echoes in the Dark',
          objective:
            "Recover and interpret a torn prophecy fragment connected to Louis's lineage and the wardstone",
          reward:
            "A translated line that reveals a name, a partial map to the sealed chamber, and a cryptic warning about 'one who opens with a hiss'",
        },
      ],
      powers: [],
      villain_options: [],
      completed: false,
    },
  ],
  potential_outcomes: [
    {
      outcome_id: 'partial_victory',
      description:
        'The immediate attack is repelled and the wardstone stabilized temporarily, but the antagonist escapes with artifacts or knowledge that will pose threats in future years.',
    },
    {
      outcome_id: 'lingering_threat',
      description:
        'The villain remains at large or embedded within sympathizers; their plan is delayed but not thwarted, leaving Hogwarts vulnerable to future assaults.',
    },
    {
      outcome_id: 'new_mystery',
      description:
        'A recovered prophecy fragment and traces from the wardstone hint at a sealed chamber and a legacy tied to Louis’s bloodline, opening deeper mysteries to be pursued.',
    },
  ],
  synopsis:
    "Louis Dimos's first year at Hogwarts begins with suspicion when he is sorted into Slytherin and ghostly phenomena cluster around him. As his Parseltongue and Elpithes gifts emerge, he and a fracturing set of allies discover tampering at a wardstone beneath the school. Confronting a shadowed antagonist fractures trust and reveals blood-linked powers, but the villain escapes with pieces of the puzzle. The year closes on a fragile safety, a prophecy fragment about Louis’s lineage, and the promise of greater dangers to come.",
};

export default async function InitStory() {
  const user = await currentUser();
//   createStoryArcForUser(
//     user?.id || '',
//     '4ef2ac49-6f52-4fec-8313-aabb19b46097',
//     storyDetails
//   );
  return (
    <div>
      {/* <p>{user.id}</p> */}
      {/* <p
        className="inline-flex items-center gap-x-1.5 rounded-md bg-[#02323C] px-5 py-3 text-base font-medium text-white shadow-xs font-sans absolute bottom-16 right-10"
        onClick={() => {
          createStoryArcForUser(
            user?.id || '',
            '4ef2ac49-6f52-4fec-8313-aabb19b46097',
            storyDetails
          );
        }}
      >
        Begin Story
        <BiSolidRightArrowCircle
          aria-hidden="true"
          className="-mr-0.5 size-5"
        />
      </p> */}
    </div>
  );
}
