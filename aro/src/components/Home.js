import React, { useState } from "react";
import axios from "axios";
import "./Home.css";

const Home = () => {
  const [message, setMessage] = useState();
  const [AROResponse, setAROResponse] = useState();
  const [dialogHistory, setDialogHistory] = useState([]);

  async function queryARO() {
    addDialogToList(message);
    const response = await axios.get(`/queryARO/${message}`, {});
    const newDialog = response.data.data["0"].content["0"].text.value;
    setAROResponse(newDialog);
    addDialogToList(newDialog);
  }

  function onChange(event) {
    setMessage(event.target.value);
  }

  const handleKeypress = (event) => {
    if (event.key === "Enter") {
      document.getElementById("buttons").click();
    }
  };

  const addDialogToList = (newDialog) => {
    setDialogHistory((prevList) => [...prevList, newDialog]);
  };

  return (
    <div>
      <form>
        <p>{AROResponse}</p>
        <div id="userInput">
        <input onChange={onChange}></input>
        <button
          type="button"
          onClick={() => {
            queryARO();
          }}
        >
          Submit
        </button>
        </div>
      </form>
      <aside>
        <ul>
          {dialogHistory.map((str, index) => (
            <li key={index}>{str}</li>
          ))}
        </ul>
      </aside>
    </div>
  );
};

export default Home;
