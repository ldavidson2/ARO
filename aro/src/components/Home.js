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
  const [AROResponse, setAROResponse] = useState("");
  const [dialogHistory, setDialogHistory] = useState(["", ""]);
  const [isRecording, setIsRecording] = useState(false);
  const [asideShowing, setAsideShowing] = useState(false);
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  const [open, setOpen] = useState(false);
  const [characterSheetOpen, setCharacterSheetOpen] = useState(false);
  const [characters, setCharacters] = useState();
  const [characterId, setCharacterId] = useState();
  const tokens = [
    { id: 1, row: 7, column: 17, url: "https://preview.redd.it/3hdi9fk7ayw81.png?width=550&format=png&auto=webp&s=da1c7b6c9afcf9f8004384975f98846528a7b214" },
    { id: 2, row: 0, column: 1, url: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/7ad89412-f260-4de8-9220-746d0683c0d0/dao6dot-59c25a34-9197-47c0-9581-0226b477a288.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzdhZDg5NDEyLWYyNjAtNGRlOC05MjIwLTc0NmQwNjgzYzBkMFwvZGFvNmRvdC01OWMyNWEzNC05MTk3LTQ3YzAtOTU4MS0wMjI2YjQ3N2EyODgucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.2GFO2Z8JFOxDafOIracG6C78lhtIA5oOyGH43DWggMM" },
    { id: 3, row: 2, column: 2, url: "https://raw.githubusercontent.com/IsThisMyRealName/too-many-tokens-dnd/main/Thug/ThugElfFemaleMelee%20(10).webp" },
    // Add more tokens as needed
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
        <div>
          <CombatMap rows={8} cols={18} tokens={tokens} />
        </div>
        {awaitingResponse ? (
          <div className="dots">
            <div className="dots-pulse"></div>
          </div>
        ) : (
          <div>
            <p>{AROResponse}</p>
          </div>
        )}
        {/* <FileUpload /> */}
        <div id="textToSpeech">
          <TextToSpeech text={AROResponse} />
        </div>
      </div>
      <div id="right">
        <form>
          <div id="generatedImage">
            <img src={generatedImageLink} alt="Generated Image" />
          </div>
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
