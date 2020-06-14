/**
 * Functions to connect with the WP GraphQL Db
 * Dependencies:
 *  .env 
 * 
 */
import ApolloClient from "apollo-boost";
import gql from "graphql-tag";

import React from 'react'
const configs = require('dotenv').config() // load in env variables from your .env file

export function getGraphQLEndpoint() {
	return process.env.REACT_APP_GRAPHQL_ENDPOINT;
}

// React Apollo. We define the client as global var.
export function loadApolloClient() {
  if (!window.client)
	  window.client = new ApolloClient({
    	uri: getGraphQLEndpoint(),
	  });
	return window.client;
}

/**
- Queries API
------------------------------------------------------
 */


 // TODO: move away form the object
export const queries = {
         GAMEFRAMES: gql`
           query getGameFrames {
             gameframes {
               edges {
                 node {
                   title
                   id
                   slug
                   databaseId
                   featuredImage {
                     sourceUrl
                     altText
                   }
                 }
               }
             }
           }
         `,
         GAMEFRAMEBYID: gql`
           query gameframe($id: String!) {
             title
             id
           }
         `,
};

// not in use
export const GET_DISTRICT_CARDS = gql`
  query getDistrictCards($gameframeID: ID!) {
    gameframe(id: $gameframeID) {
      title
      id
      district_cards_repeater {
        districtCardsGroup {
          description
          price
          districtNum
          name
          image {
            sourceUrl
            mediaDetails {
              file
              height
              width
              sizes {
                file
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_CARDS = gql`
         query getCards($gameframeID: ID!) {
           gameframe(id: $gameframeID) {
             title
             id
             district_wildcards {
               oneLessDistrictToFinish {
                 description
                 price
                 name
                 image {
                   sourceUrl
                 }
               }
               prestigeCard1 {
                 description
                 price
                 extraPrice
                 name
                 image {
                   sourceUrl
                 }
               }
             }
             district_cards_repeater {
               fieldGroupName
               districtCardsGroup {
                 description
                 price
                 districtNum
                 name
                 image {
                   sourceUrl
                 }
               }
             }
             character_cards {
               characterCard1 {
                 name
                 description
                 image {
                   sourceUrl
                 }
               }
               characterCard2 {
                 name
                 description
                 image {
                   sourceUrl
                 }
               }
               characterCard3 {
                 name
                 description
                 image {
                   sourceUrl
                 }
               }
               characterCard4 {
                 name
                 description
                 image {
                   sourceUrl
                 }
               }
               characterCard5 {
                 name
                 description
                 image {
                   sourceUrl
                 }
               }
               characterCard6 {
                 name
                 description
                 image {
                   sourceUrl
                 }
               }
               characterCard7 {
                 name
                 description
                 image {
                   sourceUrl
                 }
               }
               characterCard8 {
                 name
                 description
                 image {
                   sourceUrl
                 }
               }
             }
           }
         }
       `;

export const GET_GAMEFRAME_BY_SLUG = gql`
  query getGameFrameBySlug( $slug: String! ) {
    gameframeBy(slug: $slug) {
      title
      id
      databaseId
      district_cards_repeater {
        fieldGroupName
      }
    }
  }

`;

//export const loadGameFrameBy = async (gameFramePost, setInitCards) => {


/**
 * Given a WPGraphQL gameframe Post, generates the JSON cards for the game
 * @param {*} gameFramePost: needs fields id, which looks like "cG9zdDo3"
 * @param {*} setInitCards : hook to be called to set the state with the generated Cards
 */
export const loadCardsFromDB = async ( gameFramePost, setInitCards ) => {

  const client = loadApolloClient();
  const initCards = await client.query({
      query: GET_CARDS,
      variables: { gameframeID: gameFramePost.id },
    })
    .then((result) => {
      console.log("loading cards", result);
      let cardsJSON = [];
      /* 
      Convert {
        description: "Homer's card!"
        name: "Moe's Tavern"
      }
      Into
      {
        "ID": 1018,
        "image": "/imgs/cards/taberna-de-moe.jpeg",
        "name": "taberna-de-moe",
        "type": "district",
        "description": "Carta Homeriana. Si juegas con Homer, esta carta te dará $1 en tu turno si la has construído",
        "type-of-district": 5,
        "price": 5 
      }
      */
      if (result?.data?.gameframe?.character_cards)
        
        //Set up character cards!
        Object.keys(result.data.gameframe.character_cards).filter( key => key.includes('characterCard') ).forEach( (key, i) => {
          const element = result.data.gameframe.character_cards[key];          
          cardsJSON.push({
            ID: key,
            "character-number": i + 1,
            image: element.image?.sourceUrl ? element.image.sourceUrl : null, //mediaDetails?.sizes? element.image?.mediaDetails?.sizes[0].file,
            name: element.name,
            type: "character",
            description: element.description,
          });
        });

        // Set up wildcards


        // Set up district cards
        if (result?.data?.gameframe?.district_cards_repeater?.districtCardsGroup)
          result.data.gameframe.district_cards_repeater.districtCardsGroup.forEach(
            (element, i) => {
              cardsJSON.push({
                ID: "district-card-" + i,
                image: element.image?.sourceUrl
                  ? element.image.sourceUrl
                  : null, //mediaDetails?.sizes? element.image?.mediaDetails?.sizes[0].file,
                name: element.name,
                type: "district",
                description: element.description,
                "type-of-district": parseInt(element.districtNum),
                price: element.price,
              });
            }
          );

        console.log(cardsJSON);
        if (setInitCards)
          setInitCards(cardsJSON);
        return cardsJSON;
      }
    ); // end .then. I should adda a catch here (TODO)

    
    return initCards;;
}