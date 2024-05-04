import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Home.css";
import microphone from "./images/microphone.png";
import send from "./images/send.png";
import toggleArrow from "./images/toggle-arrow.png";
import toggleArrowClosed from "./images/toggle-arrow-closed.png";
import meme from "./images/meme.jpg";
import TextToSpeech from "./TextToSpeech.js";
import FileUpload from "./FileUpload.js";
import nav from "./images/nav.png";
import CharacterSheet from "./CharacterSheet.js";
import CombatMap from "./CombatMap.js";

const Home = () => {
  const [message, setMessage] = useState("");
  const [displayMessage, setDisplayMessage] = useState("");
  const [generatedImageLink, setGeneratedImageLink] = useState(meme);
  const [imageButtonContainerStyle, setImageButtonContainertyle] = useState("ImageButtonContainer");
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [AROResponse, setAROResponse] = useState(
    "As your group emerges from the dense, dark embrace of the ancient forest, you find yourselves stepping into a vast, open clearing. The trees behind you whisper with the movements of smaller creatures, but ahead, the landscape opens dramatically, offering a blend of both danger and opportunity. Sunlight pierces through the canopy behind you, casting long shadows over the grass that sways gently in the breeze—a stark contrast to the oppressive darkness of the woods. Across the grassy expanse, the land subtly transforms; stone and sand disrupt the green tapestry, leading toward a snaking ribbon of water that cuts through the terrain. This stream, shimmering under the sunlight, flows across your path, creating a natural barrier that you must navigate. As your eyes trace its path, you notice that the stream widens, its banks marshy and treacherous. To the south, beyond this rocky and water-riddled obstacle zone, the terrain rises slightly. Larger rocks and boulders define this higher ground, suggesting a more solid footing but also more exposure. Here, the stream’s end can be seen flowing into a large pool, its waters dark and still, bordered by sand—a hauntingly serene mirror reflecting the chaos of your forthcoming confrontation. As you take in this sprawling scene, the signs of your adversaries are unmistakable. To your far right, near the southeastern edge of the clearing where shadows meld with sunlight, the hulking form of a Minotaur paces slowly. Its breaths are like puffs of steam in the cool air, and each step is deliberate, heavy, shaking the slight pebbles around its feet. Closer to the central stream, just off the rough path where the rocks meet the water, the massive, serpentine coils of a Hydra disturb the water, sending ripples lapping at the banks. It’s an unsettling sight—the creature’s multiple heads, each with its own lethal gaze, swivel alertly, watching for any movement. And there, near the northern boundary where the field meets the melancholic forest, a Cyclops stands, its single, eerie eye scanning the landscape. Its club, fashioned from a gnarled tree trunk, rests against its shoulder, ready to swing with devastating force. You face these formidable foes across a terrain that challenges both the mind and body. Strategy here is as important as strength—the choices you make in navigating this complex landscape could mean the difference between victory and defeat."
  );
  const [dialogHistory, setDialogHistory] = useState(["", ""]);
  const [isRecording, setIsRecording] = useState(false);
  const [asideShowing, setAsideShowing] = useState(false);
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  const [open, setOpen] = useState(false);
  const [characterSheetOpen, setCharacterSheetOpen] = useState(false);
  const [characters, setCharacters] = useState();
  const [characterId, setCharacterId] = useState();
  const [inCombat, setInCombat] = useState(true);
  const tokens = [
    {
      id: 1,
      row: 6,  // Moved from row 0 to row 6
      column: 24,
      image: "minotaur",
    },
    {
      id: 2,
      row: 6,
      column: 6,  // Moved right to column 6
      image: "cyclops",
    },
    {
      id: 3,
      row: 7,
      column: 5,  // Moved left to column 5
      image: "hydra",
    },
    {
      id: 4,
      row: 7,  // Jillie moved to row 7
      column: 4,
      image: "jillie",
    },
    {
      id: 5,
      row: 6,  // Lou moved to row 6
      column: 4,
      image: "lou",
    },
    {
      id: 6,
      row: 9,  // Giant moved down closer to the central area
      column: 23,
      image: "giant",
    }
  ];
  const terrainMap = [
    ["forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest"],
    ["forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest"],
    ["forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest"],
    ["forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest", "forest"],
    ["grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass"],
    ["grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass"],
    ["grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass"],
    ["stone", "stone", "stone", "stone", "stone", "sand", "sand", "water", "water", "water", "water", "water", "water", "water", "water", "sand", "sand", "stone", "stone", "stone", "stone", "stone", "stone", "stone", "stone"],
    ["water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water"],
    ["sand", "sand", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "water", "sand", "sand"]
  ];
  let menuRef = useRef(null);

  useEffect(() => {
    getCharacters();
    const handler = (e) => {
      if (!menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    async function getCharacters() {
      // const response = await axios.get("/getCharacters", {});
      // setCharacters(response.data);
    }

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  });

  function showCharacterSheet(characterId) {
    setCharacterId(characterId);
    setCharacterSheetOpen(true);
  }

  async function queryARO() {
    // setDisplayMessage("");
    // if (message.toLowerCase().includes("generate an image of")) {
    //   const response = await axios.get(`/queryARO/${message}`, {});
    //   setGeneratedImageLink(response.data);
    // } else {
    //   setAwaitingResponse(true);
    //   addDialogToList(message);
    //   const response = await axios.get(`/queryARO/${message}`, {});
    //   const newDialog = response.data;
    //   setAROResponse(newDialog);
    //   setAwaitingResponse(false);
    //   addDialogToList(newDialog);
    // }
  }

  function onChange(event) {
    setMessage(event.target.value);
    setDisplayMessage(event.target.value);
  }

  const handleKeypress = (event) => {
    if (event.keyCode === 13 && event.shiftKey === false) {
      document.getElementById("sendButton").click();
    }
  };

  const addDialogToList = (newDialog) => {
    setDialogHistory((prevList) => [...prevList, newDialog]);
  };

  async function startRecording() {
    setImageButtonContainertyle("ImageButtonContainerRecording");
    setIsRecording(!isRecording);
    if (recognition) {
      recognition.start();
    }
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      setDisplayMessage(transcript);
      console.log(transcript);
    };
  }

  const stopRecording = () => {
    setImageButtonContainertyle("ImageButtonContainer");
    setIsRecording(!isRecording);
    if (recognition) {
      recognition.stop();
    }
  };

  return (
    <div id="main">
      {characterSheetOpen && <CharacterSheet characterId={characterId} />}
      {open ? (
        <div className="openMenu" ref={menuRef}>
          <p>Characters</p>
          <ul>
            {characters &&
              characters.map((character) => (
                <li key={character.PK}>
                  <button
                    onClick={() => {
                      showCharacterSheet(character.PK);
                    }}
                  >
                    {character.name}
                  </button>
                </li>
              ))}
          </ul>
        </div>
      ) : (
        <div ref={menuRef}>
          <button
            className="navButton"
            onClick={() => {
              setOpen(!open);
            }}
          >
            <img src={nav} className="navIcon" alt="Navigation Menu Icon" />
          </button>
        </div>
      )}
      <div id="left">
        {inCombat ? (
          <>
            <div>
              <CombatMap rows={10} cols={25} tokens={tokens} terrainMap={terrainMap} />
            </div>
            <div className="combatResponse">
              {awaitingResponse ? (
                <div className="dots">
                  <div className="dots-pulse"></div>
                </div>
              ) : (
                <div>
                  <p>{AROResponse}</p>
                </div>
              )}
            </div>
            <div id="combatTextToSpeech">
              <TextToSpeech text={AROResponse} />
            </div>
          </>
        ) : (
          <>
            <div className="aroResponse">
              {awaitingResponse ? (
                <div className="dots">
                  <div className="dots-pulse"></div>
                </div>
              ) : (
                <div>
                  <p>{AROResponse}</p>
                </div>
              )}
            </div>
            <div id="textToSpeech">
              <TextToSpeech text={AROResponse} />
            </div>
          </>
        )}

        {/* <FileUpload /> */}
      </div>
      <div id="right">
        <form>
          <div id="generatedImage">{!inCombat && <img src={generatedImageLink} alt="Generated Image" />}</div>

          <div id="userInput">
            {isRecording ? (
              <button className={imageButtonContainerStyle} type="button" onClick={stopRecording}>
                <img className="microphoneIcon" src={microphone} alt="Microphone Button" />
              </button>
            ) : (
              <button className={imageButtonContainerStyle} type="button" onClick={startRecording}>
                <img className="microphoneIcon" src={microphone} alt="Microphone Button" />
              </button>
            )}
            <textarea value={displayMessage} onChange={onChange} onKeyDown={handleKeypress}></textarea>
            <button
              id="sendButton"
              type="button"
              onClick={() => {
                queryARO();
              }}
            >
              <img className="sendIcon" src={send} alt="Send Button" />
            </button>
          </div>
        </form>
      </div>
      {asideShowing ? (
        <div>
          <button className="asideToggleOpen" onClick={() => setAsideShowing(!asideShowing)}>
            <img className="toggleIcon" src={toggleArrow} alt="Toggle Arrow" />
          </button>
          <aside>
            <ul>
              {dialogHistory.map((str, index) => (
                <li key={index}>{str}</li>
              ))}
            </ul>
          </aside>
        </div>
      ) : (
        <button className="asideToggle" onClick={() => setAsideShowing(!asideShowing)}>
          <img className="toggleIcon" src={toggleArrowClosed} alt="Closed Toggle Arrow" />
        </button>
      )}
    </div>
  );
};

export default Home;
