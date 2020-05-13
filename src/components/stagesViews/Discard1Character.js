// Stage 2: Discard 1 character from deck
// Conversion of the view form DeckCards.js
// Still not used.
import React, { Component } from 'react'
import PropTypes from "prop-types";
import { classAfterWait } from '../../helpers';

export default class Discard1Character extends Component {
  // props
  static propTypes = {
    hand: PropTypes.shape({
      stage: PropTypes.string,
    }),
    gameOptions: PropTypes.shape({
      moveOnIfOnlyOneOption: PropTypes.string,
      moveToNextStage: PropTypes.func
    }),
    cards: PropTypes.array,
    characterCards: PropTypes.array,
    cardsAPI: PropTypes.shape({
      removeRandomCharacterCard: PropTypes.func,
    }),
    gameAPI: PropTypes.shape({
      moveToNextStage: PropTypes.func,
    }),
    players: PropTypes.array,
    currentPlayer: PropTypes.number,
  };


  // This is an option for the game. If we want this stage to be triggered automatically without human action.
  liRef = React.createRef(); // access with this.liRef

  constructor (props) {
    super();
    this.action = this.action.bind(this); // do we need this?    
  }

  // Automatic action by the computer
  computerAction = () => {
    if (this.props.hand.stage !== 'discard-character') return null;
    console.log('<Discard1Character /> Update currentPlayer:', this.props.currentPlayer);
    
    if ((this.props.gameOptions.moveOnIfOnlyOneOption || (this.props.players && typeof this.props.currentPlayer==='number' && this.props.players[this.props.currentPlayer].is_computer)) 
      && (this.liRef.current)) {
        // console.log('Action Discard char automatic on stage: '+this.props.hand.stage, this.liRef.current);
        this.liRef.current.click();
      }
  }
  componentDidUpdate() {
    this.computerAction();
  }

  // the action of clicking on one card image: removes one character from characterDeck and moves to next stage.
  action = event => {
    this.props.cardsAPI.removeRandomCharacterCard();
    this.props.gameAPI.moveToNextStage();
  }


  render() {

    if (this.props.hand.stage !== 'discard-character') return null;

    return (
      <div key='gfs5' className={ classAfterWait('fade-in-animation-once', this.props) }>
        <p key='gf54'>Here tou have the {this.props.characterCards.length} character cards face down.</p>
        <p key='gf5'>Click to remove one random card from the characters' deck and make the hand start</p>
        <ul className='d-inline-flex p-0 justify-content-center flex-wrap' onClick={ this.action }>
        {
          this.props.cards.filter( c => c.type === 'character' ).map( (card, i) => {
            return (<li ref={!i? this.liRef:null} key={'tt'+card.ID} className='Card small-card cursor-pointer hover-border'>
                        <img className="small-card img-fluid" src="/imgs/back-character.jpeg"  alt="" />
                    </li>);
          } )
        }
        </ul>        
      </div>
    )
  }
}
