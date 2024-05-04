import React, { useState, useRef, useEffect, createRef } from "react";
import Hexagon from "./Hexagon.js";
import grass from "./images/grass-tile.png"
import sand from "./images/sand-tile.png"
import water from "./images/water-tile.png"
import forest from "./images/forest-tile.png"

const CombatMap = ({ rows, cols, tokens, terrainMap }) => {
  const activeIconRef = useRef(null);
  const combatMapRef = useRef(null);
  const tokenRefs = useRef([]);
  const initialOffsetRef = useRef({ x: 0, y: 0 });
  const [iconPositions, setIconPositions] = useState({});
  const initialPositions = {};
  const terrainImages = {
    grass: grass,
    sand: sand,
    water: water,
    forest: forest,
  };

  useEffect(() => {
    console.log(terrainMap);
    console.log(terrainMap[0]);
    console.log(terrainMap[0][0]);
    tokens.forEach((token) => {
      const { row, column } = token;
      const { x, y } = calculateHexCoordinates(row, column);
      initialPositions[token.id] = { x, y };
    });

    tokenRefs.current = Array(tokens.length)
      .fill()
      .map((_, i) => tokenRefs.current[i] || createRef());

    setIconPositions(initialPositions);
    const handleResize = () => {
      centerAllTokens();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const calculateHexCoordinates = (row, col) => {
    const hexStyles = window.getComputedStyle(document.querySelector(".hexagon"));
    const hexLeftWidth = parseFloat(window.getComputedStyle(document.querySelector(".hexLeft")).borderRightWidth);
    const hexRightWidth = parseFloat(window.getComputedStyle(document.querySelector(".hexRight")).borderLeftWidth);
    let currentHexWidth = (parseFloat(hexStyles.width) + hexLeftWidth + hexRightWidth) / 2;
    let currentHexHeight = parseFloat(hexStyles.height);
    let currentTokenWidth = parseFloat(window.getComputedStyle(document.querySelector(".moveableIcon0")).width);
    let currentTokenHeight = parseFloat(window.getComputedStyle(document.querySelector(".moveableIcon0")).height);
    let combatMapRect = combatMapRef.current.getBoundingClientRect();

    let x = (col + 3) * currentHexWidth + currentHexWidth / 2;
    let y;

    if (col % 2 !== 0) {
      y = (row + 1) * currentHexHeight + currentHexHeight / 2;
    } else {
      y = row * currentHexHeight + currentHexHeight;
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

    x -= currentTokenWidth / 2;
    y -= currentTokenHeight / 2;

    return { x, y };
  };

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

  const centerAllTokens = () => {
    tokens.forEach((token) => {
        const { row, column } = token;
        const { x, y } = calculateHexCoordinates(row, column);
        setIconPositions((prevPositions) => ({
            ...prevPositions,
            [token.id]: { x, y },
          }));
      });

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
    let currentTokenWidth = parseFloat(window.getComputedStyle(document.querySelector(".moveableIcon0")).width);
    let currentTokenHeight = parseFloat(window.getComputedStyle(document.querySelector(".moveableIcon0")).height);

    if (!activeIconRef.current) return;

    const { clientX, clientY } = getCoordinates(event);
    const combatMapRect = combatMapRef.current.getBoundingClientRect();

    const offsetX = clientX - combatMapRect.left;
    const offsetY = clientY - combatMapRect.top;

    const initialX = iconPositions[activeIconRef.current].x;
    const initialY = iconPositions[activeIconRef.current].y;

    const maxX = combatMapRect.width - currentTokenWidth;
    const maxY = combatMapRect.height - currentTokenHeight;

    const newX = Math.max(Math.min(initialX + offsetX - initialOffsetRef.current.x, maxX), 0);
    const newY = Math.max(Math.min(initialY + offsetY - initialOffsetRef.current.y, maxY), 0);

    setIconPositions((prevPositions) => ({
      ...prevPositions,
      [activeIconRef.current]: { x: newX, y: newY },
    }));
  };

  async function handleMouseUp(e, tokenId, tokenRef) {
    const hexStyles = window.getComputedStyle(document.querySelector(".hexagon"));
    const hexLeftWidth = parseFloat(window.getComputedStyle(document.querySelector(".hexLeft")).borderRightWidth);
    const hexRightWidth = parseFloat(window.getComputedStyle(document.querySelector(".hexRight")).borderLeftWidth);
    let currentHexWidth = (parseFloat(hexStyles.width) + hexLeftWidth + hexRightWidth) / 2;
    let currentHexHeight = parseFloat(hexStyles.height);
    let currentTokenWidth = parseFloat(window.getComputedStyle(document.querySelector(".moveableIcon0")).width);
    let currentTokenHeight = parseFloat(window.getComputedStyle(document.querySelector(".moveableIcon0")).height);
    activeIconRef.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    if (tokenId) {
      const nearestHexCentre = calculateNearestHexCentre(tokenRef.current.getBoundingClientRect());
      if (nearestHexCentre) {
        const { x, y } = nearestHexCentre.getBoundingClientRect();
        const combatMapRect = combatMapRef.current.getBoundingClientRect();
        const offsetX = x - combatMapRect.left - currentTokenWidth / 2;
        const offsetY = y - combatMapRect.top - currentTokenHeight / 2;

        setIconPositions((prevPositions) => ({
          ...prevPositions,
          [tokenId]: { x: offsetX, y: offsetY },
        }));

        let newRow = Math.floor(offsetY / currentHexHeight);
        let newCol = Math.floor(offsetX / currentHexWidth);
        if (newCol < 0) {
          newCol = 0;
        }

        console.log(tokens[tokenId - 1]);
        tokens[tokenId - 1].row = newRow;
        tokens[tokenId - 1].column = newCol;
        console.log(tokens[tokenId - 1]);

        console.log("Token position:", { newRow, newCol });
      }
    }
  }

  const handleMouseLeave = (event) => {
    if (activeIconRef.current) {
      handleMouseUp(event, activeIconRef.current, tokenRefs.current[activeIconRef.current - 1]);
    }
  };

  return (
    <div className="combatContainer">
      <div className="combatMap" ref={combatMapRef} onMouseLeave={(e) => handleMouseLeave(e)}>
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
                <Hexagon key={`${rowIndex}-${colIndex}`} backgroundImage={terrainImages[terrainMap[rowIndex][colIndex]]} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CombatMap;
