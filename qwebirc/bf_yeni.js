/*
vvv 1 11
  */

(function injectGlobalStyles() {
    if (document.querySelector('style[data-bf-style="global"]')) return;
    const bfGlobalStyles = document.createElement('style');
    bfGlobalStyles.dataset.bfStyle = 'global';
    bfGlobalStyles.innerHTML = `
        /* Genel stiller */
        .bfKadi { font-weight: bold; cursor: pointer; display: inline-block; }

        /* Fontlar */
        .bfFnt1 { font-size: 14.5px; font-family: 'Kalam', cursive, sans-serif; line-height: 1em; }
        .bfFnt2 { font-size: 15px; font-family: 'Signika', sans-serif; }
        .bfFnt3 { font-size: 14px; font-family: 'Grandstander', cursive, sans-serif; line-height: 1em; }
        .bfFnt4 { font-size: 15px; font-family: 'Comic Neue', cursive, sans-serif; line-height: 1em; }
        .bfFnt5 { font-size: 14px; font-family: 'Quicksand', sans-serif; line-height: 1em; }
        .bfFnt6 { font-size: 13px; font-family: 'Orbitron', sans-serif; }
        .bfFnt7 { font-size: 12px; font-family: 'Lemonada', cursive, sans-serif; }
        .bfFnt8 { font-size: 15px; font-family: 'Grenze Gotisch', cursive, sans-serif; line-height: 1em; }
        .bfFnt9 { font-size: 12px; font-family: 'Merienda', cursive, sans-serif; line-height: 1em; }
        .bfFnt10 { font-size: 14px; font-family: 'Amita', cursive, sans-serif; line-height: 1em; }
        .bfFnt11 { font-size: 14px; font-family: 'Averia Libre', cursive, sans-serif; line-height: 1em; }
        .bfFnt12 { font-size: 13.5px; font-family: 'Turret Road', sans-serif; line-height: 1em; }
        .bfFnt13 { font-size: 15px; font-family: 'Sansita', sans-serif; line-height: 1em; }
        .bfFnt14 { font-size: 13px; font-family: 'Comfortaa', cursive, sans-serif; line-height: 1em; }
        .bfFnt15 { font-size: 15px; font-family: 'Charm', cursive, sans-serif; line-height: 1em; }
        .bfFnt16 { font-size: 14px; font-family: 'Arial', sans-serif; line-height: 1em; }
        .bfFnt17 { font-size: 12px; font-family: 'Arial', sans-serif; line-height: 1em; font-style: italic; letter-spacing: 1.5px; }
        .bfFnt18 { font-size: 13px; font-family: 'Rampart One', cursive; line-height: 1em; font-weight: 600; font-style: italic; letter-spacing: 1px; }
        .bfFnt19 { font-size: 13px; font-family: 'Kaushan Script', cursive; line-height: 1em; font-weight: 600; letter-spacing: 1px; }
        .bfFnt20 { font-size: 15px; font-family: 'Bebas Neue', cursive; line-height: 1em; font-weight: 500; }
        .bfFnt21 { font-size: 16px; font-family: 'Changa One', cursive; line-height: 1em; font-weight: 400; font-style: italic; letter-spacing: 1px; }
        .bfFnt22 { font-size: 14px; font-family: 'Kaushan Script', cursive; line-height: 1em; font-weight: 400; letter-spacing: 1px; }
        .bfFnt23 { font-size: 14px; font-family: 'Charmonman', cursive; line-height: 1em; font-weight: 900; font-style: italic; letter-spacing: 2px; }
        .bfFnt24 { font-size: 15.5px; font-family: 'Dancing Script', cursive; line-height: 1em; font-weight: 600; font-style: italic; letter-spacing: 2px; }
        .bfFnt25 { font-size: 13px; font-family: 'Aclonica', sans-serif; line-height: 1em; font-weight: 400; font-style: italic; letter-spacing: 1px; }
        .bfFnt26 { font-size: 13px; font-family: 'Black Ops One', cursive; line-height: 1em; font-weight: 400; font-style: italic; letter-spacing: 1px; }
        .bfFnt27 { font-size: 15px; font-family: 'Oleo Script', cursive; line-height: 1em; font-weight: 900; font-style: italic; letter-spacing: 0px; }
        .bfFnt28 { font-size: 12px; font-family: 'Kablammo', cursive; line-height: 1em; font-weight: 600; letter-spacing: 1px; }
        .bfFnt29 { font-size: 13px; font-family: 'Condiment', cursive; line-height: 1em; font-weight: 600; letter-spacing: 4px; }
        .bfFnt30 { font-size: 15px; font-family: 'Bungee Inline', cursive, sans-serif; line-height: 1em; }
        .bfFnt31 { font-size: 15px; font-family: 'Monoton', cursive, sans-serif; line-height: 1em; }
        .bfFnt32 { font-size: 14px; font-family: 'Press Start 2P', cursive, sans-serif; line-height: 1em; }
        .bfFnt33 { font-size: 15px; font-family: 'Shrikhand', cursive, sans-serif; line-height: 1em; }
        .bfFnt34 { font-size: 13px; font-family: 'Titan One', cursive, sans-serif; line-height: 1em; }
        .bfFnt35 { font-size: 12px; font-family: 'Vast Shadow', cursive, sans-serif; line-height: 1em; }
        .bfFnt36 { font-size: 20px; font-family: 'Zeyada', cursive, sans-serif; line-height: 1em; }
        .bfFnt37 { font-size: 15px; font-family: 'Emilys Candy', cursive, sans-serif; line-height: 1em; }
        .bfFnt38 { font-size: 13px; font-family: 'Frijole', cursive, sans-serif; line-height: 1em; }
        .bfFnt39 { font-size: 15px; font-family: 'Nosifer', cursive, sans-serif; line-height: 1em; }
        .bfFnt40 { font-size: 13px; font-family: 'Alfa Slab One', cursive, sans-serif; line-height: 1em; }
        .bfFnt41 { font-size: 15px; font-family: 'Archivo Black', sans-serif; line-height: 1em; }
        .bfFnt42 { font-size: 16px; font-family: 'Bangers', cursive, sans-serif; line-height: 1em; }
        .bfFnt43 { font-size: 18px; font-family: 'Bebas Neue', sans-serif; line-height: 1em; }
        .bfFnt44 { font-size: 19px; font-family: 'Caveat', cursive, sans-serif; line-height: 1em; }
        .bfFnt45 { font-size: 11px; font-family: 'Cinzel Decorative', cursive, sans-serif; line-height: 1em; }
        .bfFnt46 { font-size: 18px; font-family: 'Covered By Your Grace', cursive, sans-serif; line-height: 1em; }
        .bfFnt47 { font-size: 15px; font-family: 'Creepster', cursive, sans-serif; line-height: 1em; }
        .bfFnt48 { font-size: 13.5px; font-family: 'Eater', cursive, sans-serif; line-height: 1em; }
        .bfFnt49 { font-size: 12px; font-family: 'Finger Paint', cursive, sans-serif; line-height: 1em; }
        .bfFnt50 { font-size: 13px; font-family: 'Fontdiner Swanky', cursive, sans-serif; line-height: 1em; }
        .bfFnt51 { font-size: 15px; font-family: 'Fruktur', cursive, sans-serif; line-height: 1em; }
        .bfFnt52 { font-size: 12px; font-family: 'Geostar Fill', cursive, sans-serif; line-height: 1em; }
        .bfFnt53 { font-size: 15px; font-family: 'Gloria Hallelujah', cursive, sans-serif; line-height: 1em; }
        .bfFnt54 { font-size: 15px; font-family: 'Great Vibes', cursive, sans-serif; line-height: 1em; }
        .bfFnt55 { font-size: 16px; font-family: 'IM Fell English SC', cursive, sans-serif; line-height: 1em; }
        .bfFnt56 { font-size: 12px; font-family: 'Inknut Antiqua', cursive, sans-serif; line-height: 1em; }
        .bfFnt57 { font-size: 19px; font-family: 'Jolly Lodger', cursive, sans-serif; line-height: 1em; }
        .bfFnt58 { font-size: 16px; font-family: 'Lakki Reddy', cursive, sans-serif; line-height: 1em; }
        .bfFnt59 { font-size: 13px; font-family: 'Luckiest Guy', cursive, sans-serif; line-height: 1em; }
        .bfFnt60 { font-size: 14px; font-family: 'MedievalSharp', cursive, sans-serif; line-height: 1em; }
        .bfFnt61 { font-size: 12px; font-family: 'Metamorphous', cursive, sans-serif; line-height: 1em; }
        .bfFnt62 { font-size: 14px; font-family: 'Mystery Quest', cursive, sans-serif; line-height: 1em; }
        .bfFnt63 { font-size: 15px; font-family: 'New Rocker', cursive, sans-serif; line-height: 1em; }
        .bfFnt64 { font-size: 16px; font-family: 'Pirata One', cursive, sans-serif; line-height: 1em; }
        .bfFnt65 { font-size: 13px; font-family: 'Plaster', cursive, sans-serif; line-height: 1em; }
        .bfFnt66 { font-size: 15px; font-family: 'Raleway Dots', cursive, sans-serif; line-height: 1em; }
        .bfFnt67 { font-size: 14.5px; font-family: 'Rubik Moonrocks', cursive, sans-serif; line-height: 1em; }
        .bfFnt68 { font-size: 13px; font-family: 'Special Elite', cursive, sans-serif; line-height: 1em; }
        .bfFnt70 { font-size: 15.5px; font-family: 'Lobster', cursive, sans-serif; line-height: 1em; }
        .bfFnt71 { font-size: 14px; font-family: 'Pacifico', cursive, sans-serif; line-height: 1.5em; }
        .bfFnt72 { font-size: 18px; font-family: 'Akaya Telivigala', cursive, sans-serif; line-height: 1em; }
        .bfFnt73 { font-size: 16px; font-family: 'Satisfy', cursive, sans-serif; line-height: 1.4em; }
        .bfFnt74 { font-size: 19px; font-family: 'Marck Script', cursive, sans-serif; line-height: 1em; }
        .bfFnt75 { font-size: 15px; font-family: 'Tangerine', cursive, sans-serif; line-height: 1em; }
        .bfFnt76 { font-size: 18px; font-family: 'Allura', cursive, sans-serif; line-height: 1em; }
        .bfFnt77 { font-size: 15px; font-family: 'Cedarville Cursive', cursive, sans-serif; line-height: 1em; }
        .bfFnt78 { font-size: 15px; font-family: 'Bad Script', cursive, sans-serif; line-height: 1em; }
        .bfFnt79 { font-size: 15px; font-family: 'Herr Von Muellerhoff', cursive, sans-serif; line-height: 1em; }
        .bfFnt80 { font-size: 15px; font-family: 'Reenie Beanie', cursive, sans-serif; line-height: 1em; }
        .bfFnt81 { font-size: 15px; font-family: 'Sacramento', cursive, sans-serif; line-height: 1em; }
        .bfFnt82 { font-size: 15px; font-family: 'La Belle Aurore', cursive, sans-serif; line-height: 1em; }
        .bfFnt83 { font-size: 14px; font-family: 'Petit Formal Script', cursive, sans-serif; line-height: 1em; }
        .bfFnt84 { font-size: 15px; font-family: 'Dawning of a New Day', cursive, sans-serif; line-height: 1em; }
        .bfFnt85 { font-size: 15px; font-family: 'Parisienne', cursive, sans-serif; line-height: 1em; }
        .bfFnt86 { font-size: 15px; font-family: 'Give You Glory', cursive, sans-serif; line-height: 1em; }
        .bfFnt87 { font-size: 15px; font-family: 'Qwigley', cursive, sans-serif; line-height: 1em; }
        .bfFnt88 { font-size: 15px; font-family: 'Over the Rainbow', cursive, sans-serif; line-height: 1em; }
        .bfFnt89 { font-size: 15px; font-family: 'Lovers Quarrel', cursive, sans-serif; line-height: 1em; }
        .bfFnt90 { font-size: 15px; font-family: 'Bilbo', cursive, sans-serif; line-height: 1em; }
        .bfFnt91 { font-size: 18px; font-family: 'Bilbo Swash Caps', cursive, sans-serif; line-height: 1em; }
        .bfFnt126 { font-size: 16.5px; font-family: 'Changa One', cursive, sans-serif; line-height: 1em; }
        .bfFnt127 { font-size: 15px; font-family: 'Charmonman', cursive, sans-serif; line-height: 1em; }
        .bfFnt128 { font-size: 18px; font-family: 'Dancing Script', cursive, sans-serif; line-height: 1em; }
        .bfFnt129 { font-size: 15px; font-family: 'Aclonica', sans-serif; line-height: 1em; letter-spacing: 1px; }
        .bfFnt130 { font-size: 15px; font-family: 'Sriracha', cursive, sans-serif; line-height: 1em; }
        .bfFnt131 { font-size: 15px; font-family: 'Shadows Into Light', cursive, sans-serif; line-height: 1em; }
        .bfFnt132 { font-size: 15px; font-family: 'Amatic SC', cursive, sans-serif; line-height: 1em; letter-spacing: 1px; }
        .bfFnt133 { font-size: 15px; font-family: 'Indie Flower', cursive, sans-serif; line-height: 1em; }
        .bfFnt140 { font-size: 12px; font-family: 'Titan One', sans-serif; line-height: 1em; font-weight: 400; }
        .bfFnt141 { font-size: 16px; font-family: 'Bebas Neue', sans-serif; line-height: 1em; font-weight: 400; }
        .bfFnt142 { font-size: 13px; font-family: 'Righteous', sans-serif; line-height: 1em; font-weight: 400; }
        .bfFnt143 { font-size: 12px; font-family: 'Alfa Slab One', sans-serif; line-height: 1em; font-weight: 400; }
        .bfFnt144 { font-size: 13px; font-family: 'Anton', sans-serif; line-height: 1em; font-weight: 400; }
        .bfFnt180 { font-size: 12px; font-family: 'Orbitron', sans-serif; font-weight: 600; }
        .bfFnt181 { font-size: 15px; font-family: 'Press Start 2P', cursive; font-weight: 400; }
        .bfFnt182 { font-size: 15px; font-family: 'Bangers', cursive; }
        .bfFnt183 { font-size: 16.5px; font-family: 'VT323', monospace; }
        .bfFnt184 { font-size: 14px; font-family: 'Russo One', sans-serif; }
        .bfFnt185 { font-size: 12px; font-family: 'Audiowide', cursive; }
        .bfFnt186 { font-size: 12px; font-family: 'Shrikhand', cursive; }
        .bfFnt187 { font-size: 16px; font-family: 'Lobster', cursive; }
        .bfFnt188 { font-size: 13px; font-family: 'Pacifico', cursive; }
        .bfFnt189 { font-size: 14px; font-family: 'Special Elite', cursive; }
        .bfFnt190 { font-size: 15px; font-family: 'Monoton', cursive; }
        .bfFnt191 { font-size: 14px; font-family: 'Fredericka the Great', cursive; }
        .bfFnt192 { font-size: 13px; font-family: 'Rye', cursive; }
        .bfFnt193 { font-size: 14px; font-family: 'Luckiest Guy', cursive; }
        .bfFnt194 { font-size: 12px; font-family: 'Wallpoet', cursive; }
        .bfFnt195 { font-size: 14px; font-family: 'Gloria Hallelujah', cursive; }
        .bfFnt196 { font-size: 15px; font-family: 'Chewy', cursive; }
        .bfFnt197 { font-size: 16px; font-family: 'Great Vibes', cursive; }
        .bfFnt198 { font-size: 15px; font-family: 'Nosifer', cursive; }
        .bfFnt199 { font-size: 15px; font-family: 'Raleway Dots', cursive; }

		.bfFnt69 { font-size: 15px; font-family: 'UnifrakturMaguntia', cursive, sans-serif; line-height: 1em; }
		.bfFnt125 { font-size: 15px; font-family: 'Bungee Shade', cursive, sans-serif; line-height: 1em; }


        /* Renkler (bfrenK) */
        .bfrenK1 { color: #ff0000; }
        .bfrenK5 { color: #cccc00; }
        .bfrenK9 { color: #008000; }
        .bfrenK14 { color: #03add8; }
        .bfrenK15 { color: #3366ff; }
        .bfrenK16 { color: #107896; }
        .bfrenK17 { color: #004d99; }
        .bfrenK18 { color: #6633ff; }
        .bfrenK19 { color: #9933ff; }
        .bfrenK20 { color: #cc33ff; }
        .bfrenK21 { color: #ff33ff; }
        .bfrenK22 { color: #ff33cc; }
        .bfrenK23 { color: #ff3399; }
        .bfrenK24 { color: #ff3366; }
        .bfrenK25 { color: #00cc99; }
        .bfrenK26 { color: #ff9900; }
        .bfrenK27 { color: #cc0066; }
        .bfrenK28 { color: #339966; }
        .bfrenK29 { color: #990099; }
        .bfrenK30 { color: #879fab; }
        .bfrenK501 { color: #000000; }
        .bfrenK502 { color: #00BFFF; }
        .bfrenK556 { color: #00108d; text-shadow: 0px 0px 1px #00bbff; }
        .bfrenK557 { color: #0b0a79; text-shadow: 0px 1px 1px #0b0a79; }
        .bfrenK558 { color: #101010; text-shadow: 0 0 0.1em #6b6363, 0 0 0.1em #ffffff, 0 0 0.2em #fff3f3, 0 0 0.0em #000000, 0 0 0.1em #ff8b01; }
        .bfrenK559 { color: #067AC1; text-shadow: 0px 0px 2px #067AC1; }
        .bfrenK560 { color: #ff2020; text-shadow: 0px 1px 1px #ff0000; }
        .bfrenK561 { color: #ff2828; text-shadow: 0px 1px 1px #ff0000; }
        .bfrenK562 { color: #ff00dd; text-shadow: 0 0 0.1em #ff00fbad, 0 0 0.1em #00000000, 0 0 0.2em #ffffff00, 0 0 0.2em #ffffff00, 0 0 0.1em #ffffff00; }
        .bfrenK563 { color: #ff6be4; text-shadow: 2px 1px 4px #000000; }
        .bfrenK564 { color: #0b0a50; text-shadow: 0 0 0.2em #00a5ff, 0 0 0.3em #ffffff, 0 0 0.2em #008ad4, 0 0 1em #ffffff, 0 0 0.6em #ffffff; }
        .bfrenK565 { color: #0e1e72; text-shadow: 0px 0px 0px #b7b7b7; }
        .bfrenK566 { color: #000986; text-shadow: 0 0 0.2em #00c9ff, 0 0 0.2em #007ac2ad, 0 0 0.4em #0d58f7c4, 0 0 1em #ffffff, 0 0 0.6em #ffffff; }
        .bfrenK567 { color: #000000; text-shadow: 0 0 0.2em #ffbbbb, 0 0 0.2em #f87474, 0 0 0.2em #ffc8c8, 0 0 0.2em #d2a6c626, 0 0 0.1em #000000; }
        .bfrenK568 { color: #ff4500; text-shadow: 1px 1px 2px #000000; }
        .bfrenK569 { color: #00ff00; text-shadow: 0 0 3px #000000, 0 0 5px #00ff00; }
        .bfrenK570 { color: #ff69b4; text-shadow: 1px 1px 3px #4b0082; }
        .bfrenK571 { color: #4682b4; text-shadow: 0 0 2px #ffffff; }
        .bfrenK572 { color: #dc143c; text-shadow: 1px 1px 2px #000000; }
        .bfrenK573 { color: #ff6347; text-shadow: 1px 1px 3px #000000; }
        .bfrenK574 { color: #00b7eb; text-shadow: 0 0 4px #ffffff, 0 0 6px #00b7eb; }
        .bfrenK575 { color: #8a2be2; text-shadow: 1px 1px 2px #000000; }
        .bfrenK576 { color: #228b22; text-shadow: 0 0 3px #ffffff; }
        .bfrenK577 { color: #ff0000; text-shadow: 1px 1px 3px #000000; }
        .bfrenK578 { color: #b8860b; text-shadow: 0 0 2px #ffffff; }
        .bfrenK579 { color: #4b0082; text-shadow: 0 0 4px #ffffff; }
        .bfrenK580 { color: #c71585; text-shadow: 1px 1px 2px #000000; }
        .bfrenK581 { color: #2f4f4f; text-shadow: 0 0 3px #ffffff; }
        .bfrenK582 { color: #ff4500; text-shadow: 1px 1px 3px #000000; }
        .bfrenK583 { color: #8b0000; text-shadow: 0 0 2px #ffffff; }
        .bfrenK584 { color: #483d8b; text-shadow: 1px 1px 2px #000000; }
        .bfrenK585 { color: #006400; text-shadow: 0 0 3px #ffffff; }
        .bfrenK586 { color: #ff00ff; text-shadow: 1px 1px 3px #000000; }
        .bfrenK587 { color: #2e8b57; text-shadow: 0 0 2px #ffffff; }
        .bfrenK588 { color: #e91e63; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); }
        .bfrenK589 { color: #673ab7; text-shadow: 0 0 3px rgba(103, 58, 183, 0.3); }
        .bfrenK590 { color: #ffeb3b; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
        .bfrenK591 { color: #2196f3; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
        .bfrenK592 { color: #f44336; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
        .bfrenK593 { color: #4caf50; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
        .bfrenK594 { color: #ff9800; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
        .bfrenK595 { color: #9c27b0; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
        .bfrenK596 { color: #3f51b5; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
        .bfrenK597 { color: #e91e63; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
        .bfrenK598 { color: #8bc34a; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
        .bfrenK616 { color: #673ab7; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
        .bfrenK617 { color: #03a9f4; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
        .bfrenK618 { color: #ff4081; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
        .bfrenK619 { color: #2196f3; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
        .bfrenK627 { color: #ffeb3b; text-shadow: 0 0 5px rgba(255, 235, 59, 0.5); }
        .bfrenK628 { color: #00e5ff; text-shadow: 0 0 5px rgba(0, 229, 255, 0.5); }
        .bfrenK629 { color: #e040fb; text-shadow: 0 0 5px rgba(224, 64, 251, 0.5); }
        .bfrenK630 { color: #3d5afe; text-shadow: 0 0 5px rgba(61, 90, 254, 0.5); }
        .bfrenK631 { color: #76ff03; text-shadow: 0 0 5px rgba(118, 255, 3, 0.5); }
        .bfrenK632 { color: #ff4081; text-shadow: 0 0 5px rgba(255, 64, 129, 0.5); }
        .bfrenK633 { color: #00e5ff; text-shadow: 0 0 5px rgba(0, 229, 255, 0.5); }
        .bfrenK634 { color: #76ff03; text-shadow: 0 0 5px rgba(118, 255, 3, 0.5); }
        .bfrenK635 { color: #e040fb; text-shadow: 0 0 5px rgba(224, 64, 251, 0.5); }
        .bfrenK636 { color: #3d5afe; text-shadow: 0 0 5px rgba(61, 90, 254, 0.5); }
        .bfrenK637 { color: #ff1744; text-shadow: 0 0 5px rgba(255, 23, 68, 0.5); }
        .bfrenK638 { color: #00e5ff; text-shadow: 0 0 5px rgba(0, 229, 255, 0.5); }
        .bfrenK639 { color: #ff1744; text-shadow: 0 0 5px rgba(255, 23, 68, 0.5); }


		.bfrenK700 { color: #9c27b0; text-shadow: 0 0 5px rgba(156, 39, 176, 0.5); } /* Derin Mor */
        .bfrenK701 { color: #e91e63; text-shadow: 0 0 5px rgba(233, 30, 99, 0.5); } /* Canlı Pembe */

		.bfrenKKahve { color: rgb(127, 67, 67); }
		
        .bfrenK702 { color: #d81b60; text-shadow: 0 0 3px rgba(216, 27, 96, 0.3); } /* Koyu Pembe */
        .bfrenK703 { color: #7b1fa2; text-shadow: 0 0 4px rgba(123, 31, 162, 0.4); } /* Mor-Magenta */
        .bfrenK704 { color: #ff4081; text-shadow: 0 0 6px rgba(255, 64, 129, 0.6); } /* Parlak Pembe */

        /* Gradyanlar (bfGad) */

		.bfGad532 { background: linear-gradient(to right, #f12711, #f5af19); color: transparent; -webkit-background-clip: text; background-clip: text; }
		.bfGad544 { background: linear-gradient(to right, #00b7eb, #00bcd4); color: transparent; -webkit-background-clip: text; background-clip: text; }
		.bfGad545 { background: linear-gradient(to right, #ff6f00, #ffca28); color: transparent; -webkit-background-clip: text; background-clip: text; }
		.bfGad546 { background: linear-gradient(to right, #2196f3, #3f51b5); color: transparent; -webkit-background-clip: text; background-clip: text; }
		.bfGad547 { background: linear-gradient(to right, #76ff03, #b2ff59); color: transparent; -webkit-background-clip: text; background-clip: text; }
		.bfGad548 { background: linear-gradient(to right, #e91e63, #f06292); color: transparent; -webkit-background-clip: text; background-clip: text; }
		.bfGad549 { background: linear-gradient(to right, #0288d1, #26a69a); color: transparent; -webkit-background-clip: text; background-clip: text; }
		.bfGad550 { background: linear-gradient(to right, #d81b60, #f06292); color: transparent; -webkit-background-clip: text; background-clip: text; }
		.bfGad551 { background: linear-gradient(to right, #ff5722, #ff9800); color: transparent; -webkit-background-clip: text; background-clip: text; }
		.bfGad552 { background: linear-gradient(to right, #7b1fa2, #ab47bc); color: transparent; -webkit-background-clip: text; background-clip: text; }
		.bfGad553 { background: linear-gradient(to right, #0288d1, #039be5); color: transparent; -webkit-background-clip: text; background-clip: text; }
		.bfGad554 { background: linear-gradient(to right, #ff9800, #ffc107); color: transparent; -webkit-background-clip: text; background-clip: text; }
		.bfGad555 { background: linear-gradient(to right, #673ab7, #9575cd); color: transparent; -webkit-background-clip: text; background-clip: text; }
		.bfGad560 { background: linear-gradient(to right, #00b8d4, #00e5ff); color: transparent; -webkit-background-clip: text; background-clip: text; }
		.bfGad600 { background: linear-gradient(to right, #9c27b0, #e91e63); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad601 { background: linear-gradient(to right, #d81b60, #8e24aa); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad602 { background: linear-gradient(to right, #ff4081, #7b1fa2); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad603 { background: linear-gradient(to right, #e91e63, #ab47bc); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad604 { background: linear-gradient(to right, #8e24aa, #f06292); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad13 { background: linear-gradient(to right, #373B44, #4286f4); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad18 { background: linear-gradient(to right, #544a7d, #ffd452); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad19 { background: linear-gradient(to right, #009FFF, #ec2F4B); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad24 { background: linear-gradient(to right, #FF0099, #0575E6); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad27 { background: linear-gradient(to right, #1a2a6c, #b21f1f, #fdbb2d); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad34 { background: linear-gradient(to bottom, #6db3f2 0%, #54a3ee 50%, #3690f0 51%, #1e69de 100%); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad35 { background: linear-gradient(to top, #a241b7, #7f68d7, #5186e9, #1b9 wonderef, #12b2eb); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad36 { background: linear-gradient(to right, #ff6b6b, #4ecdc4); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad37 { background: linear-gradient(to right, #ff9a8b, #ff6a88); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad38 { background: linear-gradient(to right, #a8c0ff, #3f2b96); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad39 { background: linear-gradient(to right, #ff7e5f, #feb47b); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad40 { background: linear-gradient(to right, #11998e, #38ef7d); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad512 { background: linear-gradient(90deg, rgba(255, 20, 147, 1) 3%, rgba(92, 0, 255, 1) 15%, rgba(0, 142, 255, 1) 30%, rgba(0, 255, 10, 1) 47%, rgba(0, 0, 0, 1) 63%, rgba(255, 61, 0, 1) 81%, rgba(224, 53, 255, 1) 95%); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad513 { background: linear-gradient(to right, #00ff87, #ff00d4); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad514 { background: linear-gradient(to right, #ffd700, #ff4500); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad515 { background: linear-gradient(to right, #4b0082, #00ced1); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad516 { background: linear-gradient(to right, #ff1493, #00b7eb); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad517 { background: linear-gradient(to right, #8b0000, #ffdead); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad518 { background: linear-gradient(to right, #ff416c, #ff4b2b); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad519 { background: linear-gradient(to right, #43cea2, #185a9d); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad520 { background: linear-gradient(to right, #f7971e, #ffd200); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad521 { background: linear-gradient(to right, #870000, #190a05); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad522 { background: linear-gradient(to right, #36d1dc, #5b86e5); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad523 { background: linear-gradient(to right, #e44d26, #f16529); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad524 { background: linear-gradient(to right, #ffafbd, #ffc3a0); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad525 { background: linear-gradient(to right, #4568dc, #b06ab3); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad526 { background: linear-gradient(to right, #ed213a, #93291e); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad527 { background: linear-gradient(to right, #11998e, #38ef7d); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad528 { background: linear-gradient(to right, #ff5e62, #f7b733); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad529 { background: linear-gradient(to right, #3c1053, #ad5389); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad530 { background: linear-gradient(to right, #ff9966, #ff5e62); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad531 { background: linear-gradient(to right, #00f260, #0575e6); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad533 { background: linear-gradient(to right, #0083B0, #00B4DB); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad534 { background: linear-gradient(to right, #ff6b6b, #4ecdc4); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad535 { background: linear-gradient(to right, #ff9966, #ff5e62); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad536 { background: linear-gradient(to right, #d4fc79, #96e6a1); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad537 { background: linear-gradient(to right, #00dbde, #fc00ff); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad538 { background: linear-gradient(to right, #fa709a, #fee140); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad539 { background: linear-gradient(to right, #ff9a9e, #fad0c4); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad540 { background: linear-gradient(to right, #a1c4fd, #c2e9fb); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad541 { background: linear-gradient(to right, #ffafbd, #ffc3a0); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad542 { background: linear-gradient(to right, #f6d365, #fda085); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad543 { background: linear-gradient(to right, #ff9a8b, #ff6a88); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad561 { background: linear-gradient(to right, #f093fb, #f5576c); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad562 { background: linear-gradient(to right, #00c6ff, #0072ff); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad563 { background: linear-gradient(to right, #7b1fa2, #e91e63); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad564 { background: linear-gradient(to right, #ffca28, #ef5350); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad570 { background: linear-gradient(to right, #ff1744, #d81b60); color: transparent; -webkit-background-clip: text; background-clip: text; text-shadow: 0 0 3px rgba(255, 23, 68, 0.3); }
        .bfGad571 { background: linear-gradient(to right, #00c853, #64dd17); color: transparent; -webkit-background-clip: text; background-clip: text; text-shadow: 0 0 3px rgba(0, 200, 83, 0.3); }
        .bfGad572 { background: linear-gradient(to right, #ff9100, #ff5722); color: transparent; -webkit-background-clip: text; background-clip: text; text-shadow: 0 0 3px rgba(255, 145, 0, 0.3); }
        .bfGad573 { background: linear-gradient(to right, #d81b60, #8e24aa); color: transparent; -webkit-background-clip: text; background-clip: text; text-shadow: 0 0 3px rgba(216, 27, 96, 0.3); }
        .bfGad574 { background: linear-gradient(to right, #00b0ff, #304ffe); color: transparent; -webkit-background-clip: text; background-clip: text; text-shadow: 0 0 3px rgba(0, 176, 255, 0.3); }
        .bfGad575 { background: linear-gradient(to right, #ffeb3b, #ffd700); color: transparent; -webkit-background-clip: text; background-clip: text; text-shadow: 0 0 5px rgba(255, 235, 59, 0.5); }
        .bfGad576 { background: linear-gradient(to right, #ff1744, #d81b60); color: transparent; -webkit-background-clip: text; background-clip: text; text-shadow: 0 0 3px rgba(255, 23, 68, 0.3); }
        .bfGad577 { background: linear-gradient(to right, #00b0ff, #304ffe); color: transparent; -webkit-background-clip: text; background-clip: text; text-shadow: 0 0 3px rgba(0, 176, 255, 0.3); }
        .bfGad578 { background: linear-gradient(to right, #ff9100, #ff5722); color: transparent; -webkit-background-clip: text; background-clip: text; text-shadow: 0 0 3px rgba(255, 145, 0, 0.3); }
        .bfGad579 { background: linear-gradient(to right, #d81b60, #8e24aa); color: transparent; -webkit-background-clip: text; background-clip: text; text-shadow: 0 0 3px rgba(216, 27, 96, 0.3); }
        .bfGad580 { background: linear-gradient(to right, #76ff03, #00c853); color: transparent; -webkit-background-clip: text; background-clip: text; text-shadow: 0 0 3px rgba(118, 255, 3, 0.3); }
        .bfGad180 { background: linear-gradient(to right, #00e5ff, #18ffff); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad181 { background: linear-gradient(to right, #ff9100, #ff3d00); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad182 { background: linear-gradient(to right, #00c853, #b2ff59); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad183 { background: linear-gradient(to right, #ff1744, #ff8a80); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad184 { background: linear-gradient(to right, #651fff, #7c4dff); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad185 { background: linear-gradient(to right, #00bfa5, #1de9b6); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad186 { background: linear-gradient(to right, #ff4081, #f50057); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad187 { background: linear-gradient(to right, #ff6f00, #ffd600); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad188 { background: linear-gradient(to right, #8e24aa, #e040fb); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad189 { background: linear-gradient(to right, #1de9b6, #00b8d4); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad190 { background: linear-gradient(to right, #2196f3, #00bcd4); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad191 { background: linear-gradient(to right, #ff5252, #ff4081); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad192 { background: linear-gradient(to right, #4caf50, #81c784); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad193 { background: linear-gradient(to right, #f44336, #e57373); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad194 { background: linear-gradient(to right, #00e676, #1de9b6); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad195 { background: linear-gradient(to right, #ff9800, #ffc107); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad196 { background: linear-gradient(to right, #2196f3, #03a9f4); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad197 { background: linear-gradient(to right, #7c4dff, #651fff); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad198 { background: linear-gradient(to right, #d500f9, #aa00ff); color: transparent; -webkit-background-clip: text; background-clip: text; }
        .bfGad199 { background: linear-gradient(to right, #ff3d00, #dd2c00); color: transparent; -webkit-background-clip: text; background-clip: text; }

        /* Neon efektleri */
        .bfNeon25 { color: #fff; text-shadow: 1px 1px 1px #503930, 1px 1px 3px #604439, 1px 1px 5px #604439; }

        /* Animasyon efektleri */

.bfEfekt-155 { animation: tada 1s ease-in-out infinite; animation-delay: 0s; }
@media (prefers-reduced-motion: reduce) { .bfEfekt-155 { animation-duration: 1s !important; animation-iteration-count: infinite !important; } }



        .bfEfekt-92 { transition: all 0.3s ease; }
        .bfEfekt-92:hover { letter-spacing: 1px; }

        .bfEfekt-93 { transition: all 0.3s ease; }
        .bfEfekt-93:hover { transform: translateY(-3px) rotate(1deg); text-shadow: 0 3px 5px rgba(0, 188, 212, 0.4); }

        .bfEfekt-94 { transition: all 0.3s ease; }
        .bfEfekt-94:hover { transform: scale(1.05); text-shadow: 0 0 5px rgba(255, 107, 107, 0.5); }

        .bfEfekt-95 { transition: all 0.3s ease; }
        .bfEfekt-95:hover { transform: scale(1.1); color: #fff176; }

        .bfEfekt-96 { transition: all 0.3s ease; }
        .bfEfekt-96:hover { transform: translateY(-2px); text-shadow: 0 0 5px rgba(255, 153, 102, 0.5); }

        .bfEfekt-97 { transition: all 0.3s ease; }
        .bfEfekt-97:hover { transform: scale(1.05); color: #42a5f5; }

        .bfEfekt-98 { transition: all 0.3s ease; }
        .bfEfekt-98:hover { transform: scale(1.05); text-shadow: 0 0 5px rgba(212, 252, 121, 0.5); }

        .bfEfekt-99 { transition: all 0.3s ease; }
        .bfEfekt-99:hover { transform: translateY(-2px); color: #ef5350; }

        .bfEfekt-100 { transition: all 0.3s ease; }
        .bfEfekt-100:hover { transform: scale(1.05); text-shadow: 0 0 5px rgba(0, 219, 222, 0.5); }

        .bfEfekt-101 { transition: all 0.3s ease; }
        .bfEfekt-101:hover { transform: scale(1.1); color: #66bb6a; }

        .bfEfekt-102 { transition: all 0.3s ease; }
        .bfEfekt-102:hover { transform: translateY(-2px); text-shadow: 0 0 5px rgba(250, 112, 154, 0.5); }

        .bfEfekt-103 { transition: all 0.3s ease; }
        .bfEfekt-103:hover { transform: scale(1.05); color: #ffb300; }

        .bfEfekt-104 { transition: all 0.3s ease; }
        .bfEfekt-104:hover { transform: scale(1.05); text-shadow: 0 0 5px rgba(255, 154, 158, 0.5); }

        .bfEfekt-105 { transition: all 0.3s ease; }
        .bfEfekt-105:hover { transform: translateY(-2px); color: #ab47bc; }

        .bfEfekt-106 { transition: all 0.3s ease; }
        .bfEfekt-106:hover { transform: scale(1.05); text-shadow: 0 0 5px rgba(161, 196, 253, 0.5); }

        .bfEfekt-107 { transition: all 0.3s ease; }
        .bfEfekt-107:hover { transform: scale(1.1); color: #5c6bc0; }

        .bfEfekt-108 { transition: all 0.3s ease; }
        .bfEfekt-108:hover { transform: translateY(-2px); text-shadow: 0 0 5px rgba(255, 175, 189, 0.5); }

        .bfEfekt-109 { transition: all 0.3s ease; }
        .bfEfekt-109:hover { transform: scale(1.05); color: #ec407a; }

        .bfEfekt-110 { transition: all 0.3s ease; }
        .bfEfekt-110:hover { transform: scale(1.05); text-shadow: 0 0 5px rgba(246, 211, 101, 0.5); }

        .bfEfekt-111 { transition: all 0.3s ease; }
        .bfEfekt-111:hover { transform: translateY(-2px); color: #9ccc65; }

        .bfEfekt-146 { transition: all 0.3s ease; position: relative; }
        .bfEfekt-146:hover { transform: scale(1.05) skewX(-5deg); text-shadow: 0 0 5px rgba(84, 51, 255, 0.5), 0 0 10px rgba(32, 189, 255, 0.3), 0 0 15px rgba(165, 254, 203, 0.2); letter-spacing: 1px; }

        .bfEfekt-147 { transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); position: relative; }
        .bfEfekt-147:after { content: ''; position: absolute; width: 100%; height: 3px; bottom: -5px; left: 0; background-color: #673ab7; transform: scaleX(0); transform-origin: center; transition: transform 0.3s ease; }
        .bfEfekt-147:hover:after { transform: scaleX(1); }
        .bfEfekt-147:hover { transform: translateY(-2px); color: #7e57c2; }

        .bfEfekt-148 { transition: all 0.3s ease; position: relative; }
        .bfEfekt-148:before { content: ''; position: absolute; width: 100%; height: 2px; bottom: -2px; left: 0; background: linear-gradient(to right, #f093fb, #f5576c); transform: scaleX(0); transform-origin: left; transition: transform 0.3s ease; }
        .bfEfekt-148:hover:before { transform: scaleX(1); }
        .bfEfekt-148:hover { text-shadow: 0 0 5px rgba(240, 147, 251, 0.5), 0 0 10px rgba(245, 87, 108, 0.3); transform: translateY(-2px); }

        .bfEfekt-149 { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .bfEfekt-149:hover { transform: scale(1.1) rotate(2deg); color: #29b6f6; text-shadow: 0 5px 15px rgba(3, 169, 244, 0.4); }

        .bfEfekt-150 { transition: all 0.4s ease; position: relative; }
        .bfEfekt-150:after { content: ''; position: absolute; width: 100%; height: 2px; bottom: -2px; left: 0; background: linear-gradient(to right, #00c6ff, #0072ff); transform: scaleX(0); transform-origin: right; transition: transform 0.4s ease; }
        .bfEfekt-150:hover:after { transform: scaleX(1); transform-origin: left; }
        .bfEfekt-150:hover { text-shadow: 0 0 5px rgba(0, 198, 255, 0.5), 0 0 10px rgba(0, 114, 255, 0.3); letter-spacing: 2px; }

        .bfEfekt-151 { animation: pulse 1.5s ease-in-out infinite; animation-delay: 0s; }
        @media (prefers-reduced-motion: reduce) { .bfEfekt-151 { animation-duration: 1.5s !important; animation-iteration-count: infinite !important; } }


        .bfEfekt-153 { animation: fadeInDown 1.2s ease-out infinite; animation-delay: 0s; }
        @media (prefers-reduced-motion: reduce) { .bfEfekt-153 { animation-duration: 1.2s !important; animation-iteration-count: infinite !important; } }

        .bfEfekt-154 { animation: swing 1.5s ease-in-out infinite; animation-delay: 0s; }
        @media (prefers-reduced-motion: reduce) { .bfEfekt-154 { animation-duration: 1.5s !important; animation-iteration-count: infinite !important; } }

        .bfEfekt-156 { animation: bounceIn 0.8s ease; animation-delay: 0.1s; will-change: transform; }
        .bfEfekt-157 { animation: pulse 0.9s ease-out; animation-delay: 0.2s; will-change: transform; }
        .bfEfekt-158 { animation: flipInX 0.9s ease-in; animation-delay: 0.3s; will-change: transform; }
        .bfEfekt-159 { animation: lightSpeedIn 0.8s ease; animation-delay: 0.4s; will-change: transform; }
        .bfEfekt-160 { animation: rollIn 1s ease-in; animation-delay: 0.1s; will-change: transform; }
        .bfEfekt-161 { animation: bounceIn 0.8s ease; animation-delay: 0.2s; will-change: transform; }
        .bfEfekt-162 { animation: pulse 0.9s ease-out; animation-delay: 0.3s; will-change: transform; }
        .bfEfekt-163 { animation: flipInX 0.9s ease-in; animation-delay: 0.4s; will-change: transform; }
        .bfEfekt-164 { animation: lightSpeedIn 0.8s ease; animation-delay: 0.1s; will-change: transform; }
        .bfEfekt-165 { animation: rollIn 1s ease-in; animation-delay: 0.2s; will-change: transform; }
        .bfEfekt-166 { animation: pulse 1s ease infinite; animation-delay: 0.1s; will-change: transform; }


        .bfEfekt-168 { animation: neonFlash 1.3s ease infinite; animation-delay: 0.3s; will-change: opacity; }
        @keyframes neonFlash {
            0%, 100% { opacity: 1; }
            20%, 60% { opacity: 0.4; }
            40%, 80% { opacity: 1; }
        }

        .bfEfekt-170 { animation: thunderGlow 1.4s ease infinite; animation-delay: 0.1s; will-change: opacity, text-shadow; }
        @keyframes thunderGlow {
            0% { opacity: 0.6; text-shadow: 0 0 5px rgba(118, 255, 3, 0.5); }
            50% { opacity: 1; text-shadow: 0 0 10px rgba(118, 255, 3, 0.8); }
            100% { opacity: 0.6; text-shadow: 0 0 5px rgba(118, 255, 3, 0.5); }
        }



        .bfEfekt-172 { animation: voltSurge 1.2s ease infinite; animation-delay: 0.3s; will-change: transform; }
        @keyframes voltSurge {
            0% { transform: skewX(0deg); }
            20% { transform: skewX(-5deg); }
            40% { transform: skewX(5deg); }
            60% { transform: skewX(-3deg); }
            80% { transform: skewX(3deg); }
            100% { transform: skewX(0deg); }
        }

        .bfEfekt-173 { }
        @keyframes flashBurst {
            0% { opacity: 0; }
            20% { opacity: 1; }
            40% { opacity: 0.4; }
            60% { opacity: 1; }
            100% { opacity: 1; }
        }


        .bfEfekt180 { animation: flicker180 1.2s linear infinite; }
        @keyframes flicker180 {
            0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
            20%, 24%, 55% { opacity: 0.4; }
        }

        .bfEfekt181 { animation: bounce181 0.8s ease-in-out infinite; }
        @keyframes bounce181 {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
        }

        .bfEfekt183 { animation: scanlines183 2s steps(5) infinite; }
        @keyframes scanlines183 {
            0% { text-shadow: 0 0 1px #ff1744; }
            50% { text-shadow: 0 0 2px #ff8a80; }
            100% { text-shadow: 0 0 1px #ff1744; }
        }

        .bfEfekt184 { animation: glow184 1s ease-in-out infinite alternate; }
        @keyframes glow184 {
            0% { text-shadow: 0 0 3px #7c4dff; }
            100% { text-shadow: 0 0 10px #7c4dff; }
        }

        .bfEfekt187 { animation: wobble187 1.2s ease-in-out infinite; }
        @keyframes wobble187 {
            0%, 100% { transform: rotate(0); }
            25% { transform: rotate(3deg); }
            75% { transform: rotate(-3deg); }
        }

        .bfEfekt188 { animation: blur188 2s infinite; }
        @keyframes blur188 {
            0%, 100% { filter: blur(0px); }
            50% { filter: blur(1px); }
        }


        .bfEfekt190 { animation: scan190 1.5s linear infinite; }
        @keyframes scan190 {
            0% { transform: scaleX(1); }
            50% { transform: scaleX(1.05); }
            100% { transform: scaleX(1); }
        }

.bfEfekt191 { animation: skew191 1.2s ease-in-out infinite; }
        @keyframes skew191 {
            0%, 100% { transform: skewX(0deg); }
            50% { transform: skewX(5deg); }
        }

        .bfEfekt192 { animation: glitch192 0.3s infinite; }
        @keyframes glitch192 {
            0% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
            100% { transform: translate(0); }
        }


        .bfEfekt194 { animation: pulse194 1s infinite; }
        @keyframes pulse194 {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        .bfEfekt195 { animation: float195 2s ease-in-out infinite; }
        @keyframes float195 {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }

        .bfEfekt197 { animation: flicker197 0.5s infinite; }
        @keyframes flicker197 {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }


    /* bfEfekt-210: Yumuşak Parıltı (Soft Glow) */
    .bfEfekt-210 {
        animation: softGlow 2s ease-in-out infinite;
    }
    @keyframes softGlow {
        0%, 100% { text-shadow: 0 0 3px rgba(255, 255, 255, 0.5); }
        50% { text-shadow: 0 0 6px rgba(255, 255, 255, 0.8); }
    }

    /* bfEfekt-212: Renk Dalgası (Color Wave) */
    .bfEfekt-212 {
        animation: colorWave 3s ease-in-out infinite;
    }
    @keyframes colorWave {
        0% { color: #ff3333; }
        50% { color: #3366ff; }
        100% { color: #ff3333; }
    }

    /* bfEfekt-213: Hafif Sıçrama (Soft Bounce) */
    .bfEfekt-213 {
        display: inline-block;
        animation: softBounce 1.5s ease-in-out infinite;
    }
    @keyframes softBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
    }

    /* bfEfekt-214: Harf Dalgası (Letter Wave) */
    .bfEfekt-214 {
        display: inline-block;
    }
    .bfEfekt-214 span {
        display: inline-block;
        animation: letterWave 1.2s ease-in-out infinite;
        animation-delay: calc(0.1s * var(--i));
    }
    @keyframes letterWave {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-2px); }
    }

    /* bfEfekt-216: Hafif Döndürme (Soft Spin) */
    .bfEfekt-216 {
        display: inline-block;
        animation: softSpin 4s linear infinite;
    }
    @keyframes softSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* bfEfekt-217: Yumuşak Solma (Soft Fade) */
    .bfEfekt-217 {

    }
    @keyframes softFade {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }

    `;
    document.head.appendChild(bfGlobalStyles);
})();













window.tasarımlar = {
    1: { classes: ['bfFnt3', 'bfrenK21'] },
    2: { classes: ['bfFnt15', 'bfNeon25'] },
    3: { classes: ['bfFnt7', 'bfGad18'] },
    4: { classes: ['bfFnt15', 'bfrenK24'] },
    5: { classes: ['bfFnt3', 'bfrenK9'] },
    6: { classes: ['bfFnt13', 'bfrenK14'] },
    7: { classes: ['bfFnt13', 'bfrenK20'] },
    8: { classes: ['bfFnt2', 'bfGad34'] },
    9: { classes: ['bfFnt4', 'bfrenK22'] },
    10: { classes: ['bfFnt1', 'bfrenK15'] },
    11: { classes: ['bfFnt15', 'bfGad24'] },
    12: { classes: ['bfFnt7', 'bfrenK1'] },
    13: { classes: ['bfFnt6', 'bfrenK16'] },
    14: { classes: ['bfFnt5', 'bfrenK5'] },
    15: { classes: ['bfFnt9', 'bfrenK17'] },
    16: { classes: ['bfFnt15', 'bfGad13'] },
    17: { classes: ['bfFnt7', 'bfrenK18'] },
    18: { classes: ['bfFnt11', 'bfrenK21'] },
    19: { classes: ['bfFnt1', 'bfrenK19'] },
    20: { classes: ['bfFnt15', 'bfrenK30'] },
    21: { classes: ['bfFnt3', 'user', 'bfrenK1'] },
    //22: { classes: ['bfFnt14', 'bfGad35'] },
    23: { classes: ['bfFnt2', 'bfGad27'] },
    24: { classes: ['bfFnt5', 'bfGad19'] },
    25: { classes: ['bfFnt1', 'bfrenK23'] },
    26: { classes: ['bfFnt10', 'bfGad36'] },
    27: { classes: ['bfFnt12', 'bfrenK25'] },
    28: { classes: ['bfFnt8', 'bfGad37'] },
    29: { classes: ['bfFnt15', 'bfrenK26'] },
    30: { classes: ['bfFnt9', 'bfGad38'] },
    31: { classes: ['bfFnt5', 'bfrenK27'] },
    32: { classes: ['bfFnt14', 'bfGad39'] },
    33: { classes: ['bfFnt2', 'bfrenK28'] },
    34: { classes: ['bfFnt11', 'bfGad40'] },
    35: { classes: ['bfFnt7', 'bfrenK29'] },
    //36: { classes: ['bfFnt16', 'bfrenK501'] },
    37: { classes: ['bfFnt16', 'bfrenK502'] },
    38: { classes: ['bfFnt17', 'bfGad512'] },
    39: { classes: ['bfFnt18', 'bfrenK556'] },
    40: { classes: ['bfFnt19', 'bfrenK557'] },
    41: { classes: ['bfFnt20', 'bfrenK558'] },
    42: { classes: ['bfFnt21', 'bfrenK559'] },
    43: { classes: ['bfFnt22', 'bfrenK560'] },
    44: { classes: ['bfFnt23', 'bfrenK561'] },
    45: { classes: ['bfFnt24', 'bfrenK562'] },
    46: { classes: ['bfFnt25', 'bfrenK563'] },
    47: { classes: ['bfFnt26', 'bfrenK564'] },
    48: { classes: ['bfFnt27', 'bfrenK565'] },
    49: { classes: ['bfFnt28', 'bfrenK566'] },
    50: { classes: ['bfFnt29', 'bfrenK567'] },
    //51: { classes: ['bfFnt30', 'bfrenK568'] },
    //52: { classes: ['bfFnt31', 'bfGad513'] },
    //53: { classes: ['bfFnt32', 'bfrenK569'] },
    54: { classes: ['bfFnt33', 'bfGad514'] },
    55: { classes: ['bfFnt34', 'bfrenK570'] },
    56: { classes: ['bfFnt35', 'bfGad515'] },
    57: { classes: ['bfFnt36', 'bfrenK571'] },
    58: { classes: ['bfFnt37', 'bfGad516'] },
    59: { classes: ['bfFnt38', 'bfrenK572'] },
    //60: { classes: ['bfFnt39', 'bfGad517'] },
    61: { classes: ['bfFnt40', 'bfrenK573'] },
    62: { classes: ['bfFnt41', 'bfGad518'] },
    63: { classes: ['bfFnt42', 'bfrenK574'] },
    64: { classes: ['bfFnt43', 'bfGad519'] },
    65: { classes: ['bfFnt44', 'bfrenK575'] },
    66: { classes: ['bfFnt45', 'bfGad520'] },
    67: { classes: ['bfFnt46', 'bfrenK576'] },
    68: { classes: ['bfFnt47', 'bfGad521'] },
    69: { classes: ['bfFnt48', 'bfrenK577'] },
    70: { classes: ['bfFnt49', 'bfGad522'] },
    71: { classes: ['bfFnt50', 'bfrenK578'] },
    72: { classes: ['bfFnt51', 'bfGad523'] },
    73: { classes: ['bfFnt52', 'bfrenK579'] },
    74: { classes: ['bfFnt53', 'bfGad524'] },
    75: { classes: ['bfFnt54', 'bfrenK580'] },
    76: { classes: ['bfFnt55', 'bfGad525'] },
    77: { classes: ['bfFnt56', 'bfrenK581'] },
    78: { classes: ['bfFnt57', 'bfGad526'] },
    79: { classes: ['bfFnt58', 'bfrenK582'] },
    80: { classes: ['bfFnt59', 'bfGad527'] },
    81: { classes: ['bfFnt60', 'bfrenK583'] },
    82: { classes: ['bfFnt61', 'bfGad528'] },
    83: { classes: ['bfFnt62', 'bfrenK584'] },
    84: { classes: ['bfFnt63', 'bfGad529'] },
    85: { classes: ['bfFnt64', 'bfrenK585'] },
    86: { classes: ['bfFnt65', 'bfGad530'] },
    87: { classes: ['bfFnt66', 'bfrenK586'] },
    88: { classes: ['bfFnt67', 'bfGad531'] },
    89: { classes: ['bfFnt68', 'bfrenK587'] },
    91: { classes: ['bfFnt70', 'bfrenK588', 'bfEfekt-91'] },
    92: { classes: ['bfFnt71', 'bfGad533', 'bfEfekt-92'] },
    93: { classes: ['bfFnt72', 'bfrenK589', 'bfEfekt-93'] },
    94: { classes: ['bfFnt73', 'bfGad534', 'bfEfekt-94'] },
    //95: { classes: ['bfFnt74', 'bfrenK590', 'bfEfekt-95'] },
    //96: { classes: ['bfFnt75', 'bfGad535', 'bfEfekt-96'] },
    //97: { classes: ['bfFnt76', 'bfrenK591', 'bfEfekt-97'] },
    //98: { classes: ['bfFnt77', 'bfGad536', 'bfEfekt-98'] },
    99: { classes: ['bfFnt78', 'bfrenK592', 'bfEfekt-99'] },
    //100: { classes: ['bfFnt79', 'bfGad537', 'bfEfekt-100'] },
    //101: { classes: ['bfFnt80', 'bfrenK593', 'bfEfekt-101'] },
    //102: { classes: ['bfFnt81', 'bfGad538', 'bfEfekt-102'] },
    //103: { classes: ['bfFnt82', 'bfrenK594', 'bfEfekt-103'] },
    104: { classes: ['bfFnt83', 'bfGad539', 'bfEfekt-104'] },
    //105: { classes: ['bfFnt84', 'bfrenK595', 'bfEfekt-105'] },
    //106: { classes: ['bfFnt85', 'bfGad540', 'bfEfekt-106'] },
    107: { classes: ['bfFnt86', 'bfrenK596', 'bfEfekt-107'] },
    //108: { classes: ['bfFnt87', 'bfGad541', 'bfEfekt-108'] },
    109: { classes: ['bfFnt88', 'bfrenK597', 'bfEfekt-109'] },
    //110: { classes: ['bfFnt89', 'bfGad542', 'bfEfekt-110'] },
    //111: { classes: ['bfFnt90', 'bfrenK598', 'bfEfekt-111'] },
    112: { classes: ['bfFnt91', 'bfGad543'] },
    113: { classes: ['bfFnt44', 'bfrenK590', 'bfEfekt-91'] },
    114: { classes: ['bfFnt45', 'bfGad535', 'bfEfekt-92'] },
    115: { classes: ['bfFnt46', 'bfrenK591', 'bfEfekt-93'] },
    116: { classes: ['bfFnt47', 'bfGad536', 'bfEfekt-94'] },
    117: { classes: ['bfFnt48', 'bfrenK592', 'bfEfekt-95'] },
    118: { classes: ['bfFnt49', 'bfGad537', 'bfEfekt-96'] },
    119: { classes: ['bfFnt50', 'bfrenK593', 'bfEfekt-97'] },
    120: { classes: ['bfFnt51', 'bfGad538', 'bfEfekt-98'] },
    121: { classes: ['bfFnt52', 'bfrenK594', 'bfEfekt-99'] },
    122: { classes: ['bfFnt53', 'bfGad539', 'bfEfekt-100'] },
    123: { classes: ['bfFnt54', 'bfrenK595', 'bfEfekt-101'] },
    124: { classes: ['bfFnt55', 'bfGad540', 'bfEfekt-102'] },
    125: { classes: ['bfFnt56', 'bfrenK596', 'bfEfekt-103'] },
    126: { classes: ['bfFnt57', 'bfGad541', 'bfEfekt-104'] },
    127: { classes: ['bfFnt58', 'bfrenK597', 'bfEfekt-105'] },
    128: { classes: ['bfFnt59', 'bfGad542', 'bfEfekt-106'] },
    129: { classes: ['bfFnt60', 'bfrenK598', 'bfEfekt-107'] },
    130: { classes: ['bfFnt61', 'bfGad543', 'bfEfekt-108'] },
    131: { classes: ['bfFnt62', 'bfrenK616', 'bfEfekt-109'] },
    132: { classes: ['bfFnt63', 'bfGad561', 'bfEfekt-110'] },
    133: { classes: ['bfFnt64', 'bfrenK617', 'bfEfekt-111'] },
    134: { classes: ['bfFnt65', 'bfGad562', 'animate__animated', 'animate__pulse'] },
    135: { classes: ['bfFnt66', 'bfrenK618', 'animate__animated', 'animate__bounceIn'] },
    136: { classes: ['bfFnt67', 'bfGad563', 'animate__animated', 'animate__fadeInDown'] },
    137: { classes: ['bfFnt68', 'bfrenK619', 'animate__animated', 'animate__swing'] },
    138: { classes: ['bfFnt70', 'bfGad564', 'animate__animated', 'animate__bounceIn'] },
    //139: { classes: ['bfFnt71', 'bfrenK627', 'animate__animated', 'animate__pulse'] },
    140: { classes: ['bfFnt72', 'bfGad570', 'animate__animated', 'animate__flipInX'] },
    141: { classes: ['bfFnt73', 'bfrenK628', 'animate__animated', 'animate__lightSpeedIn'] },
    142: { classes: ['bfFnt74', 'bfGad571', 'animate__animated', 'animate__rollIn'] },
    //143: { classes: ['bfFnt75', 'bfrenK629', 'animate__animated', 'animate__bounceIn'] },
    //144: { classes: ['bfFnt76', 'bfGad572', 'animate__animated', 'animate__pulse'] },
    //145: { classes: ['bfFnt77', 'bfrenK630', 'animate__animated', 'animate__flipInX'] },
    //146: { classes: ['bfFnt125', 'bfGad560', 'bfEfekt-146'] },
    147: { classes: ['bfFnt126', 'bfrenK616', 'bfEfekt-147'] },
    148: { classes: ['bfFnt127', 'bfGad561', 'bfEfekt-148'] },
    149: { classes: ['bfFnt128', 'bfrenK617', 'bfEfekt-149'] },
    //150: { classes: ['bfFnt129', 'bfGad562', 'bfEfekt-150'] },
    151: { classes: ['bfFnt130', 'bfrenK618', 'animate__animated', 'animate__pulse'] },
    152: { classes: ['bfFnt131', 'bfGad563'] },

    157: { classes: ['bfFnt141', 'bfGad570', 'animate__animated', 'animate__pulse'] },
    158: { classes: ['bfFnt142', 'bfrenK628', 'animate__animated', 'animate__flipInX'] },
    159: { classes: ['bfFnt143', 'bfGad571', 'animate__animated', 'animate__lightSpeedIn'] },
    160: { classes: ['bfFnt144', 'bfrenK629', 'animate__animated', 'animate__rollIn'] },
    161: { classes: ['bfFnt140', 'bfGad572', 'animate__animated', 'animate__bounceIn'] },
    162: { classes: ['bfFnt141', 'bfrenK630', 'animate__animated', 'animate__pulse'] },
    163: { classes: ['bfFnt142', 'bfGad573', 'animate__animated', 'animate__flipInX'] },
    //164: { classes: ['bfFnt143', 'bfrenK631', 'animate__animated', 'animate__lightSpeedIn'] },
    165: { classes: ['bfFnt144', 'bfGad574', 'animate__animated', 'animate__rollIn'] },
    166: { classes: ['bfFnt140', 'bfrenK632', 'animate__animated', 'animate__pulse'] },
    167: { classes: ['bfFnt141', 'bfrenK632', 'bfEfekt-177'] },
    168: { classes: ['bfFnt142', 'bfrenK633'] },
    169: { classes: ['bfFnt143', 'bfGad576', 'bfEfekt-169'] },
    //170: { classes: ['bfFnt144', 'bfrenK634', 'bfEfekt-170'] },
    171: { classes: ['bfFnt140', 'bfGad577', 'bfEfekt-171'] },
    172: { classes: ['bfFnt141', 'bfrenK635'] },
    173: { classes: ['bfFnt142', 'bfGad578'] },
    174: { classes: ['bfFnt143', 'bfrenK636', 'bfEfekt-174'] },
    175: { classes: ['bfFnt144', 'bfGad579', 'bfEfekt-175'] },
    176: { classes: ['bfFnt140', 'bfrenK637'] },
    177: { classes: ['bfFnt141', 'bfrenK638', 'bfEfekt-177'] },
    178: { classes: ['bfFnt142', 'bfGad580', 'bfEfekt-178'] },
    179: { classes: ['bfFnt49', 'bfrenK639', 'bfEfekt-179'] },
    180: { classes: ['bfFnt180', 'bfGad180', 'bfEfekt180'] },
    //181: { classes: ['bfFnt181', 'bfGad181', 'bfEfekt181'] },
    182: { classes: ['bfFnt182', 'bfGad182', 'bfEfekt182'] },
    183: { classes: ['bfFnt183', 'bfGad183', 'bfEfekt183'] },
    184: { classes: ['bfFnt184', 'bfGad184', 'bfEfekt184'] },
    185: { classes: ['bfFnt185', 'bfGad185', 'bfEfekt185'] },
    186: { classes: ['bfFnt186', 'bfGad186', 'bfEfekt186'] },
    187: { classes: ['bfFnt187', 'bfGad187'] },
    188: { classes: ['bfFnt188', 'bfGad188'] },
    189: { classes: ['bfFnt189', 'bfGad189', 'bfEfekt189'] },
    190: { classes: ['bfFnt189', 'bfGad190'] },
    191: { classes: ['bfFnt191', 'bfGad191', 'bfEfekt191'] },
    192: { classes: ['bfFnt192', 'bfGad192'] },
    193: { classes: ['bfFnt193', 'bfGad193', 'bfEfekt193'] },
    194: { classes: ['bfFnt194', 'bfGad194'] },
    //195: { classes: ['bfFnt195', 'bfGad195', 'bfEfekt195'] },
    196: { classes: ['bfFnt196', 'bfGad196', 'bfEfekt196'] },
    197: { classes: ['bfFnt197', 'bfGad197', 'bfEfekt197'] },
    198: { classes: ['bfFnt195', 'bfGad198', 'bfEfekt196'] },
    199: { classes: ['bfFnt199', 'bfGad199', 'bfEfekt199'] },
	200: { classes: ['bfFnt70', 'bfGad600'] }, // Lobster, Mor-Pembe Gradyan, Bounce
    201: { classes: ['bfFnt76', 'bfrenK700'] }, // Allura, Derin Mor, Pulse + Glow
    //202: { classes: ['bfFnt81', 'bfGad601', 'animate__animated', 'animate__tada', 'bfEfekt-201'] }, // Sacramento, Pembe-Mor Gradyan, Tada + Pulse
    203: { classes: ['bfFnt91', 'bfrenK701', 'bfEfekt-202'] }, // Bilbo Swash Caps, Canlı Pembe, ShakeX + Shimmer
    //204: { classes: ['bfFnt132', 'bfGad602', 'animate__animated', 'animate__swing', 'bfEfekt-203'] }, // Amatic SC, Pembe-Mor Gradyan, Swing + Bounce
    205: { classes: ['bfFnt141', 'bfrenK702', 'bfEfekt-204'] }, // Bebas Neue, Koyu Pembe, ZoomIn + Swing
    206: { classes: ['bfFnt3', 'user', 'bfrenKKahve'] }, // Alfa Slab One, Pembe-Mor Gradyan, FlipInX + Flash
    207: { classes: ['bfFnt187', 'bfrenK703'] }, // Lobster, Mor-Magenta, HeartBeat + Neon
    208: { classes: ['bfFnt191', 'bfGad604'] }, // Fredericka the Great, Mor-Pembe Gradyan, Jello + Vibrate
    210: { classes: ['bfFnt70', 'bfrenK618', 'bfEfekt-210'] }, // Lobster, Parlak Pembe, Soft Glow
    211: { classes: ['bfFnt42', 'bfGad570', 'bfEfekt-211'] }, // Bangers, Kırmızı-Pembe Gradyan, Gentle Vibrate
    212: { classes: ['bfFnt131', 'bfEfekt-212'] }, // Shadows Into Light, Color Wave
    //213: { classes: ['bfFnt196', 'bfrenK631', 'bfEfekt-213'] }, // Chewy, Parlak Yeşil, Soft Bounce
    214: { classes: ['bfFnt133', 'bfGad561', 'bfEfekt-214'] }, // Indie Flower, Pembe-Mor Gradyan, Letter Wave
    215: { classes: ['bfFnt141', 'bfrenK702', 'bfEfekt-215'] }, // Bebas Neue, Koyu Pembe, Pulse Glow
    //216: { classes: ['bfFnt187', 'bfGad603', 'bfEfekt-216'] }, // Lobster, Pembe-Mor Gradyan, Soft Spin
    217: { classes: ['bfFnt191', 'bfrenK703'] }, // Fredericka the Great, Mor-Magenta, Soft Fade
    218: { classes: ['bfFnt76', 'bfGad604'] }, // Allura, Mor-Pembe Gradyan, Soft Slide
    219: { classes: ['bfFnt91', 'bfrenK701', 'bfEfekt-219'] }, // Bilbo Swash Caps, Canlı Pembe, Soft Tilt
	220: { classes: ['bfFnt3', 'user', 'bfrenKKahve'] } // Bilbo Swash Caps, Canlı Pembe, Soft Tilt
};