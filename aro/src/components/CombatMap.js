import React, { useState, useRef, useEffect } from "react";
import Hexagon from "./Hexagon.js";
import jillieToken from "./images/Jillie-Token.png";

const CombatMap = ({ rows, cols, tokens }) => {
  const [iconPositions, setIconPositions] = useState({
    token: { x: 50, y: 380 },
  });
  const [hexWidth, setHexWidth] = useState(0);
  const [hexHeight, setHexHeight] = useState(0);
  const activeIconRef = useRef(null);
  const initialOffsetRef = useRef({ x: 0, y: 0 });
  const combatMapRef = useRef(null);
  const containerRef = useRef(null);
  const tokenRef = useRef(null);

  useEffect(() => {
    const hexStyles = window.getComputedStyle(document.querySelector(".hexagon"));
    const hexLeftWidth = parseFloat(window.getComputedStyle(document.querySelector(".hexLeft")).borderRightWidth);
    const hexRightWidth = parseFloat(window.getComputedStyle(document.querySelector(".hexRight")).borderLeftWidth);
    setHexWidth((parseFloat(hexStyles.width) + hexLeftWidth + hexRightWidth) / 2);
    setHexHeight(parseFloat(hexStyles.height));
    const moveableIcon = tokenRef.current;
    const containerHeight = containerRef.current.getBoundingClientRect().height;
    const initialTokenY = containerHeight - containerHeight / 2.15;
    const initialCoordinates = calculateHexCoordinates(5, 8);
    setIconPositions({
      token: { x: initialCoordinates.x, y: initialCoordinates.y },
    });
    calculateNearestHexCentre();
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

    x -= tokenRef.current.offsetWidth / 2;
    y -= tokenRef.current.offsetHeight / 2;

    return { x, y };
  };

  const handleMouseDown = (event, icon) => {
    event.preventDefault();

    const { clientX, clientY } = getCoordinates(event);
    const combatMapRect = combatMapRef.current.getBoundingClientRect();

    const offsetX = clientX - combatMapRect.left;
    const offsetY = clientY - combatMapRect.top;

    setIconPositions((prevPositions) => ({
      ...prevPositions,
      [icon]: { x: offsetX, y: offsetY },
    }));

    activeIconRef.current = icon;
    initialOffsetRef.current = { x: offsetX, y: offsetY };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event) => {
    event.preventDefault();

    if (!activeIconRef.current) return;

    const { clientX, clientY } = getCoordinates(event);
    const combatMapRect = combatMapRef.current.getBoundingClientRect();

    const offsetX = clientX - combatMapRect.left;
    const offsetY = clientY - combatMapRect.top;

    const initialX = iconPositions[activeIconRef.current].x;
    const initialY = iconPositions[activeIconRef.current].y;

    const maxX = combatMapRect.width - tokenRef.current.offsetWidth;
    const maxY = combatMapRect.height - tokenRef.current.offsetHeight;

    const newX = Math.max(Math.min(initialX + offsetX - initialOffsetRef.current.x, maxX), 0);
    const newY = Math.max(Math.min(initialY + offsetY - initialOffsetRef.current.y, maxY), 0);

    setIconPositions((prevPositions) => ({
      ...prevPositions,
      [activeIconRef.current]: { x: newX, y: newY },
    }));
  };

  const handleMouseUp = () => {
    activeIconRef.current = null;

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    const nearestHexCentre = calculateNearestHexCentre();
    if (nearestHexCentre) {
      const { x, y } = nearestHexCentre.getBoundingClientRect();
      const combatMapRect = combatMapRef.current.getBoundingClientRect();
      const offsetX = x - combatMapRect.left - tokenRef.current.offsetWidth / 2;
      const offsetY = y - combatMapRect.top - tokenRef.current.offsetHeight / 2;

      setIconPositions((prevPositions) => ({
        ...prevPositions,
        token: { x: offsetX, y: offsetY },
      }));

      let newRow = Math.floor(offsetY / hexHeight);
      let newCol = Math.floor(offsetX / hexWidth);
      if (newCol < 0) {
        newCol = 0;
      }

      console.log("Token position:", { newRow, newCol });
    }
  };

  const calculateNearestHexCentre = () => {
    const tokenBoundingBox = tokenRef.current.getBoundingClientRect();
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

  const handleTouchStart = (event, icon) => {
    handleMouseDown(event, icon);
    document.addEventListener("touchmove", handleMouseMove, { passive: false });
    document.addEventListener("touchend", handleMouseUp);
  };

  return (
    <div className="combatContainer" ref={containerRef}>
      <div className="combatMap" ref={combatMapRef}>
        <img
          className="moveableIcon"
          src={jillieToken}
          alt="Token"
          style={{
            transform: `translate(${iconPositions.token.x}px, ${iconPositions.token.y}px)`,
          }}
          onMouseDown={(e) => handleMouseDown(e, "token")}
          onTouchStart={(e) => handleTouchStart(e, "token")}
          ref={tokenRef}
        />
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div className="hexRow" key={rowIndex}>
            {Array.from({ length: cols }).map((_, colIndex) => (
              <Hexagon key={`${rowIndex}-${colIndex}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CombatMap;
