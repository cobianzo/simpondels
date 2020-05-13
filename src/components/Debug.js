import React from 'react'
import { renderObject } from "../helpers";
// import '../css/Debug.scss';

function Debug({ cards, characterCards, districtCards, players, currentPlayer, crownPlayer, gameOptions, hand, handBackup, gameAPI, stages, gameEndedBy, gameStarted, justAFlag }) {

  return (
    <React.Fragment>
    <h5 key='874'>Hand situation</h5>
    { gameOptions.dev ? renderObject(hand) : null }
    { gameOptions.dev ? <div>gameEndedBy: {gameEndedBy} </div> : null }
    { gameOptions.dev ? <div>gameStarted: {gameStarted} </div> : null }
    { gameOptions.dev ? <div>justAFlag: {justAFlag} </div> : null }
    <h4>handBackup</h4>
    { gameOptions.dev ? renderObject(handBackup) : null }
    <hr/>        
    <h5>Stage original settings</h5>
    <div className="opacity-50">
      { gameOptions.dev ? renderObject(hand.stage? stages[hand.stage] : null) : null }
    </div>
    <hr/>
    <h5 key='9843'>Stage actual settings</h5>
    <div key='fds732'>
      { gameOptions.dev ? renderObject(gameAPI.getCurrentStageParams()) : null }
    </div>
    <button onClick={ ()=>{
      const obj = gameAPI.saveGameAsJSON();
      document.querySelector('#debug-game').innerHTML = JSON.stringify(obj);
    } } className='btn btn-info'>save params</button>
    <textarea id='debug-game'></textarea>
    </React.Fragment>

  );
}

export default Debug;
