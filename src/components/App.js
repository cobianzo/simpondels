/*TODO:

  DONE: Al construir, evitar q se puedan construir dos cartas iguales. (actualizar allow to build, buildable card)
  BUG: turno lenny & card. Escoger cartas y no dinero. A acabar la accion se ejecuta la Character Act, q es tomar 2 cartas mas. Pero la turn param pickedCardsThisPlayerTurn se queda en 2 y no 4.
  BUG: bart, when destroying a card, he can build  
  FIXED: los wildcards no cuentan como carta de distrito
  DONE: Anotar cuando una carta ha sido construida en este turno, y marcarlas animadas
  BUG: mano de mono, al volver al backup stage, no gaurda bien. (quiza el handBackup no se resetea?)
  DONE: when using commisary allow not to destroy anything.
  TODO: make decisions of computer with timeout to see what he does
  DONE: show info for wildcards when hovering, and characters when hovering in character selection
        For that, see how to create ref for  the class .tootilpable
  TODO: Laboratory working ok even for computer, now just show a message saying that you chose a Card.
  TODO: Create a helper that returns 'you;, 'the computer' or the name of the 'current char'
  TEST: test if Lenny & Carl can take cards from 3 options
  TEST: check if alcande gets the crown if hes killed
  BUG: having the card residencia or montanha modifies the move next button. The dependiente has his own next button and eneds to be using the <NextBtn/> component.
  BUG: when has the residencia and mountain cards at the same time, it receives only 1 card instead of 2?
  BUG: You have the card tienda-de-donuts, shoudlnt appear if you are killed, and you should be able to use it
  BUG: can buy 3 cards pe doesnt work
  BUG: que no se vea la pantalla hasta que se responda la pregunta modal.
  BUG: dont being able to use the card tiend de donuts if dead.
  BUG: finish game for computer: not working automatic decision
  BUG: calculating points to 3rd player moves automatically to show the winnner.
  BUG: mano de mono to the computer. The comp should select a random card. When selecting a card, the Next turn doesnt appear.
  BUG: The modal window, if is bigger than the screen ,doesnt scroll
  TODO: when having the card Centro de Convenciones, show a message explaining that building is $q cheaper
  TODO: Dont show Wait scren in stage discard 1 character card
  BUG: When teh computer has Lenny and Carl, I think he is not getting extra cards after Action
  BUG: the action of a wildcard doesnt run the check Move to next
*/
import React, { useState, useEffect, useRef } from 'react';

import TopNav from './TopNav';
import StartGame from './StartGame';
import CardsDeck from './CardsDeck';
import Card from './Card';
import Footer from './Footer';
import Tooltip from './Tooltip'; // do we use this?
import Players from './Players';
import WaitConfirmationModal from './WaitConfirmationModal';
import Debug from './Debug';
import '../css/App.scss';
import { shuffle, unique, isEmpty, logg, logfn, pronoum } from "../helpers";
import { loadApolloClient, GET_GAMEFRAME_BY_SLUG, loadCardsFromDB } from "../db-api";

// The app can be called unsing Router technics. 
// When called with redirect, then 'location' contains params, in particualr the param location.gameProps.initCards, with the JSON of all the cards
// When called from Router match, the params are in match.params.gameslug, with a value of the slug of the gameframe
function App({location, match}) {

  // M O D E L +++++++++++++++++++++++++++++++++++++++ states
  const [cards, setCards] = useState([]); // [ {cardOjb}, {cardObj} ... ]
  const [characterCards, setCharacterCards] = useState([]); // [ {cardOjb}, {cardObj} ... ] (it would have been better a list of index)
  const [districtCards, setDistrictCards] = useState([]);
  const [players, setPlayers] = useState([]); // [ {playerObj}, {playerObj} ... ]
  const [crownPlayer, setCrownPlayer] = useState(null); // set to the player index
  const [hand, setHand] = useState({ number: null, 
                                     // stage: THIS is IMPORTANT info in the game. Tells in what stage we are. Goes together with 'stages' var.
                                     stage: null,
                                     // THIS STATE CHANGE trigger the Events of the game and allow to change the stage.
                                     pickedCardsThisPlayerTurn: 0, // EVENT: pick up a card 
                                     builtCardsThisPlayerTurn: 0, // EVENT: build a district
                                     coinsOrCardsThisTurn: false, // if false, no action is allowed. (action means either take 2 coins or grab 2 district cards)
                                     characterActThisTurn: null, // kill, thief ... Only for character call turn
                                     canMoveNext: {}, // {can: bool, must: bool} tells if the current turn can be finished (false if there sre still mandatory actions to be taken in the turn)
                                     districtsBuiltThisPlayerCharacter: 0, // only for the call-character stages. It's the number of cards for the current character, and built by the player who owns the current character.
                                     stageParamsThisTurn: {}, // we initialize this from 'stages' var, every time hand.stage changes.
                                     messages: {
                                       before_coins_or_cards_btn: null,
                                       after_coins_or_cards_btn: null,
                                       after_coins_or_cards_action: null,
                                       after_character_acts: null,
                                     }
                                     }); // starts in 0. Every complete hand increments
  const [handBackup, setHandBackup] = useState(null); // sometimes we move to a different stage temporarily and then back, so we need to reset this params, saved somewhere.
  const [currentPlayer, setCurrentPlayer] = useState(null); // index of player from the 'players' array. If null the hand didnt start
  const [gameEndedBy, setGameEndedBy] = useState(null); // index of player who ended the game
  const [gameStarted, setGameStarted] = useState(false); // index of player who ended the game
  const [infoMode, setInfoMode] = useState(false); // makes that clicking a card gives you the info about the card.
  const [temporaryMessage, setTemporaryMessage] = useState(null); // not in use yet!
  const [tooltipMsg, setTooltipMsg] = useState(null);
  const [justAFlag, setJustAFlag] = useState(false); // Probably we can ger rid of this
  const [gameOptions, setGameOptions] = useState({ // this is updated by an external file
    // dev: true,
    // waitForPlayer: false,
    // hideIfNotCurrentPlayer: false,
    // moveOnIfOnlyOneOption: true,
    // endsGame: 8 // number of districts built for a player to end the game
  });

  const stages = {
                  'district-selection' :    { loopPlayers: true, maxCardsToPickup: 4, minCardsToPickup: 4},
                  'discard-character':      {maxCardsToPickup: 1, minCardsToPickup: 1},
                  'character-selection-1' : { loopPlayers: true, maxCardsToPickup: 1, minCardsToPickup: 1},
                  'character-selection-2' : { loopPlayers: true, maxCardsToPickup: 1, minCardsToPickup: 1}, 
                  'call-character-1' : { mustChooseCoinsOrCards: {coins: 2, cardsToChoose: 2}, characterAct: 'mandatory', maxCardsToPickup: 1, allowedToBuild: 1 },
                  'call-character-2' : { mustChooseCoinsOrCards: {coins: 2, cardsToChoose: 2}, characterAct: 'mandatory', maxCardsToPickup: 1, allowedToBuild: 1 },
                  'call-character-3' : { mustChooseCoinsOrCards: {coins: 2, cardsToChoose: 2}, characterAct: 'optional', maxCardsToPickup: 1, allowedToBuild: 1 },
                  'call-character-4' : { mustChooseCoinsOrCards: {coins: 2, cardsToChoose: 2}, characterAct: 'automatic', maxCardsToPickup: 1, allowedToBuild: 1 },
                  'call-character-5' : { mustChooseCoinsOrCards: {coins: 2, cardsToChoose: 2}, characterAct: 'none', maxCardsToPickup: 1, allowedToBuild: 1 },
                  'call-character-6' : { mustChooseCoinsOrCards: {coins: 2, cardsToChoose: 2}, characterAct: 'automatic', maxCardsToPickup: 1, allowedToBuild: 1 },
                  'call-character-7' : { mustChooseCoinsOrCards: {coins: 2, cardsToChoose: 2}, characterAct: 'automatic', maxCardsToPickup: 1, allowedToBuild: 3 }, // the architect can build up to 3 cards
                  'call-character-8' : { mustChooseCoinsOrCards: {coins: 2, cardsToChoose: 2}, characterAct: 'optional', maxCardsToPickup: 1, allowedToBuild: 1 },
                  'end-game': { loopPlayers: true, mustChooseCoinsOrCards: false }
  };
  
  let clonedHand = { ...hand }; // we define this globally, so if two setState happen in the same refresh, the second takes the updated value from the first.

  // in case I need to pass them all.
  const props = { cards, characterCards, districtCards, players, crownPlayer, hand, handBackup, currentPlayer, gameEndedBy, gameStarted, infoMode, temporaryMessage, tooltipMsg, justAFlag, gameOptions }

  // __CONSTRUCTOR: ON COMPONENT MOUNT - considers two cases: 
  // 1_ In case we call App from a router link with the cards as prop: <NavLink to={{ path:..., gameProps: initCards  }}, 2_ In case the url specifies the slug of the gameframe /game/simpondels
  useEffect(() => {
    // CASE the App component was called from Router <Redirect>
    if ( location.gameProps?.initCards) {
      setCards(location.gameProps.initCards);
    }

    // CASE The App component was called from <Router match>
    if (match?.params?.gameslug) {
      const { gameslug } = match.params;
      // create a fn to load the gameframe from the slug

      loadApolloClient().query({
          query: GET_GAMEFRAME_BY_SLUG,
          variables: { slug: gameslug },
        })
        .then((result) => {
          console.log('gameframe loaded;', result);
          loadCardsFromDB(result.data.gameframeBy, setCards);
        });
    }

    console.log('component did mount',location.gameProps?.initCards);
  }, []);

  
//  I dont know how to use why did you render with hooks
//if (gameOptions.dev) {
//   const whyDidYouRender = require('@welldone-software/why-did-you-render');
//   whyDidYouRender(React);
// }

  // Helper - use it with a state param. ie const prev = usePrevious(cards)
  const usePrevious = value => {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };

  // C O N T R O L L E R ++++++++++++++++++++++++++++++++++++++++


                /*        G A M E   A.P.I
                _______________          |*\_/*|________
                |  ___________  |        ||_/-\_|______  |
                | |           | |        | |           | |
                | |   0   0   | |        | |   0   0   | |
                | |     -     | |        | |     -     | |
                | |   \___/   | |        | |   \___/   | |
                | |___     ___| |        | |___________| |
                |_____|\_/|_____|        |_______________|
                  _|__|/ \|_|_.............._|________|_
                / ********** \            / ********** \
              /  ************  \        /  ************  \
 */
  const gameAPI = {
    initDemoGame: async() => {
      
      const url = window.location.origin + '/gameoptions.json';
      await fetch(url)
              .then(response => response.json())
              .then(json => {        
                // TODO: check if file doesnt exist.
                logg('loaded gameoptions for this environment: ', json);
                setGameOptions(json);                    
              });

      cardsAPI.loadCards();
      gameAPI.initPlayers([{ name: 'Giuseppe', is_computer: true}, { name: 'Player 1' }, { name: 'Canallita', is_computer: true }]);
    },
    
    // @MODEL:PLAYERS - INIT
    // @players: array with names of the players , ie [ {name: 'Peter', is_computer: false}, ... ]
    // inits the state players.
    initPlayers: (playersArray = []) => {
      logfn( 'initPlayers', [...arguments ]);    
      const allPlayers = playersArray.map( (obj,i) => ({
        name: obj.name? obj.name : "Player "+i,
        money: 0,
        characterCards: [], // array of indexes in 'cards' array
        districtCards: [],
        is_computer: obj.is_computer? obj.is_computer : false
      }) );
      // optional: shuffle the array
      setPlayers(allPlayers);
    },
      
    // @MODEL:APP game
    startGame: () => {
      logfn( 'startGame', [...arguments ]);

      if (!cards.length) {
        alert('load the cards first');
        return;
      }
      // TODO: validation. We can start a new hand only when the game didnt start or when the last player finished his turn

      // When we change the stage we trigger the useEffect to shuffle the decks
      setCurrentPlayer(0); //->>> currentPlayer change trigger
      const keys = Object.keys(stages);
      setHand(Object.assign( clonedHand, { stage: keys[0] })); // set to initial stage
      setCrownPlayer(0);  
      cardsAPI.initDistrictOrCharacterDeck('district', true);
      cardsAPI.resetCardsStatus();
      setGameStarted(true);
    },

    // load from json file
    saveGameAsJSON: () => {
      const tempHand = hand;
      tempHand.messages = {};
      const json = { 
        cards, 
        characterCards,
        districtCards,
        hand: tempHand,
        players,
        currentPlayer,
        crownPlayer,
        gameEndedBy,
        gameStarted,
        gameOptions, 
      };
      return json;
    },

    loadGame: async (data = null) => {
      const loadObjectIntoGame = (json) => {
        console.log(json);
        setCards(json.cards);        
        setCharacterCards(json.characterCards);        
        setDistrictCards(json.districtCards);        
        setHand(json.hand);        
        setPlayers(json.players);        
        setCurrentPlayer(json.currentPlayer);          
        setCrownPlayer(json.crownPlayer);          
        setGameEndedBy(json.gameEndedBy);
        setGameStarted(json.gameStarted);
        setGameOptions(json.gameOptions);
      }
      if (data) {
        loadObjectIntoGame(data); 
        logfn( 'loadGame', data);
        return;
      }

      const url = window.location.origin + '/gamesaved.json';
      logfn( 'loadGame', url);
      await fetch(url)
      .then(response => response.json())
      .then(jsonObj => {        
        loadObjectIntoGame(jsonObj); 
      });
    },

    resetHandParams: (overwrite = {}) => {
      logfn( `resetHandParams, currentPlayer:${currentPlayer}`, [...arguments ]);  

      clonedHand.stageParamsThisTurn = (clonedHand && clonedHand.stage)? stages[clonedHand.stage] : {};      
      clonedHand.pickedCardsThisPlayerTurn= 0; 
      clonedHand.builtCardsThisPlayerTurn= 0;      
      clonedHand.coinsOrCardsThisTurn = false;
      clonedHand.characterActThisTurn = false;
      clonedHand.canMoveNext= {}; // when it will be possible it will become { can: true, must: true/false }
      clonedHand.districtsBuiltThisPlayerCharacter= 0;
      clonedHand.messages= {};
      clonedHand.waitForPlayerConfirmation = false;
      // in case we reset params with some default values set in params
      clonedHand = Object.assign( clonedHand, overwrite);
      setHand(clonedHand); // doenst trigger event
      setJustAFlag(false); // reset in case this was used.
      return clonedHand;
    },

    // @MODEL:APP game - changes the stage to the next.
    moveToNextStage: () => {
      logfn( 'moveToNextStage from', hand.stage);
      let nextStage = null;
      const keys = Object.keys(stages);      
      if (hand.stage)
        keys.forEach( ( stageName, i) => {
          if ( stageName === hand.stage) { // found current stage
              // assign the next stage
            if ( hand.stage === 'end-game' ) {
              logg('GAME is ENDED. No more stages!');
            } else {              
              if ( hand.stage === 'call-character-8' && gameEndedBy === null ) {
              // if (i === (keys.length - 1)) {
                nextStage = 'discard-character';  // when finished the stages (call-character-8) we start over
              } else {              
                nextStage = keys[i + 1];  // NEXT stage
              }
            }
          }
        });
      else {
        nextStage = keys[0]; 
      }
      setHand(Object.assign(clonedHand, {stage: nextStage})); 
      //->>>> hand.stage change triggers
    },

    // @MODEL:APP game
    setMessage: ( key, jsx ) => {
      if (!clonedHand.messages) return;
      if (clonedHand.messages[key]) clonedHand.messages[key] = null;
      clonedHand.messages[key] = [clonedHand.messages[key], jsx];
      setHand(clonedHand);
      return clonedHand;
    },

    // @MODEL:APP game - when the turn is finished and we move fw (this fn knows if we move to next player or next stage)
    moveToNextPlayerOrStage: () => {
        const { loopPlayers, allowedToBuild } = gameAPI.getCurrentStageParams();

        let moveStage = !loopPlayers;
        logfn( 'moveToNextPlayerOrStage', `moveStage ${moveStage}, loopPlayers ${loopPlayers}` );
        
        if (loopPlayers) {
          let nextPlayer = currentPlayer + 1;
          if (nextPlayer === players.length) {
            logg('Turned around all players. Next stage, please! ');
            nextPlayer = null;
            moveStage = true;
          } 
          setCurrentPlayer(nextPlayer); //->>>> currentPlayer change trigger (resets hand params)
        }

        if (moveStage) {
          let choosesFirst = false;
          // check if the player can finish the game
          if (typeof allowedToBuild === 'number' && typeof currentPlayer === 'number' && !hand.choseFinishGame )
            choosesFirst = gameAPI.checkPlayerFinishGame(currentPlayer);

          if (!choosesFirst) {
            gameAPI.moveToNextStage(); // triggers hand.stage
            setCurrentPlayer(null); // this is to avoid a bug: the next player, even if it was a human, performed the action automatically, just like this one.
          }
        }

    },
    
    // @MODEL:APP game - sees if the conditions of the game (in hand) are fulfilled with the requirements of the stage.
    // we check it when we pick up a card, we build a district, take an action(money or card), and character acts.
    checkMoveToNextPlayerOrStage: ( only_return_true_or_false = false ) => {

      if (! hand.stage ) return false;
      logfn( 'checkMoveToNextPlayerOrStage', `force action ${!only_return_true_or_false}` );

      let canMove = true; // init. Will tell if the turn can finish or not (allowed to pass turn)
      let shouldMove = false; // init. Will tell if the turn is finished completly so we force moving (for the case when the user can build and has to decide)
      const {minCardsToPickup, mustChooseCoinsOrCards, characterAct } = gameAPI.getCurrentStageParams(); // object

      // situation: character X (ie the assasin) is called and no player has the card.
      // if (characterAct && (currentPlayer === null)) {
      //   setHand(Object.assign( clonedHand, { canMoveNext: { can: true, must: true } } ));
      //   return { allowedToMove: true, forcedToMove: true };
      // }

      // we check options that makes us decide that the player can not move to the next step yet
      canMove = canMove && !(minCardsToPickup &&  clonedHand.pickedCardsThisPlayerTurn < minCardsToPickup);
      canMove = canMove && !( mustChooseCoinsOrCards && !clonedHand.coinsOrCardsThisTurn ); // it means that action was not taken yet and it should.
      canMove = canMove && !( (characterAct === 'mandatory' || characterAct === 'automatic') && ( !clonedHand.characterActThisTurn ) );
      
      // has the possibility of building?
      // the reason that can hold the player from passing turn is that he can build.
      const buildableCards = playersAPI.playerCanBuild( currentPlayer );
      console.log('the player can build cards: '+buildableCards);
      if (canMove && ( !buildableCards ) ) {
        shouldMove = true;
      } else if (buildableCards) {
        // Automatic decision to build cards
        if (players && players[currentPlayer].is_computer) {
          
          
          const rdnCard = Math.floor(Math.random() * (buildableCards.length));        
          const buildOrNot = (Math.floor(Math.random() * 2) < 2); // 66%
          
          if (buildOrNot) {            
            console.log('Action build card automatic on stage: '+hand.stage+' card '+buildableCards[rdnCard], cards[buildableCards[rdnCard]].name);
            if (!justAFlag) {
              cardsAPI.buildCard(cards[buildableCards[rdnCard]].ID, true);
              setJustAFlag('building');
            }
          } else shouldMove = true          
        } 
      }

      // only informative option
      if (only_return_true_or_false) {        
        clonedHand.canMoveNext = { can: canMove, must: shouldMove};
        setHand(clonedHand);
        return { allowedToMove: canMove, forcedToMove: shouldMove };
      }

      // normally this is the action. AT THE MOMENT THIS NEVER EXECTURES
      if (shouldMove) {
          gameAPI.moveToNextPlayerOrStage();        
      }
    },

    // MODEL:APP game - plIndx should be same as currentPlayer
    // returns true if the player has finished the districts to end the game
    checkPlayerFinishGame(plIndx) {
      if (gameEndedBy !== null) return false; // when the game is already finished this fn returns false.

      let limit = gameOptions.endsGame; // number of built district cards to be considered finished
      if (playersAPI.playerHasBuiltWildcard(plIndx, 'one-less-district-to-finish')) { // Modificator 
        limit--;
      }
      
      const builtDistricts = playersAPI.getBuildDistrictCardsForPlayer(plIndx); // .filter( ci => !cards[ci].wildcard );
      if (builtDistricts.length >= limit && currentPlayer === plIndx) {
        //game can finish. Now he has to accept or not.        
        setHandBackup({...hand});
        setHand(Object.assign({...hand}, {stage: 'situation-game-end?:player-chooses' })); 
        return true;
      }
      return false;
    },


    // MODEL:APP game
    getCurrentStageParams: () => {
      if (clonedHand && clonedHand.stageParamsThisTurn) {
        // Modificator card Cine Aztec: if the player has this card he can choose watching 3 cards instead of 2
        if ( typeof currentPlayer === 'number' 
              && playersAPI.playerHasBuiltWildcard( currentPlayer, 'see-3-cards' ) 
              && clonedHand.stageParamsThisTurn.mustChooseCoinsOrCards ) {
          logg('getCurrentStageParams: has the card cine aztec: can view 3 cards');
          clonedHand.stageParamsThisTurn.mustChooseCoinsOrCards.cardsToChoose = 3; 
        }

        return clonedHand.stageParamsThisTurn;
      }
      return {};
    },

    // @MODEL:APP game.
    setUpCharacterSettings: (characterNumber) => {
      logfn( 'setUpCharacterSettings', characterNumber);  

      // if this object exists, then we are coming back from a temporary stage ad we dont need to check all this.
      if (handBackup) return false;

      const { playerIndex, card, cardIndex } = playersAPI.getPlayerWhoOwnsCharacterCard(characterNumber);

      setCurrentPlayer(playerIndex);

      // 'set' as card discovered:
      card.is_character_called = true;
      let newCards = [...cards];
      newCards[cardIndex] = {...card};
      setCards(newCards);

      // @MAYBECHANGE: any action related to characters set in currentPlayer UPDATE could come here for uniformity.
      
      // if current character is killed there is no action he can make.
      if (card.is_killed || playerIndex === null) {

        // Modificator card hospital, can take cards or coins even if he is dead.
        const hasHospital = playersAPI.playerHasBuiltWildcard(playerIndex, 'hospital');
        if (card.is_killed && hasHospital) {
          clonedHand.stageParamsThisTurn.maxCardsToPickup = 1; // we could not need to set this, but in case of Lenny we dont want them to use their power of choosing 2.
          gameAPI.setMessage('before_coins_or_cards_btn', <p key='gt3'>You were killed but you have the {hasHospital.name} card. So you can still take money or coins</p>);
        } else {
          clonedHand.stageParamsThisTurn.mustChooseCoinsOrCards = false;
          clonedHand.stageParamsThisTurn.maxCardsToPickup = 0;
          gameAPI.setMessage('before_coins_or_cards_btn', card.is_killed? (<p key='tt5'>You are DEAD!</p>) : (<p>Nooo one</p>));
        }

        clonedHand.stageParamsThisTurn.characterAct = false;
        clonedHand.stageParamsThisTurn.allowedToBuild = 0;
        // gameAPI.checkMoveToNextPlayerOrStage( true );
        setHand(clonedHand);
        return;          
      }

      // We call the card The King and move current Player to the payer that will get the crown.
      if (hand.stage === 'call-character-4') {        
        const { playerIndex : kingPlayerIndex } = playersAPI.getPlayerWhoOwnsCharacterCard(4); // currentPlayer is still not defined. So we take the new crown Owner from this
        setCrownPlayer(kingPlayerIndex);
        logg('@ACTION OF POWER for character 4 - The King. Get the crown: '+players[kingPlayerIndex].name);
        clonedHand.characterActThisTurn = 'get-the-crown';
        setHand( clonedHand );
        gameAPI.setMessage('before_coins_or_cards_btn', <p key='yt5'>You got the crown, as the king that you are.<br/>You'll be the first in the next turn</p>);
        // TODOMESSAGE
      }

      // 
      if (card.is_stolen) {
        // al money goes to the player with character 2.
        const { playerIndex: characted2PlayerIndex } = playersAPI.getPlayerWhoOwnsCharacterCard(2);
        const clonedPlayers = [ ...players ];
        const stolenAmount = clonedPlayers[playerIndex].money;

        clonedPlayers[characted2PlayerIndex].money += stolenAmount;
        clonedPlayers[playerIndex].money = 0;
        gameAPI.setMessage('before_coins_or_cards_btn', 
              <p key='hh6'>You have been stolen by the Thief!, owned by <b>{ players[characted2PlayerIndex].name }</b><br/> 
                 {!stolenAmount? ' You didn\'t have money though!' : `you had ${ stolenAmount } coins, that now ${ stolenAmount === 1? 'is' : 'are'} for him` }
                  .<br/><br/>Now, choose your option: <br/><br/></p>);        
        setPlayers(clonedPlayers);
      }

      // 4 characters receive gold by the cards on his ditrict: charNum 4, 5, 6, 8.
      // we take the district cards from this player that are built and belong to this character
      if ([4,5,6,8].includes(card['character-number'])) {
        playersAPI.payPlayerByDistrictCardsType(playerIndex, card['character-number']);
      }

      // Modificator with CARDS Situation:

      // Observatory (biblioteca): Is choose Card: can take 2 out of 3, instead of 1 out of 2
      if (playersAPI.playerHasBuiltWildcard(playerIndex, 'observatory')) {      
        clonedHand.stageParamsThisTurn.mustChooseCoinsOrCards.cardsToChoose = 3;
        clonedHand.stageParamsThisTurn.maxCardsToPickup = 2;
        gameAPI.setMessage('before_pickup_card', <p>You can select 2 cards because you have the observatory</p>);
        setHand( clonedHand );
      }

    }
  

  } // end gameAPI

  /*  C A R D S     A.P.I      starts
                 ██████████       
                ████████████      
                ██        ██      
                ██▄▄▄▄▄▄▄▄▄█      
                ██▀███ ███▀█      
  █             ▀█        █▀      
  ██                  █           
   █              ██              
  █▄            ████ ██  ████
   ▄███████████████  ██  ██████   
      █████████████  ██  █████████
               ████  ██ █████  ███
                ███  ██ █████  ███
                ███     █████████ */
  
  const cardsAPI = {
    // @MODEL:CARDS - INIT
    // grab the cards from json file and load them into 
    loadCards: async () => {
      logfn( 'loadCards', [...arguments ]);
      // Change this in the future if we want to load different cards from an API
      const url = window.location.origin + '/cardsdemo.json';
      // var json = require(url); //(with path)
      console.log(url);
      await fetch(url)
        .then(response => response.json())
        .then(json => {
          console.log(json);
          json.forEach(card => {
            if (card["repeat-card"]) {
              // in the file, if the card has the field repeat-card, we clone that card that amount of times.
              const repeatTimes = card["repeat-card"];
              delete card["repeat-card"];
              for ( let i =1; i < repeatTimes; i++) {
                let newCard = Object.assign({}, card);
                newCard.ID = card.ID + '.'+i; // new ID is '104.1' for example
                json.push(newCard);
              }
            }
          });
          setCards([...json]);
        });

      // or whatever you want to do with the resulting object
    },

    // @MODEL:CARDS
    getCardIndexByID: cardID => cards.findIndex( card => card.ID === cardID ),
    getCardByID: cardID => cards[cardsAPI.getCardIndexByID(cardID)],
    getCardIndexByCharacterNumber: characterNumber => cards.findIndex( card => (card['character-number'] && card['character-number'] === characterNumber) ),
    getCardByCharacterNumber: characterNumber => cards[cardsAPI.getCardIndexByCharacterNumber(characterNumber)],
    getCalledCharacterCard: () => {
        if (!hand || !hand.stage) return {};
        if (!hand.stage.includes('call-character-')) return {};
        const characterNumber = parseInt(hand.stage.slice(hand.stage.lastIndexOf('-') + 1)); // grabs 3 from 'call-character-3' 
        return cardsAPI.getCardByCharacterNumber(characterNumber);
    },
    getWildcards: (name, single=false) => {  // return array of cards index. considers that there might be more than 1 repeated wildcard. If single===true returns the card index of the first wildcard found (normally there will be only that one)
      const arr = cards.filter(c=> c.wildcard === name ).map( c => cards.findIndex( innerC => c.ID === innerC.ID ) )
      return single? (arr.length? arr[0]:false) : arr; 
    }, 


    // @MODEL:CARDS - get, from the whole deck, only the 'typeOfCard' (character/district) cards and shuffle them. Ready to be taken by players
    // @param typeOfCard: 'character' cards, 'district' cards or all?
    // @param shuffleBool: do we shuffle the created deck?
    initDistrictOrCharacterDeck: (typeOfCard = null, shuffleBool = false) => {
      logfn( 'initDistrictOrCharacterDeck', typeOfCard );
      // 1) get, from Cards, only the type "character" or "disctrict" cards in an array.
      let deck = [...cards ];
      console.log('cards character not shuffled:', cards);
      if (typeOfCard) {
      deck = deck.filter(card => card.type && card.type === typeOfCard);
      }
      
      // 2) shuffle it (using helper fn)
      if (shuffleBool)
        deck = shuffle(deck);

      // Update the state of the list of cards
      console.log(`deck of ${typeOfCard} shuffled and initialized as `, deck); 
      if (typeOfCard === 'character') 
        setCharacterCards(deck);
      else if (typeOfCard === 'district')
        setDistrictCards(deck);

      return deck; // just in case, but normally we wont need it
    },

    // used in the beginning of every hand.
    resetCardsStatus: () => {
      const newCards = [...cards].map( c => Object.assign(c, { 
                                              is_killed: false, // if this character card was killed by the assassin (char 1)
                                              is_stolen: false, // " " stolen bt he thief (char 2) 
                                              is_character_called: false, // if this character card was already called, therefore discovered
                                              is_built_this_hand: false // if this district card was built this hand
                                            }) );
      setCards(newCards); // reset cards properties changes in the previous turn.
    },

    // @MODEL:CARDS - 
    buildCard: (cardID, skipValidation = false) => {
      let all_cards = [...cards];
      let all_players = [...players];
      const cardIndex = cardsAPI.getCardIndexByID(cardID);
      const { playerIndex } = playersAPI.getPlayerWhoOwnsDistrictCard(cardID);
      logfn( 'buildCard', cards[cardIndex].name );
      let cardPrice = cards[cardIndex].price;
      if (playersAPI.playerHasBuiltWildcard(playerIndex, 'build-cheaper')) {// if player has the wildcard 'build-cheaper', the price is 1 coin less
        cardPrice--;
        logg(`The player has the wildcard ${cards[cardIndex].name}. Building will cost, cheaper: ${cardPrice}` );
      }

      if (!skipValidation) {
        // VALIDATION
        if (!gameAPI.getCurrentStageParams().allowedToBuild) {
          console.log('this stage is not for building');
          return;
        }
        if (hand.builtCardsThisPlayerTurn >= gameAPI.getCurrentStageParams().allowedToBuild) {
          console.log('you already built enough');
          return;
        }
        if (playerIndex !== currentPlayer) {
          console.log('You can\'t buy cards if you are not the current player');
          return;
        }
        if (players[playerIndex].money < cardPrice) {
          alert(`Sorry, this card costs $${cardPrice} and you only have ${players[playerIndex].money}!`);
          return null; // the player doesnt have money to build that card
        }
      }

      // remove money form player!
      all_players[playerIndex].money -= cardPrice;
      setPlayers(all_players);

      if ( typeof cardIndex === 'number' ) {
        all_cards[cardIndex].is_built = true;
        all_cards[cardIndex].is_built_this_hand = hand.stage;
        setCards(all_cards);
        clonedHand.builtCardsThisPlayerTurn = clonedHand.builtCardsThisPlayerTurn + 1;
        setHand(clonedHand); 
        //->>>> we didnt define trigger State Event hand.builtCardsThisPlayerTurn

        // Modificator with CARDS Situation:: we are building the laboratory: move to the situation
        if (cardsAPI.getWildcards('laboratory').includes(cardIndex)) {        
          console.log('buildCard: building laboratory!');
          setHandBackup({...clonedHand});
          clonedHand.stage = 'situation-laboratory:select-deck-card';
          clonedHand.pickedCardsThisPlayerTurn = 0;
          setHand(clonedHand);
          return;
        }

        // Modificator with CARDS Situation:: the picked up card is the Commisary:        
        if (cardsAPI.getWildcards('commisary').includes(cardIndex)) {        
          setHandBackup({...clonedHand});
          clonedHand.stage = 'situation-commisary:destroy-a-card';          
          setHand(clonedHand);
          return;
        }

        gameAPI.checkMoveToNextPlayerOrStage(true);
        
      }
    },

    // @MODEL:CARDS - updates the given card as 'killed'
    killCharacter: (character_number) => {
      logg('@ACTION OF POWER for character 1 - kill', character_number);
      let all_cards = [...cards];
      const theCardToKillIndex = cardsAPI.getCardIndexByCharacterNumber(character_number);
      if ( typeof theCardToKillIndex === 'number' && theCardToKillIndex >= 0 ) {
        all_cards[theCardToKillIndex].is_killed = true;
        clonedHand.characterActThisTurn = 'kill';
        gameAPI.setMessage('after_character_acts', (<h3 key='y10'>
            { players[currentPlayer].is_computer? cardsAPI.getCardByCharacterNumber(1).name : 'You'} killed {all_cards[theCardToKillIndex].name}!
            </h3>));
        setCards(all_cards);
        setHand(clonedHand);        
        return;
      }
    },

    // @MODEL:CARDS - updates the given card as 'stolen'
    stealCharacter: (character_number) => {
      logg('@ACTION OF POWER for character 2 - steal another card');
      let all_cards = [...cards];
      const theCardToStealIndex = cardsAPI.getCardIndexByCharacterNumber(character_number);
      if ( typeof theCardToStealIndex === 'number' && theCardToStealIndex >= 0 ) {        
        all_cards[theCardToStealIndex].is_stolen = true;
        setCards(all_cards);
        gameAPI.setMessage('after_character_acts', (<h3 key='y16'> { pronoum(props) } stole from {all_cards[theCardToStealIndex].name}!</h3>));
        clonedHand.characterActThisTurn = 'steal';
        setHand(clonedHand);
        // TODOMESSAGE
        return;
      }
    },

  } // end cardsAPI
    

//                                P L A Y E R S 
//                                 __________
//                               /           \
//                               |   0 . 0    |
//                               |    /_      P
//                               \_   ___     /
//                                 \________/
//                                  A. P. I.

  const playersAPI = {


    // @MODEL:PLAYER/CARDS
    // WHAT: removes the card from the specified deck, and returns it
    // ...
    // @param playerIndex
    // @param cardID: the ID of the card in the array cards. If null it takes random, if 'last-district-card' it takes the last
    // @param times: number of cards to pick up, used when cardID : 'last-district-card'
    // Status update: [..]
    pickUpCard: ( { playerIndex= null, cardID = null, times= 1, ignoreLimitThisTurn = false } ) => {
            
      // 0 ) VALIDATION: get number of cards per turn, and check that we are ok
      if (clonedHand.pickedCardsThisPlayerTurn >= gameAPI.getCurrentStageParams().maxCardsToPickup 
           && !ignoreLimitThisTurn ) {
        console.log('Tried to pick up more cards than allowed');
        return;
      }

      // 1) DATA: init the player and the card. If not player set, get current. If not card set, random.
      let deck, grabLastDistrictCard;
      
      if (typeof(cardID) === 'number') {
        const { type : cardType } = cardsAPI.getCardByID(cardID);
        deck = (cardType === 'district') ? [...districtCards] : [...characterCards];
        times = 1; // just to make sure we run it exactly 1 loop.
      } else {
        deck = [...districtCards];
        grabLastDistrictCard = (cardID === 'last-district-card');
      }
      const thePlayerIndex = playerIndex || currentPlayer;
      let playersUpdated = [...players];
      let cardIndex, theCard;

      logfn( `pickUpCard`, `ID ${cardID} by player ${playerIndex}` );
      
      if (!deck.length) {
        logg('--- deck empty. exit');
        return;
      }


      // WE TAKE times CARDS FROM THE DECK
      
      for (let i=0; i<times; i++) {

        if (grabLastDistrictCard) {
          if ( deck.length <= 0 ) {
            logg('There are no more district cards. Total grabbed so far: ' +clonedHand.pickedCardsThisPlayerTurn);
            cardID = null; // we dont do actions on the deck
          } else {
            cardID = deck[deck.length - 1].ID;
          }
        } 

        if (cardID) {
          cardIndex = cardID ? cardsAPI.getCardIndexByID(cardID) : Math.floor(Math.random() * cards.length);
          theCard = cards[cardIndex];
                
          // console.log(`Picking up card ${theCard.name} from ${theCard.type}, by player ${thePlayerIndex}`);
        
          // 2) @MODEL:CARDS Remove the card from deck. 
          deck.splice(deck.findIndex(card => card.ID === cardID), 1); // deck has one less item now
          // Update the right deck (characters or district).  
          
          // 3) @MODEL:PLAYERS: include that card in the list of cards of that player.        
          const thePlayer = Object.assign({}, playersUpdated[thePlayerIndex]);
          thePlayer[`${theCard.type}Cards`].push(cardIndex); // ie. players[3].characterCards = [  3, 0, 1, 9] Where 9 is the index in array cards of the current card.
          thePlayer[`${theCard.type}Cards`] = thePlayer[`${theCard.type}Cards`].filter(unique);
          playersUpdated[thePlayerIndex] = thePlayer;
          
          // update param value.
          clonedHand.pickedCardsThisPlayerTurn = clonedHand.pickedCardsThisPlayerTurn+1;
          logg(`-- card grabbed ${theCard.name}, by ${players[thePlayerIndex].name}. Total ${clonedHand.pickedCardsThisPlayerTurn}`);
        } 
      }  
        
      // setState calls
      if (theCard) 
        if (theCard.type === 'character') setCharacterCards(deck); else setDistrictCards(deck);
      setPlayers(playersUpdated);
      setHand(Object.assign(clonedHand)); 
      //->>>> trigger State Event hand.pickedCardsThisPlayerTurn change
        
      return cardID;
        
    },

    // returns bool
    playerHasCharacter: ( plyrIndx, character_number) => {
      logfn( `playerHasCharacter`, plyrIndx, character_number);
      const { playerIndex: playerIndexWithCharacter } = playersAPI.getPlayerWhoOwnsCharacterCard(character_number);
      return playerIndexWithCharacter === plyrIndx;
    },

    // returns the cardIndex of the district card
    playerHasBuiltDistrictCard: (plyrIndx, cardID ) => {
      if (!players[plyrIndx]) return null;
      return players[plyrIndx].districtCards.find( ci => cards[ci].ID === cardID && (cards[ci].is_built) );
    },

    // @MODEL:PLAYERS [...]
    getPlayerWhoOwnsCharacterCard: (character_number) => {
      logfn( `getPlayerWhoOwnsCharacterCard`, character_number);
      
      const cardIndex = cardsAPI.getCardIndexByCharacterNumber(character_number);
      let playerIndex = players.findIndex( player => player.characterCards.includes(cardIndex) );       
      const player = (typeof playerIndex === 'number')? players[playerIndex] : {};
      return { player, playerIndex: (playerIndex>=0? playerIndex : null), card: cards[cardIndex], cardIndex };
    },
    
    getPlayerWhoOwnsDistrictCard: (cardID) => {
      logfn( `getPlayerWhoOwnsCard`, cardID);
      const cardIndex = cardsAPI.getCardIndexByID(cardID);
      const playerIndex = players.findIndex( player => player.districtCards.includes(cardIndex) );
      const player = players[playerIndex];
      return { player, playerIndex, card: cards[cardIndex], cardIndex };
    },

    // returns array of index cards.
    getBuildDistrictCardsForPlayer: (playerIndex) => {
      if ( typeof playerIndex !== 'number' ) return [];
      let dCards = [...players[playerIndex].districtCards]; // array of cards index.
      return dCards.filter( cardIndx => cards[cardIndx].is_built );
    },

    // returns 
    getBuildDistrictCardsForPlayerAndType: (plyrIndx, districtType) => {       
      if ( typeof plyrIndx !== 'number' ) return [];
      return playersAPI.getBuildDistrictCardsForPlayer(plyrIndx).filter(
        cardIndx => cards[cardIndx]["type-of-district"] === districtType
      );
    },

    // returns 0 if not, if found 1 card (normally) returns the card, and if more than 1, then the 1st one. (normally 1) if yes
    playerHasBuiltWildcard(plIndx, wildcardName) {
      const builtCardsIndexes = playersAPI.getBuildDistrictCardsForPlayer(plIndx); // array of indexes
      const wildCardsIndexes = cardsAPI.getWildcards(wildcardName); // array of indexes
      const results = builtCardsIndexes.filter( ci => wildCardsIndexes.includes(ci) ); // intersection of these arrays
      
      return results.length>=1? cards[results[0]] : results.length;
    },

    // @MODEL:PLAYERS
    giveMoneyToPlayer: (coins = 0, playerIndex = null) => {
      const playrIndx = (playerIndex === null) ? currentPlayer : playerIndex;
      logfn( `giveMoneyToPlayer`, playrIndx + ' +' + coins);
      if ( playrIndx === null ) return;
      const playersTemp = [ ...players ];
      playersTemp[playrIndx].money = playersTemp[playrIndx].money + coins;
      setPlayers(playersTemp);  // doesnt trigger anything
      return playersTemp;
    },

    // increases the .money of the player and updates the hand param 'districtsBuiltThisPlayerCharacter'.
    payPlayerByDistrictCardsType: ( plIndx, districtType ) => {
      
      const districtCardsForThisCharacter = playersAPI.getBuildDistrictCardsForPlayerAndType(plIndx, districtType)
          // for ( let cardIndx of districtCardsForThisCharacter ) {
      if (districtCardsForThisCharacter.length) {        
        playersAPI.giveMoneyToPlayer(districtCardsForThisCharacter.length, plIndx);
        gameAPI.setMessage('before_coins_or_cards_btn', <p key='iu7'>You have received $ {districtCardsForThisCharacter.length} because you have the card {cardsAPI.getCalledCharacterCard().name} and {districtCardsForThisCharacter.length} built cards for this character</p>);
        setHand(clonedHand, { districtsBuiltThisPlayerCharacter: districtCardsForThisCharacter.length });
        logg('----hand.districtsBuiltThisPlayerCharacter: '+districtCardsForThisCharacter.length);
      }

    },

    setPlayerWithCrownFirst: () => {      
      // ie: [Peter, Mark, John*, Susanne] we convert it into [John*, Susanne, Peter, Mark]
      logfn( `setPlayerWithCrownFirst ${players[crownPlayer]? players[crownPlayer].name : ''}` );
      if (typeof crownPlayer === 'number') {
        let playersPrev = [...players].slice(crownPlayer).concat([...players].slice(0, crownPlayer));
        setPlayers(playersPrev);
        setCrownPlayer(0);
        return playersPrev; // just in case we want to use the modified array form the caller fn
      }
      return players;
    },

    // does the player have money to build any of his district cards?
    // @return false if the player can't build at all.
    //               if no cardIndex specified,r eturns the array of cardindex buildable if can build
    //              
    playerCanBuild: ( playerIndex, cardIndex = null) => {
      const { allowedToBuild } = gameAPI.getCurrentStageParams();
      
      if ( typeof playerIndex !== 'number' || ( playerIndex !== currentPlayer )) return false; // only current player can build
      if ( !allowedToBuild ) return false; // in the stage doesnt allow to build return false.
      
      const playrIndx = (playerIndex === null) ? currentPlayer : playerIndex;
      
      if ( allowedToBuild <= clonedHand.builtCardsThisPlayerTurn ) return false; // already built enough! 

      const reduction = (playersAPI.playerHasBuiltWildcard(playrIndx, 'build-cheaper'))? 1 : 0; // Modificator. if the player has the card build-cheaper every card costs $1 less
      
      const playerBuildableDictrictCards = [ ...players[playrIndx].districtCards ]  // from the district cards
            .filter( cardIndex => {                         
              const have_money = (cards[cardIndex].price - reduction) <= players[playrIndx].money; // only the affordable
              return have_money && (!cards[cardIndex].is_built); // and only the non built ones.
            } );      
      
      if (cardIndex === null) // can build in general?
        return playerBuildableDictrictCards.length ? playerBuildableDictrictCards : false;
      else {
        // can build THAT card?
        if (!playerBuildableDictrictCards.length) return false;
        
        // Other possiblity that makes the card unbuildable: is there another card with the same name already built
        const sameCardsAlreadyBuilt = playersAPI.getBuildDistrictCardsForPlayer(playrIndx).filter( ci => cards[ci].name === cards[cardIndex].name ) // returns indexes
        if (sameCardsAlreadyBuilt.length) {
          // Modificator can-build-duplicates, with this card the player can build duplicates.
          if (!playersAPI.playerHasBuiltWildcard(playrIndx, 'can-build-duplicates')) 
            return false;
        }
        
        return playerBuildableDictrictCards.includes(cardIndex); // if the card is included in the buildable cards, why not?
      }
    },

    // @MODEL:PLAYERS - act for the magician (dependiente tienda comics)
    swapDistrictCardsBetweenPlayers: ( player1Index = null, player2Index) => {
      
      const thePlayer1Index = player1Index || currentPlayer;
      logfn( `swapDistrictCardsBetweenPlayers ${thePlayer1Index}`, player2Index);

      // proceed to the swap of variables. We only swap the non built cards!
      let tempPlayers = [ ...players ];
      const tempPlayer1DistrictCards = [...players[thePlayer1Index].districtCards ];
      tempPlayers[thePlayer1Index].districtCards = tempPlayer1DistrictCards.filter( ci => cards[ci].is_built ).concat( [ ...players[player2Index].districtCards.filter( ci => !cards[ci].is_built ) ] );
      tempPlayers[player2Index].districtCards = [...players[player2Index].districtCards ].filter( ci => cards[ci].is_built ).concat( tempPlayer1DistrictCards.filter( ci => !cards[ci].is_built ) );
      setPlayers(tempPlayers);

      logg('@ACTION OF POWER for character 3: Magician - swap non built district cards with other player');
      setHand(Object.assign(clonedHand, { characterActThisTurn: 'swap-cards' }));
      gameAPI.setMessage('after_character_acts', (<h3 key='y11'>Your hand cards have been replaced with {players[player2Index].name} </h3>));
    },

    // @MODEL:PLAYERS/CARDS
    warlordCanDestroyBuiltCard: (card) => {
      const { playerIndex : playerIndexDestroyed } = playersAPI.getPlayerWhoOwnsDistrictCard(card.ID); // info about the destroyed card and its owner

      const currentCalledCard = cardsAPI.getCalledCharacterCard();
      const { playerIndex: warlordPlayerIndex } = playersAPI.getPlayerWhoOwnsCharacterCard(8);
      logfn( `warlordCanDestroyBuiltCard ${card.name}`, warlordPlayerIndex);

            // VALIDATION
      // TODO: the card can't be destroyed if the owner has the character Home (5)
      if (playersAPI.playerHasCharacter(playerIndexDestroyed, 5)) {
        console.log(`The card ${card.name} can't be destroyed. Its owner has the Bishop!`);
        return false;
      }
      // TODO: the card can't be destroyed if it belongs to a complete district or a district with the Tower.
      // TODO: only if it's build, it can be removed.
      if (!card.is_built) {
        console.log(`The card ${card.name} can't be destroyed. It is not built!`);
        return false;
      }
      // only if the current player is Bart, and has money, it can be removed.
      if (currentCalledCard['character-number'] !== 8) {
        console.log(`The current character is not the Warlord, who is the only one allowed to destroy`);
        return false;
      }
      const extra_price = (playersAPI.playerHasBuiltWildcard(playerIndexDestroyed, 'destroy-more-expensive'))? 1 : 0; // Modificator church:
      if ( !(players[warlordPlayerIndex].money >= (card.price - 1 + extra_price))) {
        console.log(`The current player doesnt have money to destroy that card, which costs ${(card.price - 1 )}`);
        return false;
      }
      
      if (!playersAPI.playerHasCharacter(currentPlayer, 8)) {
        console.log(`The current Player hasnt the Warlord card. He cant destry any card.`);
        return false;
      }

      // Modificator "wildcard": "cant-be-destroyed". 
      if (card.wildcard === 'cant-be-destroyed') {
        console.log(`That card cant be destroyed by the wardlord. That's its power.`);
        return false;
      }

      return true;
    },

    // This fn has no validation. The validation is made by the previous fn
    destroyBuiltCardByWarlord: (card) => {
      const { playerIndex : playerIndexDestroyed } = playersAPI.getPlayerWhoOwnsDistrictCard(card.ID); // info about the destroyed card and its owner
      const { playerIndex: warlordPlayerIndex } = playersAPI.getPlayerWhoOwnsCharacterCard(8);
      logfn( `destroyBuiltCardByWarlord ${card.name}`, warlordPlayerIndex);

      const yes_or_no = playersAPI.destroyBuiltCard(card);
      // remove money from Barts player - This could be and should be currentPlayer 
      const extra_price = (playersAPI.playerHasBuiltWildcard(playerIndexDestroyed, 'destroy-more-expensive'))? 1 : 0; // Modificator church: if the destroyed has the Iglesia, it's more expensive // 
      players[warlordPlayerIndex].money = players[warlordPlayerIndex].money - (card.price - 1 + extra_price);

      gameAPI.setMessage('after_character_acts', <p key='y4'>You have destroyed the card {card.name} to player {players[playerIndexDestroyed].name} </p> );        

      setPlayers( players ); // the card has dissappeared for the player and the money from the current player

      return yes_or_no;
    },

    // this simply takes the card back to the deck. Doesnt remove the money to the warlord
    destroyBuiltCard: (card) => {
      const { player : playerDestroyed, 
              playerIndex : playerIndexDestroyed, 
              cardIndex : cardIndexDestroyed } = playersAPI.getPlayerWhoOwnsDistrictCard(card.ID); // info about the destroyed card and its owner
      
      // remove card from player.
      const indexInPlayersCards = playerDestroyed.districtCards.findIndex( index => cards[index].ID === card.ID );
      if (indexInPlayersCards < 0) return false;      
      let distritCardsAfterDestroy = players[playerIndexDestroyed].districtCards;
      distritCardsAfterDestroy.splice(indexInPlayersCards, 1);
      players[playerIndexDestroyed].districtCards = distritCardsAfterDestroy;      
      setPlayers( players ); 

      // change the param is_built to false
      let newCard = Object.assign( { ...cards[cardIndexDestroyed] }, { is_built: false, is_built_this_hand: false } );
      let newCards = [ ...cards ];
      newCards[cardIndexDestroyed] = newCard;
      setCards( newCards ); // the card is not built anymore

      // add it to the beggining of the deck 
      let tempDistrictCards = [...districtCards];
      tempDistrictCards = [card].concat(tempDistrictCards); // this is the new districtCards deck
      setDistrictCards(tempDistrictCards); // put the cards on the beginning

      return true; // everything went ok, the card is destroyed.
    },

    

    calculatePuntuationPlayer: (plIndx) => {
      // count built districts points
      logfn( `calculatePuntuationPlayer ${plIndx}`, players[plIndx].name);
      let puntuation = {total:0, pointsByCards: 0, pointsByColor: 0, pointsByFinishingGame:0,pointsBy8Districts:0};
      const builtCards = playersAPI.getBuildDistrictCardsForPlayer(plIndx);
      // const pointsByCards = builtCards.reduce( (accumulator, i ) => accumulator + cards[i].price + (cards[i]['extra-price']? cards[i]['extra-price'] : 0), 0 );
      const uniqueColorsGame = cards.map(item => item["type-of-district"]? item["type-of-district"] : null).filter((value, index, self) => value !== null && self.indexOf(value) === index) // unique colours inthe game
      const uniqueColorsBuilt = builtCards.map(ci => cards[ci]["type-of-district"]? cards[ci]["type-of-district"] : null).filter((value, index, self) => value !== null && self.indexOf(value) === index) // unique colours built by the player
      builtCards.forEach( i => {
        puntuation.pointsByCards += cards[i].price + (cards[i]['extra-price']? cards[i]['extra-price'] : 0);  
      });      
      puntuation.pointsByColor = uniqueColorsGame.length === uniqueColorsBuilt.length? 3 : 0;
      puntuation.pointsByFinishingGame = gameEndedBy === plIndx? 4 : 0;
      puntuation.pointsBy8Districts = (builtCards.length >= gameOptions.endsGame && !puntuation.pointsByFinishingGame)? 2 : 0;
      puntuation.pointsByBadulaque = playersAPI.playerHasBuiltWildcard(plIndx, 'money-into-points')? players[plIndx].money : 0; // modificator badulaque
      puntuation.pointsByRio = playersAPI.playerHasBuiltWildcard(plIndx, '1-point-per-different-color')? uniqueColorsBuilt.length : 0;  // modificator rio  
      puntuation.total = puntuation.pointsByCards+puntuation.pointsByColor+puntuation.pointsByFinishingGame+puntuation.pointsBy8Districts+puntuation.pointsByBadulaque;
      return puntuation;
    }

  } // end playersAPI


  // END OF C O N T R O L L E R ++++++++++++++++++++++++++++++++++++++++


  
  // *** L I F E  C Y C L E (@MODEL:APP GAME; actions on states update) *******************
  // *************************************************************
 

/*
        @@@@@@           @@@@@@
      @@@@@@@@@@       @@@@@@@@@@
    @@@@@@@@@@@@@@   @@@@@@@@@@@@@@
  @@@@@@@@@@@@@@@@@ @@@@@@@@@@@@@@@@@
 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      @@@@@@@@@@@@@@@@@@@@@@@@@@@
        @@@@@@@@@@@@@@@@@@@@@@@
          @@@@@@@@@@@@@@@@@@@
            @@@@@@@@@@@@@@@
              @@@@@@@@@@@
                @@@@@@@
                  @@@
                   @

*/

  // ONUPDATE currentPlayer (change of turn)------
  const prevCurrentPlayer = usePrevious(currentPlayer);
  useEffect(() => {
    // Only if currentPlayer changes from a player to the next one:
    if ( prevCurrentPlayer ===  currentPlayer) return;
    if ( typeof currentPlayer !== 'number' ) return;
    logfn('currentPlayer UPDATE', prevCurrentPlayer, currentPlayer);
    
    let playersTemp = [...players];

    const { loopPlayers } = gameAPI.getCurrentStageParams();

    
    const cpReady = (typeof currentPlayer === 'number') && ( hand.stage !== 'end-game' )
    // every time change player, we set an overlay window for the next player to confirm it's him
    if (loopPlayers)
      gameAPI.resetHandParams(cpReady? { waitForPlayerConfirmation: true } : {});


    // END OF GAME! if we have finished the game we calculate the points:
    if (hand.stage === 'end-game' && typeof currentPlayer === 'number') {
      const puntuation = playersAPI.calculatePuntuationPlayer(currentPlayer);
      if (!playersTemp[currentPlayer].puntuation || playersTemp[currentPlayer].puntuation.total !== puntuation.total) {
        let newCurrentPlayer = {...playersTemp[currentPlayer]};
        newCurrentPlayer.puntuation = puntuation;
        playersTemp[currentPlayer] = newCurrentPlayer;
        if (currentPlayer === (players.length -1) ) { // if all players have counted puntuation
          const winnerPl = playersTemp.reduce((pl, current) => (pl.puntuation.total > current.puntuation.total) ? pl : current, { puntuation: {} });
          const winnerPlIndex = playersTemp.findIndex( pl => pl === winnerPl );
          playersTemp[winnerPlIndex].winner = true;
          // setCurrentPlayer(null);
        }
        setPlayers(playersTemp);
        gameAPI.checkMoveToNextPlayerOrStage(true);
      }
    }

    // Sett more actions at setupCharacteer
  }, [prevCurrentPlayer, currentPlayer, gameAPI, hand.stage, playersAPI, hand, clonedHand, cardsAPI, players]);


  // ONUPDATE hand.pickedCardsThisPlayerTurn ------ every time a player picks a card from district or char deck (or the system discards a card from the char deck)
  const prevPickedCardsThisPlayerTurn = usePrevious(hand.pickedCardsThisPlayerTurn);
  useEffect(() => {
    // Only if hand.pickedCardsThisPlayerTurn changes and we don't consider that the param is reset to 0:
    if ( prevPickedCardsThisPlayerTurn ===  hand.pickedCardsThisPlayerTurn) return;
    if ( !hand.pickedCardsThisPlayerTurn) return;

    logfn('hand.pickedCardsThisPlayerTurn UPDATE (empty)', prevPickedCardsThisPlayerTurn, hand.pickedCardsThisPlayerTurn);

    // depending on the stage, we see what's the limit.
    
    // gameAPI.checkMoveToNextPlayerOrStage(true); // I removed this, it's better to handle it in the place where the picked card is happening.

  });


  // ONUPDATE hand.characterActThisTurn ------ when a cahracter played his powe (kill, steal ...)
  const prevCharacterActThisTurn = usePrevious(hand.characterActThisTurn);
  useEffect(() => {
    // Only if hand.characterActThisTurn changes and we don't consider that the param is reset to 0:
    if ( prevCharacterActThisTurn ===  hand.characterActThisTurn) return;
    if ( !hand.characterActThisTurn) return;

    gameAPI.checkMoveToNextPlayerOrStage(true);

    logfn('hand.characterActThisTurn UPDATE', prevCharacterActThisTurn, hand.characterActThisTurn);
  });
  
  // ONUPDATE hand.coinsOrCardsThisTurn ------ when a player took the action ( money or cards ). ie, Mr burns receives 1 gold after action
  const prevcoinsOrCardsThisTurn = usePrevious(hand.coinsOrCardsThisTurn);
  useEffect(() => {
    // Only if hand.coinsOrCardsThisTurn changes and we don't consider that the param is reset to 0:
    if ( prevcoinsOrCardsThisTurn ===  hand.coinsOrCardsThisTurn) return;
    if ( !hand.coinsOrCardsThisTurn) return;
    
    logfn(`hand.coinsOrCardsThisTurn UPDATE from ${prevcoinsOrCardsThisTurn} to ${hand.coinsOrCardsThisTurn}, stage ${hand.stage}`);

    if (hand.stage === 'call-character-6') {
      if (!cardsAPI.getCardByCharacterNumber(7).is_killed) {
        logg('@ACTION OF POWER for character 6 - on Update coinsOrCards, receives 1$ after choosing money/cards (Mr Burns).');
        clonedHand.characterActThisTurn = 'collect-tax';
        gameAPI.setMessage('after_coins_or_cards_action', <p>Merchant: You have received $ 1!!</p> );      
        setHand( clonedHand );
        playersAPI.giveMoneyToPlayer(1);
      } else {
        gameAPI.setMessage('before_coins_or_cards_action', <p>You can't receive the extra $1 that correspond to your character</p> );
        setHand( Object.assign(clonedHand, { characterActThisTurn: 'no-act'} ) );
      }

    }
    
    if (hand.stage === 'call-character-7') {
      if (!cardsAPI.getCardByCharacterNumber(7).is_killed) {
        playersAPI.pickUpCard( { cardID: 'last-district-card', times:2 } );
        gameAPI.setMessage('after_coins_or_cards_action', <p>You receive 2 aditional cards, {} in total</p> );      
        setHand( Object.assign(clonedHand, { characterActThisTurn: 'receive-extra-cards'} ) );
        logg('@ACTION OF POWER for CHARACTER 7 - on Update coinsOrCards (Architect -Lenny&Carl) receives 2 district cards');
      } else {
        gameAPI.setMessage('before_coins_or_cards_action', <p>You can't receive the extra cards that correspond to your character</p> );
        setHand( Object.assign(clonedHand, { characterActThisTurn: 'no-act'} ) );
      }
    }


    gameAPI.checkMoveToNextPlayerOrStage(true);

  }, [prevcoinsOrCardsThisTurn, hand, gameAPI, playersAPI, clonedHand, cardsAPI]);

// ONUPDATE hand.canMoveNext ------ changes when an action lets the player to pass turn. this is updated by other states in the lifecycle
const prevCanMoveNext = usePrevious(hand.canMoveNext);
useEffect(() => {
  // Only if hand.canMoveNext changes and we don't consider that the param is reset to 0:
  if ( prevCanMoveNext ===  hand.canMoveNext) return;
  if ( !hand.canMoveNext ) return;
  if ( isEmpty(hand.canMoveNext) ) return; // we dont consider the param when reset

  // if we get here, we moved into 'can move to next turn'

  // automatically move to the next stage without more waiting.
  if  (hand.canMoveNext.can && hand.canMoveNext.must) {
    if ( ['district-selection', 'discard-character', 'character-selection-1', 'character-selection-2' ]
                                      .includes(hand.stage) )
      gameAPI.moveToNextPlayerOrStage();
  }
  

  logfn(`hand.canMoveNext UPDATE from ${prevCanMoveNext.can} to ${hand.canMoveNext.can}, stage ${hand.stage}`);
});

  // ONUPDATE crownPlayer ------ when the king is reveled, the player owner gets the crown.
  const prevCrownPlayer = usePrevious(crownPlayer);
  useEffect(() => {
      // Only if currentPlayer changes from a player to the next one:
      if ( prevCrownPlayer ===  crownPlayer) return;
      logfn('crownPlayer UPDATE', prevCrownPlayer, crownPlayer);
      
      // Modificator Centro Comercial, if a player has that wildcard, he gets $1 on change of crown. If we are in discard-character stage, the crown is not actually changing, it's the order of players that changes.
      if (hand.stage !== 'discard-character' && typeof prevCrownPlayer === 'number' && typeof crownPlayer === 'number') {
        const playersWithWildcard = players.filter( (pl,i) => playersAPI.playerHasBuiltWildcard(i, 'coin-on-change-of-crown'));
        if (playersWithWildcard.length) playersWithWildcard.forEach( (pl, i) => {
          const wildCard = cardsAPI.getWildcards('coin-on-change-of-crown', true);
          playersAPI.giveMoneyToPlayer(1, i);
          gameAPI.setMessage('before_coins_or_cards_btn', <p key='gg4'>As you get the crown, {i===currentPlayer? 'you' : 'the player '+pl.name+''} receives $1 because of the card {cards[wildCard].name} </p>);
        } );
      }
  
  });


  // ---- THE REAL LIFE CYCLE OF THE GAME - events on every stage -----------------------------
  const prevStage = usePrevious(hand.stage);
  // ONUPDATE hand.stage--------------------------
  useEffect(() => {
    // Only if hand.stage changes:
    if ( prevStage ===  hand.stage) return;
    logfn('hand.stage UPDATE', prevStage, hand.stage);
    
    const { loopPlayers } = gameAPI.getCurrentStageParams(); 

    
    if (loopPlayers) {
      setCurrentPlayer(0) ; // init currentPlayer, if it is a turn of players
    }

    // inits everytime we move to next stage.
    if (handBackup) {
      // if we come from another temporary stage with saved data, then we just load the handBackup      
    } else {
      const cpReady = 1; // (typeof currentPlayer === 'number')       
      // if (players[currentPlayer] && !players[currentPlayer].is_computer)
      gameAPI.resetHandParams(cpReady? { waitForPlayerConfirmation: true } : {});
    }

    // cases where coming back from situations and the temporary hand should be removed.
    if ( ['situation-game-end?:player-chooses', 'situation-commisary:destroy-a-card', 'situation-laboratory:select-deck-card']
          .includes(prevStage)) {
      setHandBackup(false);
    }

    // particular case: comes back from situation to choose if we want to finish the game
    if (prevStage === 'situation-game-end?:player-chooses') {
      gameAPI.moveToNextStage();
    }



    let playersX = [...players]; // cloning for updating, later    

    switch (hand.stage) {

      case 'district-selection':
          // now the actions are triggered by the selection of the cards by clickin on it.
        break;

      case 'discard-character':
        // reset character cards for every player
        playersX = playersAPI.setPlayerWithCrownFirst();
        console.log('setting players like: ', playersX)
        playersX.map( (player, i) => { 
          playersX[i].characterCards = [];
          delete(playersX[i].card_buy3cards_already_used); // reset property from card modificator buy-3-cards
          delete(playersX[i].card_sell1card1coin_already_used); // reset property from card modificator zurditurium
        });
        setPlayers(playersX);
        cardsAPI.resetCardsStatus();
        setCurrentPlayer(0);
        cardsAPI.initDistrictOrCharacterDeck('character');
        // from here CardsDeck > clicking in a char card triggers the picked card
        break;
      case 'character-selection-1' :
        break;
      case 'character-selection-2' : 
        break;
      case 'call-character-1' :
        // ACTION of char 1: THE ASSASSIN.
        gameAPI.setUpCharacterSettings(1);        
        break;
      case 'call-character-2' :
        // ACTION of char 2: THE THIEF.
        gameAPI.setUpCharacterSettings(2);
        break;
      case 'call-character-3' :
        // ACTION of char 3: THE MAGICIAN.
        gameAPI.setUpCharacterSettings(3);
        break; 
      case 'call-character-4' :
        // ACTION of char 4: THE KING.
        
        gameAPI.setUpCharacterSettings(4);        
        
        break;
      case 'call-character-5' :
        // ACTION of char 5: THE BISHOP - cant be destroyed.
        gameAPI.setUpCharacterSettings(5);
        break;
      case 'call-character-6' :
        // ACTION of char 5: THE MERCHANT (Mr burns)- after action, takes 1 gold more. See update hand.coinsOrCardsThisTurn
        gameAPI.setUpCharacterSettings(6); // See hand.coinsOrCardsThisTurn UPDATE - it will receive a coin when that triggers
        break;
      case 'call-character-7' :
        gameAPI.setUpCharacterSettings(7);
        break;
      case 'call-character-8' :
        // it might be the case of trying to destry a card, move to stage 'situation:', and then back here.        
        if (handBackup) 
          setHandBackup(false);
        else 
          gameAPI.setUpCharacterSettings(8);        
        break;

      case 'end-game' :
          logg('GAME IS OVER - counting player by player');          
        break;
      default:
        break;
    }


    return () => {

    }
  }, [prevStage, hand.stage, crownPlayer, playersAPI, players, gameAPI, cardsAPI, currentPlayer, cards, handBackup])

  // *** end of LIFE CYCLE  **************************************
  // *************************************************************
 


/* ++++++++++++++++++++++++++++++++ V I E W ++++++++++++++++++++++++++++++++
  /~~~\/~~\/~~~\/~~~\/~~\/~~~\                    /~~~\/~~\/~~~\/~~~\/~~\/~~~\
  | /\/ /\/ /\ || /\/ /\/ /\ |                    | /\ \/\ \/\ || /\ \/\ \/\ |
  \ \/ /\/ /\/ /\ \/ /\/ /\/ /                    \ \/\ \/\ \/ /\ \/\ \/\ \/ /
   \ \/\ \/\ \/  \ \/\ \/\ \/                      \/ /\/ /\/ /  \/ /\/ /\/ /
 ,_/\ \/\ \/\ \__/\ \/\ \/\ \______________________/ /\/ /\/ /\__/ /\/ /\/ /\_,
 (__/\__/\__/\____/\__/\__/\________________________/\__/\__/\____/\__/\__/\__)
*/
 
  
  return (
    <div className={'App '+(infoMode? ' App--info-mode':'')+(gameStarted? ' App--started' :'App--not-started')+(hand && hand.stage? ' '+hand.stage: '')}>      
      <div className='App__body'>
        <div className='App__body-temporarymessage'>{temporaryMessage}</div> { /* not in use so far */ }

        { /* This renders 1 on the 1st time */  }
        <StartGame gameAPI={gameAPI} cards={cards} gameStarted={gameStarted} isLoading={ match?.params?.gameslug? true : false } />

        <div className={'row m-0' + (gameStarted? '' : ' d-none') }>
          {gameOptions.dev? (<div className='DevInfo col-2 border small'>
            <Debug cards={cards} characterCards={characterCards} districtCards={districtCards} players={players} currentPlayer={currentPlayer} gameOptions={gameOptions} hand={hand} handBackup={handBackup} gameAPI={gameAPI} stages={stages} gameEndedBy={gameEndedBy} crownPlayer={crownPlayer} gameStarted={gameStarted} justAFlag={justAFlag} />
          </div>) : null }
          
            { /* modal to hide all info in the screen until the right player gets the tablet */ }
            <WaitConfirmationModal currentPlayer={currentPlayer} setCurrentPlayer={setCurrentPlayer} players={players} hand={hand} setHand={setHand} gameOptions={gameOptions} cardsAPI={cardsAPI} />
            
            <div className={'col-' + (gameOptions.dev? '5' : '6') } key='gfds4'>
              <TopNav gameAPI={gameAPI} currentPlayer={currentPlayer} hand={hand} players={players} playersAPI={playersAPI} gameOptions={gameOptions} setGameOptions={setGameOptions} cards={cards} cardsAPI={cardsAPI} infoMode={infoMode} setInfoMode={setInfoMode} gameStarted={gameStarted} />

              <CardsDeck cards={cards} setCards={setCards} characterCards={characterCards} setCharacterCards={setCharacterCards} districtCards={districtCards} setDistrictCards={setDistrictCards} players={players} setPlayers={setPlayers} hand={hand} setHand={setHand} handBackup={handBackup} setHandBackup={setHandBackup} currentPlayer={currentPlayer} setCurrentPlayer={setCurrentPlayer} playersAPI={playersAPI} gameAPI={gameAPI} cardsAPI={cardsAPI} gameEndedBy={gameEndedBy} setGameEndedBy={setGameEndedBy} gameOptions={gameOptions} justAFlag={justAFlag} setJustAFlag={setJustAFlag} infoMode={infoMode} setInfoMode={setInfoMode} />
            </div>
            <div className={'col-' + (gameOptions.dev? '5' : '6') } key='35tt5'>
              <Players players={players} currentPlayer={currentPlayer} crownPlayer={crownPlayer} cards={cards} setCards={setCards} cardsAPI={cardsAPI} playersAPI={playersAPI}  gameOptions={gameOptions} gameEndedBy={gameEndedBy} hand={hand} infoMode={infoMode} setInfoMode={setInfoMode} />
            </div>
            
        </div>
      
        <Tooltip tooltipMsg={tooltipMsg} setTooltipMsg={setTooltipMsg}/>
      </div>
      
      <Footer gameAPI={gameAPI} currentPlayer={currentPlayer} hand={hand} players={players} playersAPI={playersAPI} gameOptions={gameOptions} setGameOptions={setGameOptions} cards={cards} cardsAPI={cardsAPI} infoMode={infoMode} setInfoMode={setInfoMode} gameStarted={gameStarted} crownPlayer={crownPlayer} setCards={setCards} characterCards={characterCards} districtCards={districtCards} gameEndedBy={gameEndedBy} />

      {
        gameOptions.dev ? (
        <div className='devtools container'>
          <h5>District Deck</h5>
          <ul className='row district-deck list-unstyled'>
            { districtCards.map( card => <li className='small-card' key={ 'devcard'+card.ID }>
              <Card card={card} infoMode={infoMode} setInfoMode={setInfoMode}
                    handleOnClick={ () => {                                   
                      if (typeof currentPlayer !== 'number') {alert('no pl'); return false; }  
                      playersAPI.pickUpCard( { playerIndex: currentPlayer, cardID: card.ID, ignoreLimitThisTurn: true } ) } } />
            </li>) }
          </ul>
          <h5>Chars Deck</h5>
          <ul className='row character-deck list-unstyled'>
            { characterCards.map( card => <li className='small-card' key={ 'devcard'+card.ID }>
              <Card card={card}/>
            </li>) }
          </ul>
        </div>
        ) : null

      }
    </div>
  );
}

export default App;
