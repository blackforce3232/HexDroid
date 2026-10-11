(function fontvecssYukle() {

	var fontLinks = [
		'https://fonts.googleapis.com/css2?family=Kalam&family=Signika&family=Grandstander&family=Comic+Neue&family=Quicksand&display=swap',
		'https://fonts.googleapis.com/css2?family=Orbitron&family=Lemonada&family=Grenze+Gotisch&family=Merienda&family=Amita&display=swap',
		'https://fonts.googleapis.com/css2?family=Averia+Libre&family=Turret+Road&family=Sansita&family=Comfortaa&family=Charm&display=swap',
		'https://fonts.googleapis.com/css2?family=Lobster+Two&family=Rampart+One&family=Kaushan+Script&family=Faster+One&family=Changa+One&display=swap',
		'https://fonts.googleapis.com/css2?family=Charmonman&family=Dancing+Script&family=Aclonica&family=Black+Ops+One&family=Oleo+Script&display=swap',
		'https://fonts.googleapis.com/css2?family=Kablammo&family=Condiment&family=Lobster&family=Pacifico&family=Akaya+Telivigala&display=swap',
		'https://fonts.googleapis.com/css2?family=Chewy&family=Righteous&family=Smokum&family=Wallpoet&family=Fredericka+the+Great&display=swap',
		'https://fonts.googleapis.com/css2?family=Sunshiney&family=Rye&family=DynaPuff&family=Oleo+Script+Swash+Caps&family=Bungee+Inline&display=swap',
		'https://fonts.googleapis.com/css2?family=Monoton&family=Press+Start+2P&family=Shrikhand&family=Titan+One&family=Vast+Shadow&display=swap',
		'https://fonts.googleapis.com/css2?family=Zeyada&family=Emilys+Candy&family=Frijole&family=Nosifer&family=Alfa+Slab+One&display=swap',
		'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Bangers&family=Bebas+Neue&family=Caveat&family=Cinzel+Decorative&display=swap',
		'https://fonts.googleapis.com/css2?family=Covered+By+Your+Grace&family=Creepster&family=Eater&family=Finger+Paint&family=Fontdiner+Swanky&display=swap',
		'https://fonts.googleapis.com/css2?family=Fruktur&family=Geostar+Fill&family=Gloria+Hallelujah&family=Great+Vibes&family=IM+Fell+English+SC&display=swap',
		'https://fonts.googleapis.com/css2?family=Inknut+Antiqua&family=Jolly+Lodger&family=Lakki+Reddy&family=Luckiest+Guy&family=MedievalSharp&display=swap',
		'https://fonts.googleapis.com/css2?family=Metamorphous&family=Mystery+Quest&family=New+Rocker&family=Pirata+One&family=Plaster&display=swap',
		'https://fonts.googleapis.com/css2?family=Raleway+Dots&family=Rubik+Moonrocks&family=Special+Elite&family=UnifrakturMaguntia&family=Bungee&family=Audiowide&family=Russo+One&family=Syncopate&family=Exo+2&display=swap',
		'https://fonts.googleapis.com/css2?family=Satisfy&family=Marck+Script&family=Tangerine&family=Allura&family=Cedarville+Cursive&family=Bad+Script&family=Herr+Von+Muellerhoff&family=Reenie+Beanie&family=Sacramento&family=La+Belle+Aurore&family=Petit+Formal+Script&family=Dawning+of+a+New+Day&family=Parisienne&family=Give+You+Glory&family=Qwigley&family=Over+the+Rainbow&family=Lovers+Quarrel&family=Bilbo&family=Bilbo+Swash+Caps&family=Sriracha&family=Shadows+Into+Light&family=Amatic+SC&family=Indie+Flower&family=VT323&family=Anton&display=swap',
		'https://fonts.googleapis.com/css2?family=Bungee+Shade&display=swap' // Eksik font eklendi
	];

  fontLinks.forEach(function(href) {
    var fontLinks = document.createElement('link');
    fontLinks.href = href;
    fontLinks.rel = 'stylesheet';
    document.head.appendChild(fontLinks);
  });

  var animasyon = document.createElement('link');
  animasyon.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
  animasyon.rel = 'stylesheet';
  document.head.appendChild(animasyon);
})();