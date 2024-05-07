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
    ""
  );
  const [dialogHistory, setDialogHistory] = useState(["", ""]);
  const [isRecording, setIsRecording] = useState(false);
  const [asideShowing, setAsideShowing] = useState(false);
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  const [menuOpen, setMenuOpen] = useState(false);
  const [characterSheetOpen, setCharacterSheetOpen] = useState(false);
  const [characters, setCharacters] = useState();
  const [characterId, setCharacterId] = useState();
  const [tokens, setTokens] = useState();
  const [terrainMap, setTerrainMap] = useState();
  const [inCombat, setInCombat] = useState(false);
  const menuRef = useRef(null);
  const asideRef = useRef(null);
  const asideToggleRef = useRef(null);
  // const tokens =     [ {id: 1, row: 5, column: 12, image: "lou", entity: "player"}, {id: 2, row: 5, column: 6, image: "minotaur", entity: "non-player"}, {id: 3, row: 5, column: 18, image: "minotaur", entity: "non-player"}];
  // const terrainMap = [["dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP"], ["g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g"], ["dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP"], ["g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g"], ["dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP"], ["b","b","g","g","g","g","g","stb","stb","g","g","stb","g","g","g","g","g","g","g","stb","stb","g","g","g","g"], ["dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP"], ["g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g"], ["dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP","dP"], ["g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g"]];

  useEffect(() => {
    getCharacters();
    const handler = (e) => {
      if (!asideRef.current.contains(e.target) && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setAsideShowing(false);
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
    setDisplayMessage("");
    let response;
    if (message.toLowerCase().includes("generate an image of")) {
      response = await axios.get(`/queryARO/${message}`, {});
      setGeneratedImageLink(response.data);
    } else {
      setAwaitingResponse(true);
      addDialogToList(message);
      if (inCombat) {
        response = await axios.get(`/queryARO/${message + "current token positions: " + tokens}`, {});
      } else {
        response = await axios.get(`/queryARO/${message}`, {});
        console.log(response.data);
        console.log(response.data.Mode);
      }
      if (response.data.Mode.includes("combat initiation")) {
        await setTerrainMap(response.data.Terrain);
        await setTokens(response.data.Tokens);
        setInCombat(true);
      } else if (response.data.Mode.includes("combat")) {
        await setTokens(response.data.Tokens);
        setInCombat(true);
      }
      console.log(response.data.Mode);
      const newDialog = response.data.Response;
      setAROResponse(newDialog);
      setAwaitingResponse(false);
      addDialogToList(newDialog);
    }
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

  const handleTokenPositionChange = (data) => {
    setTokens(data);
  };

  return (
    <div id="main">
      {characterSheetOpen && <CharacterSheet characterId={characterId} />}
      {menuOpen ? (
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
              setMenuOpen(!menuOpen);
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
              <CombatMap
                rows={10}
                cols={25}
                tokens={tokens}
                terrainMap={terrainMap}
                onTokenPositionChange={handleTokenPositionChange}
              />
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
      <div ref={asideRef}>
        {asideShowing ? (
          <div>
            <aside>
              <ul>
                {dialogHistory.map((str, index) => (
                  <li key={index}>{str}</li>
                ))}
              </ul>
            </aside>
          </div>
        ) : (
          <button className="asideToggle" onClick={() => setAsideShowing(true)}>
            <img ref={asideToggleRef} className="toggleIcon" src={toggleArrowClosed} alt="Closed Toggle Arrow" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
