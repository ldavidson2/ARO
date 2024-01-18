import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Home.css";
import microphone from "./images/microphone.png";
import send from "./images/send.png";
import toggleArrow from "./images/toggle-arrow.png";
import toggleArrowClosed from "./images/toggle-arrow-closed.png";
import meme from "./images/meme.jpg";
import TextToSpeech from './TextToSpeech.js';

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

  // useEffect(() => {
  //   if (generatedImageLink == "") {
  //   }
  // }, []);

  async function queryARO() {
    setDisplayMessage("");
    if (message.toLowerCase().includes("generate an image of")) {
      const response = await axios.get(`/queryARO/${message}`, {});
      setGeneratedImageLink(response.data);
    } else {
      setAwaitingResponse(true);
      addDialogToList(message);
      const response = await axios.get(`/queryARO/${message}`, {});
      const newDialog = response.data;
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
    if (event.keyCode === 13 && event.shiftKey == false) {
      document.getElementById("sendButton").click();
    }
  };

  const addDialogToList = (newDialog) => {
    setDialogHistory((prevList) => [...prevList, newDialog]);
  };

  async function startRecording() {
    setImageButtonContainertyle("ImageButtonContainerRecording");
    console.log("recording started");
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
    console.log("recording stopped");
    setIsRecording(!isRecording);
    if (recognition) {
      recognition.stop();
    }
  };

  return (
    <div id="main">
      <div id="left">
        {awaitingResponse ? (
          <div class="dots">
            <div class="dots-pulse"></div>
          </div>
        ) : (
          <div>
          <TextToSpeech text={AROResponse} />
          <p>{AROResponse}</p>
          </div>
        )}
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
