import React from 'react';

function StartGame(props) {
  const { gameStarted, cards, gameAPI } = props;

  if (gameStarted) return null;

  const inputPlayersRef = [ React.createRef(), React.createRef(), React.createRef()];
  const isComputerPlayersRef = [ React.createRef(), React.createRef(), React.createRef()];

  return (
    <div className='container mt-5 mb-3'>
      { !(cards && cards.length)? (
        /* Screen 1. Click Start */
        <div className='w-100 m-0 text-center'>
          <h1>Welcome to the Simpondels</h1>
          <button className={'btn btn-primary btn-lg m-auto  opacity-animation'} onClick={() => gameAPI? gameAPI.initDemoGame(): null}>
          Click to Start</button>
          
        </div>) : null}
        { (!gameStarted && cards.length) ? (
          /* Screen 2. Select players */
          <React.Fragment>
          <h4 className='mt-4 text-center'>To start the game, write the name of the players and click start game</h4>
          <div className='container text-center'>          
          { [1,2,3].map( (num,i) => (
              <div key={'plname'+i}>
                <input ref={inputPlayersRef[i]} defaultValue={(i!==2)?`Player ${num}`: 'Canallita'} />
                <label htmlFor={'comp'+i}>
                  <input id={'comp'+i} ref={isComputerPlayersRef[i]}  type='checkbox' defaultChecked={(i===2)} /> Computer 
                </label>
              </div>
          )) }
            <button className='btn btn-success btn-xl' 
                    onClick={ () => {
                        const plyParams = inputPlayersRef.map( (ref, i) => {
                          console.log(isComputerPlayersRef[i].current);
                          return {name: inputPlayersRef[i].current.value, is_computer: isComputerPlayersRef[i].current.checked}
                        } );         
                        console.log('players loading:', plyParams);
                        gameAPI.initPlayers(plyParams);
                        gameAPI.startGame();                       
                      } 
                    }>
              Start game
            </button>

          </div>
          </React.Fragment>
        ) : null}
    </div>
  );
}

export default StartGame;
