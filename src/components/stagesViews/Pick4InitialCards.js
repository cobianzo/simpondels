// Stage 1: Start the game by picking up 4 initial cards and 2$
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { classAfterWait } from '../../helpers';

export default class Pick4InitialCards extends Component {
    static propTypes = {
        hand: PropTypes.shape({
            stage: PropTypes.string,
        }),
        players: PropTypes.array,
        playersAPI: PropTypes.shape({
            giveMoneyToPlayer: PropTypes.func,
            pickUpCard: PropTypes.func,
        }),
        gameAPI: PropTypes.shape({
            getCurrentStageParams: PropTypes.func,
            moveToNextPlayerOrStage: PropTypes.func,
        }),
        gameOptions: PropTypes.shape({
            moveOnIfOnlyOneOption: PropTypes.bool,
        }),
        currentPlayer: PropTypes.number
    }

    // This is an option for the game. If we want this stage to be triggered automatically without human action.
    theRef = React.createRef();
    componentDidUpdate() {
        if (!this.props.hand) return null;
        if (this.props.hand.stage !== 'district-selection') return null;
        console.log('<Pick4InitialCards /> Update currentPlayer:', this.props.currentPlayer);
        window.requestAnimationFrame(() => {
            if (typeof this.props.currentPlayer !== 'number') return;

            if (this.props.players.length && (this.props.gameOptions.moveOnIfOnlyOneOption || this.props.players[this.props.currentPlayer].is_computer) 
            && (this.theRef.current)) {       
                console.log('Action automatic select 4 district cards on stage: '+this.props.hand.stage);
                this.theRef.current.click();
            }
        });
    }

    // Action when clicking on the back card image: taking 4 cards and move to next player
    clickHandle = () => {
        this.props.playersAPI.giveMoneyToPlayer(2);
        this.props.playersAPI.pickUpCard({ cardID: 'last-district-card', times: 4 } );
        this.props.gameAPI.moveToNextPlayerOrStage();
    }

    render() {
        if (this.props.hand.stage !== 'district-selection') return null;
        if (typeof this.props.currentPlayer !== 'number') return null;
        return (
        <div className={ classAfterWait('fade-in-animation-once', this.props) }>
            <h3 className='mt-3'>Hi {this.props.players[this.props.currentPlayer].name}</h3>
            <p>click on the card to grab your initial {this.props.gameAPI.getCurrentStageParams().minCardsToPickup} district cards</p>
            <ul className='row list-unstyled pt-4'>
            <li ref={this.theRef} className='offset-3 col-6 hover-rotate p-1' onClick={ this.clickHandle }>
                <img className="m-auto img-fluid rotate-left rounded" style={ {"maxWidth": "100px"} } src="/imgs/back.jpeg" alt="Click the card to pick it up!" />
                <span className="badge badge-info absolute-center opacity-animation">Click me!</span>
            </li>
            </ul>
            
        </div>
        )
    }
}