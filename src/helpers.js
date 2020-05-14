import React from 'react'
// HELPERS

// shuffles an array by reference. Don't need to use the return value. Use: 
// @param array: the array we want to shuffle
// @return the array, altough the array given as an arg is already shuffleed
export function shuffle(array) {
  // one method:
  array.sort(() => Math.random() - 0.5);
  return array;
}

// works with array, use it with filter. ie: const uniqueAges = ages.filter(unique)
export function unique(value, index, self) {
	return self.indexOf(value) === index
}

// tells if an object is empty like : {}
export function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

// NOT USED
// compares two array (it might have objects or anything inside) or objects (can be nested)
// and returns true if they have the same values.
export function isEqual(value, other) {

	// Get the value type
	var type = Object.prototype.toString.call(value);

	// If the two objects are not the same type, return false
	if (type !== Object.prototype.toString.call(other)) return false;

	// If items are not an object or array, return false
	if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;

	// Compare the length of the length of the two items
	var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
	var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
	if (valueLen !== otherLen) return false;

	// Compare two items
	var compare = function (item1, item2) {

		// Get the object type
		var itemType = Object.prototype.toString.call(item1);

		// If an object or array, compare recursively
		if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
			if (!isEqual(item1, item2)) return false;
		}

		// Otherwise, do a simple comparison
		else {

			// If the two items are not the same type, return false
			if (itemType !== Object.prototype.toString.call(item2)) return false;

			// Else if it's a function, convert to a string and compare
			// Otherwise, just compare
			if (itemType === '[object Function]') {
				if (item1.toString() !== item2.toString()) return false;
			} else {
				if (item1 !== item2) return false;
			}

		}
	};

	// Compare properties
	if (type === '[object Array]') {
		for (var i = 0; i < valueLen; i++) {
			if (compare(value[i], other[i]) === false) return false;
		}
	} else {
		for (var key in value) {
			if (value.hasOwnProperty(key)) {
				if (compare(value[key], other[key]) === false) return false;
			}
		}
	}

	// If nothing failed, return true
	return true;

};

// function for dev purposes
export function logg( string, obj = null, ...rest) {
	if (arguments.length === 1 ) 
		console.log(string);
	if (arguments.length === 2 ) 
		console.log(string, obj);
	if (arguments.length > 2 ) 
		console.log( Array.from(arguments).join(" -||- ") );
	return;
}

export function logfn ( fn_name, ...args ) {	
	const str = `**** FN ${fn_name} ****`;
	logg( str, ...args );
}

export function renderObject(obj) {
	let jsx = null;
	if (!obj) return '';
	for ( let key of Object.keys(obj) )
		if ( obj[key] === null )
			jsx = [ jsx, (<span key={key} className='d-block'>{key} >>> <i>null</i></span>) ];
		else if ( obj[key] === false )
			jsx = [ jsx, (<span key={key} className='d-block'>{key} >>> <i>false</i></span>) ];		
		else if ( typeof obj[key] === 'object' ) {}
			// jsx = [ jsx, (<span key={key} className='d-block'>{key} >>> <blockquote style={ {"overflowWrap": "anywhere"} }>{JSON.stringify(obj[key], getCircularReplacer())}</blockquote></span>) ];
		else jsx = [ jsx, (<div key={key} className='d-block'> { key  } >> <b>{ obj[key] }</b></div>) ]
	return jsx;
}

// solution at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value
// to avoid  TypeError: cyclic object value - JSON.stringify(circularReference, getCircularReplacer());
// {"otherData":123}
const getCircularReplacer = () => {
	const seen = new WeakSet();
	return (key, value) => {
		if (typeof value === "object" && value !== null) {
		if (seen.has(value)) {
			return;
		}
		seen.add(value);
		}
		return value;
	};
};

// help to show info about a card
export function createOverlay(html, callbackOnClose) {
	const id = 'card-description-overlay';
    if (document.getElementById(id)) document.getElementById(id).remove();
    const overlay = document.createElement("div");
    const close = document.createElement("span");
    close.classList.add(...['badge', 'badge-info']);
    close.innerHTML = 'X';
    close.addEventListener('click', () => {
      document.getElementById(id).remove();
      callbackOnClose();
    });
    overlay.innerHTML = html;    
    overlay.id = id;
    document.querySelector('.App__body').prepend(overlay);
    overlay.prepend(close);
}

// To create fade in effect when the state change
export function classAfterWait(nameOfClass, props) {
	if (!props) return nameOfClass;
	if (!props.gameOptions.waitForPlayer) return nameOfClass;
	// if waiting for confirmation we dont show the class
	return (props.hand.waitForPlayerConfirmation ? '' : nameOfClass);
}

// USE: pronoum(props), pronoum(props, 'player'), pronoum(props, 'you', 'player')
//  Needed props: players, currentPlayer, cardsAPI, 
// @param normalpronoum: 'you' | number 1 to 8 | player
// @param pronoum: 'player', 'char', 'you'
// @RETURNS: you | Michael | Homer
// NEEDS props: players, currentPlayer, cardsAPI
export function pronoum(props, normalpronoum = 'you', ifcomputerpronoum = 'player', options = {capitalize:false}) {
	if (!props.players) return '??';
	if (typeof props.currentPlayer !== 'number') return '??';
	if (!props.players[props.currentPlayer]) return '??';
	const charCard = (props.cardsAPI)? props.cardsAPI.getCalledCharacterCard() : null;
	
	let pronoum = normalpronoum; // by default is 'you'
	if (typeof normalpronoum === 'number' && props.cardsAPI) {
		pronoum = props.cardsAPI.getCardByCharacterNumber(normalpronoum).name;
	} else
	if (normalpronoum === 'player') {
		pronoum = props.players[props.currentPlayer].name;
	}
	else
	if (props.players[props.currentPlayer].is_computer)
		switch (ifcomputerpronoum) {
			case 'player':
				pronoum = props.players[props.currentPlayer].name;
				break;
			case 'char':
				if (charCard) {					
					pronoum = charCard.name;
				}
				break;	
			default:
				// you or 'the computer'
				pronoum = 'the computer';
				break;
		}
	if (options && options.capitalize) {
		pronoum = pronoum.charAt(0).toUpperCase() + pronoum.slice(1);
	}
	return pronoum;
}