import React, {useState, useEffect} from 'react'
import Card from '../Card'
import { shuffle, pronoum } from "../../helpers";

// Laboratory wild card: allow the user to pick up any card from the dect
// This Component shows, in a modal window, all cards in the deck, and the user must choose one by clicing on it.
// WHEN: when the hand.stage is set to 'situation-laboratory:select-deck-card'. This happens when the laboratory card is built.
function LaboratoryView(props) {  
  // proprierties
  const { gameOptions,
        hand, setHand, handBackup,
        playersAPI, players, currentPlayer,
        cardsAPI, cards, districtCards, setDistrictCards} = props;
  
  // params for computer auto action
  const is_computer = (players[currentPlayer] && players[currentPlayer].is_computer);
  let liRef = null;
  let jsx_for_computer = null;
  let randCardClicked = -1;
  
  // Automatic action for computer: select random card after 3 seconds
  const [timing, setTiming] = useState(is_computer? 3 : null);
  useEffect(() => {
    timing && setTimeout(() => setTiming(timing - 1), 1000);
    if (timing === 0 && liRef.current) {
      liRef.current.click();
    }
  });
  // crate a random card to choose by comp
  if (is_computer){
    liRef = React.createRef();
    randCardClicked = Math.floor(Math.random() * districtCards.length);
    jsx_for_computer = is_computer? <button className='btn btn-danger'>Choosing a card in <br/>{timing}</button> : null;     
  }



  if (!cards || !cards.length) return null;
  if ( hand.stage !== 'situation-laboratory:select-deck-card') return null; // set the hand.stage to thos in order to render this screen
  
  // Action when you click on one card.
  const handleClickSelectCard = (card) => {
    const pickedCard = playersAPI.pickUpCard({ cardID: card.ID } ) || {};
    const shuffledDistrictCards = shuffle(districtCards);
    setDistrictCards(shuffledDistrictCards);
    // this message didnt work.
    handBackup.messages.after_character_acts = <p key='y140'> { pronoum(props, 'You', 'player')} have now the card {pickedCard.name} form the deck. The deck will be shuffled now.</p>;
    console.log('Moving back to the caller stage, from situation');
    setHand( {...handBackup} ); // handBackup contains the stage:call-character-X and all the settings as they were 
  }

  
  
  
  // RENDER VIEW ------------------------------------------------------------------------------
  const laboratoryCard = cards[cardsAPI.getWildcards('laboratory', true)] || {};
  return (
    <div key='poszi' className='modal d-block bg-opacity' tabIndex="-1" role="dialog" > 
        <div className='modal-dialog modal-content p-4 fade-in-animation-once' role="document"> 
          <div className='row'>
            <div className='small-card col-3'>
              <Card card={laboratoryCard} />
            </div>
            <div className='col-9'>
              <p>Building the {laboratoryCard.name}!</p>
              <p>{ pronoum(props, 'You', 'player')} can choose the card that { pronoum(props, 'you', 'player')} want from the deck</p>
              { jsx_for_computer }
            </div>
          </div>
          <ul className='list-unstyled extra-small-cards d-flex flex-wrap'>
          {
            districtCards.map( (c, i) => {
              return (<li key={'dis-'+c.ID} className='hover-border pointer-cursor border--white'
                          onClick={() => handleClickSelectCard(c)}
                          ref={ (i===randCardClicked)? liRef : null } >
                        { is_computer && gameOptions.hideIfNotCurrentPlayer?
                          null /*<img className="rounded extra-small-card" src="/imgs/back.jpeg"  alt="hidden" /> */
                        : <Card card={c} /> }
              </li>)
            })
          }
          </ul>
      </div>
    </div>
  ) // end render
}


export default LaboratoryView;
