import React from 'react';

// Message on the dialog before starting a turn
// These components go in the 

export function DistrictSelectionHelp(props) {

  return (
    <div className='container'>
      <h5>Grab the first 4 cards from the deck</h5>
      <p>To start the game, every player grabs 4 cards and 2 coins</p>
      <ul>
        <li key='s2'>The cards will be in your hand, nobody else can see them until you BUILD them</li>
      </ul>
    </div>    
  );
}