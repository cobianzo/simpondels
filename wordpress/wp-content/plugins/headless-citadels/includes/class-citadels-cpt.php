<?php
/** ALV:
 * Define all custom post types
 *
 * @package    Citadels
 * @subpackage Citadels/includes
 * @author     Alvaro <cobianzo@gmail.com>
 */
class Citadels_CPT {

	public function __construct() {
		// hooks
        add_action( 'init', [$this, 'load_gameframe_cpt'] );
	}
	
	public static function load_gameframe_cpt() {

		/**
		 * Post Type: Game Frame.
		 */

		$labels = [
			"name" => __( "Game Frame", "twentytwenty" ),
			"singular_name" => __( "Game Frames", "twentytwenty" ),			
		];

		$args = [
			"label" => __( "Game Frame", "twentytwenty" ),
			"labels" => $labels,
			"description" => "",
			"public" => true,
			"publicly_queryable" => true,
			"show_ui" => true,
			"show_in_rest" => true,
			"rest_base" => "",
			"rest_controller_class" => "WP_REST_Posts_Controller",
			"has_archive" => false,
			"show_in_menu" => true,
			"show_in_nav_menus" => true,
			"delete_with_user" => false,
			"exclude_from_search" => false,
			"capability_type" => "post",
			"map_meta_cap" => true,
			"hierarchical" => false,
			"rewrite" => [ "slug" => "gameframe", "with_front" => true ],
			"query_var" => true,
			"supports" => [ "title", "editor", "thumbnail" ],
			"show_in_graphql" => true,
			"graphql_single_name" => "gameframe",
      		"graphql_plural_name" => "gameframes",
		];

		register_post_type( "gameframe", $args );
	}



}
