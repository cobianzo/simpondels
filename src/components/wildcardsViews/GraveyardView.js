import React from 'react'
import Card from '../Card'
import { shuffle } from "../../helpers";

// Graveyard wild card: allows the user to protect one card attacked by the Warlord
// WHEN: when the hand.stage is set to 'situation-graveyard:defend-with-graveyard'. This happens when the Warlord tries to destroy a card, in the hand.stage == 'character-call-8'
function Graveyard(props) {  
  const { hand, setHand, handBackup,
        playersAPI, players, currentPlayer,
        cardsAPI, cards, districtCards, setDistrictCards} = props;
  
  if (!cards || !cards.length) return null;
  if ( hand.stage !== 'situation-graveyard:defend-with-graveyard') return null; // set the hand.stage to thos in order to render this screen

  // RENDER VIEW ------------------------------------------------------------------------------
  const graveyardCard = cards[cardsAPI.getWildcards('graveyard', true)] || {};
  return (
    <div key='poszi' className='modal d-block bg-opacity' tabIndex="-1" role="dialog" > 
    
    </div>
  ) // end render
}

export default Graveyard;
