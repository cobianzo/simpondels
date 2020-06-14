// Action Btn is the button saying "Money" or "Cards" at the beginning of the turn.
// This is called in CardsDeck.js, inside fn viewWrapperCharacter(). 
// Only used when the stage is a character call.
import React, {useState} from 'react';
import '../css/ActionButton.scss';
import Card from './Card';
import { isEmpty, pronoum } from "../helpers";

function ActionButton({ hand, setHand, handBackup, players, currentPlayer, setCurrentPlayer, playersAPI, gameAPI, cardsAPI, cards, districtCards, setDistrictCards }) {

  // M O D E L +++++++++++++++++++++++++++++++++++++++ states
  const [showPartial_CardsToChoose, setshowPartial_CardsToChoose] = useState(false); // bool - flago to activate the modal to choose cards
  const [currentlyShownForPlayerChoice, setCurrentlyShownForPlayerChoice] = useState([]); // [ {cardOjb}, {cardObj} ... ] - the cards to display on modal window when tha player chooses CArds and not money

  // Action to take Money or take cards
  if (!hand) return
  if ( null === currentPlayer) return null;
  const { mustChooseCoinsOrCards, maxCardsToPickup } = gameAPI.getCurrentStageParams();

  // if we are not in a call stage
  const theCharacterCard = cardsAPI.getCalledCharacterCard();
  if ( !theCharacterCard || theCharacterCard === {})
    return null;
  
  // ---- End of VALIDATION ------

  // This is an option for the game. If we want this stage to be triggered automatically without human action.
  // TODO: actually this doesnt work exactly as it should: it executes more than once. (use a flag?)
  const opts = [ React.createRef(), React.createRef() ] ;
  let rdmClick = (Math.floor(Math.random() * 3) < 2)? 0 : 1; // 66% to choose money, whici is closer to real game
  const cp = (typeof currentPlayer === 'number')? players[currentPlayer] : {};
  if (cp.districtCards && !cp.districtCards.filter( ci => !cards[ci].is_built).length ) rdmClick = 1;
  if (cp.is_computer && !hand.coinsOrCardsThisTurn) {
    window.requestAnimationFrame(() => {
      if (opts[rdmClick].current) {       
        console.log('Action cards/money automatic on stage: '+hand.stage, opts[rdmClick].current);
        opts[rdmClick].current.click();        
      }
    });
  }

  // when clicking on the selected action
  const handleCoinsOrCardsAction = (action) => {
    if (isEmpty(cardsAPI.getCalledCharacterCard())) return false;
    const newHand = Object.assign({}, hand);  

    if (hand.coinsOrCardsThisTurn) { // for some reason if I use 'hand' the value is not updated.
    console.log(`action take ${action} is not allowed. You already performed your action (${hand.coinsOrCardsThisTurn})`);
    return;
  }
  
    // give 2 coins to the player
    if ( action === 'money' ) {
      playersAPI.giveMoneyToPlayer(2);
      setHand( Object.assign(newHand, { coinsOrCardsThisTurn: action }) );
      //->>>> trigger hand.coinsOrCardsThisTurn change
  //    gameAPI.checkMoveToNextPlayerOrStage();
//      if (!handBackup) // avoid setting the hand if, after checking on the previous line, we have moved to another temporary stage
    }
    // give 2 cards to the player
    if ( action === 'cards' ) {
      console.log('showing Cards to the player');
      setshowPartial_CardsToChoose(true); // this will activate the html to show 2 cards and make the player chose 1 card 
      const numCardsLeftToChoose = mustChooseCoinsOrCards.cardsToChoose - hand.pickedCardsThisPlayerTurn;
      const newCurrentlyShownForPlayerChoice = districtCards.slice(numCardsLeftToChoose*-1).map( c => c.ID );
      setCurrentlyShownForPlayerChoice(newCurrentlyShownForPlayerChoice);
        // slice(numCardsToChoose*-1).map( c => {
      // playersAPI.pickUpCard({ cardID: 'last-district-card', times: 2}); // this calls already to checkMoveToNextPlayerOrStage();
    }    
  }
// --------------------------------------
  const chooseCard = (cardID) => {
    // console.log('choses card: '+ card.name);
    playersAPI.pickUpCard({ playerIndex: currentPlayer, cardID: cardID}); // this calls already to checkMoveToNextPlayerOrStage();    
    const rewritePickedCardsThisPlayerTurn = hand.pickedCardsThisPlayerTurn + 1; // hand.pickedCard... is not updated yet, but I know it was incremented by 1.
    const newCurrentlyShownForPlayerChoice = currentlyShownForPlayerChoice.filter( cid => cid !== cardID );
    setCurrentlyShownForPlayerChoice(newCurrentlyShownForPlayerChoice);

    if ((rewritePickedCardsThisPlayerTurn) >= maxCardsToPickup) {
      // DONE: we have chosens the card(s) that we must choose;
      
      const newHand = { ...hand }
      // since we call here setHand, the pickUpCard setHand is overwritten. So we need to set up here the value for pickedCardsThisPlayerTurn again, using rewritePickedCardsThisPlayerTurn
      setHand( Object.assign(newHand, { pickedCardsThisPlayerTurn: rewritePickedCardsThisPlayerTurn, 
                                           coinsOrCardsThisTurn: 'cards' }) );

      // the rest of the shown cards must go to the beginning of the deck.  
      const newDistictCards = [...districtCards.filter( c => newCurrentlyShownForPlayerChoice.includes(c.ID) && c.ID !== cardID)]
                                .concat( districtCards.filter( c=> !newCurrentlyShownForPlayerChoice.includes(c.ID) && c.ID !== cardID ) );

      setshowPartial_CardsToChoose(false); // flag to remove the modal with the cards choice
      setDistrictCards(newDistictCards); // update the district cards with the non chosen cards in the beginning
      setCurrentlyShownForPlayerChoice([]); // reset
    }
  }
  // --- End of the HANDLEs CLICK to choose that card--- 


  let msg_before = cp.is_computer? <p className='mb-3'>The computer is playing this turn</p> : null;
  
  // Messages before the button, set up dynamically depending on actions
  msg_before = [ msg_before, hand.messages.before_coins_or_cards_btn ];
  // message about player action money/cards
  if ( !mustChooseCoinsOrCards) {
    // this means that this players is not allowed to take an action (ie, his called card is killed)
    msg_before = [ msg_before, <h3 key='shutup'>No action allowed</h3> ];    
  }
 
  // Messages after the button, set up dynamically depending on actions
  let msg_after = null;
  msg_after = [ msg_after, hand.coinsOrCardsThisTurn ? hand.messages.after_coins_or_cards_action : hand.messages.after_coins_or_cards_btn ];

  const btnClass = ( mustChooseCoinsOrCards && !hand.coinsOrCardsThisTurn) ? 'CardsDeck__actions--enabled btn-primary' : 'CardsDeck__actions--disabled btn-secondary';

  const numCardsLeftToChoose = maxCardsToPickup - hand.pickedCardsThisPlayerTurn;

  // Automatic action: This is an option for the game. If we want this stage to be triggered automatically without human action.
  if (typeof currentPlayer === 'number' && players[currentPlayer].is_computer) {   
    if (showPartial_CardsToChoose) {
      console.log('Automatic action choose card');
      const cardID = currentlyShownForPlayerChoice[currentlyShownForPlayerChoice.length-1];
      chooseCard(cardID);
    }
  }
  return (      
    <div className="CardsDeck__actions" key='lp3'>
      { msg_before }
      { mustChooseCoinsOrCards? 
          (showPartial_CardsToChoose === false)?
          (  
          <React.Fragment>
              {/* show option: MONEY OR CARD */}
              { (!hand.coinsOrCardsThisTurn               
                    && !hand.messages.before_coins_or_cards_btn
              )? <p key='k-4423'>Choose between taking { mustChooseCoinsOrCards.coins } coins or { maxCardsToPickup } card out of { mustChooseCoinsOrCards.cardsToChoose }</p> : null }

              <button className={ 'btn ' + btnClass + (hand.coinsOrCardsThisTurn === 'money'? ' btn-info ': '') } 
                      onClick={ () => handleCoinsOrCardsAction('money') } key='alp2' ref={opts[0]}>
                Money $
              </button>
              <button className={ 'btn  ' + btnClass + (hand.coinsOrCardsThisTurn === 'cards'? ' btn-info ': '') }
                      onClick={ () => handleCoinsOrCardsAction('cards') } key='alp1' ref={opts[1]}>
                Card
              </button>
            </React.Fragment>
          ) : (
            <div key='poszi' className='modal d-block bg-opacity' tabIndex="-1" role="dialog" > 
              {/* CARD WAS CHOSEN: show cards pick up 1! */}
              <div className='modal-dialog modal-content p-4' role="document"> 
                <h2>Choose {numCardsLeftToChoose} card{numCardsLeftToChoose > 1? 's' : ''}:</h2>
                { hand.messages.before_pickup_card }
                <ul className='flex-row flex-wrap list-unstyled p-0 mt-3'>
                  { 
                    currentlyShownForPlayerChoice.map( (cID, i) => {                    
                        return (
                          <li key={'choose-'+cID} className='hover-rotate small-card p-1' 
                              onClick={() => chooseCard(cID) }>                              
                            <Card card={ cardsAPI.getCardByID(cID)} place={'show-description'} />
                          </li>
                        )
                      }
                    )
                  }
                </ul>
              </div>
            </div>
          ) : null }
      { msg_after }
    </div>
  );    

}

export default ActionButton;