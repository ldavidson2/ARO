import React from "react";
import "./CombatMap.css";

const Hexagon = () => {
  return (
    <div className="hexagon" >
      <div className="hexLeft"></div>
      <div className="hexMiddle"><div className="hexCentre"></div></div>
      <div className="hexRight"></div>
    </div>
  );
};

export default Hexagon;
