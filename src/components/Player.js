import React, { useState } from 'react';
import Card from './Card'

import '../css/Player.scss';

// @player: { name: 'Peter', characterCards: [ ... ], money: 5 .. }
function Player({ hand, players, player, index, currentPlayer, playersAPI, crownPlayer, cards, setCards, cardsAPI, gameOptions, gameEndedBy, infoMode, setInfoMode }) {

  const [forceHideCards, setForceHideCards] = useState(false); // set to the player index
  return ( 
          <div className='Player'>
            <div className='row'>
              <div className='col-6'>
                <h4 className="d-block">
                  {player.name}{ (player.is_computer? ' (comp) ':'')} 
                  { (currentPlayer === index && !player.is_computer)? (
                    <button className={'small btn-sm btn btn-'+(forceHideCards? 'danger' :'success')}
                            onClick={() => setForceHideCards(!forceHideCards)}>
                      {forceHideCards? 'show' :'hide' }
                    </button>
                  ):null}
                </h4>
              </div>
              <div className='col-3'>
                { (crownPlayer === index )? (<img className='Card__icon img-fluid h-100' src="/imgs/crown.png" height='50' alt='crown'/> ) : null }
              </div>
              <div className='col-3'>
                $ {player.money} 
                { gameOptions.dev? <button onClick={() => playersAPI.giveMoneyToPlayer(1, index)} className={'btn btn-success btn-sm'}>+</button> : null }
                { gameOptions.dev? <button onClick={() => playersAPI.giveMoneyToPlayer(-1, index)} className={'btn btn-danger btn-sm'}>-</button> : null }
              </div>
            </div>

            <div className='row'>            
              <div className='col-2 extra-small-cards'>                
                { player.characterCards.map( ( cardIndex, i ) => {
                  const card = cards[cardIndex];
                  return (
                    <Card card={card} key={i} place={'character-private'} currentPlayer={currentPlayer} ownerPlayer={index} gameOptions={gameOptions} players={players} hand={hand} infoMode={infoMode} setInfoMode={setInfoMode} forceHideCards={forceHideCards} />
                    )
                  }) }
              </div>
              <div className='col-10'>              
                <div className='row extra-small-cards Player__private-cards'>                  
                  { player.districtCards.filter( cardIndex => !cards[cardIndex].is_built )
                        .map( ( cardIndex, i ) => {
                            const dCard = cards[cardIndex];
                            // TODO: make clicable if the currentPlayer has money to buy it!                            
                            return (
                              <Card key={'cc-'+cardIndex} place={'player-private'}  card={dCard} allowedToBuild={playersAPI.playerCanBuild(index, cardIndex)} cardsAPI={cardsAPI} ownerPlayer={index} currentPlayer={currentPlayer}  gameOptions={gameOptions} players={players} hand={hand} infoMode={infoMode} setInfoMode={setInfoMode} forceHideCards={forceHideCards} />
                              )
                    }) }
                </div>
                <div className='row extra-small-cards Player__built-cards'>
                { player.districtCards.filter( cardIndex => cards[cardIndex].is_built ).map( ( cardIndex, i ) => {
                    const card = cards[cardIndex];
                    return (
                      <Card card={card} key={i} place={'player-built'} player={player} cards={cards} setCards={setCards} infoMode={infoMode} setInfoMode={setInfoMode} hand={hand} />
                      )
                    }) }
                </div>
                {
                  (typeof player.puntuation === 'object') ? <p className={'position-absolute badge badge__label--tilted Player__points ' + (player.winner? 'badge-success Player__points--winner' : 'badge-info')} >{player.puntuation.total} points</p> : null
                }
                {
                  (index === gameEndedBy) ? <p className={'position-absolute badge badge__label--tilted Player__gameended badge-info'} >finished the game</p> : null
                }
              </div>
            </div>
          </div>
         );
}
       
export default Player;
