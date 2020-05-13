// This is called in CardsDeck.js, inside fn viewWrapperCharacter(). 
import React from 'react';
import '../css/NextTurnButton.scss';
import Card from './Card';

function NextTurnButton({ cards, hand, gameAPI, players, playersAPI, currentPlayer, setCurrentPlayer, overwriteText }) {

  // Modifcator the card take-cards-if-dont-have-any allows you, when you finish your turn to take 2 cards
  const partialViewTakeCardsIfYouDontHaveAny = () => {
    const wildCardCards = playersAPI.playerHasBuiltWildcard(currentPlayer, 'take-cards-if-dont-have-any');
    const wildCardMoney = playersAPI.playerHasBuiltWildcard(currentPlayer, 'take-1-coin-if-dont-have-any');
    // VALIDATION  
    if (hand.stage === 'end-game') return false; // dont apply in last stage
    const goOnCards = (wildCardCards && !players[currentPlayer].districtCards.filter( ci => !cards[ci].is_built ).length);  // if he doesnt have this card this partial is not applied
    const goOnMoney = (wildCardMoney && !players[currentPlayer].money);
    if (!goOnCards && !goOnMoney) return false;

    // This is an option for the game. If we want this stage to be triggered automatically without human action.
    const btnRef = React.createRef();
    // if (typeof currentPlayer === 'number' && players[currentPlayer].is_computer) {
    //   window.requestAnimationFrame(() => {
    //     if (btnRef.current) {       
    //       console.log('Action automatic to move next on stage: '+hand.stage);     
    //       btnRef.current.click();
    //     }
    //   });
    // }


    return (
      <div className='row mt-3' key='dd'>
        { goOnCards? `You have the card ${wildCardCards.name} and you don't have any card in your hand.` : '' }
        { goOnMoney? `You have the card ${wildCardMoney.name} and you don't have any money.` : '' }
        <div className='col-6 extra-small-cards' key='g55'>
          { goOnCards? <Card card={wildCardCards} /> : null}
          { goOnMoney? <Card card={wildCardMoney} /> : null}
        </div>
        <button className="col-6 btn btn-danger mb-3 mx-auto" onClick={ () => {
          if (goOnCards) playersAPI.pickUpCard( { cardID: 'last-district-card', times:2, ignoreLimitThisTurn: true } ); // the ignoreLimitThisTurn is not needed, strangely
          if (goOnMoney) playersAPI.giveMoneyToPlayer(1, currentPlayer);
          handleClick();
        }} key='6n' ref={btnRef}>      
          { overwriteText? overwriteText : '' }
          { goOnCards? `Take 2 cards from the deck` : '' }
          { goOnMoney? `Take 1 coin` : '' }
          and move to next turn
        </button>
      </div> )
  }

  const handleClick = () => {
    gameAPI.moveToNextPlayerOrStage();
  }

  // we show the button if: we can move to the next turn
  if (hand.canMoveNext.can) {
    const jsx = partialViewTakeCardsIfYouDontHaveAny();
    if (jsx) return jsx;

    let text = (players && typeof currentPlayer === 'number' && players[currentPlayer].is_computer)? 'The computer has finished. Someone clicks here.' : 'Next turn';
    text = overwriteText? overwriteText : text;
    return <button className="btn btn-danger mb-3 mx-auto" onClick={handleClick}>
      {hand.stage === 'end-game' ? (currentPlayer === (players.length -1)? 'Finish' : 'Next player') : text }
    </button>
  }
  return null;

}

export default NextTurnButton;

