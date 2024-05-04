import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CharacterSheet.css";
import armorClass from "./images/armor-class.png";
import movementSpeed from "./images/movement-speed.png";

const CharacterSheet = ({ characterId }) => {
  const [character, setCharacter] = useState();

  useEffect(() => {
    getCharacter();
  });

  async function getCharacter() {
    // const response = await axios.get("/getCharacter", {
    //   params: {
    //     character_id: characterId,
    //   },
    // });
    // await setCharacter(response.data);
  }

  return (
    <div className="characterSheetContainer">
      <div className="main">
        <div className="characterSheetHeader">
          <label className="characterName">
            <input type="text" value="Jillie Beyn" /> Name
          </label>
          <label className="characterRace">
            <input type="text" value="Halfling" /> Race
          </label>
          <label className="characterClass">
            <input type="text" value="Rogue" /> Class
          </label>
          <label className="characterLevel">
            <input type="text" value="5" /> Level
          </label>
          <label className="characterExperience">
            <input type="text" value="" />
            Experience
          </label>
        </div>
        <div className="characterBody">
          <div className="bodyColumnOne">
            <div className="strength">
              <p>Strength</p>
              <input type="text" value="11" />
              <input type="text" value="0" />
            </div>
            <div className="dexterity">
              <p>Dexterity</p>
              <input type="text" value="18" />
              <input type="text" value="+4" />
            </div>
            <div className="constitution">
              <p>Constitution</p>
              <input type="text" value="14" />
              <input type="text" value="+2" />
            </div>
            <div className="intelligence">
              <p>Intelligence</p>
              <input type="text" value="12" />
              <input type="text" value="+1" />
            </div>
            <div className="wisdom">
              <p>Wisdom</p>
              <input type="text" value="10" />
              <input type="text" value="0" />
            </div>
            <div className="charisma">
              <p>Charisma</p>
              <input type="text" value="16" />
              <input type="text" value="+3" />
            </div>
          </div>
          <div className="bodyColumnTwo">
            <div className="savingThrows"></div>
            <div className="skillsContainer">
              <table>
                <tbody>
                  <tr>
                    <td>Acrobatics</td>
                    <td>
                      <input type="text" value="0" />
                    </td>
                  </tr>
                  <tr>
                    <td>Animal Handling</td>
                    <td>
                      <input type="text" value="4" />
                    </td>
                  </tr>
                  <tr>
                    <td>Arcana</td>
                    <td>
                      <input type="text" value="1" />
                    </td>
                  </tr>
                  <tr>
                    <td>Athletics</td>
                    <td>
                      <input type="text" value="3" />
                    </td>
                  </tr>
                  <tr>
                    <td>Deception</td>
                    <td>
                      <input type="text" value="0" />
                    </td>
                  </tr>
                  <tr>
                    <td>History</td>
                    <td>
                      <input type="text" value="1" />
                    </td>
                  </tr>
                  <tr>
                    <td>Insight</td>
                    <td>
                      <input type="text" value="7" />
                    </td>
                  </tr>
                  <tr>
                    <td>Intimidation</td>
                    <td>
                      <input type="text" value="0" />
                    </td>
                  </tr>
                  <tr>
                    <td>Investigation</td>
                    <td>
                      <input type="text" value="1" />
                    </td>
                  </tr>
                  <tr>
                    <td>Medicine</td>
                    <td>
                      <input type="text" value="7" />
                    </td>
                  </tr>
                  <tr>
                    <td>Nature</td>
                    <td>
                      <input type="text" value="4" />
                    </td>
                  </tr>
                  <tr>
                    <td>Perception</td>
                    <td>
                      <input type="text" value="4" />
                    </td>
                  </tr>
                  <tr>
                    <td>Performance</td>
                    <td>
                      <input type="text" value="0" />
                    </td>
                  </tr>
                  <tr>
                    <td>Persuasion</td>
                    <td>
                      <input type="text" value="0" />
                    </td>
                  </tr>
                  <tr>
                    <td>Religion</td>
                    <td>
                      <input type="text" value="4" />
                    </td>
                  </tr>
                  <tr>
                    <td>Sleight of Hand</td>
                    <td>
                      <input type="text" value="0" />
                    </td>
                  </tr>
                  <tr>
                    <td>Stealth</td>
                    <td>
                      <input type="text" value="0" />
                    </td>
                  </tr>
                  <tr>
                    <td>Survival</td>
                    <td>
                      <input type="text" value="4" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="bodyColumnThree">
            <div className="extraInfo">
              <label>
                <input type="checkbox" checked={false} />
              </label>
              <label>
                Initiative
                <input type="text" value="+4" />
              </label>
              <label>
                Proficiency Bonus
                <input type="text" value="+3" />
              </label>
            </div>
            <div className="feats">
              <h1>Feats</h1>
            </div>
            <div className="favourites">
              <h1>Favourites</h1>
            </div>
            <div className="briefInventory">
              <h1>carry weight, PP, GP, SP, CP</h1>
            </div>
            <div className="languages">
              <h1>Languages</h1>
            </div>
          </div>
        </div>
      </div>
      <div className="rightColumn">
        {/* <img src={Jillie} id="characterArt" alt="Character Art" /> */}
        <div className="movementAndArmor">
          <label>
            <img src={movementSpeed} alt="Movement Speed" />
            <input type="text" value="25" />
          </label>
          <label>
            <img src={armorClass} alt="Armor Class" />
            <input type="text" value="20" />
          </label>
        </div>
        <p className="hitpointsTitle">Hitpoints</p>
        <div className="hitpointsContainer">
          <input type="text" value="38" />
          <p>/</p>
          <input type="text" value="38" />
          <p> + </p>
          <input type="text" value="0" />
        </div>
        <p className="hitDiceTitle">Hit Dice</p>
        <div className="hitDiceContainer">
          <input type="text" value="5" />
          <p>/</p>
          <input type="text" value="5" />
          <input type="text" value="d8" />
        </div>
        <p className="deathSavesTitle">Death Saves</p>
        <div className="deathSavesContainer"></div>
        <div className="activeEffects"></div>
      </div>

      {/* <div className="leftColumn">
        <img src={Jillie} id="characterArt" alt="Character Art" />
        <div className="movementAndArmor">
          <label>
            <img src={movementSpeed} alt="Movement Speed" />
            <input type="text" value="25" />
          </label>
          <label>
            <img src={armorClass} alt="Armor Class" />
            <input type="text" value="20" />
          </label>
        </div>
        <p id="hitpointsTitle">Hitpoints</p>
        <div className="hitpointsContainer">
          <input type="text" value="38" />
          <p>/</p>
          <input type="text" value="38" />
          <p> + </p>
          <input type="text" value="0" />
        </div>
        <p id="hitDiceTitle">Hit Dice</p>
        <div className="hitDiceContainer">
          <input type="text" value="5" />
          <p>/</p>
          <input type="text" value="5" />
          <input type="text" value="d8" />
        </div>
        <p id="deathSavesTitle">Death Saves</p>
        <p>
          {" "}
          <i>section under construction...</i>
        </p>
      </div>
      <div className="mainSection">
        <div className="characterSheetHeader">
          <label>
            <input type="text" value="Jillie Beyn" /> Name
          </label>
          <label>
            <input type="text" value="Rogue" /> Class
          </label>
          <label>
            <input type="text" value="Halfling" /> Race
          </label>
          <label>
            <input type="text" value="  5" /> Level
          </label>
          {/* {character && <h1>{character.Name}</h1>} 
        </div>
        <div className="attributes">
          <label>
            Strength <input type="text" value="12" />
            <input className="abilityModifiers" type="text" value="+1" />
          </label>
          <label>
            Dexterity <input type="text" value="18" />
            <input className="abilityModifiers" type="text" value="+4" />
          </label>
          <label>
            Constitution <input type="text" value="14" />
            <input className="abilityModifiers" type="text" value="+2" />
          </label>
          <label>
            Intelligence <input type="text" value="10" />
            <input className="abilityModifiers" type="text" value="0" />
          </label>
          <label>
            Wisdom <input type="text" value="10" />
            <input className="abilityModifiers" type="text" value="0" />
          </label>
          <label>
            Charisma <input type="text" value="16" />
            <input className="abilityModifiers" type="text" value="+3" />
          </label>
        </div>
        <div id="skillsContainer">
          <table>
            <tbody>
              <tr>
                <td>Acrobatics</td>
                <td>
                  <input type="text" value="0" />
                </td>
              </tr>
              <tr>
                <td>Animal Handling</td>
                <td>
                  <input type="text" value="4" />
                </td>
              </tr>
              <tr>
                <td>Arcana</td>
                <td>
                  <input type="text" value="1" />
                </td>
              </tr>
              <tr>
                <td>Athletics</td>
                <td>
                  <input type="text" value="3" />
                </td>
              </tr>
              <tr>
                <td>Deception</td>
                <td>
                  <input type="text" value="0" />
                </td>
              </tr>
              <tr>
                <td>History</td>
                <td>
                  <input type="text" value="1" />
                </td>
              </tr>
              <tr>
                <td>Insight</td>
                <td>
                  <input type="text" value="7" />
                </td>
              </tr>
              <tr>
                <td>Intimidation</td>
                <td>
                  <input type="text" value="0" />
                </td>
              </tr>
              <tr>
                <td>Investigation</td>
                <td>
                  <input type="text" value="1" />
                </td>
              </tr>
            </tbody>
          </table>
          <table>
            <tbody>
              <tr>
                <td>Medicine</td>
                <td>
                  <input type="text" value="7" />
                </td>
              </tr>
              <tr>
                <td>Nature</td>
                <td>
                  <input type="text" value="4" />
                </td>
              </tr>
              <tr>
                <td>Perception</td>
                <td>
                  <input type="text" value="4" />
                </td>
              </tr>
              <tr>
                <td>Performance</td>
                <td>
                  <input type="text" value="0" />
                </td>
              </tr>
              <tr>
                <td>Persuasion</td>
                <td>
                  <input type="text" value="0" />
                </td>
              </tr>
              <tr>
                <td>Religion</td>
                <td>
                  <input type="text" value="4" />
                </td>
              </tr>
              <tr>
                <td>Sleight of Hand</td>
                <td>
                  <input type="text" value="0" />
                </td>
              </tr>
              <tr>
                <td>Stealth</td>
                <td>
                  <input type="text" value="0" />
                </td>
              </tr>
              <tr>
                <td>Survival</td>
                <td>
                  <input type="text" value="4" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div> */}
    </div>
  );
};

export default CharacterSheet;
