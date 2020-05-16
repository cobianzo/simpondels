// React
import React from 'react'
import { renderToString } from 'react-dom/server'
// --- Partials
import Card from './Card'
import ActionButton from './ActionButton'
import NextTurnButton from './NextTurnButton'
// --- CSS
import '../css/CardsDeck.scss';
import { isEmpty, logg, createOverlay } from "../helpers";
// --- Main Views
import Pick4InitialCards from './stagesViews/Pick4InitialCards';
import Discard1Character from './stagesViews/Discard1Character';
// =.= Secondary Views
import LaboratoryView from './wildcardsViews/LaboratoryView';
import CommisaryView from './wildcardsViews/CommisaryView';
import GraveyardView from './wildcardsViews/GraveyardView';

function CardsDeck({ cards, setCards, characterCards, setCharacterCards, districtCards, setDistrictCards, players, setPlayers, hand, setHand, handBackup, setHandBackup, currentPlayer, setCurrentPlayer, playersAPI, gameAPI, cardsAPI, gameEndedBy, setGameEndedBy, gameOptions, justAFlag, setJustAFlag, infoMode, setInfoMode}) {
              
  // CONTROLLER ++++++++++++++++++++++++++++++++++++++++

  // the turn of discard 1 card from the character deck. This could be in the original cardsAPI definition
  cardsAPI.removeRandomCharacterCard = () => {
    if (!characterCards.length) return null;
    let clonedCardsArray = [ ...characterCards ];
    clonedCardsArray.splice(Math.floor(Math.random() * clonedCardsArray.length), 1);
    setCharacterCards(clonedCardsArray);

    // @MAYBECHANGE: I think we could avid this and simply move to nextStage here.
    const clonedHand = Object.assign({}, hand);
    setHand(Object.assign(clonedHand, { pickedCardsThisPlayerTurn : (hand.pickedCardsThisPlayerTurn + 1)}) ); 
    //->>>> trigger hand.pickedCardsThisPlayerTurn change
  }


  // VIEWS:

  // 2) View on stage 'district-selection' - on the beginning of the game
  // REPLACED BY <Pick4InitialCards />
  /*const viewDistrictSelectionDeck = () => {
  
    if (hand.stage !== 'district-selection') return null;
    if (typeof currentPlayer !== 'number') return null;

    // Action when clicking on the back card image: taking 4 cards and move to next player
    const clickHandle = () => {
      playersAPI.giveMoneyToPlayer(2);
      playersAPI.pickUpCard({ cardID: 'last-district-card', times: 4 } );
      gameAPI.moveToNextPlayerOrStage();
    }
    
    // This is an option for the game. If we want this stage to be triggered automatically without human action.
    const liRef = React.createRef();
    window.requestAnimationFrame(() => {
        if ((gameOptions.moveOnIfOnlyOneOption || players[currentPlayer].is_computer) 
          && (liRef.current)) {       
            console.log('Action automatic select 4 district cards on stage: '+hand.stage);     
            liRef.current.click();
          }
    });

    return (
      <React.Fragment>
        
        <h3 className='mt-3'>Hi {players[currentPlayer].name}</h3>
        <p>click on the card to grab your initial {gameAPI.getCurrentStageParams().minCardsToPickup} district cards</p>
        <ul className='row list-unstyled pt-4'>
          <li ref={liRef} className='offset-3 col-6 hover-rotate p-1' onClick={ clickHandle }>
            <img className="m-auto img-fluid rotate-left rounded" style={ {"maxWidth": "100px"} } src="/imgs/back.jpeg" alt="Click the card to pick it up!" />
            <span className="badge badge-info absolute-center opacity-animation">Click me!</span>
          </li>
        </ul>
        
      </React.Fragment>
    );
  } */
 
  // TOBEREPACED BY <Discard1Character />
/*  const viewDiscardCharacterDeck = () => {
    if (hand.stage !== 'discard-character') return <hr />;

    // the action of clicking on one card image: removes one character from characterDeck and moves to next stage.
    const action = () => {
      cardsAPI.removeRandomCharacterCard();
      gameAPI.moveToNextStage();
    }

    // This is an option for the game. If we want this stage to be triggered automatically without human action.
    const liRef = React.createRef();
    window.requestAnimationFrame(() => {
        if ((gameOptions.moveOnIfOnlyOneOption || (players && typeof currentPlayer==='number' && players[currentPlayer].is_computer)) 
          && (liRef.current)) {
            console.log('Action Discard char automatic on stage: '+hand.stage, liRef.current);
            liRef.current.click();
          }
    });

    return (
      <div key='gfs5'>
        <p key='gf54'>Here tou have the {characterCards.length} character cards face down.</p>
        <p key='gf5'>Click to remove one random card from the characters' deck and make the hand start</p>
        <ul className='d-inline-flex p-0 justify-content-center flex-wrap' onClick={ action }>
        {
          cards.filter( c => c.type === 'character' ).map( (card, i) => {
            return (<li ref={!i? liRef:null} key={'tt'+card.ID} className='Card small-card cursor-pointer hover-border'><img className="small-card img-fluid" src="/imgs/back-character.jpeg"  alt="" /></li>);
          } )
        }
        </ul>        
      </div>
    );
  } */

  // 2) View on stage 'character-selection-1' and 'character-selection-2'
  const viewCharacterSelectionDeck = () => {
    if (!hand.stage || hand.stage.indexOf('character-selection') < 0) return <hr />;
    const characterRound = parseInt(hand.stage.slice(hand.stage.lastIndexOf('-') + 1)); // grabs 2 from 'character-selection-2' 
    

    const action = (card) => {
      if (infoMode) {
        const html = renderToString(<Card key={'cover'+card.ID} card={card} />) + '<div class="pull-right">'+card.description+'</div>';
        createOverlay(html, () => setInfoMode(false) );
        return;
      }
      playersAPI.pickUpCard({ cardID: card.ID });
      gameAPI.checkMoveToNextPlayerOrStage(true);
    }

    // This is an option for the game. If we want this stage to be triggered automatically without human action.
    const liRef = React.createRef();
    const rdmClick = Math.floor(Math.random() * characterCards.length);
    if (typeof currentPlayer === 'number' && players[currentPlayer].is_computer) {
      window.requestAnimationFrame(() => {
        if (liRef.current) {       
          console.log('Action Select char automatic on stage: '+hand.stage);     
          liRef.current.click();
          setCurrentPlayer(false);
        }
      });
    }


    return (
      <React.Fragment>
      <p>Select your {characterRound===1?'first':'second'} character, {typeof currentPlayer === 'number'? players[currentPlayer].name : ''}</p>
      <ul className='row small-cards px-0'>
        {characterCards.map( (card,i) => {
          return (
            <li key={card.ID} ref={i===rdmClick? liRef: null} className='col-3 my-2 list-unstyled hover-rotate' 
            onClick={ () => action(card) }>
              <Card card={card} />
            </li>
          );
        })}
      </ul>
      </React.Fragment>
    );

  }

  const viewWrapperCharacter = () => {    

    if (!hand) return;
    if (!hand.stage) return;
    const theCard = cardsAPI.getCalledCharacterCard();
    if ( !theCard || isEmpty(theCard) ) return null;
    
    // find card for the current character

    // init params for this hand:
    const { characterAct, mustChooseCoinsOrCards, allowedToBuild } = gameAPI.getCurrentStageParams();
    logg(`debug : ${characterAct}, ${JSON.stringify(mustChooseCoinsOrCards)}, ${allowedToBuild}, `);
    // init the jxs for the right column
    let special_character_action_jsx = null;

    if ( null === currentPlayer) { // this was set when (!playersAPI.getPlayerWhoOwnsCharacterCard(characterNumber))
      special_character_action_jsx = (<p key='p-smt'>
                Nobody has the character {theCard.name} <br/>
      </p>);
      // gameAPI.checkMoveToNextPlayerOrStage(true); // If we call this one it gets into an infinite loop.
      // so we do it manually      
      setHand(Object.assign(hand, { canMoveNext: { can: true, must: true} } ) );
    } else if (theCard.is_killed) {      
      setHand(Object.assign(hand, { canMoveNext: { can: true, must: true} } ) );
    }
    else {
      // The character act for the magician can happen before the coinOrCards decision
      if ( characterAct && hand.characterActThisTurn === false && theCard["character-number"] === 3)
        special_character_action_jsx = partialViewCharacter_3();

      // Normally, The character act sohuld happen after the Player action is taken
      if (hand && hand.coinsOrCardsThisTurn)
        // could check to write a msg of characted already acted
        if ( characterAct && hand.characterActThisTurn === false ) 
        switch (theCard["character-number"]) {
          case 1:
            special_character_action_jsx = partialViewCharacter_1_and_2(1);
            break;
          case 2:
            special_character_action_jsx = partialViewCharacter_1_and_2(2);
            break;    
          case 3:
            break;
          case 4:
            special_character_action_jsx = partialViewCharacter_4(); break;
          case 5:
            special_character_action_jsx = partialViewCharacter_5(); break;
          case 6:
            special_character_action_jsx = partialViewCharacter_6(); break;
          case 7:
            special_character_action_jsx = partialViewCharacter_7(); break;
          case 8:
            special_character_action_jsx = partialViewCharacter_8(); break;
          default: 
            special_character_action_jsx = <small>No field for this character number</small> 
            break;
        }
    }

    if ( typeof currentPlayer === 'number' ) { 
      // show text of after chaacter acted. This is set during the action of the char.
      if ( hand.characterActThisTurn ) {
        if (hand.messages.after_character_acts)  {
          special_character_action_jsx = [ special_character_action_jsx, hand.messages.after_character_acts ];
        }
        // default msg after character did his action
        if (mustChooseCoinsOrCards && !hand.coinsOrCardsThisTurn)
          special_character_action_jsx = [ special_character_action_jsx, (<p key='shutup1'>You can take your action - grab money or district cards - </p>) ];
        if ( hand.canMoveNext.can )
          special_character_action_jsx = [ special_character_action_jsx, (<p key='shutup2'>You can pass turn to the next character.</p>) ];
        if ( playersAPI.playerCanBuild(currentPlayer) )
      special_character_action_jsx = [ special_character_action_jsx, (<p key='shutup3'>Or you can build {allowedToBuild} district{allowedToBuild>1? 's' : ''}.</p>) ];  
      }
    }

    if ( hand.builtCardsThisPlayerTurn )
      special_character_action_jsx = [ special_character_action_jsx, hand.messages.after_build_card ];

    // add description of the card before the inteaction act from the character.
            
    return (
      <div className='container' key='aa56'>
        <div className='row' key='fd356'>
          <div className='col-4' key='2356'>
            <Card card={ theCard } />

           { ( characterAct ) ? ( <p key='sthn-more'>{theCard.description}</p> ) : null }
    
          </div>
          <div className='col-8' key='fds-2793'>
            
            <ActionButton key='ww' hand={hand} setHand={setHand} handBackup={handBackup} players={players} currentPlayer={currentPlayer} setCurrentPlayer={setCurrentPlayer} playersAPI={playersAPI} gameAPI={gameAPI} cardsAPI={cardsAPI} districtCards={districtCards} setDistrictCards={setDistrictCards} cards={cards} />

            { partialViewDonutShopCanBuy3Cards() /* Modificator for card donuts shop. Buy 3 cards x 3$ */}

            { special_character_action_jsx }

            <NextTurnButton key='w2' cards={cards} hand={hand} gameAPI={gameAPI} players={players} playersAPI={playersAPI} currentPlayer={currentPlayer} setCurrentPlayer={setCurrentPlayer} />

            { 
            /* Modificator for card zurditurium. Allows to sell one non built card per 1$ */
            partialViewSituationWildcardZurditurium() }
            
          </div>
        </div>
      </div>

    )
  }

  // Assassin and Thief CALL. Show the card (the assass or thief) and the list of characters to select one.
  const partialViewCharacter_1_and_2 = (charNum) => {
    // the list of characters cards to show.


    // characters you can't steal from: the assassin or the assassin target (is_killed).
    let eC = []; // this var could be called "extra characters you can't touch", but I call it ec.
    if (charNum === 2) {
      
      const theKilledCardIndex = cards.findIndex( c => c.is_killed );
      eC = [ cardsAPI.getCardIndexByCharacterNumber(1) ].concat( (theKilledCardIndex >= 0) ? [theKilledCardIndex] : [] ); // index of cards
    }

    // characterss except the assasin and except the other character that the player has
    const allCharacterCards = [...cards ].filter(card => 
      card.type && card.type === 'character' 
      && card['character-number'] !== charNum 
      && !players[currentPlayer].characterCards.includes( cardsAPI.getCardIndexByID(card.ID) )  // don't show you chanracters. dont kill you self!
      && !eC.includes( cardsAPI.getCardIndexByID(card.ID) )  // don't show the excluded characters, which are the killer and eny killed characted.
    );
    // This is an option for the game. If we want this stage to be triggered automatically without human action.
    const refArr = allCharacterCards.map( card => React.createRef() );
    const rdmClick = Math.floor(Math.random() * allCharacterCards.length);
    window.requestAnimationFrame(() => {
        if (players[currentPlayer].is_computer 
          && (refArr[rdmClick].current)) {
            console.log('Action automatic to kill/steal on stage: '+hand.stage);     
            refArr[rdmClick].current.click();
          }
    });



    const clickHandle = (selected_character_number) => {
      switch (charNum) {
        case 1: cardsAPI.killCharacter(selected_character_number);
          break;
        case 2: cardsAPI.stealCharacter(selected_character_number);
          break;
        default: break;
      }
      return false;
    }

    return (
        <React.Fragment>        
          {/* show all character cards except the assassin and you own char */ }
           <p key='gg5'>Select the character that you want to { charNum === 1 ? 'kill' : 'steal from' } </p>
           <ul className="list-unstyled row CardsDeck__character-pickup">
           { 
             allCharacterCards.map( (card, i) => {
               return  ( <li  key={'charno-'+i} className="col-4 px-0 pb-3 hover-border" 
                              onClick={ () => clickHandle(card['character-number']) }
                              ref={refArr[i]}>
                           <Card key={card.ID} card={card} />
                         </li> );                
             } ) }
           </ul>        
           { /* extra info about the characters you cant steal from */
           (charNum === 2)? <small>          
               You can't steal from {                 
                   eC.map( (cardIndex, i) => 
                     (((i+1) === eC.length) && (eC.length > 1) ? ' or ' : (i?', ':'') ) 
                     + cards[cardIndex].name )
                   }  </small> : null }
         </React.Fragment>
    );
  }

  // 3: the magician: shows all players and you have to select 1 of them or the deck.
  const partialViewCharacter_3 = () => {
    
    // put current cards on the beggining of districtCards deck, and take same amount from top.    
    const handleDiscardCards = () => {
      let tempDistrictCards = [...districtCards];
      let listCurrentPlayerCard = players[currentPlayer].districtCards.map( cardIndex => ( cards[cardIndex] ) ).filter( card => !card.is_built );
      tempDistrictCards = listCurrentPlayerCard.concat(tempDistrictCards); // this is the new districtCards deck
      setDistrictCards(tempDistrictCards); // put the cards on the beginning
      
      // now pick same amount of cards.
      const numberOfCards = listCurrentPlayerCard.length;      
      let updatePlayers = [...players];
      // remove the private cards from player. This is a little long but basically inits the district cards of the player to the built ones (so basically has removed the ones not built)
      updatePlayers[currentPlayer].districtCards = updatePlayers[currentPlayer].districtCards.filter(cc => !listCurrentPlayerCard.map( ca => cardsAPI.getCardIndexByID(ca.ID) ).includes(cc)); // discard the cards
      
      // get the last top cards from district deck
      for (let i = 0; i < numberOfCards; i++) {
        let lastCard = tempDistrictCards.pop();
        updatePlayers[currentPlayer].districtCards.push(cardsAPI.getCardIndexByID(lastCard.ID));
      }
      setPlayers(updatePlayers);

      logg('@ACTION OF POWER for character 3: Magician - replace cards with the deck');
      let clonedHand = gameAPI.setMessage('after_character_acts', (<h3 key='tt10'>Your cards have been replaced by cards on the deck</h3>));
      setHand(Object.assign(clonedHand, { characterActThisTurn: 'replaced-cards' }));
    }

    // Prepare the data to show swap of 
    const cardsInHand = players[currentPlayer].districtCards.filter( ci => !cards[ci].is_built );
    const swapButtonsInfo = players.map( (player, playerIndex) => {
      if (playerIndex === currentPlayer) return null;
      const privateCards = player.districtCards.filter( cardIndex => !cards[cardIndex].is_built );
      if (!privateCards.length) return null;
      return {
        playerIndex: playerIndex,
        numberCards: privateCards.length,
        ref: (cardsInHand.length <= privateCards.length)? React.createRef() : null
      }            
    }).filter( obj => !!obj );
            


    // Automatic action for computer: This is an option for the game. If we want this stage to be triggered automatically without human action.
    let refArr = false; // every item if the array if the button that we can click, randonmly selected (if decide, also randomly, to swap cards). Only players with the same or more cards are considered to swap.
    let refRandomIndex = false;
    window.requestAnimationFrame(() => {        
      if (players[currentPlayer] && players[currentPlayer].is_computer) {        
        const refArr = [ React.createRef() ].concat( swapButtonsInfo.filter(info => info.ref).map( info => info.ref ) );
        const swap_or_not = Math.floor(Math.random() * 3) < 2; // 66% possibilities swap
        if (swap_or_not) {
          refRandomIndex = Math.floor(Math.random() * refArr.length);
          if (refArr[refRandomIndex] && refArr[refRandomIndex].current) {
            refArr[refRandomIndex].current.click(); // swap!  
            console.log('Automatic action swap cards with ', refArr[refRandomIndex]? refArr[refRandomIndex].current : null);
            hand.messages.before_coins_or_cards_action = <p>Cards swapped</p>
          } else console.log('ERROR. Not found ref');
        } else {
          hand.messages.before_coins_or_cards_action = <p>No cards swapped</p>
          console.log('Automatic action swap cards not taken ');
          setHand( Object.assign({...hand}, { characterActThisTurn: 'no-act'} ) );             
        }  
      }
    });

    // now the view
    return (
      <React.Fragment>
        <div className="col-12 my-4">You can change the cards in your hand. Select, if you want, how you want to discard your hand</div>
        <div className="d-flex-row flex-wrap">
          <div className="col-sm">
            
            <NextTurnButton cards={cards} hand={hand} gameAPI={gameAPI} players={players} playersAPI={playersAPI} currentPlayer={currentPlayer} setCurrentPlayer={setCurrentPlayer} overwriteText={'Keep my cards and move to next player'} />
            
            <button className="btn btn-info w-100" 
                    onClick={handleDiscardCards}
                    ref={refArr? refArr[0] : null } >
              Discard on Deck
              <ul className="d-inline-flex list-unstyled extra-small-cards">
                {  /* show back of cards for the non built ones */
                cardsInHand.map( ci => {
                  return (<li key={'dd' + ci} ><img className="rotate-left rounded small-card img-fluid p-1" src="/imgs/back.jpeg"  alt="" /> </li>);
                } )  }
              </ul>
            </button>
          </div>
          <hr className='w-100'/>
          { swapButtonsInfo.map( (info, i) => {
            return ( 
                <div  key={'k'+i} className="col-sm" 
                      onClick={ () => playersAPI.swapDistrictCardsBetweenPlayers( null, info.playerIndex) } 
                      ref={info.ref? info.ref : null }
                      >
                  <button className={ 'mb-3 btn btn-primary' }>
                    <p className="mb-0"> 
                      Exchange cards with <b>{players[info.playerIndex].name}</b> 
                      <small className='d-block'>{info.numberCards} cards</small>
                    </p>
                    <ul className="d-inline-flex list-unstyled">
                    { Array.from(Array(info.numberCards), (e, i) =>
                        <li key={'dd' + i} ><img className="rounded small-card img-fluid p-1" src="/imgs/back.jpeg"  alt="" /> </li> )
                    } 
                    </ul> 
                  </button>
                  { (players[currentPlayer].is_computer && refRandomIndex && refArr[refRandomIndex] && refArr[refRandomIndex].current)? refArr[refRandomIndex].current.click() : null }
                </div>
            );
          }) }
        </div>
      </React.Fragment>
    );
  }

  // 4: the king
  const partialViewCharacter_4 = () => {    
    return (
      <div key='hp0'>
        <p> You get the crown. You will start next turn. </p>
      </div>
    );
  }

  const partialViewCharacter_5 = () => {
    return (
      <div key='hp3'>        
        You are inmune to any attack from the Warlord
      </div>
    );
  }

  // the merchant (Mr Burns)
  const partialViewCharacter_6 = () => {
    // the money is given in lifecycle hand.coinsOrCardsThisTurn update.
    if (gameAPI.getCurrentStageParams().mustChooseCoinsOrCards) {
     if (!hand.coinsOrCardsThisTurn) 
        return <p>You will receive $ 1 after taking your action </p>    
      // return <div> There you go!. You have $ 1 more. </div> we do it tiwh the message param
    }
    return null;
  }

  // the architect - receives 2 cards and can build 3 cards
  const partialViewCharacter_7 = () => {
    if (gameAPI.getCurrentStageParams().mustChooseCoinsOrCards) {
      if (!hand.coinsOrCardsThisTurn)      
        return ( <React.Fragment>
            <p key='u4'>You will receive 2 cards after taking your action </p>    
            <p key='u2'>You can build up to ${gameAPI.getCurrentStageParams().allowedToBuild} cards this turn. </p>    
            </React.Fragment> 
        );
      return <div> There you go!. You took { hand.pickedCardsThisPlayerTurn } cards in your hand. Happy building!</div>
    }
    return false;
  }

  // Bart, can destroy one district card built
  const partialViewCharacter_8 = () => {
    // destroying the card ... or at least trying
    const handleCardClick = (card) => {
      const cardIndex = cardsAPI.getCardIndexByID(card.ID);
      if (playersAPI.warlordCanDestroyBuiltCard(card)) {
        const { playerIndex: destroyedPlayer } = playersAPI.getPlayerWhoOwnsDistrictCard(card.ID);

        // Modificator, the attacked player (not the current one) has the graveyard
        const graveyardCards = cardsAPI.getWildcards('graveyard'); // array of card indexes        
        if (playersAPI.playerHasBuiltWildcard(destroyedPlayer, 'graveyard') 
            && !graveyardCards.includes(cardIndex) ) {
          // The attacked player has the graveyard. He can choose using it or not. This takes us to a different scenario. We move to a that stage. The graveyard card can be destroyed as any other
          setHandBackup({...hand});
          setHand(Object.assign({...hand}, {stage: 'situation-graveyard:defend-with-graveyard', attackedCardID: card.ID  })); 
          setCurrentPlayer(destroyedPlayer);
        }
        // If the user doesn have the graveyard (normally) We proceed to destroy the card.
        else
        if (playersAPI.destroyBuiltCardByWarlord(card)) {
          let clonedHand = {...hand}
          clonedHand.characterActThisTurn= 'destroy-card';
          setHand(clonedHand);
          logg('@ACTION OF POWER for character 8: Warlord - destroys a card');
        }
      }
    }

    let refsSet = {};
    logg('@ACTION OF POWER for character 5 - The player with this card can not be destroyed');
    // We prepare the var with all the info about the destroyable cards per player. 
    const { playerIndex: bishopPlayerIndex } = playersAPI.getPlayerWhoOwnsCharacterCard(5);
    const playersDestroyable = players.map(( player, playerIndex ) => {
      // playersDestroyable = array [ { cardsDestroyable: [ { ID:xx, ..., destroyable: true }, { ID:xx, ..., destroyable: false }, ... ] }  ]
      // every index of array corresponds to index on 'players' array.
      if (playerIndex === currentPlayer ) return null;
      if (typeof bishopPlayerIndex === 'number' && bishopPlayerIndex >= 0  && bishopPlayerIndex === playerIndex && bishopPlayerIndex !== currentPlayer )
        return null;
        const builtCards = player.districtCards
                              .filter( cardIndex => cards[cardIndex].is_built )
                              .map( ( cardIndex, i ) => { 
                                const theCard = { ...cards[cardIndex] };
                                theCard.destroyable = playersAPI.warlordCanDestroyBuiltCard(theCard);
                                if (theCard.destroyable) 
                                  refsSet[theCard.ID] = React.createRef();                                
                                return theCard;
                              } );
        return {is_bishop: false, cardsDestroyable: builtCards }
    });
    
    // Automatic action for computer: This is an option for the game. If we want this stage to be triggered automatically without human action.
    // we have refsSet = { 32: {current: <> ...}, } where 32 is card.ID. Only cards that are destroyable.
    window.requestAnimationFrame(() => {        
      if (players[currentPlayer].is_computer && !hand.characterActThisTurn) {
        const rdmClickKey = Object.keys(refsSet)[Math.floor(Math.random() * Object.keys(refsSet).length)];
        if (Object.keys(refsSet).length && refsSet[rdmClickKey].current) {
          console.log('Action automatic destroy a card: '+hand.stage);     
          // destroy or not destroy. Let's destroy on a possibility of 66%
          const destroy_or_not = Math.floor(Math.random() * 3) < 2; // rdm results between [0..2]
          if (destroy_or_not)
            refsSet[rdmClickKey].current.click(); // destroy!
          else { // the computer decided not to destroy
            let newHand = { ...hand};
            newHand.messages.after_character_acts = <b>Bart didnt destroy any card</b>;
            newHand.characterActThisTurn = 'dont-destroy';
            setHand(newHand);
          }
        }
      }
    });

    return (
      <div key='ff1'>        
        <p key='por3'>Select the district you want to destroy</p>
        {
          (bishopPlayerIndex !== currentPlayer && typeof bishopPlayerIndex === 'number' && bishopPlayerIndex >= 0)? (
              <p key='uy3'>You can't attact <b>{players[bishopPlayerIndex].name }</b>, because he has the Bishop character.</p>
          ) : null
        }
        { 
        playersDestroyable.map(( player, playerIndex )=> {     
          if (!player) return null;
          return ( 
            <div key={ ' player-to-destroy-' + playerIndex} >
              <h3>{ players[playerIndex].name } <small> { player.cardsDestroyable? `${player.cardsDestroyable.length} cards` : `` } </small></h3>
              { !player.cardsDestroyable.length ? (<p>No cards to destroy</p>) : (
                <ul className='list-unstyled'>
                { player.cardsDestroyable.map( card => {                  
                  return (
                    <li className={ 'small-card col-sm ' + (card.destroyable? 'Card--destroyable hover-border pointer-cursor' : 'Card--undestroyable') }
                        onClick={ card.destroyable? () => handleCardClick(card) : null }
                        ref={refsSet[card.ID]? refsSet[card.ID] : null}
                        key={ 'destroy-card-' + card.ID }
                    >
                      <Card card={card} />
                    </li>
                    ) 
                  }) 
                }
                </ul>
              ) }
            </div>
          )
        })
        }
      </div>
    );
  }

  const viewGameEndPlayerCount = () => {
    // the view for every player counting his points when the game is over.
    
    const changeCardColor = (card, district_color) => {
      // given the card, we change the type-of-district attr.
      const cardIndx = cardsAPI.getCardIndexByID(card.ID);
      card['type-of-district'] = district_color;
      card.is_color_changed = true;
      const newCards = [...cards];
      newCards[cardIndx] = card;
      setCards(newCards);
      const puntuation = playersAPI.calculatePuntuationPlayer(currentPlayer);
      const curPlyObj = [...players][currentPlayer];
      curPlyObj.puntuation = puntuation;
      players[currentPlayer] = curPlyObj;
      setPlayers([...players]);
    }

    if (!cards.length) return;
    if ( hand.stage !== 'end-game') return; // set the hand.stage to thos in order to render this screen
    const winnerIndex = players.findIndex( pl => pl.winner===true );
    if (winnerIndex >= 0) {
      setCurrentPlayer(winnerIndex);
      return (<h3 className='mt-5'>Congrats {players[winnerIndex].name},<br/>you won, with {players[winnerIndex].puntuation.total} points</h3>)
    }
    // if no player is set, we start counting by the first one
    if (typeof currentPlayer !== 'number') {          
        setCurrentPlayer(0);
        return;
    }


    if (!players[currentPlayer].puntuation) return;
    
    const { pointsByCards, pointsByColor, pointsByFinishingGame, pointsBy8Districts, pointsByBadulaque, pointsByRio, total } = players[currentPlayer].puntuation;
    
    // Modificator card 'choose-card-color', With this card the player can hoose its colour, than can count for the counting.
    const cardToChoosecolor = playersAPI.playerHasBuiltWildcard(currentPlayer, 'choose-card-color');
    const uniqueColors      = cards.map(item => item["type-of-district"]? item["type-of-district"] : null).filter((value, index, self) => value !== null && self.indexOf(value) === index) // unique colours inthe game
    const jsx = (cardToChoosecolor && !cardToChoosecolor.is_color_changed && !cardToChoosecolor.is_built_this_hand)? (
        <div className='mt-3' key='hy5'>
          You have the card {cardToChoosecolor.name}, you can choose its colour and it can affect the counting of points.
          <ul className='list-unstyled row justify-content-center mt-3'>
          { uniqueColors.map( color => (
            <li onClick={() => changeCardColor(cardToChoosecolor, color) } className={`mx-1 badge badge--inline Card__badge--color-${color}`}>
              &nbsp;
            </li>
          ) )}
          </ul>
        </div>
      ) : null;

    return (
      <div key='rt5' className='row'>
        { jsx }
        <h2 className='col-12'>Counting points for {players[currentPlayer].name}</h2>
        <ul className="col-12 list-unstyled">
          <li key='k1'>Points by built cards: {pointsByCards}</li>
          <li key='k2'>Points by cards of all different colours: {pointsByColor}</li>
          <li key='k3'>Points by finising the game: {pointsByFinishingGame}</li>
          {pointsBy8Districts? <li key='kk'>Points by building a full city: {pointsBy8Districts}</li> :  null }
          {pointsByBadulaque? <li key='s2'>Points by Badulaque card (converts your money into points): {pointsByBadulaque}</li> :  null }
          {pointsByRio? <li key='ss2'>Points by Rio card (every different color in your cards is 1 point): {pointsByRio}</li> :  null }
        </ul>
        <h1 className='col-12'> Total: {total} </h1>
        <NextTurnButton cards={cards} hand={hand} gameAPI={gameAPI} players={players}  playersAPI={playersAPI} currentPlayer={currentPlayer} setCurrentPlayer={setCurrentPlayer} />
      </div>
    );
  }

  // When the Wardlord attacks a card, and the attacked player has the gravyard
/*  const viewSituationGraveyardDefend = () => {

    if (!cards.length) return;
    if ( hand.stage !== 'situation-graveyard:defend-with-graveyard') return; // set the hand.stage to thos in order to render this screen

    const graveyardCard = cards[cardsAPI.getWildcards('graveyard')[0]] || {};
    const warLordCard = cardsAPI.getCardByCharacterNumber(8); // warlord is num 8
    const attackedCard = {...cards[cardsAPI.getCardIndexByID(hand.attackedCardID)]}; // I saved this before I called this stage
    const hasMoneyToSaveIt = players[currentPlayer].money >= 1;

    const backToCallerStage = () => {
      console.log('Moving back to the caller stage call-character-8, from situation');      
      if (!handBackup.characterActThisTurn) { // this happens when the attacked player doesnt have money to defend the card. In that case the card is already destroyed by the caller.
        handBackup.characterActThisTurn = 'destroy-for-lack-of-money-to-defend';
        handBackup.messages.after_character_acts = <h4 key='y94'>You destroyed the card {attackedCard.name} because {players[currentPlayer].name} didn't have money to protect it</h4>
      }
      setHand( {...handBackup }); // handBackup contains the stage:call-character-8 and all the settings as they were 
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


    return (<div key='fd3' className='row'>
      <div key='yi4' className='col-4'>
        <Card card={graveyardCard} />
        <div className='position-absolute top-0 rotate-right extra-small-card'>
          <Card card={warLordCard} />
        </div>
        <p>{ graveyardCard.description } </p>
      </div>
      <div key='re3' className='col-8 small-cards'>
        <p>The attacked card is the {attackedCard.name}</p>
        <Card card={attackedCard} />
        {
          !hasMoneyToSaveIt? (<div><p>You don't have 1 coin to save it! sorry</p>
                                    <button onClick={backToCallerStage} className='btn btn-primary btn-danger'>Back</button>
                              </div>) : (
            <div className='action-btns justify-content-center'>
              <p>Make your choice:</p>
              <button onClick={saveAttackedCard} className='btn btn-primary btn-danger mr-2'>Save the card</button>
              <button onClick={letItCrumbleToDust} className='btn btn-primary btn-success'>Let it crumble</button>
              <p>Saving the card will cost you 1 coin,</p>
            </div>
          )
        }
      </div>
    
    </div>);
  } */

  /*const viewSituationCommisaryDestroyCard = () => {
    if (!cards.length) return null;
    if ( hand.stage !== 'situation-commisary:destroy-a-card') return null; // set the hand.stage to thos in order to render this screen
    
    const commisaryCard = cards[cardsAPI.getWildcards('commisary')[0]] || {}; // the wildcard

    const handleDestroyCard = (cardIndex) => {
      if (cardIndex >= 0 ) {
        const destroyed = playersAPI.destroyBuiltCard(cards[cardIndex]);
        logg('Commisary card destroying card', destroyed);
        handBackup.messages.after_build_card = <p>You have just destroyed the card {cards[cardIndex].name}, using your card {commisaryCard.name}, which has also been removed.</p>
      } else {
        handBackup.messages.after_build_card = <p>Wigum did't destroy any card, and your card {commisaryCard.name}, has been removed form the game.</p>
      }
      // destroy also the commisary, but this one completely, dont move it back to the deck
      let dCards = [...players[currentPlayer].districtCards ];
      dCards = dCards.filter( ci => !(cards[ci].wildcard === 'commisary' && cards[ci].is_built) ); // get district card from player except the commisary that he is building
      players[currentPlayer].districtCards = dCards;
      setPlayers(players);
      // --- 
      setHand( {...handBackup} );
      // the handbackup is reset in the update of hand.stage
    }

    return (

      <div key='poszi' className='modal d-block bg-opacity' tabIndex="-1" role="dialog" > 
        <div key='s3' className='modal-dialog modal-content p-4' role="document"> 
          <div key='s2' className='row'>
            <div key='q3' className='small-card col-3'>
              <Card card={commisaryCard} />
            </div>
            <div key='r3' className='col-9'>
              <p key='g-1'>You Are building the {commisaryCard.name}!</p>
              <p key='g-3'>You can destroy any card from your opponents</p>
            </div>
          </div>
          { players.map( (pl, pli) => {
              if (pli === currentPlayer) return null;
              const listCardsPlayer = playersAPI.getBuildDistrictCardsForPlayer(pli);
              return (
                <div key={'ppl-'+pli} className='col-12'>
                    <h4>{pl.name}</h4>
                    <ul className='list-unstyled extra-small-cards d-flex flex-wrap'>
                      { listCardsPlayer.length? null : <p>No cards to destroy</p> }
                      { 
                        listCardsPlayer.map( ci => {
                        return (
                        <li key={'plki'+ci} className='col-sm hover-border'
                            onClick={ () => handleDestroyCard(ci) } >
                          <Card card={cards[ci]} />
                        </li>
                        )
                      }) }
                    </ul>
                </div>
              );
          }) }
          <button className='btn btn-danger mt-2' onClick={() => handleDestroyCard(-1) }>
            I am magnanimus, I don't want to destroy any card.
          </button>
        </div>
      </div>
      
    );
  } */

  // if the player has the card Zurditurim, on his turn he can choose on changin one card and take 1 coin
  const partialViewSituationWildcardZurditurium = () => {
    if (!cards.length) return null;
    if (typeof currentPlayer !== 'number') return;
    
    if (!gameAPI.getCurrentStageParams().characterAct) return null; // only if actions area llows (ie, if killed he cant do it.)
    
    if (players[currentPlayer].card_sell1card1coin_already_used) return null; // if already used, dont show

    // if no cards in hand, dont show
    if (!players[currentPlayer].districtCards.filter( ci => !cards[ci].is_built ).length) return null;

    const handleSellCardPer1Coin = (cardIndex) => {
      logg(`Using the card to sell your ${cards[cardIndex].name} per $1`);
      // 1 send card to the deck
      let tempDistrictCards = [cards[cardIndex]].concat([...districtCards]);
      setDistrictCards(tempDistrictCards); // put the cards on the beginning
      // 2 remove card from players
      let clonedPlayers = [...players];
      const newPlayer = {...players[currentPlayer] } 
      newPlayer.districtCards = newPlayer.districtCards.filter( ci => ci !== cardIndex );
      clonedPlayers[currentPlayer] = newPlayer;
      // 3 give 1$ to the player
      clonedPlayers[currentPlayer].money++;
      // set the flag to avoid using the card more times in this turn
      clonedPlayers[currentPlayer].card_sell1card1coin_already_used = true;
      // 4 update the players
      setPlayers(clonedPlayers);      
    }
    
    const wildCard = playersAPI.playerHasBuiltWildcard(currentPlayer, 'sell-card-per-1-coin'); // this should be an object
    if (typeof wildCard === 'object') {

      return (
        <div className='col-12 mt-4'>
          <p key='lpp1'>You have the card {wildCard.name}</p>
          <p key='lpp2'>If you want to, you can sell one of your cards and get 1 coin for it</p>
          <ul className='row extra-small-cards px-0 list-unstyled'>
          { players[currentPlayer].districtCards.filter( ci => !cards[ci].is_built ).map( (ci,i) => {
              return (
                <li key={'xx'+i} className='col-3 my-2 hover-border' onClick={ (e) => handleSellCardPer1Coin(ci) }>
                  <Card card={cards[ci]} />
                </li>
              );
            } )
          }
          </ul>
        </div>
      );


    }

    return null;
  }

  const partialViewDonutShopCanBuy3Cards = () => {
    if (!cards || !cards.length) return null;
    const shopCard = playersAPI.playerHasBuiltWildcard(currentPlayer, 'buy-3-cards');
    if (!shopCard) return null;
    if (players[currentPlayer].card_buy3cards_already_used) return null;

    const buy3Cards = () => {
      players[currentPlayer].money -= 3; // setPlayers will be called in the next fn.
      players[currentPlayer].card_buy3cards_already_used = true; // setPlayers will be called in the next fn.
      playersAPI.pickUpCard({ cardID: 'last-district-card', times: 3 } );
    }

    const canBuy3Cards = players[currentPlayer].money >= 3;
    return (<div className='row' key='g4'>
      <p key='gd3'>You have the card {shopCard.name}. With it you can buy 3 cards per $3</p>
      { canBuy3Cards? (<p key='d'>
          <button className='btn btn-primary' onClick={buy3Cards}>Buy 3 cards per $3</button>

      </p>) : <p key='d'>But you don't have $3, so you can't use that power in this turn.</p>}

    </div>);

  }




  const viewSituationPlayerChoosesEndGame = () => {
    if (!cards.length) return null;
    if ( hand.stage !== 'situation-game-end?:player-chooses') return null;

    const handleFinishGame = (finishOrNot) => {
      console.log('Chose to finish game: '+finishOrNot+'. ? Moving back to the caller stage from situation-game-end?:player-chooses');      
      // if chooses yes, update state:
      if (finishOrNot)
        setGameEndedBy(currentPlayer);   
      // back to caller stage
      setHand( {...handBackup } ); // >>>> Triggers update, where handBackup is reset and moves to next stage.
      // it cant movetonextstage here because it triggers handles that overwrite the hand and stuff.
    }
    // Automatic action
    const refFinish = React.createRef();
    let msg = null;
    if (players[currentPlayer] && players[currentPlayer].is_computer) {
      // msg = 
      handBackup.messages.after_character_acts = <p>The computer has decided {gameEndedBy === currentPlayer? '' : 'not '} finishing the game at the end of this hand</p>
      window.requestAnimationFrame(() => {
        // if (!refFinish.current) return;
        const decide_finish = 1;
        // refFinish.current.click();
        handleFinishGame(decide_finish);
        console.log('Action automatic to finish the game',decide_finish);
      });
    }
    return (
      <div key='poszi' className='modal d-block bg-opacity' tabIndex="-1" role="dialog" > 
        <div className='modal-dialog modal-content p-4' role="document"> 
          { msg? msg : ( /* << this is the html when the player is the computer */
            <div>
              <h3>Finish the game at the end of this hand?</h3>
              <p key='fd3'>You have enough district cards built to finish the game</p>
              <button ref={refFinish} key="bfsfg" className='btn btn-success' 
              onClick={ () => handleFinishGame(true) }>
                        Yes, end the game
              </button>
              <button key="fdfg" className='btn btn-danger' 
              onClick={ () => handleFinishGame(false) }>
                        No, keep on playing
              </button>
              <p key='ll3'>The game will continue after the end of the hand, where the count of points will happen</p>
            </div>

          ) }
        </div>
      </div>
    )
  }

  return (
    <div className="CardsDeck text-center">        
        <Pick4InitialCards hand={hand} players={players} playersAPI={playersAPI} gameAPI={gameAPI} gameOptions={gameOptions} currentPlayer={currentPlayer} />
        <Discard1Character hand={hand} gameOptions={gameOptions} cards={cards} characterCards={characterCards} cardsAPI={cardsAPI} gameAPI={gameAPI} players={players} currentPlayer={currentPlayer} />
        {viewCharacterSelectionDeck()}
        {viewWrapperCharacter()}
        { hand.stage === 'situation-graveyard:defend-with-graveyard' ? 
          <GraveyardView gameOptions={gameOptions} hand={hand} setHand={setHand} handBackup={handBackup} playersAPI={playersAPI} players={players} currentPlayer={currentPlayer} setCurrentPlayer={setCurrentPlayer} setPlayers={setPlayers} cardsAPI={cardsAPI} cards={cards} districtCards={districtCards} setDistrictCards={setDistrictCards} /> : null
        }
        { hand.stage === 'situation-laboratory:select-deck-card' ? 
          <LaboratoryView gameOptions={gameOptions} hand={hand} setHand={setHand} handBackup={handBackup} playersAPI={playersAPI} players={players} currentPlayer={currentPlayer} cardsAPI={cardsAPI} cards={cards} districtCards={districtCards} setDistrictCards={setDistrictCards} /> : null
        }
        { hand.stage === 'situation-commisary:destroy-a-card' ? 
          <CommisaryView gameOptions={gameOptions} gameAPI={gameAPI} setHand={setHand} handBackup={handBackup} playersAPI={playersAPI} players={players} setPlayers={setPlayers} currentPlayer={currentPlayer} cardsAPI={cardsAPI} cards={cards} /> : null
        }
        {viewSituationPlayerChoosesEndGame()}
        {viewGameEndPlayerCount()}
    </div>
  );
}

export default CardsDeck;
