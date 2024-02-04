import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Intro.css";

const Intro = () => {
  const [worlds, setWorlds] = useState();

  useEffect(() => {
    getWorlds();
  }, []);

  async function getWorlds() {
    const response = await axios.get("/getWorlds", {});
    setWorlds(response.data);
  }

  return <div></div>;
};

export default Intro;
