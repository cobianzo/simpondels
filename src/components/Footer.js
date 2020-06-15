import React, { useState } from 'react';

function Footer({ gameAPI, currentPlayer, hand, players, playersAPI, gameOptions, setGameOptions, cards, cardsAPI, infoMode, setInfoMode, gameStarted, crownPlayer, setCards, characterCards, districtCards, gameEndedBy }) {
  return (
    <footer className="Footer text-center">
      {!gameStarted ? (
        <div key="e3" className="mt-2 container">
          <h5 className="text-left">Rules of the game</h5>
          <ul className="text-left">
            <li>There are 3 players</li>
            <li>
              There are 8 character cards, everyone has a number from 1 to 8.
            </li>
            <li>There are many district cards</li>
            <li>
              Every player starts with 4 district cards (that nobody else can
              see) and $2
            </li>
            <li>
              The aim of the game is to build 8 district cards, by paying their
              price with $
            </li>
            <li>
              When a card is built by a player, the rest of players can see it
            </li>
            <li>
              <b>On every hand:</b>
              <ul className="text-left">
                <li>
                  One character card is removed from the character cards' deck
                </li>
                <li>
                  Every player chooses 2 character cards. Initially nobody can
                  see the characters that other players choose.
                </li>
                <li>
                  Then the characters are called, one by one, starting by the
                  number 1 (Actor Secundario Bob)
                </li>
                <li>
                  The player with that character reveals the card, and plays. He
                  can choose between taking $2 or 1 card from the deck
                </li>
                <li>
                  Depending on his character, he will have a different power.
                </li>
              </ul>
            </li>
          </ul>
        </div>
      ) : null}
      <div
        key="d3"
        className="container d-flex flex-wrap justify-content-center"
      >
        <p className="w-100">
          {" "}
          (c) {gameOptions.title || "Simpsondels"} . Dev tools{" "}
        </p>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => {
            const gameAsString = JSON.stringify(gameAPI.saveGameAsJSON());
            document.querySelector("#debug-gamesaved").value = gameAsString;
            localStorage.setItem("gameSaved", gameAsString);
          }}
        >
          Save game
        </button>
        <button
          className="btn btn-success btn-sm"
          onClick={() => {
            const stringed = document.querySelector("#debug-gamesaved").value;
            gameAPI.loadGame(JSON.parse(stringed));
          }}
        >
          Load
        </button>
        <textarea id="debug-gamesaved">
          {localStorage.getItem("gameSaved")}
        </textarea>
        <button
          className={"btn btn-success btn-sm " + (gameOptions.dev? "active" : "")}
          onClick={() => {
            setGameOptions(
              Object.assign({...gameOptions}, { dev: !gameOptions.dev })
            );
          }}
        >
          Developer mode
        </button>
      </div>
    </footer>
  );
}

export default Footer;
