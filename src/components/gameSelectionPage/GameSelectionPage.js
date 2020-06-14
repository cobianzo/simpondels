import React, { useState, useEffect, useRef, createRef } from "react";
import GameFramesList from './GameFramesList';
import { NavLink, Redirect } from "react-router-dom";
//Apollo
import gql from 'graphql-tag';
import { graphql } from "react-apollo";
import { loadApolloClient, loadCardsFromDB } from "../../db-api";

function GamePicker() {
  const [option, setOption] = useState(null); // new-game | load-game
  const [newGameName, setNewGameName] = useState(null);
  const [newGameFrame, setNewGameFrame] = useState(null);
  const [initCards, setInitCards] = useState(null);

  // Refs to access DOM
  const inputGameName = createRef();
  useEffect(() => {
    // Prescindible. it sets the focus in the input when it is shown.
    if (inputGameName?.current)
      inputGameName.current.focus();
  }, [option]);

  // ACTIONS --------------------------------
  const selectNewGameName = (gameName) => {
    // validation of the new Game Name
    if (gameName?.length) { // TODO: check that the name is not repeated.
      setNewGameName(gameName);
    }
    
  }
  // @param gameFramePost: object returned by apollo. fields: { title, id, slug }
  const selectGameFrame = ( gameFramePost ) => {
    // TODO: given a frameFrame post, we load the cards
    console.log("selected", gameFramePost);
    // Get all AC fields.
    setNewGameFrame(gameFramePost);

    // LOADING with graphQL the cards:
    const cardsJSON = loadCardsFromDB(gameFramePost, setInitCards);
    // Need await?
  }
  const createNewGame = (gameName) => {
      alert(`creating game ${gameName}`);
  }


  // if (initCards)
  //   return <Redirect to={{ pathname: '/game/', gameProps: { initCards } }} />;
    
  if (newGameFrame)
    return <Redirect to={{ pathname: '/game/' + newGameFrame.slug, gameProps: { initCards } }} />;
    
  return (
    <div className="container">
      <div className="row text-center">
        <h1 className="col-12 my-5">Citadels</h1>
        <small className="col-12">
          You are running this application in <b>{process.env.NODE_ENV}</b>{" "}
          mode.
        </small>
        { /** Initial Screen: 2 buttons showing the 2 options  */}
        {option === null ? (
          <React.Fragment>
            <div className="col-12 col-sm-4 text-center">
              <button
                onClick={() => { 
                  setOption("new-game"); 
                  setTimeout( () => inputGameName?.current && inputGameName.current.focus(), 500);
                  } }
                className="btn btn-primary btn-lg"
              >
                Start a new game
              </button>
            </div>
            <div className="col-12 col-sm-4 text-center">
              <NavLink to={{ pathname: '/game/simpsons', gameProps: { testProp: '444'} }}>Just play Simpsondels</NavLink>
            </div>
            <div className="col-12 col-sm-4 text-center">
              <button
                onClick={() => setOption("load-game")}
                className="btn btn-primary btn-lg"
              >
                Load Game
              </button>
            </div>
          </React.Fragment>
        ) : null}
        {/** Option 1 */}
        {/** CREATE A NEW GAME UI  */}
        {option === "new-game" ? (
          <div className="col-12 text-center">
            <h2>{newGameName || "New Game"}</h2>
            {newGameName === null ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  selectNewGameName(inputGameName.current.value);
                }}
              >
                <label htmlFor="game-name" className="mt-5">
                  Enter the name of the game and click RETURN&nbsp; <br />
                  <input
                    ref={inputGameName}
                    name="game-name"
                    className="p-2 my-4 text-center"
                  ></input>
                </label>
              </form>
            ) : newGameFrame === null ? /** Option 1.1 */ (
              <label className="mt-1">
                Select the kind of the game you want to play &nbsp; <br />
                <GameFramesList actionOnSelectGameFrame={selectGameFrame} />
              </label>
              ) : /** Option 1.2 */ (
              <label className="mt-1">
                Game frame Selected: {newGameFrame.title}
              </label>
            )}
          </div>
        ) : null}

        {/** Option 2 */}
        {/** LOAD A GAME UI  */}
        {option === "load-game" ? (
          <div className="col-12 text-center">Load Game</div>
        ) : null}
      </div>
    </div>
  );
}

export default GamePicker;