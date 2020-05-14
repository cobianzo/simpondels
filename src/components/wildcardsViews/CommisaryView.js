import React, {useState, useEffect} from 'react'
import Card from '../Card'
import { logg, pronoum } from "../../helpers";

// Laboratory wild card: allow the user to pick up any card from the dect
// This Component shows, in a modal window, all cards in the deck, and the user must choose one by clicing on it.
// WHEN: when the hand.stage is set to 'situation-laboratory:select-deck-card'. This happens when the laboratory card is built.
function CommisaryView(props) {  
  // proprierties
  const { gameOptions, gameAPI,
        setHand, handBackup,
        playersAPI, players, setPlayers, currentPlayer,
        cardsAPI, cards} = props;
  
  // Prepare vars
  const commisaryCard = cards[cardsAPI.getWildcards('commisary', true)] || {}; // the wildcard
  // prepare all destroyable cards for players
  let allDestroyableCardsArr = []; // list of all cardIndex, so the computer can choose a random one from here
  let cardsByPlayer = []; // [ { playerIndex:x, destroyableCards: [ 32, 4, 31] }, .. ] 
  players.forEach( (player, pli) => {
    if (pli === currentPlayer) return;
    let playerAndCards = { playerIndex: pli}
    playerAndCards.destroyableCards = playersAPI.getBuildDistrictCardsForPlayer(pli); // array of index cards
    allDestroyableCardsArr = allDestroyableCardsArr.concat(playerAndCards.destroyableCards);
    cardsByPlayer.push(playerAndCards);
  } );
  


  // params for computer auto action
  // Automatic action for computer: select random card after 3 seconds
  const is_computer = (players[currentPlayer] && players[currentPlayer].is_computer);
  const [timing, setTiming] = useState(is_computer ? 3 : null);
  useEffect(() => {
    timing && setTimeout(() => setTiming(timing - 1), 1000);
    if (timing === 0) {
      debugger
      if (allDestroyableCardsArr.length) {
        cardRef.current && cardRef.current.click();
      } else {
        noactionRef.current && noactionRef.current.click();
      }
    }
  }, [timing]);
  let cardRef = null;
  let rdnCardIndex = null;
  const noactionRef = React.createRef(); // btn 'i dont want to destroy any card
  if ( is_computer ) {
    // select a random card Index
    rdnCardIndex = allDestroyableCardsArr.length? allDestroyableCardsArr[Math.floor(Math.random() * (allDestroyableCardsArr.length))] : null;
    cardRef = React.createRef();
  }
    
  
  
  // VALIDATION
  if (!cards || !cards.length) return null;
  
  // Action when you click on one card.
  const handleDestroyCard = (cardIndex) => {
    if (cardIndex >= 0) {
      const destroyed = playersAPI.destroyBuiltCard(cards[cardIndex]);
      logg('Commisary card destroying card', destroyed);
      handBackup.messages.after_build_card = <p>{pronoum(props)} have just destroyed the card {cards[cardIndex].name}, using your card {commisaryCard.name}, which has also been removed.</p>
    } else {
      handBackup.messages.after_build_card = <p>Wiggum did't destroy any card, and your card {commisaryCard.name}, has been removed form the game.</p>
    }
    // destroy also the commisary, but this one completely, dont move it back to the deck
    let dCards = [...players[currentPlayer].districtCards];
    dCards = dCards.filter(ci => !(cards[ci].wildcard === 'commisary' && cards[ci].is_built)); // get district card from player except the commisary that he is building
    players[currentPlayer].districtCards = dCards;
    setPlayers(players);
    // --- 
    handBackup.canMoveNext = { can: true, must: false };
    setHand({ ...handBackup });
    // the handbackup is reset in the update of hand.stage
  }


  
  
  
  // RENDER VIEW ------------------------------------------------------------------------------
  return (
    <div key='poszi' className='modal d-block bg-opacity' tabIndex="-1" role="dialog" >
      <div key='s3' className='modal-dialog modal-content p-4' role="document">
        <div key='s2' className='row'>
          <div key='q3' className='small-card col-3'>
            <Card card={commisaryCard} />
          </div>
          <div key='r3' className='col-9'>
            <p key='g-1'>{ pronoum(props) } are building the {commisaryCard.name}!</p>
            <p key='g-3'>{pronoum(props)} can destroy any card from your opponents</p>
            {is_computer ? <button className='btn btn-danger'>Choosing a card in <br />{timing}</button> : null }
          </div>
        </div>        
        { cardsByPlayer.map( plAndCards => { /* plAndCards is { playerIndex: 2, destroyableCards: [23, 1, 12 ...] } */
          return (
            <div key={plAndCards.playerIndex}>
              <h2>{players[plAndCards.playerIndex].name}</h2>
              { plAndCards.destroyableCards.length ? 
                ( <ul className='list-unstyled extra-small-cards d-flex flex-wrap'> 
                    {
                      plAndCards.destroyableCards.map((ci, i) => (
                        <li key={'plki' + ci} className={'col-sm hover-border' + ((ci === rdnCardIndex && gameOptions.dev)? ' transition-all rotate-left' : null) }
                          onClick={() => handleDestroyCard(ci)}
                          ref={ci === rdnCardIndex? cardRef : null } >
                          <Card card={cards[ci]} />
                        </li>
                    )
                  )}
                  </ul>
                )
                : <p>No cards to destroy</p> }
            </div>
            )
        })}
        <button className='btn btn-danger mt-2'
                ref={noactionRef}
                onClick={() => handleDestroyCard(-1)}>
          I am magnanimus, I don't want to destroy any card.
        </button>
      </div>
    </div>

  );
}


export default CommisaryView;
