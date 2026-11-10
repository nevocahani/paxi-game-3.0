/* Edit this file to add or revise the room challenges. answerIndex is zero-based. */
window.GAME_DATA = {
  rooms: [
    {
      id: "artemis-1",
      title: "Artemis I",
      kicker: "MISSION 01 / LUNAR ORBIT",
      subtitle: "THE UNCREWED TEST FLIGHT",
      note: "A strange signal is coming from the Moon's far side. The Zippy Tribe is guarding the next door.",
      radio: "“Can you hear me out there?”",
      challenges: [
        {
          type: "question",
          title: "A test flight with a purpose",
          prompt: "What was the main goal of the uncrewed Artemis I test flight?",
          options: [
            "Land a crew on the Moon and establish the first human settlement.",
            "Test the Orion spacecraft and its heat shield from end to end in real mission conditions before risking human lives.",
            "Destroy asteroids that threatened Earth's orbit.",
            "See whether the Zippy Tribe could survive inside a human spacecraft."
          ],
          answerIndex: 1,
          source: "https://www.nasa.gov/missions/artemis/artemis-i/"
        },
        {
          type: "question",
          title: "The fiery return",
          prompt: "About how fast was Orion traveling when it re-entered Earth's atmosphere and tested its heat shield?",
          options: ["10,000 km/h", "40,000 km/h", "100,000 km/h"],
          answerIndex: 1,
          source: "https://www.nasa.gov/missions/artemis/artemis-i/"
        },
        {
          type: "code",
          title: "Unlock the restraints",
          prompt: "The Zippy leader left a code clue: join the number of the first question to the first digit of Orion's correct re-entry speed.",
          answer: "14",
          hint: "Use question 1 and the first digit of 40,000."
        }
      ]
    },
    {
      id: "artemis-2",
      title: "Artemis II",
      kicker: "MISSION 02 / CREWED LUNAR FLYBY",
      subtitle: "THE FIRST CREWED ORION FLIGHT",
      note: "Paxsi's voice is breaking up. The next signal is coming from the crew's flight log.",
      radio: "“I can see your signal getting closer!”",
      challenges: [
        {
          type: "question",
          title: "The flight profile",
          prompt: "What was the defining feature of Artemis II's trip around the Moon?",
          options: [
            "A crewed lunar flyby on a free-return trajectory, with no landing.",
            "A direct landing at the lunar south pole.",
            "A crewed orbit around Mars.",
            "An immediate docking with the International Space Station."
          ],
          answerIndex: 0,
          source: "https://www.nasa.gov/missions/artemis/artemis-2/"
        },
        {
          type: "question",
          title: "Four explorers",
          prompt: "Which agencies were represented on the four-person Artemis II crew?",
          options: [
            "NASA and the Canadian Space Agency (CSA).",
            "NASA only.",
            "NASA and the Russian space agency.",
            "NASA, ESA, and the Canadian Space Agency."
          ],
          answerIndex: 0,
          source: "https://www.nasa.gov/missions/artemis/artemis-2/"
        },
        {
          type: "question",
          title: "A life-support checkout",
          prompt: "What important spacecraft systems did Artemis II test with astronauts aboard in deep space?",
          options: [
            "Systems for landing and driving on Mars.",
            "Life-support and other Orion systems, including air, water, and temperature control.",
            "A launch system that uses no fuel.",
            "A permanent nuclear power station for the Moon."
          ],
          answerIndex: 1,
          source: "https://www.nasa.gov/missions/artemis/artemis-2/"
        },
        {
          type: "question",
          title: "A careful journey home",
          prompt: "How did Orion's free-return trajectory help the Artemis II crew?",
          options: [
            "The Moon's and Earth's gravity naturally guided Orion back toward Earth after the flyby.",
            "It put Orion into a permanent orbit around the Moon.",
            "It allowed Orion to land without parachutes.",
            "It sent Orion directly to the International Space Station."
          ],
          answerIndex: 0,
          source: "https://www.nasa.gov/missions/artemis/artemis-2/"
        },
        {
          type: "question",
          title: "Splashdown",
          prompt: "In which ocean did Orion splash down after Artemis II?",
          options: ["The Atlantic Ocean", "The Indian Ocean", "The Pacific Ocean", "The Arctic Ocean"],
          answerIndex: 2,
          source: "https://www.nasa.gov/missions/artemis/artemis-2/"
        }
      ]
    },
    {
      id: "artemis-3",
      title: "Artemis III",
      kicker: "MISSION 03 / LANDER DEMONSTRATIONS",
      subtitle: "TESTING THE NEXT LUNAR LANDERS",
      note: "One final room separates your crew from Paxsi. The tribe's newest questions are about the next mission.",
      radio: "“I'm right behind that door. Hurry!”",
      challenges: [
        {
          type: "question",
          title: "A mission plan that changed",
          prompt: "What is NASA's current plan for Artemis III?",
          options: [
            "Demonstrate spacecraft and lander operations in low Earth orbit before future lunar landings.",
            "Land astronauts on the Moon and build a permanent city there.",
            "Send the crew to orbit Mars.",
            "Replace Orion with the Apollo spacecraft."
          ],
          answerIndex: 0,
          source: "https://www.nasa.gov/missions/artemis/nasas-artemis-iii-mission-to-test-future-moon-lander-operations/"
        },
        {
          type: "question",
          title: "Practice before landing",
          prompt: "What will crews and flight controllers practice during the planned Artemis III mission?",
          options: [
            "Rendezvous, docking, habitation, and operating procedures for future lunar missions.",
            "Building a nuclear power station on the Moon.",
            "Driving a rover on Mars.",
            "Launching Orion without a rocket."
          ],
          answerIndex: 0,
          source: "https://www.nasa.gov/missions/artemis/nasas-artemis-iii-mission-to-test-future-moon-lander-operations/"
        },
        {
          type: "question",
          title: "A team effort",
          prompt: "How many astronauts are planned to fly aboard Orion on Artemis III?",
          options: ["Two", "Three", "Four", "Six"],
          answerIndex: 2,
          source: "https://www.nasa.gov/missions/artemis/nasas-artemis-iii-mission-to-test-future-moon-lander-operations/"
        }
      ]
    }
  ],
  assets: {
    scene: "background_animated_480.gif",
    groundTop: "grass_top.png",
    groundFill: "dirt.png",
    logo: "logo-pixelart-512-preview.png",
    walkRight: "Astronaut-Character-Sprite-Walking-Forwa-32x32px-frames",
    walkLeft: "mirrored-frames",
    jumpRight: "jump-frames",
    jumpLeft: "jump-frames-mirrored",
    doorClosed: "sprite-fusion-pixel-art-generator-32x32.png",
    doorOpen: "door-open-frames",
    paxsi: [
      "paxi/WhatsApp%20Image%202026-11-10%20at%2015.55.55.jpeg",
      "paxi/WhatsApp%20Image%202026-11-10%20at%2015.55.55434.jpeg"
    ]
  }
};
