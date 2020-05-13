## File structure

- cardsdemo.json: needed. Here all cards with specification.
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

- gameoptions.json : It is loaded when started the game. If not found then it is used:
- gameoptions-default.json (this file is included in git, so it will always be there)
- gamesaved.json: situation of a game that can be loaded. To create a snapshop in json of a game use the button save params and copy and paste the textarea in this file. Then load it with the button "Load game"
