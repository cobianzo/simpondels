import React from 'react'
import '../css/Card.scss';
import { renderToString } from 'react-dom/server'
import { createOverlay } from "../helpers";

function Card({ hand, card, place, allowedToBuild, cardsAPI, currentPlayer, ownerPlayer, gameOptions, players, infoMode, setInfoMode, forceHideCards, handleOnClick }) {

  if (!card) {
    return <p>No card!</p>
  }

  // build card on click, if we are on the place===player-private and it's buildable
  const handleBuildCard = () => {
    if (cardsAPI && card.type === 'district' && !card.is_built)       
      cardsAPI.buildCard(card.ID);
  }
  // non REACT code! non declarative, show an overlay on the fly
  const handleInfo = () => {
    console.log('request popup for card');
    const html = renderToString(<Card key={'cover'+card.ID} card={card} />) + '<div class="pull-right">'+card.description+'</div>';
    createOverlay(html, () => setInfoMode(false) )
  }

  const isBuildable = allowedToBuild; 
  let classes = "Card "+place+" ";

  let showCard = true;
  
  if ((forceHideCards || (gameOptions && gameOptions.hideIfNotCurrentPlayer)) && (hand && hand.stage !== 'end-game') ) {
    const not_current_pl = currentPlayer !== ownerPlayer || (players && players[ownerPlayer].is_computer);
    if (place === 'player-private' && (not_current_pl || forceHideCards))
      showCard = false;
    if (place === 'character-private' && (not_current_pl || forceHideCards) && !card.is_character_called)
      showCard = false;
  }
  // if this player is not allowed to see the card because it is in the hand of another player
  if (!showCard) {
    return (
      <div className={classes}>
        <img className="Card__image mx-auto img-fluid" src={`/imgs/back${card.type==='character'?'-character':''}.jpeg`} alt={ 'hidden' } />
      </div>
    )
  }

// removed .tooltipable
  classes += `Card--${ card.type } Card--color-${(card["type-of-district"] || card["character-number"] || "default" )}`;
  classes += card.is_killed ? " Card--killed" : "";
  classes += card.is_stolen ? " Card--stolen" : "";
  classes +=  isBuildable? " hover-border cursor-pointer Card--is-buyable" : ( place === 'player-private' ) ? " Card--no-buyable" : "";
  classes +=  card.is_built_this_hand && currentPlayer !== ownerPlayer? " Card--built-this-hand" : "";
  classes +=  hand && card.is_built_this_hand === hand.stage? " Card--built-this-turn" : "";
  classes +=  card.description && card.description.length? " Card--has-description" : "";
  
  // action when we click on the card!
  let theHandleOnClick = () => {
    if (infoMode) handleInfo(); // priority to the infoMode (when we click on the button to show info of the clicked card)
    else if (handleOnClick) handleOnClick(); // second priority to the prop passed as param (in dev, we use it to giv this card to a player)
      else if (isBuildable) handleBuildCard(); // and finally, if the card can be built, onclick means BUILD!
  };
    
  return (
    <div  className={ classes } 
          onClick={ theHandleOnClick }
          data-cardid={ card.ID }>
      <div className={'badge Card__badge Card__badge--color-' +(card["type-of-district"] || card["character-number"]) }>
          <span className='position-absolute'> {card["character-number"]? card["character-number"] : <React.Fragment>&nbsp;</React.Fragment> } </span>        
      </div>
      { card.is_killed? ( <img className='Card__icon img-fluid' src="/imgs/is-killed.png" alt='killed'/> ) : null  }
      { card.is_stolen? ( <img className='Card__icon img-fluid' src="/imgs/is-stolen.png" alt='stolen'/> ) : null  }
            
      <img className="Card__image mx-auto img-fluid" src={card.image} alt={ card.description} />

      <p className="Card__title">
        {card.name}
        {
          card.price? <span className="d-block">$ {card.price} { card['extra-price']? `(+${card['extra-price']})` : '' }</span> : ''
        }
      </p>
      { card.description? (<div className={"Card__description " + (place === 'show-description'? '' : 'd-none')}>{card.description}</div>) : null}
    </div>
  );
}

export default Card;
