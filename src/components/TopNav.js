import React, { useState } from 'react'

function TopNav({ cards, cardsAPI, currentPlayer, hand, players, gameAPI, playersAPI, gameOptions, setGameOptions, infoMode, setInfoMode, gameStarted }) {

  const [open, updateOpen] = useState(false);

  // returns player object
  const getCurrentPlayer = () => players[currentPlayer]? players[currentPlayer] : {} ;

  const waitForPlayerInput  = React.createRef();
  const hideCardsInput      = React.createRef();
//  const dontStopInput      = React.createRef();

  return (
    <div className={'TopNav ' + (open ? 'open' : 'closed')}>
      { gameOptions.dev? (
        <div className='row text-center'>
          <small className={ 'card col-4' }> { getCurrentPlayer().name } ({currentPlayer})</small>
          <small className={ 'card col-4 bg-' + (hand.canMoveNext.can ? 'success' : 'danger ') } > can pass turn </small>
          <small className={ 'card col-4 bg-' + (hand.canMoveNext.must ? 'success' : 'danger ') } > turn is finished </small>
        </div>): null }
        
        
      <button className={'btn btn-primary btn-sm ' + ( gameOptions.dev? '' : 'd-none' ) } onClick={gameAPI.initDemoGame}>Load cards</button>
      <button className={'btn btn-secondary btn-sm ' + ( cards.length && gameOptions.dev? '' : 'd-none' ) } onClick={ () => gameAPI.startGame() }>Start game</button>
      <button className={'btn btn-info btn-sm ' + ( gameOptions.dev? '' : 'd-none' ) } onClick={ () => gameAPI.loadGame() }>Load game</button>
      {/* <button className={'btn btn-warning btn-sm ' + ( cards.length && !gameOptions.dev? '' : 'd-none' ) } onClick={ () => {
          const wildCard = cards[cardsAPI.getWildcards('commisary')[0]] || {};
          playersAPI.pickUpCard( { playerIndex: currentPlayer, cardID: wildCard.ID} );
      } }>Test</button> */}
      <button className={'btn btn-sm ' + ( cards.length && gameStarted? '' : 'd-none' ) + (infoMode? 'btn-success':'btn-warning' ) } onClick={ () => { setInfoMode(!infoMode)} } >
        Check cards description
      </button>     

      <label htmlFor="waitinput" className='extra-small'>
        <input id="waitinput" type='checkbox' value='on' 
          checked={ gameOptions.waitForPlayer } 
          ref={waitForPlayerInput} 
          onChange={ () => { console.log(waitForPlayerInput.current.checked); let go = {...gameOptions}; go.waitForPlayer = waitForPlayerInput.current.checked;  setGameOptions(go) } }
        />  Wait for confirmation
      </label>
      <label htmlFor="hidecardsinput"  className='extra-small'>
        <input id="hidecardsinput" type='checkbox' value='on' 
          checked={ gameOptions.hideIfNotCurrentPlayer } 
          ref={hideCardsInput}
          onChange={ () => { let go = {...gameOptions}; go.hideIfNotCurrentPlayer = hideCardsInput.current.checked;  setGameOptions(go) } }          
        />  Hide private cards
      </label>
      {/* <label htmlFor="dontStopinput">
        <input id="dontStopinput" type='checkbox' value='on' 
          checked={ gameOptions.moveOnIfOnlyOneOption } 
          ref={dontStopInput}
          onChange={ () => { let go = {...gameOptions}; go.moveOnIfOnlyOneOption = dontStopInput.current.checked;  setGameOptions(go) } }          
        />  Dont stop for confirmation if there is only 1 option.
      </label> */}
      <br/>
      <small className='extra-small'>Click on <i>Check cards description</i> and then click on a card to know more about it.</small>
    </div>
  );
}

export default TopNav;
