import React from 'react';
// Apollo imports
import ApolloClient from "apollo-boost";
import { ApolloProvider, Query } from "react-apollo";
import { loadApolloClient, queries } from "../../db-api";

// This is the query that Apollo Client will send to the WP site.


function loopItemGameFrame( { post,  actionOnClick } ) {
  // single preview of a gameframe from API
  return (
    <li
      key={post.databaseId}
      className="list-group-item-action"
      onClick={actionOnClick ? () => actionOnClick(post) : null}
    >
      {post.id}, {post.databaseId}, {post.title}
    </li>
  );
}

function GameFramesList( {actionOnSelectGameFrame} ) {

  return (
    <ApolloProvider client={loadApolloClient()}>
      <div>
        <ul className="list-group select-gameframe mt-3">
          <Query query={queries.GAMEFRAMES} variables={ {} }>
            {({ loading, error, data }) => {
              if (loading)
                return <li className="disabled">Loading game Frames...</li>;
              if (error) return <p>Error :(</p>;
              if (!data.gameframes.edges.length)
                return <p>No matching gameframes found.</p>;

              return data.gameframes.edges.map((edge) => {
                const { node: post } = edge;
                const { postId, title } = post; // todo: include feat image
                return loopItemGameFrame({
                  post,
                  actionOnClick: actionOnSelectGameFrame,
                });
              });
            }}
          </Query>
        </ul>
      </div>
    </ApolloProvider>
  );

}

export default GameFramesList;
