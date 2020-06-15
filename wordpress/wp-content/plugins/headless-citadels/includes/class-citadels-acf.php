<?php
/** ALV:
 * Define all Advaced Custom Fields to display in the backend
 *
 * @package    Citadels
 * @subpackage Citadels/includes
 * @author     Alvaro <cobianzo@gmail.com>
 */
class Citadels_ACF {

	// helper
	private $hide_on_screen = [
					0 => 'permalink',
					1 => 'the_content',
					2 => 'excerpt',
					3 => 'discussion',
					4 => 'comments',
					5 => 'revisions',
					6 => 'slug',
					7 => 'author',
					8 => 'format',
					9 => 'page_attributes',
					10 => 'featured_image',
					11 => 'categories',
					12 => 'tags',
					13 => 'send-trackbacks',
	];
	private $location_gameframe = [
					[
						[
							'param' => 'post_type',
							'operator' => '==',
							'value' => 'gameframe',
						],
					],
				];
	/**
	 * define hooks and init settings
	 */
	public function __construct() {
		// hooks
        add_action( 'acf/init', [$this, 'register_citadels_acf'] );
	}
	

	public function create_card_subfields( $slug, $labels = [ 'default_name' => 'card', 'default_description' => ' ... ' ], $extra_fields = [] ) {
		
		$subfieldwidth_100 = !empty($labels['subfield_width_100']);
		$subfields = [
				[
					'key' => 'field_' . $slug . '_image',
					'label' => 'Image',
					'name' => 'image',
					'type' => 'image',
					'instructions' => 'Upload the image for the card',
					'required' => 0,						
					'wrapper' => ['width' => $subfieldwidth_100? '100' : '20'],
					'show_in_graphql' => 1,
					'return_format' => 'array',
					'preview_size' => 'medium',
					'library' => 'post',						
				],
				[
					'key' => 'field_' . $slug . '_name',
					'label' => 'Name',
					'name' => 'name',
					'type' => 'text',
					'instructions' => 'ie \'' . $labels['default_name'] . '\'',
					'required' => 1,
					'conditional_logic' => 0,
					'wrapper' => ['width' => $subfieldwidth_100? '100' :'20'],
					'show_in_graphql' => 1,
					'default_value' => $labels['default_name'],
					'maxlength' => '30',
				],
				[
					'key' => 'field_' . $slug  . '_description',
					'label' => 'Description',
					'name' => 'description',
					'type' => 'textarea',
					'instructions' => '',
					'required' => 0,
					'conditional_logic' => 0,
					'wrapper' => ['width' => $subfieldwidth_100? '100' : (array_key_exists( 'district', $extra_fields )? '15' : '33')],
					'show_in_graphql' => 1,
					'default_value' => $labels['default_description'], 
					'rows' => 4,
				]
			];
			$has_extra_price = array_key_exists( 'extra-price', $extra_fields );
			$has_repeat = array_key_exists( 'repeat', $extra_fields );
			if (array_key_exists( 'price', $extra_fields )) 
				$subfields[] = [
					'key' => 'field_' . $slug  . '_price',
					'label' => 'Price',
					'name' => 'price',					
					'type' => 'number',
					'instructions' => 'Select price',
					'required' => 0,
					'conditional_logic' => 0,
					'wrapper' => ['width' => $subfieldwidth_100? '100' : (($has_extra_price || $has_repeat)? '10' : '20') ],
					'show_in_graphql' => 1,
					'default_value' => $extra_fields['price'],
					'min' => 0,
					'max' => 7,
					'step' => 1,
				];
			if ( array_key_exists( 'extra-price', $extra_fields )) 
				$subfields[] = [
					'key' => 'field_' . $slug  . '_extra_price',
					'label' => 'Extra Price',
					'name' => 'extra_price',					
					'type' => 'number',
					'instructions' => 'Extra price: extra points given when the game is finished.',
					'required' => 0,
					'conditional_logic' => 0,
					'wrapper' => ['width' => $subfieldwidth_100? '100' : '15'],
					'show_in_graphql' => 1,
					'default_value' => 2,
					'min' => 0,
					'max' => 7,
					'step' => 1,
				];
			if ( array_key_exists( 'district', $extra_fields )) 
				$subfields[] = [
					'key' => 'field_district_num',
					'label' => 'District',
					'name' => 'district_num',
					'type' => 'select',
					'instructions' => '',
					'required' => 0,
					'conditional_logic' => 0,
					'wrapper' => [ 'width' => $subfieldwidth_100? '100' : 15],
					'show_in_graphql' => 1,
					'choices' => array(
						4 => 'King\'s District',
						5 => 'Bishop\'s District',
						6 => 'Merchant\'s District',
						8 => 'Warlord\'s District',						
					),
					'default_value' => false,
					'allow_null' => 0,
					'multiple' => 0,
					'ui' => 0,
					'return_format' => 'value',
					'ajax' => 0,
					'placeholder' => '',
				];
			if ( array_key_exists( 'repeat', $extra_fields )) 
				$subfields[] = [
					'key' => 'field_' . $slug  . '_repeat',
					'label' => 'Repeated',
					'name' => 'repeat',					
					'type' => 'number',
					'instructions' => 'Number of cards like this one in the deck',
					'required' => 0,
					'conditional_logic' => 0,
					'wrapper' => ['width' => 10],
					'show_in_graphql' => 1,
					'default_value' => $extra_fields['repeat'],
					'min' => 1,
					'max' => 5,
					'step' => 1,
				];
		return $subfields;
	}

	/**
	 * 
	 */
	public function create_card_group_field( $slug = 'character_card_1', $labels = [ 'width' => 100, 'subfield_width_100' => false, 'instructions' => '', 'default_name' => '', 'default_description'=> ''] ) {
		
		$field = [
			'key' => 'field_' . $slug,
			'label' => $labels['default_name'] . ' Card',
			'name' => $slug,
			'type' => 'group',
			'instructions' => $labels['instructions'],
			'required' => 0,
			'wrapper' => ['width' => array_key_exists('width', $labels)? $labels['width'] : 100 ],
			'show_in_graphql' => 1,
			'layout' => 'block',
			'sub_fields' => $this->create_card_subfields( $slug, $labels ),
		];
		//echo"<pre>"; print_r($field); echo "</pre>";
		return $field;
	}

	public function create_wildcard_group_field( $slug, $price, $labels ) {
		$field = $this->create_card_group_field( $slug, $labels);
		$field['sub_fields'] = $this->create_card_subfields( $slug, $labels, [ 'price' => $price ] + (!empty($labels['extra-price'])? [ 'extra-price' => $labels['extra-price'] ] : []) );
		return $field;
	}

	/**
	 * Undocumented function
	 *
	 * @param [type] $slug
	 * @param [type] $price
	 * @param [type] $district_code
	 * @param [type] $number_of_cards_in_deck
	 * @param [type] $labels
	 * @return void
	 */
	// public function create_district_card_group_field( $slug, $price, $district_code, $number_of_cards_in_deck, $labels ) {
	// 	$field = $this->create_card_group_field( $slug, $labels);
	// 	$field['sub_fields'] = $this->create_card_subfields( $slug, $labels, [ 'price' => $price, 'district' => $district_code, 'repeat' => $number_of_cards_in_deck ] );
	// 	$field['sub_fields'][2]['wrapper']['width'] = 30; // description field shorter		
	// 	return $field;
	// }

	/**
	 * Definition of ACF for a Game Frame: Fields for cards
	 * Called in the acf/init hook
	 * 
	 * @return void
	 */
	public function register_citadels_acf() {
		if( function_exists('acf_add_local_field_group') ):
			
			acf_add_local_field_group([
				'key' => 'group_character_cards',
				'title' => 'Character Cards for Game Frame',
				'instructions' => 'Define the Assassin card. Select the image, name and description. For example, if you Game Frame is about Game of Thrones, this character could be the Faceless man Jaqen H\'ghar, or Arya Stark.',
				'fields' => [
					$this->create_card_group_field( 'character_card_1', [
						'width'					=> 25,
						'subfield_width_100'	=> true,
						'instructions' 			=> '',
						'default_name' 			=> 'Assassin',
						'default_description' 	=> 'You are evil! In your turn, you can select one character to kill.
	The murdered character won\'t receive cards or money, and won\'t be able to perform his action.',
					]),
					$this->create_card_group_field( 'character_card_2', [
						'width'					=> 25,
						'subfield_width_100'	=> true,
						'instructions' 			=> '',
						'default_name' 			=> 'Thief',
						'default_description' 	=> 'You steal all the money from any of the characters. You can\'t steal from the Assassin or the character that he killed.',
					]),
					$this->create_card_group_field( 'character_card_3', [
						'width'					=> 25,
						'subfield_width_100'	=> true,
						'instructions' 			=> '',
						'default_name' 			=> 'Magician',
						'default_description' 	=> 'you have one of two options: Exchange your entire hand of cards (not the cards in your city) with the hand of another player (this applies even if you have no cards in your hand, in which case you simply take the other player\'s cards). / Place any number of cards from your hand facedown at the bottom of the District Deck, and then draw an equal number of cards from the top of the District Deck.',
					]),
					$this->create_card_group_field( 'character_card_4', [
						'width'					=> 25,
						'subfield_width_100'	=> true,
						'instructions' 			=> '',
						'default_name' 			=> 'King',
						'default_description' 	=> 'When the King is called, you immediately receive the Crown. You receive one gold for each noble (yellow) district in your city.',
					]),
					$this->create_card_group_field( 'character_card_5', [
						'width'					=> 25,
						'subfield_width_100'	=> true,
						'instructions' 			=> '',
						'default_name' 			=> 'Bishop',
						'default_description' 	=> 'You receive one gold for each religious (blue) district in your city. Your districts may not be destroyed/exchanged by the Warlord/Diplomat.',
					]),
					$this->create_card_group_field( 'character_card_6', [
						'width'					=> 25,
						'subfield_width_100'	=> true,
						'instructions' 			=> '',
						'default_name' 			=> 'Merchant',
						'default_description' 	=> 'You receive one gold for each trade (green) district in your city. After you take an action, you receive one additional gold.',
						]),
					$this->create_card_group_field( 'character_card_7', [
						'width'					=> 25,
						'subfield_width_100'	=> true,
						'instructions' 			=> '',
						'default_name' 			=> 'Architect',
						'default_description' 	=> 'After you take an action, you draw two additional district cards and put both in your hand. You may build up to three districts during your turn.',
						]),
					$this->create_card_group_field( 'character_card_8', [
						'width'					=> 25,
						'subfield_width_100'	=> true,
						'instructions' 			=> '',
						'default_name' 			=> 'Warlord',
						'default_description' 	=> 'You receive one gold for each military (red) district in your city. At the end of your turn, you may destroy one district of your choice by paying a number of gold equal to one less than the cost of the district. Thus, you may destroy a cost one district for free, a cost two district for one gold, or a cost six district for five gold, etc. You may destroy one of your own districts.',
					]),
				],
				'location' => $this->location_gameframe,
				'menu_order' => 0,
				'position' => 'normal',
				'style' => 'default',
				'label_placement' => 'top',
				'instruction_placement' => 'label',
				'hide_on_screen' => $this->hide_on_screen,
				'active' => true,
				'description' => 'There are 8 character cards. Edit them one by one',
				'show_in_graphql' => 1,
				'graphql_field_name' => 'character_cards',
			]);

			acf_add_local_field_group([
				'key' => 'group_district_wildcards',
				'title' => 'Wildcards for Game Frame',
				'fields' => [
					$this->create_wildcard_group_field( 'one-less-district-to-finish', 4, [
						'instructions' 			=> '',
						'default_name' 			=> 'one less district to finish',
						'default_description' 	=> "Impresentable. Usa la carta y podrás escoger en reducir en 1 el límite de cartas construídas para acabar el juego"
					]),
					$this->create_wildcard_group_field( 'money-into-points', 4, [
						'instructions' 			=> '',
						'default_name' 			=> 'money into points',
						'default_description' 	=> "Al acabar la partida, cada moneda que tengas te contarás como un punto"
					]),
					$this->create_wildcard_group_field( 'build-cheaper', 5, [
						'instructions' 			=> '',
						'default_name' 			=> 'build cheaper',
						'default_description' 	=> "Con esta carta en tu ciudad, construir te costará $1 menos"
					]),
					$this->create_wildcard_group_field( 'take-1-coin-if-dont-have-any', 4, [
						'instructions' 			=> '',
						'default_name' 			=> 'take 1 coin if dont have any',
						'default_description' 	=> "Si te quedas sin dinero al final de tu turno, recibe tu pensión de $1"
					]),
					$this->create_wildcard_group_field( 'see-3-cards', 5, [
						'instructions' 			=> '',
						'default_name' 			=> 'see 3 cards',
						'default_description' 	=> "Cuando escojas robar carta en tu turno, podrás visualizar 3 cartas en lugar de 2"
					]),
					$this->create_wildcard_group_field( 'observatory', 6, [
						'instructions' 			=> '',
						'default_name' 			=> 'observatory',
						'default_description' 	=> "Te puedes quedar las dos cartas que levantes del mazo."
					]),
					$this->create_wildcard_group_field( 'choose-card-color', 2, [
						'instructions' 			=> '',
						'default_name' 			=> 'choose card color',
						'default_description' 	=> "Al acabar la partida, podrás escoger el color de esta carta. Esto te podrá dar puntos si, por ejemplo, tienes los 5 colores en tus cartas construídas"
					]),
					$this->create_wildcard_group_field( 'graveyard', 2, [
						'instructions' 			=> '',
						'default_name' 			=> 'graveyard',
						'default_description' 	=> "Si Bart te destruye una carta, puedes pagar 1 moneda para evitarlo, pero esa carta pasará a tu mazo personal. No se aplica si la carta destruída es precisamente el cementerio."
					]),
					$this->create_wildcard_group_field( 'coin-on-change-of-crown', 6, [
						'instructions' 			=> '',
						'default_name' 			=> 'coin on change of crown',
						'default_description' 	=> "Por asuntos políticos, cada vez que cambie la alcaldía de jugador, te llevarás $1"
					]),
					$this->create_wildcard_group_field( 'commisary', 3, [
						'instructions' 			=> '',
						'default_name' 			=> 'commisary',
						'default_description' 	=> "Le puedes pedir al Jefe Wiggum que destruya la carta que tú elijas a cualquiera de tus oponentes. Perderás esta carta al terminar la partida."
					]),
					$this->create_wildcard_group_field( 'hospital', 6, [
						'instructions' 			=> '',
						'default_name' 			=> 'hospital',
						'default_description' 	=> "Aunque Bob haya intentado matarte, no lo ha conseguido gracias a esta carta, y podrás recibir tu dinero o tus cartas, aunque no podrás ejecutar tu acción"
					]),
					$this->create_wildcard_group_field( 'destroy-more-expensive', 6, [
						'instructions' 			=> '',
						'default_name' 			=> 'destroy more expensive',
						'default_description' 	=> "Bajo la protección del reverendo, a Bart le costará $1 más destruir tus cartas"
					]),
					$this->create_wildcard_group_field( 'laboratory', 3, [
						'instructions' 			=> '',
						'default_name' 			=> 'laboratory',
						'default_description' 	=> "Tu deseo será cumplido: al construir esta carta, puedes escoger la carta que elijas del mazo. El mazo será barajado al acabar tu turno."
					]),
					$this->create_wildcard_group_field( 'take-cards-if-dont-have-any', 6, [
						'instructions' 			=> '',
						'default_name' 			=> 'take cards if dont have any',
						'default_description' 	=> "Si no tienes cartas al final de tu turno, puedes robar dos del mazo"
					]),
					$this->create_wildcard_group_field( 'cant-be-destroyed', 3, [
						'instructions' 			=> '',
						'default_name' 			=> 'cant be destroyed',
						'default_description' 	=> "Esta carta está a salvo de las barbaridades de Bart, quien no podrá destruirla"
					]),
					$this->create_wildcard_group_field( 'point-per-different-color', 5, [
						'instructions' 			=> '',
						'default_name' 			=> '1 point per different color',
						'default_description' 	=> "Al acabar la partida, añade $1 por cada carta de diferente color que tengas en tu mano"
					]),
					$this->create_wildcard_group_field( 'can-build-duplicates', 5, [
						'instructions' 			=> '',
						'default_name' 			=> 'can build duplicates',
						'default_description' 	=> "Puedes construir cartas idénticas a las que ya tengas en tu propiedad."
					]),
					$this->create_wildcard_group_field( 'buy-3-cards', 5, [
						'instructions' 			=> '',
						'default_name' 			=> 'buy 3 cards',
						'default_description' 	=> "En tu turno, puedes pagar $3 para obtener 3 cartas del mazo"
					]),
					$this->create_wildcard_group_field( 'sell-card-per-1-coin', 5, [
						'instructions' 			=> '',
						'default_name' 			=> 'sell card per 1 coin',
						'default_description' 	=> "El negocio empieza a funcionar. En tu turno, puedes vender una de las cartas en tu mano y recibir $1 a cambio."
					]),
					$this->create_wildcard_group_field( 'prestige-card-1', 5, [
						'instructions' 			=> '',
						'default_name' 			=> 'prestige card 1',
						'default_description' 	=> "El negocio empieza a funcionar. En tu turno, puedes vender una de las cartas en tu mano y recibir $1 a cambio.",
						'extra-price' 			=> 2
					]),
					$this->create_wildcard_group_field( 'prestige-card-2', 5, [
						'instructions' 			=> '',
						'default_name' 			=> 'prestige card 2',
						'default_description' 	=> "El negocio empieza a funcionar. En tu turno, puedes vender una de las cartas en tu mano y recibir $1 a cambio.",
						'extra-price' 			=> 2
					]),
				],
				'location' => $this->location_gameframe,
				'menu_order' => 1,
				'position' => 'normal',
				'style' => 'default',
				'label_placement' => 'top',
				'instruction_placement' => 'label',
				'hide_on_screen' => $this->hide_on_screen,
				'active' => true,
				'description' => 'Edit the special cards, called Wildcards',
				'show_in_graphql' => 1,
				'graphql_field_name' => 'district_wildcards',
			]);

			acf_add_local_field_group([
				'key' => 'group_district_cards_repeater',
				'title' => 'District Cards for Game Frame',
				'name' => 'district_cards_repeater',
				'fields' => array(
					array(
						'key' => 'field_district_cards_group',
						'label' => 'District Cards',
						'name' => 'district_cards_group',
						'show_in_graphql' => 1,
						'type' => 'repeater',
						'instructions' => '',
						'required' => 0,
						'conditional_logic' => 0,
						'wrapper' => ['width' => 100 ],
						'collapsed' => '',
						'min' => 1,
						'max' => 100,
						'layout' => 'table',
						'button_label' => 'Add District Card',
						'sub_fields' => $this->create_card_subfields( 'district_card', [ 'default_name' => 'card', 'default_description' => ' ... ', 'width'					=> 25,
						'subfield_width_100' => false ], $extra_fields = [ 'price' => 4, 'district' => null, 'repeat' => 2])
					),
				),
				'location' => $this->location_gameframe,
				'menu_order' => 2,
				'position' => 'normal',
				'style' => 'default',
				'label_placement' => 'top',
				'instruction_placement' => 'label',
				'hide_on_screen' => $this->hide_on_screen,
				'active' => true,
				'description' => 'Edit the special cards, called Wildcards',
				'show_in_graphql' => 1,
				'graphql_field_name' => 'district_cards_repeater',
			]);


		endif;
	}
}
