/* Edit each mission pool here. A fresh run chooses a random subset for each mission. */
const q = (id, title, prompt, options, answerIndex, lesson, paxsiTip, source, artifact = null) =>
  ({ id, type: "question", title, prompt, options, answerIndex, lesson, paxsiTip, source, ...(artifact ? { artifact } : {}) });
const art = (name, icon, x, clue) => ({ name, icon, x, clue });
const nasa1 = "https://www.nasa.gov/mission/artemis-i/";
const nasa2 = "https://www.nasa.gov/mission/artemis-ii/";
const nasa3 = "https://www.nasa.gov/missions/artemis/nasas-artemis-iii-mission-to-test-future-moon-lander-operations/";

window.GAME_DATA = {
  rooms: [
    {
      id: "artemis-1", title: "Artemis I", kicker: "MISSION 01 / UNCREWED TEST FLIGHT",
      subtitle: "THE UNCREWED TEST FLIGHT",
      note: "LANDING ZONE / Leave the Orion lander, follow the stairs, and reach the mission console.",
      paxsiLine: "“Can you hear me out there?”", randomCount: 4,
      fixedFirst: {
        id: "a1-match-code", type: "code", answerMode: "digits", answerLength: 6, answer: "541623",
        title: "Riddle 1 · Find the code",
        brief: "Match each mission description to the numbered Artemis I component. Enter the six component numbers in A–F order.",
        lesson: "The Zippy leader mixed up the Artemis I mission file. Match each description to one numbered mission component, then read your answers from A to F to unlock the code.",
        paxsiTip: "Use each numbered component once. The descriptions are out of order—match them, then enter the numbers in A–F order.",
        prompt: "Match descriptions A–F to the numbered mission components. Use each number once, then check your matches.",
        placeholder: "······",
        matching: {
          categories: ["Heat shield test", "Lunar orbit", "Launch vehicle", "Uncrewed test flight", "Mission duration and ending", "Maximum distance in space"],
          descriptions: [
            "A. Orion’s roughly 25-day mission ended in December 2022 with a Pacific Ocean splashdown.",
            "B. The main goal was to test spacecraft systems end to end before risking human lives.",
            "C. Orion re-entered the atmosphere at about 40,000 km/h to test its heat shield.",
            "D. Orion traveled about 430,000 km from Earth, a record distance for a human-rated spacecraft.",
            "E. Orion followed a unique, distant orbit around the Moon called a Distant Retrograde Orbit.",
            "F. The Space Launch System (SLS) rocket launched Orion."
          ]
        },
        source: nasa1
      },
      questionPool: [
        q("a1-duration", "A long first flight", "About how long did Artemis I last?", ["About 6 days", "About 10 days", "About 25 days", "About 50 days"], 2, "Artemis I launched on November 16, 2022, and Orion splashed down on December 11. The uncrewed flight lasted about 25 days.", "It lasted a little over three weeks.", nasa1),
        q("a1-launcher", "The giant launcher", "Which rocket launched Orion on Artemis I?", ["Starship", "Space Launch System (SLS)", "Falcon 9", "Saturn V"], 1, "NASA’s Space Launch System (SLS) rocket launched Orion on Artemis I.", "Look for NASA’s heavy-lift rocket built for Artemis.", nasa1),
        q("a1-apollo", "A record from Apollo", "In which year did the last crewed Apollo mission land on the Moon?", ["1969", "1972", "1985", "2022"], 1, "Apollo 17 was the last crewed lunar landing of the Apollo program. Its astronauts explored the Moon in December 1972.", "Apollo 17 took place after Apollo 11’s first landing in 1969.", "https://www.nasa.gov/missions/apollo/apollo-17/"),
        q("a1-orbit", "A distant lunar orbit", "What was the name of the distant orbit Orion reached around the Moon?", ["Distant Retrograde Orbit", "Fast Free Return", "Low Earth Transfer", "Central Polar Orbit"], 0, "During Artemis I, Orion traveled in a Distant Retrograde Orbit (DRO), a large, distant orbit around the Moon.", "The name includes “Distant” and “Retrograde.”", nasa1),
        q("a1-systems", "More than a heat shield", "Besides the heat shield, which group of systems was tested on Artemis I?", ["Propulsion, communications, and navigation", "Water filtration, oxygen farming, and heating only", "Ice mining, drilling, and sample collection", "Anchoring, vertical landing, and sail deployment"], 0, "Artemis I checked Orion and its connected systems in deep space, including propulsion, communications, and navigation.", "Think about systems needed to move, communicate, and find the way.", nasa1),
        q("a1-splashdown", "Orion’s ocean landing", "In which ocean did Orion splash down at the end of Artemis I?", ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean"], 2, "Orion returned to Earth and splashed down in the Pacific Ocean on December 11, 2022.", "The capsule landed in the largest ocean.", nasa1),
        q("a1-speed", "The fiery return", "About how fast was Orion traveling when it re-entered Earth’s atmosphere?", ["10,000 km/h", "40,000 km/h", "100,000 km/h", "200,000 km/h"], 1, "Orion re-entered Earth’s atmosphere at about 40,000 km/h. Its heat shield protected the capsule from intense heat.", "The correct speed begins with a 4 and has four zeroes.", nasa1),
        q("a1-purpose", "Why fly without a crew?", "What was the main goal of the uncrewed Artemis I test flight?", ["Land astronauts and start a settlement", "Test Orion and its heat shield in real mission conditions before flying people", "Destroy asteroids threatening Earth", "Test whether the Zippy Tribe could live in Orion"], 1, "Artemis I tested Orion and its systems in real mission conditions before astronauts flew aboard.", "NASA wanted to learn how the spacecraft performed before a crew relied on it.", nasa1)
      ]
    },
    {
      id: "artemis-2", title: "Artemis II", kicker: "MISSION 02 / CREWED LUNAR FLYBY",
      subtitle: "THE FIRST CREWED ORION FLIGHT",
      note: "ORBITAL FLIGHT DECK / Find each mission record and press E to scan it. Clear the archive to activate the airlock gate.",
      paxsiLine: "“I can see your signal getting closer!”", randomCount: 3,
      questionPool: [
        q("a2-profile", "The flight profile", "What was the defining feature of Artemis II’s trip around the Moon?", ["A crewed lunar flyby on a free-return path, with no landing", "A direct landing at the lunar south pole", "A crewed orbit around Mars", "An immediate docking with the ISS"], 0, "Artemis II carried astronauts around the Moon and back without landing. Orion followed a free-return path home after the lunar flyby.", "A flyby means passing the Moon; the crew did not land.", nasa2, art("Flight Recorder", "recorder", 126, "ARTEMIS II FLIGHT PATH: crewed lunar flyby → free-return trajectory → Earth. No landing.")),
        q("a2-crew", "Four explorers", "Which agencies were represented on Artemis II’s four-person crew?", ["NASA and the Canadian Space Agency", "NASA only", "NASA and the Russian space agency", "NASA, ESA, and CSA"], 0, "The crew included NASA astronauts Reid Wiseman, Victor Glover, and Christina Koch, plus CSA astronaut Jeremy Hansen.", "Count three NASA astronauts and one Canadian crewmate.", nasa2, art("Crew Manifest", "manifest", 182, "CREW MANIFEST: 3 NASA astronauts + 1 Canadian Space Agency astronaut = 4 crew.")),
        q("a2-life-support", "A life-support checkout", "Which important spacecraft systems did Artemis II test with a crew aboard?", ["Mars landing systems", "Life support, including air, water, and temperature control", "A launch system that uses no fuel", "A permanent Moon power station"], 1, "With astronauts aboard in deep space, Artemis II tested Orion systems that support the crew, including air, water, and cabin temperature control.", "Think of what a crew needs every minute: air, water, and a safe cabin.", nasa2, art("Life-Support Module", "life-support", 286, "ORION LIFE SUPPORT: breathable air, water, and cabin temperature control.")),
        q("a2-duration", "Ten days in deep space", "About how long did the Artemis II mission last?", ["About 4 days", "About 10 days", "About 25 days", "About 40 days"], 1, "Artemis II launched on April 1, 2026, and returned on April 10. The crewed mission lasted about ten days.", "The mission lasted from April 1 to the Pacific splashdown on April 10.", "https://www.nasa.gov/news-release/nasa-welcomes-record-setting-artemis-ii-moonfarers-back-to-earth/", art("Flight Timeline", "map", 392, "FLIGHT TIMELINE: Artemis II launched April 1 and splashed down April 10, 2026.")),
        q("a2-splashdown", "Splashdown", "In which ocean did Orion splash down after Artemis II?", ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean"], 2, "Orion returned to Earth and splashed down in the Pacific Ocean. Recovery crews met the astronauts at sea.", "Orion returned by parachute and landed in the ocean.", "https://www.nasa.gov/news-release/nasa-welcomes-record-setting-artemis-ii-moonfarers-back-to-earth/", art("Recovery Beacon", "beacon", 142, "RECOVERY LOG: Orion splashed down in the Pacific Ocean."))
      ]
    },
    {
      id: "artemis-3", title: "Artemis III", kicker: "MISSION 03 / LANDER DEMONSTRATIONS",
      subtitle: "TESTING THE NEXT LUNAR LANDERS",
      note: "LANDER TEST BAY / Scan the test tags and docking targets to reveal each challenge.",
      paxsiLine: "“I'm right behind that door. Hurry!”", randomCount: 4,
      questionPool: [
        q("a3-mission", "A mission plan that changed", "What is NASA’s current plan for Artemis III?", ["Test Orion and commercial lunar lander operations in low Earth orbit", "Land astronauts and build a Moon city", "Send the crew to orbit Mars", "Replace Orion with Apollo"], 0, "NASA’s current Artemis III plan is a crewed demonstration mission in low Earth orbit. The crew will test integrated Orion and commercial lunar lander operations; it is not currently planned as a lunar landing.", "Use the current test-flight plan, not the older plan for an Artemis III Moon landing.", nasa3, art("Lander Test Tag", "lander", 86, "CURRENT PLAN: Artemis III will test Orion and commercial lander systems in low Earth orbit.")),
        q("a3-practice", "Practice before landing", "What will crews and flight controllers practice during Artemis III?", ["Rendezvous, docking, habitation, and operations for future lunar missions", "Building a nuclear power station on the Moon", "Driving a rover on Mars", "Launching Orion without a rocket"], 0, "During the planned low-orbit test, crews and flight controllers will practice rendezvous, docking, habitation, and operations with lunar lander test vehicles.", "Rendezvous brings spacecraft together in orbit; docking is their careful connection.", nasa3, art("Docking Target", "target", 270, "FLIGHT TEST CHECKLIST: rendezvous, docking, habitation, and operating procedures.")),
        q("a3-crew", "An international crew", "How many astronauts are planned to fly aboard Orion on Artemis III?", ["Two", "Three", "Four", "Six"], 2, "NASA named four astronauts for Artemis III: three NASA astronauts and ESA astronaut Luca Parmitano.", "The crew is three NASA astronauts plus one ESA astronaut.", "https://www.nasa.gov/news-release/nasa-marches-toward-artemis-iii-mission-in-2027-names-crew-members/", art("Crew Cabin Panel", "manifest", 390, "CREW PLAN: 4 astronauts, including one ESA astronaut.")),
        q("a3-duration", "Two weeks in orbit", "How long is the current Artemis III demonstration mission planned to last?", ["About 6 days", "About 10 days", "About 14 days", "About 25 days"], 2, "NASA’s current mission outline describes Artemis III as a planned 14-day demonstration in low Earth orbit.", "The planned mission length is two weeks.", nasa3, art("Flight Timeline", "map", 142, "MISSION OUTLINE: the planned low-orbit Artemis III demonstration is 14 days.")),
        q("a3-partners", "Commercial lander partners", "Which companies are developing lunar lander test vehicles for Artemis III demonstrations?", ["Blue Origin and SpaceX", "Boeing and Virgin Galactic", "ESA and JAXA", "Roscosmos and Blue Origin"], 0, "NASA’s updated Artemis III demonstration plans include test vehicles from both Blue Origin and SpaceX.", "The test vehicles come from two U.S. commercial space companies.", nasa3, art("Partner Display", "target", 198, "LANDER TEST ARTICLES: Blue Origin’s Blue Moon and SpaceX’s Starship.")),
        q("a3-apollo", "The last lunar landing", "In which year did Apollo 17 make the last crewed landing on the Moon?", ["1969", "1972", "1985", "2022"], 1, "Apollo 17 was the last crewed lunar landing, in 1972. Artemis III is now planned as an orbital lander-demonstration mission.", "Apollo 17 was the last mission to land people on the Moon.", "https://www.nasa.gov/missions/apollo/apollo-17/", art("Apollo Archive", "manifest", 330, "APOLLO 17: the last crewed Moon landing took place in December 1972.")),
        q("a3-ice", "Why lunar ice matters", "Why are lunar water-ice deposits important to future Artemis exploration?", ["They may provide a useful resource for crews and lunar infrastructure", "They cool Orion’s engines before launch from Earth", "They prove that life exists on the Moon", "They prevent temperature changes on the lunar surface"], 0, "Water ice in permanently shadowed lunar regions could support future exploration by providing water and useful materials for sustained activity.", "Think about how a local resource could help future crews.", "https://science.nasa.gov/moon/moon-water/", art("Lunar Resource Map", "map", 110, "LUNAR POLAR ICE: a potential resource for future exploration and infrastructure."))
      ]
    }
  ],
  finalChallenge: {
    id: "final-cipher", type: "code", answerMode: "letters", answerLength: 20,
    answer: "welldoneyoufoundpaxi", title: "Final riddle · Secret writing",
    brief: "Use the symbol key to decode the Zippy leader’s final message.",
    lesson: "The Zippy leader left one last message in secret writing. Use the substitution key to translate each symbol into a letter. Enter the decoded words; spaces and punctuation are optional.",
    paxsiTip: "Match each symbol to its letter, then read the encrypted message from left to right.",
    prompt: "Decode the message and enter the words it says.",
    placeholder: "TYPE THE SECRET MESSAGE",
    cipher: {
      key: [["☺","A"],["☻","B"],["♣","C"],["♦","D"],["♠","E"],["►","F"],["♂","G"],["◄","H"],["§","I"],["♥","J"],["▼","K"],["▲","L"],["♀","M"],["❥","N"],["◐","O"],["▣","P"],["✖","Q"],["☿","R"],["☀","S"],["☂","T"],["♫","U"],["❁","V"],["❀","W"],["☼","X"],["✩","Y"],["✿","Z"]],
      message: "❀♠▲▲ ♦◐❥♠, ✩◐♫ ►◐♫❥♦ ▣☺☼§!!!!!"
    },
  },
  assets: {
    scene: "background_animated_480.gif", lander: "spaceship_pixel_art_only.png", rocket: "rocket.png", ship: "ship.png",
    groundTop: "grass_top.png", groundFill: "dirt.png", logo: "logo-pixelart-512-preview.png",
    walkRight: "Astronaut-Character-Sprite-Walking-Forwa-32x32px-frames", walkLeft: "mirrored-frames",
    jumpRight: "jump-frames", jumpLeft: "jump-frames-mirrored",
    doorClosed: "sprite-fusion-pixel-art-generator-32x32.png", doorOpen: "door-open-frames",
    paxsi: ["paxi/WhatsApp%20Image%202026-11-10%20at%2015.55.55.jpeg", "paxi/WhatsApp%20Image%202026-11-10%20at%2015.55.55434.jpeg"]
  }
};
