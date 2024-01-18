import React, { useState, useEffect } from "react";
import "./TextToSpeech.css";
import play from "./images/play.png";
import pause from "./images/pause.png";
import stop from "./images/stop.png";

const TextToSpeech = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [atBeginning, setAtBeginning] = useState(true);
  const [utterance, setUtterance] = useState(null);
  const [voice, setVoice] = useState(null);
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();

    setUtterance(u);
    setVoice(voices[0]);

    return () => {
      synth.cancel();
    };
  }, [text]);

  const handlePlay = () => {
    const synth = window.speechSynthesis;

    if (isPlaying) {
      synth.pause();
    } else {
      if (atBeginning) {
        setAtBeginning(false);
        utterance.voice = voice;
        utterance.pitch = pitch;
        utterance.rate = rate;
        utterance.volume = volume;
        synth.speak(utterance);
      } else {
        synth.resume();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    const synth = window.speechSynthesis;
    synth.cancel();

    setIsPlaying(false);
    setAtBeginning(true);
  };

  const handleVoiceChange = (event) => {
    const voices = window.speechSynthesis.getVoices();
    setVoice(voices.find((v) => v.name === event.target.value));
  };

  const handlePitchChange = (event) => {
    setPitch(parseFloat(event.target.value));
  };

  const handleRateChange = (event) => {
    setRate(parseFloat(event.target.value));
  };

  const handleVolumeChange = (event) => {
    setVolume(parseFloat(event.target.value));
  };

  return (
    <div>
      <div id="voiceSettings">
        <div>
          <label>Voice:</label>
          <select value={voice?.name} onChange={handleVoiceChange}>
            {window.speechSynthesis.getVoices().map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Pitch:</label>
          <input type="range" min="0.5" max="2" step="0.1" value={pitch} onChange={handlePitchChange} />
        </div>
        <div>
          <label>Speed:</label>
          <input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={handleRateChange} />
        </div>
        <div>
          <label>Volume:</label>
          <input type="range" min="0" max="1" step="0.1" value={volume} onChange={handleVolumeChange} />
        </div>
      </div>
      <div id="audioControls">
        <button onClick={handlePlay}>
          {isPlaying ? <img src={pause} alt="Pause Button" /> : <img src={play} alt="Play Button" />}
        </button>
        <button onClick={handleStop}>
          <img src={stop} alt="Stop Button" />
        </button>
      </div>
    </div>
  );
};

export default TextToSpeech;
