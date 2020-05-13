import React from 'react'
import Player from './Player'

// @players: array of player { name: 'Peter', cards: [ ... ], money: 5 }
function Players({ players, currentPlayer, crownPlayer, cards, setCards, cardsAPI, playersAPI, gameOptions, gameEndedBy, hand, infoMode, setInfoMode }) {
  
  return (
    <div className="Players">
      {
        players.map( (player, index) => {
         const isCurrentPlayer = index === currentPlayer;
         const wrapperClass = "Players__player-wrapper " + (isCurrentPlayer? 'Players__player-wrapper--active' : '');
         return (
            <div key={'Player'+index} className={wrapperClass}>
              <Player players={players} player={player} index={index} currentPlayer={currentPlayer} playersAPI={playersAPI} crownPlayer={crownPlayer} cards={cards} setCards={setCards} cardsAPI={cardsAPI}  gameOptions={gameOptions}  gameEndedBy={gameEndedBy} hand={hand} infoMode={infoMode} setInfoMode={setInfoMode} />
            </div >
          )
        }
        )
      }
    </div >
  );
}

export default Players;
