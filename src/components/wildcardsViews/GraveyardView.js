import React, { useState, useEffect } from 'react'
import Card from '../Card'
import { shuffle } from "../../helpers";

// Graveyard wild card: allows the user to protect one card attacked by the Warlord
// WHEN: when the hand.stage is set to 'situation-graveyard:defend-with-graveyard'. This happens when the Warlord tries to destroy a card, in the hand.stage == 'character-call-8'
function Graveyard(props) {  
  // proprierties
  const { gameOptions, gameAPI,
    hand, setHand, handBackup,
    playersAPI, players, setPlayers, currentPlayer, setCurrentPlayer,
    cardsAPI, cards, setDistrictCards } = props;

  // Prepare vars
  const graveyardCard = cards[cardsAPI.getWildcards('graveyard', true)] || {};
  const warLordCard = cardsAPI.getCardByCharacterNumber(8); // warlord is num 8
  const attackedCard = { ...cards[cardsAPI.getCardIndexByID(hand.attackedCardID)] }; // I saved this before I called this stage
  const hasMoneyToSaveIt = players[currentPlayer].money >= 1;


  // params for computer auto action
  // Automatic action for computer: select random card after 3 seconds
  const is_computer = (players[currentPlayer] && players[currentPlayer].is_computer);
  const [timing, setTiming] = useState(is_computer ? 3 : null);
  useEffect(() => {
    timing && setTimeout(() => setTiming(timing - 1), 1000);
  
    if (timing === 0) {
      if (hasMoneyToSaveIt) {
        const saveOrNot = Math.floor(Math.random() * 2); // 0 or 1
        if (saveOrNot) 
          savecardRef.current.click();
        else 
          noactionRef.current.click();
      } else {
        noactionRef.current && noactionRef.current.click();
      }
    }
  }, [timing]);
  
  const noactionRef = React.createRef(); // btn 'i wont save thecard
  const savecardRef = React.createRef(); // btn 'i save thecard
  const jsx_for_computer = is_computer ? <button className='btn btn-danger'>Coming back to {warLordCard.name}'s turn in <br />{timing}</button> : null;     
  
  const backToCallerStage = () => {
    console.log('Moving back to the caller stage call-character-8, from situation');
    if (!handBackup.characterActThisTurn) { // this happens when the attacked player doesnt have money to defend the card. In that case the card is already destroyed by the caller.
      handBackup.characterActThisTurn = 'destroy-for-lack-of-money-to-defend';
      handBackup.messages.after_character_acts = <h4 key='y94'>You destroyed the card {attackedCard.name} because {players[currentPlayer].name} didn't have money to protect it</h4>
    }
    setHand({ ...handBackup }); // handBackup contains the stage:call-character-8 and all the settings as they were 
    const { playerIndex: warlordIndxPlyr } = playersAPI.getPlayerWhoOwnsCharacterCard(8);
    setCurrentPlayer(warlordIndxPlyr);
  }
  const saveAttackedCard = () => {
    let currentPlayerObj = { ...players[currentPlayer] };
    currentPlayerObj.money = currentPlayerObj.money - 1;
    let newPlayers = [...players];
    newPlayers[currentPlayer] = currentPlayerObj;
    attackedCard.is_built = false;
    let newCards = [...cards];
    newCards[hand.attackedCardID] = attackedCard;
    setDistrictCards(newCards);
    setPlayers(newPlayers);

    handBackup.characterActThisTurn = 'try-destroy-card'; // this will be saved when called set backupHnd
    handBackup.messages.after_character_acts = <h4 key='y94'>You could not destroy the card.</h4>
    backToCallerStage();
  }
  const letItCrumbleToDust = () => {
    if (playersAPI.destroyBuiltCardByWarlord(attackedCard)) {
      handBackup.messages.after_character_acts = <div key='r10'><h4>you have destroyed {attackedCard.name} </h4><p>{players[currentPlayer].name} didn't protect it, and you payed {attackedCard.price - 1} coins to destroy it</p></div>
      handBackup.characterActThisTurn = 'destroy-card';
      console.log('@ACTION OF POWER for character 8: Warlord - destroys a card: ');
      backToCallerStage();
    }
  }


  // RENDER VIEW ------------------------------------------------------------------------------
  return (<div key='fd3' className='row'>
    <div key='yi4' className='col-4'>
      <Card card={graveyardCard} />
      <div className='position-absolute top-0 rotate-right extra-small-card'>
        <Card card={warLordCard} />
      </div>
      <p>{graveyardCard.description} </p>
    </div>
    <div key='re3' className='col-8 small-cards'>
      {jsx_for_computer}
      <p>The attacked card is the {attackedCard.name}</p>
      <Card card={attackedCard} />
      {
        !hasMoneyToSaveIt ? (<div><p>You don't have 1 coin to save it! sorry</p>
          <button onClick={backToCallerStage} ref={noactionRef} className='btn btn-primary btn-danger'>Back</button>
        </div>) : (
            <div className='action-btns justify-content-center'>
              <p>Make your choice:</p>
              <button onClick={saveAttackedCard} ref={savecardRef} className='btn btn-primary btn-danger mr-2'>Save the card</button>
              <button onClick={letItCrumbleToDust} ref={noactionRef} className='btn btn-primary btn-success'>Let it crumble</button>
              <p>Saving the card will cost you 1 coin,</p>
            </div>
          )
      }
    </div>

  </div>); // end render
}

export default Graveyard;
