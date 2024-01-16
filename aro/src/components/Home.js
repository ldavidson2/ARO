import React, {useState} from "react";
import axios from "axios";

const Home = () => {
  const [message, setMessage] = useState();
  const [AROResponse, setAROResponse] = useState();
  
  async function queryARO() {
    const response = await axios.get(`/queryARO/${message}`, {});
    setAROResponse(response.data.data["0"].content["0"].text.value);
    console.log(response.data);
  }

  function onChange(event) {
    setMessage(event.target.value);
  }

  return (
    <div>
      <form>
        <p>{AROResponse}</p>
        <input onChange={onChange}></input>
        <button type="button" onClick={() => {
            queryARO();
          }}>Submit</button>
      </form>
    </div>
  );
};

export default Home;