import React from 'react';
import { DistrictSelectionHelp } from './helpHTML/StageHelp';
import Card from './Card';

// modal window covering the whole screen (so you cant see other's cards). And asking for the player CURRENTPLAYER to take control of the iPad before continuing.
// @prop hand.waitForPlayerConfirmation is what sets this window or not. gameOptions  
function WaitConfirmationModal({currentPlayer, setCurrentPlayer, players, hand, setHand, gameOptions, cardsAPI}) {
  
  const btnRef = React.useRef(null);

  if (!gameOptions.waitForPlayer) return null;
  if (typeof currentPlayer !== 'number') return null;
  if (players[currentPlayer] && players[currentPlayer].is_computer) return null;
  if (!hand.waitForPlayerConfirmation) return null;

  // This is an option for the game. If we want this stage to be triggered automatically without human action.
  
  // if (typeof currentPlayer === 'number' && players[currentPlayer].is_computer) {
  //   window.requestAnimationFrame(() => {
  //     if (btnRef.current) {        
  //       console.log('Action automatic to confirm Im the player on stage: '+hand.stage, players[currentPlayer].name);
  //       btnRef.current.click();
  //     }
  //   });
  // }

  // Action when click on 'Yes, its me , lets play'. Makes this modal window dissappear.
  const handleConfirmation = () => {
    if (!clonedHand) return;
    clonedHand.waitForPlayerConfirmation = false; 
    setHand(clonedHand);
  }

  

  let clonedHand = {...hand};
  const playerObj = players[currentPlayer];
  
  const componentsMap = { 
    'district-selection': DistrictSelectionHelp,
    'nothing': null,
 };
  let HelpComponent = componentsMap[hand.stage];
  const characterNumber = hand.stage.includes('call-character-')? parseInt(hand.stage.slice(hand.stage.lastIndexOf('-') + 1)) : null; // grabs 3 from 'call-character-3' 
  const characterCard = characterNumber? cardsAPI.getCardByCharacterNumber(characterNumber) : null;
  return(
      <div key='poszi' className='modal d-block bg-black' tabIndex="-1" role="dialog" > 
          <div className='modal-dialog modal-content p-4' role="document"> 
            <div className='row text-center'>
              { characterNumber? <p key='gf5g' className='w-100'>Calling {characterCard.name}</p> : null }
              <p className='col-12 mx-auto'>Wait for confirmation by </p><h2  className='col-12 mx-auto'>{ playerObj.name }</h2>
              { characterNumber? <div className='small-cards w-100'><Card card={characterCard}/></div> : null}
              { characterNumber? <p key='b5g'>{characterCard.description}</p> : null }
              <button className='btn btn-danger mx-auto my-3' 
                      onClick={ handleConfirmation } ref={btnRef}>
                I am {playerObj.name}, let's play                
              </button>
              { HelpComponent? (
                <div className='container'>
                  <p>In this turn</p>
                  <HelpComponent/>
                </div>) : null }
            </div>
          </div>
      </div>
  );
}

export default WaitConfirmationModal;
