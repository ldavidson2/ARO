import React from "react";
import "./CombatMap.css";

const Hexagon = (backgroundImage) => {
  return (
    <div className="hexagon">
      <div className="hexLeft"></div>
      <div className="hexMiddle">
        <img src={backgroundImage.backgroundImage} alt="hex background image" />
        <div className="hexCentre"></div>
      </div>
      <div className="hexRight"></div>
    </div>
  );
};

export default Hexagon;
