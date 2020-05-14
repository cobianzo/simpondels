## File structure

- public/cardsdemo.json: needed. Here all cards with specification.
{
    "ID": 1,  --- unique ID
    "image": "/imgs/cards/wildcards/apartamento-de-barney.jpeg",
    "name": "apartamento-de-barney",
    "type": "district" | "character"
    "description": " ... ",
    "type-of-district": 1 to 8 || "wildcard", (only for type:"district" cards. The number corresponds to the character-number of a type:"character" card)
    "wildcard": "name if its a wildcard",
    "price": 4,
    "extra-price"
},

- public/gameoptions.json : It is loaded when started the game. If not found then it is used:
- public/gameoptions-default.json (this file is included in git, so it will always be there)
- public/gamesaved.json: situation of a game that can be loaded. To create a snapshop in json of a game use the button save in the footer. Copy the params in a file. Paste it in the textbox and click Load to load a game.
