import React, { useState, useRef, useEffect, createRef } from "react";
import Hexagon from "./Hexagon.js";

const CombatMap = ({ rows, cols, tokens }) => {
  const activeIconRef = useRef(null);
  const combatMapRef = useRef(null);
  const tokenRefs = useRef([]);
  const initialOffsetRef = useRef({ x: 0, y: 0 });
  const [iconPositions, setIconPositions] = useState({});
    const initialPositions = {};
  const [hexWidth, setHexWidth] = useState(0);
  const [hexHeight, setHexHeight] = useState(0);
  const [tokenWidth, setTokenWidth] = useState(0);
  const [tokenHeight, setTokenHeight] = useState(0);

  useEffect(() => {
    const hexStyles = window.getComputedStyle(document.querySelector(".hexagon"));
    const hexLeftWidth = parseFloat(window.getComputedStyle(document.querySelector(".hexLeft")).borderRightWidth);
    const hexRightWidth = parseFloat(window.getComputedStyle(document.querySelector(".hexRight")).borderLeftWidth);
    
    setHexWidth((parseFloat(hexStyles.width) + hexLeftWidth + hexRightWidth) / 2);
    setHexHeight(parseFloat(hexStyles.height));
    setTokenWidth(parseFloat(window.getComputedStyle(document.querySelector(".moveableIcon0")).height));
    setTokenHeight(parseFloat(window.getComputedStyle(document.querySelector(".moveableIcon0")).width));

    tokens.forEach((token) => {
      const { row, column } = token;
      const { x, y } = calculateHexCoordinates(row, column);
      initialPositions[token.id] = { x, y };
    });

    tokenRefs.current = Array(tokens.length)
      .fill()
      .map((_, i) => tokenRefs.current[i] || createRef());

    setIconPositions(initialPositions);
  }, []);

  const calculateHexCoordinates = (row, col) => {
    let combatMapRect = combatMapRef.current.getBoundingClientRect();

    let x = (col + 3) * hexWidth + hexWidth / 2;
    let y;

    if (col % 2 !== 0) {
      y = (row + 1) * hexHeight + hexHeight / 2;
    } else {
      y = row * hexHeight + hexHeight;
    }

    const hexCentres = document.querySelectorAll(".hexCentre");
    let minDistance = Number.MAX_SAFE_INTEGER;
    let nearestHexCentre = null;

    hexCentres.forEach((hexCentre) => {
      const { x: hexX, y: hexY } = hexCentre.getBoundingClientRect();
      const distance = Math.sqrt(Math.pow(x - hexX, 2) + Math.pow(y - hexY, 2));

      if (distance < minDistance) {
        minDistance = distance;
        nearestHexCentre = { x: hexX, y: hexY };
      }
    });

    if (nearestHexCentre) {
      x = nearestHexCentre.x - combatMapRect.left;
      y = nearestHexCentre.y - combatMapRect.top;
    }

    x -= tokenWidth / 2;
    y -= tokenHeight / 2;

    return { x, y };
  };

  async function handleMouseDown(event, tokenId) {
    event.preventDefault();

    const { clientX, clientY } = getCoordinates(event);
    const combatMapRect = combatMapRef.current.getBoundingClientRect();

    const offsetX = clientX - combatMapRect.left;
    const offsetY = clientY - combatMapRect.top;

    setIconPositions((prevPositions) => ({
      ...prevPositions,
      [tokenId]: { x: offsetX, y: offsetY },
    }));

    activeIconRef.current = tokenId;
    initialOffsetRef.current = { x: offsetX, y: offsetY };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  const handleMouseMove = (event, tokenId) => {
    event.preventDefault();

    if (!activeIconRef.current) return;

    const { clientX, clientY } = getCoordinates(event);
    const combatMapRect = combatMapRef.current.getBoundingClientRect();

    const offsetX = clientX - combatMapRect.left;
    const offsetY = clientY - combatMapRect.top;

    const initialX = iconPositions[activeIconRef.current].x;
    const initialY = iconPositions[activeIconRef.current].y;

    const maxX = combatMapRect.width - tokenWidth;
    const maxY = combatMapRect.height - tokenHeight;

    const newX = Math.max(Math.min(initialX + offsetX - initialOffsetRef.current.x, maxX), 0);
    const newY = Math.max(Math.min(initialY + offsetY - initialOffsetRef.current.y, maxY), 0);

    setIconPositions((prevPositions) => ({
      ...prevPositions,
      [activeIconRef.current]: { x: newX, y: newY },
    }));
  };

  async function handleMouseUp(e, tokenId, tokenRef) {
    activeIconRef.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    if (tokenId) {
      const nearestHexCentre = calculateNearestHexCentre(tokenRef.current.getBoundingClientRect());
      if (nearestHexCentre) {
        const { x, y } = nearestHexCentre.getBoundingClientRect();
        const combatMapRect = combatMapRef.current.getBoundingClientRect();
        const offsetX = x - combatMapRect.left - tokenWidth / 2;
        const offsetY = y - combatMapRect.top - tokenHeight / 2;

        setIconPositions((prevPositions) => ({
          ...prevPositions,
          [tokenId]: { x: offsetX, y: offsetY },
        }));

        let newRow = Math.floor(offsetY / hexHeight);
        let newCol = Math.floor(offsetX / hexWidth);
        if (newCol < 0) {
          newCol = 0;
        }

        console.log("Token position:", { newRow, newCol });
      }
    }
  }

  const calculateNearestHexCentre = (tokenBoundingBox) => {
    const tokenCenterX = tokenBoundingBox.left + tokenBoundingBox.width / 2;
    const tokenCenterY = tokenBoundingBox.top + tokenBoundingBox.height / 2;
    const hexCentres = document.querySelectorAll(".hexCentre");

    let nearestHexCentre = null;
    let minDistance = Number.MAX_SAFE_INTEGER;

    hexCentres.forEach((hexCentre) => {
      const { x, y } = hexCentre.getBoundingClientRect();
      const distance = Math.sqrt(Math.pow(tokenCenterX - x, 2) + Math.pow(tokenCenterY - y, 2));

      if (distance < minDistance) {
        minDistance = distance;
        nearestHexCentre = hexCentre;
      }
    });
    return nearestHexCentre;
  };

  const getCoordinates = (event) => {
    if (event.type.startsWith("touch")) {
      const touch = event.touches[0];
      return { clientX: touch.clientX, clientY: touch.clientY };
    }

    return { clientX: event.clientX, clientY: event.clientY };
  };

  return (
    <div className="combatContainer">
      <div className="combatMap" ref={combatMapRef}>
        {tokens.map((token, index) => (
          <img
            ref={tokenRefs.current[index]}
            key={token.id}
            className={`moveableIcon${index}`}
            src={token.url}
            alt="Token"
            style={{
              transform: `translate(${iconPositions[token.id]?.x}px, ${iconPositions[token.id]?.y}px)`,
            }}
            onMouseDown={(e) => handleMouseDown(e, token.id)}
            onMouseMove={(e) => handleMouseMove(e, token.id)}
            onMouseUp={(e) => handleMouseUp(e, token.id, tokenRefs.current[index])}
          />
        ))}
        <div className="hexagonContainer">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div className="hexRow" key={rowIndex}>
              {Array.from({ length: cols }).map((_, colIndex) => (
                <Hexagon key={`${rowIndex}-${colIndex}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CombatMap;
