/* Données du programme FARSe 2026 — extraites du programme officiel (PDF).
   Festival des Arts de la Rue de Strasbourg, 28–30 août 2026. Spectacles gratuits. */
window.FARSE = (() => {

  const DAYS = [
    { id: "jeu", date: "2026-08-27", label: "Jeudi 27", short: "Jeu 27", long: "Jeudi 27 août", pre: true },
    { id: "ven", date: "2026-08-28", label: "Vendredi 28", short: "Ven 28", long: "Vendredi 28 août" },
    { id: "sam", date: "2026-08-29", label: "Samedi 29", short: "Sam 29", long: "Samedi 29 août" },
    { id: "dim", date: "2026-08-30", label: "Dimanche 30", short: "Dim 30", long: "Dimanche 30 août" },
  ];

  // Lieux (numérotation du programme officiel). Coordonnées approximatives (~50 m).
  const VENUES = [
    { id: 1,  name: "Place du Château", access: "", lat: 48.5807, lng: 7.7512 },
    { id: 2,  name: "Place d'Armes, parc de la Citadelle", access: "Accès par la rue de Boston", lat: 48.5740, lng: 7.7780 },
    { id: 3,  name: "Place Saint-Pierre-le-Jeune", access: "", lat: 48.5861, lng: 7.7434 },
    { id: 4,  name: "Place Grimmeissen", access: "Quartier Petite France, entre rue du Bain-aux-Plantes et rue des Lentilles", lat: 48.5810, lng: 7.7407 },
    { id: 5,  name: "Jardin du Palais universitaire", access: "Accès par la rue de l'Université", lat: 48.5849, lng: 7.7642 },
    { id: 6,  name: "Cour du lycée Oberlin", access: "Accès par la rue de la Manufacture des tabacs", lat: 48.5793, lng: 7.7618 },
    { id: 7,  name: "Square, rue de Neuchâtel", access: "4-8 rue de Neuchâtel", lat: 48.5756, lng: 7.7588 },
    { id: 8,  name: "Place du Petit Broglie", access: "", lat: 48.5847, lng: 7.7472 },
    { id: 9,  name: "Cour de l'école Schoepflin", access: "Accès quai Schoepflin", lat: 48.5872, lng: 7.7515 },
    { id: 10, name: "Place Hans-Jean Arp", access: "À côté du Musée d'art moderne", lat: 48.5787, lng: 7.7346 },
    { id: 11, name: "Cour de l'école Louvois", access: "18 quai des Alpes", lat: 48.5741, lng: 7.7590 },
    { id: 12, name: "Rue Martin Luther", access: "Le long de l'église Saint-Thomas", lat: 48.5800, lng: 7.7456 },
    { id: 13, name: "Parvis de l'Église Sainte-Madeleine", access: "Place Sainte-Madeleine", lat: 48.5787, lng: 7.7561 },
    { id: 14, name: "Place Kléber", access: "", lat: 48.5834, lng: 7.7455 },
    { id: 15, name: "Cour de l'école Sainte-Madeleine", access: "Place Sainte-Madeleine", lat: 48.5791, lng: 7.7568 },
    { id: 16, name: "Esplanade du Jura", access: "Accès par le 23 rue du Jura ou la rue de Palerme", lat: 48.5756, lng: 7.7716 },
    { id: 17, name: "Place Gutenberg", access: "", lat: 48.5818, lng: 7.7467 },
    { id: 18, name: "Docks Malraux – presqu'île Malraux", access: "Départ du spectacle depuis les Docks", lat: 48.5729, lng: 7.7615 },
    { id: 19, name: "Campus universitaire – parvis de la faculté de droit", access: "Esplanade", lat: 48.5803, lng: 7.7662 },
    { id: 20, name: "Village du FARSe – Manufacture des tabacs", access: "Cour côté rue de la Krutenau · ouvert de 12h à minuit", lat: 48.5784, lng: 7.7603 },
    { id: 21, name: "COSEC d'Ostwald", access: "Rue des Lilas, Ostwald", lat: 48.5455, lng: 7.7110, offMap: true },
  ];

  const TP = "Tout public";

  const SHOWS = [
    {
      id: "mirage", title: "Mirage (un jour de fête)", company: "Cie Dyptik",
      genre: "Danse", group: "danse", duration: 50, audience: TP, venueIds: [1],
      img: "img/shows/mirage.jpg", credit: "© C. Dertez",
      short: "Danse immersive inspirée du camp de réfugiés de Balata : l'élan des danses traditionnelles devient une force collective.",
      description: "Des grillages et des barbelés, des tôles rouillées sur le toit des habitations, des drapeaux suspendus, des pas qui frappent le sol avec force et élégance, tête haute, vêtements colorés, soigneusement ajustés… C'est l'image du camp de réfugiés de Balata en Cisjordanie. Irréelle, absurde et magique, elle inspire cette nouvelle création.\n\nImmersive, la mise en scène questionne les normes, la scène et son public. L'élan des danses traditionnelles, par leur forme concentrique, façonne la scénographie. L'énergie circule entre la périphérie et le centre. Habité par cette force collective, le mouvement devient un projectile qui dénonce les supplices et les injustices.\n\nUne image en suspens inspirée d'un désir tellement violent qu'il transcende la réalité… Mirage."
    },
    {
      id: "prelude", title: "Prélude (out)", company: "Cie Accrorap – Kader Attou",
      genre: "Pièce chorégraphique", group: "danse", duration: 35, audience: "À partir de 7 ans", venueIds: [14],
      img: "img/shows/prelude.jpg", credit: "© Michel Condette / © CM2J",
      short: "9 danseurs et danseuses, du hip-hop à la métaphore du combat : physique, poétique, fraternel.",
      description: "Un mouvement, une lutte, une humanité dansante. Prélude (out) naît d'un souffle, celui du premier cri, du mouvement vital.\n\nKader Attou y revisite son propre parcours : son enfance en banlieue lyonnaise, la découverte de la boxe, la beauté des gestes, les films de Chaplin, la force du hip-hop comme espace d'émancipation. Il y explore le lien intime entre la danse, la musique et la respiration — ce battement commun qui relie les êtres.\n\nPortée par la musique électro-acoustique de Romain Dubois, la pièce s'élève d'un silence vers une montée d'intensité, telle une lutte à mener jusqu'au bout. Les 9 danseurs et danseuses y incarnent une humanité en tension : corps à corps, respirations, élans, résistances.\n\nLa chorégraphie devient métaphore du combat, physique, poétique, fraternel."
    },
    {
      id: "pelat", title: "Pelat", company: "Joan Català",
      genre: "Cirque", group: "cirque", duration: 40, audience: TP, venueIds: [10],
      img: "img/shows/pelat.jpg", credit: "© Àngels Melange",
      short: "Entre danse, cirque, théâtre et performance : une action unique construite avec le public.",
      description: "Pelat est une proposition qui efface les frontières entre la danse, le cirque, le théâtre, la performance, entre le public et le spectacle.\n\nUn retour naturel vers des techniques artisanales et des souvenirs personnels. Une action unique qui évolue comme le résultat de l'interaction avec le spectateur."
    },
    {
      id: "stek", title: "Stek", company: "Intrepidus Squad",
      genre: "Clown", group: "cirque", duration: 50, audience: "À partir de 6 ans", venueIds: [3],
      img: null, credit: "© Michel Condette / © CM2J",
      short: "4 personnages marginaux, un grand bac poubelle, danse, cascades et clown : une tempête en été.",
      description: "Stek transpire la rue, avec son bruit et sa fumée. Par le biais de la danse, du théâtre, des cascades, de la musique, de l'acrobatie, de la jonglerie, de la manipulation d'un grand bac poubelle et du clown, Stek amène avec précision un univers qui pourrait ressembler à une tempête en été : rafraîchissant et sauvage.\n\nStek parle du lien entre 4 êtres qui donnent une valeur égale à tout ce qui grince. De la poésie inépuisable qui émerge de la marginalité, de l'incertitude, de la famille et de la précarité. Stek parle de 4 personnages marginaux qui respirent un quotidien décalé, où la vie peut valoir un morceau de pain, et les affamés peuvent devenir frères dans la lutte pour la survie."
    },
    {
      id: "ceremoniale", title: "La Cérémoniale", company: "Cie du Coin",
      genre: "Musique", group: "musique", duration: 85, audience: TP, venueIds: [5],
      img: "img/shows/ceremoniale.jpg", credit: "© Fabrice Ravier",
      short: "Célébration musicale païenne avec 6 musiciens chamans proto-hippies : chants, danses et transe collective.",
      description: "Là où le consumérisme a vidé le monde de sa spiritualité, la Cérémoniale jaillit comme un tubercule, comblant le vide ainsi laissé.\n\nPour cette célébration musicale païenne, le spectateur est invité à devenir acteur de sa propre transfiguration. On s'animera, accompagné de 6 musiciens, chamans proto-hippies, passeurs méta-dadas vers la libération spirituelle au gré de chants, de danses, de scènes de liesse et de transe collective.\n\nBigarrée et énergique, notre quête atteindra l'Éveil au totem de l'Absurde, tendant un fil d'or entre le ciel et la terre, le corps et l'esprit, l'enfant et le vieillard, le pâté et la salade."
    },
    {
      id: "autostop", title: "Autostop", company: "Cie du Rond-Point",
      genre: "Théâtre", group: "theatre", duration: 75, audience: "À partir de 12 ans", venueIds: [4],
      img: "img/shows/autostop.jpg", credit: "© Romain Péli / © Cie du Rond-Point",
      short: "Des récits d'autostop rejoués sur scène : une collection de portraits, plein phare sur la société d'aujourd'hui.",
      description: "Depuis l'âge de 15 ans, Floriane Mésenge voyage en autostop et rencontre des gens. Dans l'intimité de l'habitacle, la parole se donne et se prend avec légèreté et profondeur, comme si l'anonymat permettait un accès facilité à l'essentiel.\n\nL'artiste garde des traces de ces rencontres et, avec ses comparses Maxime Gorbatchevsky et Romain Daroles, iels rejouent des situations vécues en Autostop. Ces récits dessinent une collection de portraits, comme un plein phare sur la société d'aujourd'hui."
    },
    {
      id: "wanted", title: "WANTED", company: "Bruital Cie",
      genre: "Théâtre gestuel", group: "theatre", duration: 55, audience: "À partir de 10 ans", venueIds: [13],
      img: "img/shows/wanted.jpg", credit: "© Romain Péli / © Cie du Rond-Point",
      short: "Parodie de western entièrement mimée et sonorisée par une comédienne et un bruiteur.",
      description: "WANTED est une parodie du western, entièrement mimée et sonorisée par une comédienne et un bruiteur. Il est la voix, elle est le corps et à eux deux ils jouent tous les personnages du Far West, du shérif orgueilleux au bandit sanguinaire en passant par le banquier, le prisonnier et la femme fatale.\n\nAvec une synchronisation méthodique, ils s'amusent des clichés à la façon du cartoon et racontent entre les lignes du western une autre histoire, la leur, un peu absurde et un brin tragique."
    },
    {
      id: "epiphytes", title: "Épiphytes", company: "Cie Les Chaussons Rouges",
      genre: "Cirque", group: "cirque", duration: 45, audience: TP, venueIds: [16],
      img: "img/shows/epiphytes.jpg", credit: "© David Levene",
      short: "4 danseuses-acrobates funambules à 5 mètres de hauteur esquissent une mystérieuse forêt vivante.",
      description: "Les épiphytes sont des plantes aériennes ayant pour particularité de se développer en grimpant sur d'autres végétaux sans pour autant les parasiter. Ne touchant pas terre, elles s'abreuvent uniquement de l'humidité de l'air. À la recherche verticale de la lumière, elles sont perchées au milieu des bois.\n\nDans sa dernière création, la compagnie funambule Les Chaussons Rouges s'inspire de ces incroyables espèces végétales. Évoluant à 5 mètres de hauteur, 4 danseuses-acrobates esquissent les contours d'une mystérieuse forêt vivante, vibrante, évolutive.\n\nLa brume soudain les entoure : le fil sous leur pied devient liane, leurs balanciers d'équilibristes forment de délicats branchages. Une élégante chorégraphie en plein air, où les agrès de cirque revêtent une nature organique et sensible."
    },
    {
      id: "lavertu", title: "La Vertu", company: "Cie La Vertu",
      genre: "Musique", group: "musique", duration: null, audience: TP, venueIds: [17, 18],
      img: "img/shows/lavertu.jpg", credit: "© Susy Lagrange",
      short: "Orchestre de rue mobile mêlant opérette, chanson et jazz-rock — un prêche de la Vertu qui déraille.",
      description: "Cinq musiciens sillonnent les villes en prêchant la Vertu : sourire, équilibre et mesure. Mais leur spectacle bien huilé déraille, emporté par les émotions et l'imprévu.\n\nOrchestre de rue mobile mêlant opérette, chanson et jazz-rock, sur des textes et musiques originales.\n\nChaque jour : 14h15 place Gutenberg (30 min) et 16h20 aux Docks Malraux, départ depuis les Docks (55 min)."
    },
    {
      id: "baignoire", title: "Baignoire publique", company: "Cirque Compost",
      genre: "Cirque", group: "cirque", duration: 50, audience: "À partir de 7 ans", venueIds: [7],
      img: "img/shows/baignoire.jpg", credit: "© Patrick Denis",
      short: "Une baignoire, objet du quotidien, devient le support de toutes les acrobaties et réflexions sur le monde.",
      description: "Ils débarquent avec leur baignoire, objet du quotidien et lieu de toutes réflexions. Ils attendent quelque chose. « Ça va arriver ! »\n\nPourtant aucun signe… Cette frêle embarcation a tôt fait de devenir le support idéal pour toutes sortes d'acrobaties et de réflexions sur le monde qui les entoure."
    },
    {
      id: "anti", title: "ANTI", company: "Lapin 34",
      genre: "Théâtre", group: "theatre", duration: 60, audience: TP, venueIds: [12],
      img: "img/shows/anti.jpg", credit: "© Arnaud Massé",
      short: "Le mythe d'Antigone dans un univers de supporters ultras — costumes gonflables et fumigènes.",
      description: "Deux frères, représentants de clubs rivaux, s'affrontent et se tuent l'un l'autre. Celui qui jouait à domicile est honoré tandis que l'autre est abandonné avec interdiction d'aller honorer sa dépouille. Leur sœur va se lever contre l'ordre établi.\n\nDécouvrez le mythe d'Antigone dans un univers de supporters ultras, ultras ultras et ultras fiers de leurs couleurs. Antigone, figure de la résistance, fait valoir sa liberté individuelle. Mais peut-on sacrifier l'individu pour que vive le groupe ?\n\nUne question très sérieuse abordée avec des costumes gonflables, des fumigènes, des souffleuses à feuilles et une boule transparente avec quelqu'un dedans."
    },
    {
      id: "influence", title: "Influence", company: "Cie Les Invendus",
      genre: "Cirque jonglé", group: "cirque", duration: 45, audience: TP, venueIds: [8, 15],
      img: "img/shows/influence.jpg", credit: "© Tanguy Marchand",
      short: "Le mouvement jonglé : deux corps qui parlent et se répondent, jusqu'à l'épuisement… pour revenir au presque rien.",
      description: "Leur langage, le mouvement jonglé, se base sur le rapport du corps au jonglage et du jonglage au corps. Celui-ci a une histoire, une émotion, un parcours, une sensation, lié à leur complicité, leur relation en perpétuelle évolution.\n\nIls recherchent, ils explorent, ils avancent dans ce périple où les corps parlent et se répondent. Chorégraphié et dans le jeu, onirique, explosif et répété, le mouvement les porte et les engage physiquement jusqu'à l'épuisement des corps… pour revenir à l'essentiel, au presque rien.\n\nLe jonglage est leur exutoire, une expression, une connexion à ce qui leur fait exister, vibrer. Au-delà de l'expression corporelle, c'est une relation humaine portée et influencée par l'autre qui se joue dans l'espace. Un univers poétique, sensible et plein d'humanité.\n\nVendredi : place du Petit Broglie. Samedi et dimanche : cour de l'école Sainte-Madeleine."
    },
    {
      id: "commentfaire", title: "Comment faire les choses avec les mots", company: "Cie Joshua Monten",
      genre: "Danse", group: "danse", duration: 35, audience: TP, venueIds: [9],
      img: "img/shows/commentfaire.jpg", credit: "© Joshua Monten",
      short: "Un pas-de-deux entre corps et texte écrit, entre langage et mouvement — poète, comique, absurde.",
      description: "Comment danse-t-on avec des mots ? Ce spectacle est un pas-de-deux entre corps et texte écrit, entre langage et mouvement.\n\nLa chorégraphie abonde en présence corporelle, palpite de rythmes, se pare de la beauté de la langue et du geste, devient poète, comique, absurde."
    },
    {
      id: "fondre", title: "Comment se fondre dans l'ombre", company: "Cie Amigara",
      genre: "Danse", group: "danse", duration: 30, audience: "À partir de 5 ans", venueIds: [10],
      img: "img/shows/fondre.jpg", credit: "© Susana Chico / © Wallace Wong",
      short: "Deux corps dans un espace aux contours troublés : l'un prolonge l'autre, qui suit, qui guide ?",
      description: "Peut-on se fondre dans quelqu'un sans disparaître ? Entre fascination et dualité, deux corps évoluent dans un espace où les contours se troublent, l'un prolonge l'autre, on ne sait plus qui suit, qui guide.\n\nL'ombre est-elle une simple projection ou une entité autonome ?"
    },
    {
      id: "wakeup", title: "Wake up", company: "Cie Errância",
      genre: "Acrobatie", group: "cirque", duration: 35, audience: TP, venueIds: [19],
      img: "img/shows/wakeup.jpg", credit: "© Susana Chico / © Wallace Wong",
      short: "2 acrobates issus de deux temporalités différentes se téléscopent — un voyage en espace-temps dilaté.",
      description: "Pièce de cirque/performance pour 2 acrobates qui aborde essentiellement la question du temps autour d'une rencontre fusionnelle et atypique.\n\nDeux hommes issus de deux temporalités différentes se téléscopent. Un récit complice et asymétrique où l'un des protagonistes cherche à rentrer en dialogue avec le monde de l'autre. L'absurdité de cette rencontre fait jouer les contrastes, l'acrobatie lui arrive, donne forme à leur gravité et synchronise ces deux hommes/corps grâce au geste acrobatique, créant ainsi un voyage en un espace-temps dilaté."
    },
    {
      id: "plasticboum", title: "Plastic Boum Boum", company: "Cie du Trufu",
      genre: "Musique", group: "musique", duration: 45, audience: TP, venueIds: [8],
      img: "img/shows/plasticboum.jpg", credit: "© Arsène Forger",
      short: "Une rave-party déglinguée sans électricité : un tas de déchets devient sound-system.",
      description: "Plastic Boum Boum raconte la rencontre de Compost et Dr Gagouz, deux musiciens venus d'un futur farfelu appelé le trufu, dans lequel les musiques électro subsistent sans électricité.\n\nC'est une véritable épopée sonore pendant laquelle un tas de déchets prendra l'allure d'un sound-system et les sonorités d'une rave-party déglinguée, sans aucune assistance électrique !"
    },
    {
      id: "grosdebit", title: "Gros débit", company: "Cie Facile d'Excès",
      genre: "Théâtre musical", group: "theatre", duration: 50, audience: TP, venueIds: [5],
      img: "img/shows/grosdebit.jpg", credit: "© Cie Facile d'Excès",
      short: "3 joyeux maestros, une partition sans clefs ni bémols : un spectacle sans queue ni tête qui va faire du bruit !",
      description: "Une conquête de l'inutile menée tambours battants, un pari sur la légèreté, le contretemps… Une partition sans clefs ni bémols, improvisée par 3 joyeux maestros…\n\nIci, tout est prétexte au jeu… ils jouent de la musique et ils en jouent ! Leur approche de la musique est résolument circassienne, la virtuosité n'est pas toujours là où on l'attend, la fausse note non plus !\n\nUn spectacle sans queue ni tête, sans parole non plus, très peu sonore, mais qui va faire du bruit !"
    },
    {
      id: "pigments", title: "Pigments", company: "CirkVOST",
      genre: "Cirque aérien", group: "cirque", duration: 50, audience: TP, venueIds: [2],
      img: "img/shows/pigments.jpg", credit: "© Kalimba Itak",
      short: "« Cinquante minutes sans toucher terre ! » — voltige à 15 mètres au-dessus du sol.",
      description: "« Cinquante minutes sans toucher terre ! », c'est le défi que relève CirkVOST avec Pigments.\n\nÀ 15 mètres au-dessus du sol, ce spectacle aérien nous indique que la solidarité d'un groupe a toute sa mesure. L'individualité est à prendre en compte car chacun de nous est singulier, mais l'individualisme peut s'avérer dangereux car toute initiative personnelle peut déstabiliser le groupe si elle ne considère pas les contraintes de celui-ci.\n\nCertains y verront une allégorie criante de la société actuelle, d'autres une manifestation de défiance, rebelle aux lois de la gravité. Mais tous, petits et grands, goûteront au plaisir enivrant du vol partagé."
    },
    {
      id: "broglii", title: "Broglii", company: "Lapin 34",
      genre: "Théâtre", group: "theatre", duration: 60, audience: "À partir de 6 ans", venueIds: [11],
      img: "img/shows/broglii.jpg", credit: "© Susy Lagrange / © Lapin 34",
      short: "Un huis-clos (plus si clos…) pour 3 personnages machiavéliques en quête de pouvoir, inspiré de la BD Imbroglio.",
      description: "Le principe est clair : c'est en orchestrant dans les rues des « moments d'intense incompréhension » que la Cie Lapin 34 entend contrecarrer la pression du monde…\n\nInspiré de la BD Imbroglio de Lewis Trondheim, Broglii joue dans l'espace public un huis-clos (plus si clos…) pour 3 personnages machiavéliques en quête de pouvoir. Amour, joie, colère et trahison dans des styles pouvant aller de la folie dessinée au vaudeville, en passant par l'emphase de la tragédie grecque et l'ultra-violence tarantinesque.\n\nAux spectateurs, à chaque fois, de choisir leurs styles préférés. Et d'éprouver la joie libératrice du rire devant l'absurde."
    },
    {
      id: "compostcollaps", title: "Compost Collaps x Dr Gagouz", company: "Cie du Trufu",
      genre: "Musique", group: "musique", duration: 60, audience: TP, venueIds: [2],
      img: null, credit: null,
      short: "Un percussionniste et sa CC220, 100 % récup : le soundsystem du futur, la boîte à rythme de demain.",
      description: "Compost Collaps, c'est un percussionniste et sa CC220, un instrument fait-maison, sur-mesure, 100 % récup. Le soundsystem du futur, la boîte à rythme de demain.\n\nUne performance live, des compositions originales, inspirées des dancefloors d'ici et d'ailleurs, enchaînées comme un DJ. C'est chaud, ça pulse, on en sort renforcé, motivé, ensemble. Un kick tellurique, 220 litres de plastique, qui cogne aussi fort que nos cœurs battent. Des basses viscérales, 18 mètres de tubes, qui donnent la force de défendre ce que l'on aime. Des snares de métal en plaques qui claquent… toujours plus, jamais pareil.\n\nPour des lendemains qui chantent et qui tapent. Pour que partout, toujours, la fête continue."
    },
    {
      id: "monmonstre", title: "Mon Monstre à Moi", company: "Cie Rouge Carmin",
      genre: "Théâtre visuel et aérien", group: "theatre", duration: 45, audience: "À partir de 3 ans", venueIds: [6],
      img: "img/shows/monmonstre.jpg", credit: "© Cie Rouge Carmin",
      short: "Un huis-clos aquatique : Sasha et son monstre embarquent pour un voyage initiatique, jusqu'au plus haut des plongeoirs.",
      description: "Aujourd'hui, Sasha est triste parce que, cet après-midi à la piscine, le maître-nageur l'a poussé dans l'eau et tout le monde s'est moqué de lui. En plus, c'est le fils de la dame de la piscine et il ne sait même pas nager, la honte !\n\nLe soir, il ne peut plus dormir. Trop peur du monstre qui flotte autour de son lit. Mais, très vite, la marée monte et les emporte tous deux dans un voyage initiatique semé d'embûches.\n\nMon Monstre à Moi est un huis-clos aquatique, où Sasha et son monstre naviguent, entre tendresse et cruauté, jusqu'au saut final, tout en haut du plus haut des plongeoirs."
    },

    // ——— Animations du Village du FARSe (Manufacture des tabacs) ———
    { id: "v-fresque", title: "Atelier peinture fresque", company: "Atelier NA", genre: "Atelier", group: "village", duration: 120, audience: TP, venueIds: [20], img: null,
      short: "Atelier participatif de peinture fresque au Village du FARSe.", description: "Atelier participatif de peinture fresque, proposé par l'Atelier NA au Village du FARSe (Manufacture des tabacs). En continu de 14h à 16h." },
    { id: "v-serigraphie", title: "Atelier sérigraphie", company: "Atelier NA", genre: "Atelier", group: "village", duration: 120, audience: TP, venueIds: [20], img: null,
      short: "Atelier de sérigraphie au Village du FARSe.", description: "Atelier de sérigraphie proposé par l'Atelier NA au Village du FARSe (Manufacture des tabacs). En continu de 14h à 16h." },
    { id: "v-poesie", title: "Atelier poésie", company: "Atelier NA", genre: "Atelier", group: "village", duration: 120, audience: TP, venueIds: [20], img: null,
      short: "Atelier poésie au Village du FARSe.", description: "Atelier poésie proposé par l'Atelier NA au Village du FARSe (Manufacture des tabacs). En continu de 17h à 19h." },
    { id: "v-danse", title: "Initiation danse", company: "Atelier NA", genre: "Atelier", group: "village", duration: 120, audience: TP, venueIds: [20], img: null,
      short: "Initiation à la danse au Village du FARSe.", description: "Initiation à la danse au Village du FARSe (Manufacture des tabacs). En continu de 17h à 19h." },
    { id: "v-impro", title: "Théâtre d'improvisation", company: "Atelier NA", genre: "Atelier", group: "village", duration: 120, audience: TP, venueIds: [20], img: null,
      short: "Théâtre d'improvisation au Village du FARSe.", description: "Théâtre d'improvisation au Village du FARSe (Manufacture des tabacs). En continu de 17h à 19h." },
    { id: "v-sand", title: "Sand'animation (sable)", company: "Atelier NA", genre: "Animation", group: "village", duration: 240, audience: TP, venueIds: [20], img: null,
      short: "Animation autour du sable, en soirée au Village du FARSe.", description: "Animation autour du sable (« sand » = sable), en continu de 20h à minuit au Village du FARSe (Manufacture des tabacs)." },
    { id: "v-ludo", title: "Ludothèque", company: "Atelier NA", genre: "Animation", group: "village", duration: null, audience: TP, venueIds: [20], img: null,
      short: "Jeux en libre accès, en continu au Village du FARSe.", description: "Ludothèque en libre accès, en continu à partir de 14h au Village du FARSe (Manufacture des tabacs)." },
    { id: "v-jam", title: "Jam session", company: "Village du FARSe", genre: "Musique", group: "village", duration: 120, audience: TP, venueIds: [20], img: null,
      short: "Jam session musicale de clôture au Village du FARSe.", description: "Jam session musicale au Village du FARSe (Manufacture des tabacs), dimanche de 20h à 22h." },
  ];

  // Représentations. kind: show | village | rencontre. note = précision ponctuelle.
  const P = (id, showId, day, time, venueId, opts = {}) =>
    Object.assign({ id, showId, day, time, venueId, kind: "show" }, opts);

  const PERFS = [
    // Mirage
    P("mirage-ven-2100", "mirage", "ven", "21:00", 1),
    P("mirage-sam-1815", "mirage", "sam", "18:15", 1),
    P("mirage-dim-1815", "mirage", "dim", "18:15", 1),
    // Prélude (out)
    P("prelude-ven-1800", "prelude", "ven", "18:00", 14),
    P("prelude-sam-1800", "prelude", "sam", "18:00", 14),
    P("prelude-dim-1800", "prelude", "dim", "18:00", 14),
    // Pelat
    P("pelat-ven-1730", "pelat", "ven", "17:30", 10),
    P("pelat-sam-1730", "pelat", "sam", "17:30", 10),
    P("pelat-dim-1730", "pelat", "dim", "17:30", 10),
    // Stek
    P("stek-ven-1915", "stek", "ven", "19:15", 3),
    P("stek-sam-1915", "stek", "sam", "19:15", 3),
    P("stek-dim-1915", "stek", "dim", "19:15", 3),
    // La Cérémoniale
    P("ceremoniale-ven-1815", "ceremoniale", "ven", "18:15", 5),
    P("ceremoniale-sam-1815", "ceremoniale", "sam", "18:15", 5),
    P("ceremoniale-dim-1815", "ceremoniale", "dim", "18:15", 5),
    // Autostop
    P("autostop-ven-1900", "autostop", "ven", "19:00", 4),
    P("autostop-sam-1900", "autostop", "sam", "19:00", 4),
    P("autostop-dim-1900", "autostop", "dim", "19:00", 4),
    // WANTED
    P("wanted-ven-1930", "wanted", "ven", "19:30", 13),
    P("wanted-sam-1930", "wanted", "sam", "19:30", 13),
    P("wanted-dim-1930", "wanted", "dim", "19:30", 13),
    // Épiphytes (+ avant-première à Ostwald)
    P("epiphytes-jeu-1900", "epiphytes", "jeu", "19:00", 21, { note: "Avant le FARSe — en partenariat avec le Point d'Eau à Ostwald" }),
    P("epiphytes-ven-1745", "epiphytes", "ven", "17:45", 16),
    P("epiphytes-sam-1745", "epiphytes", "sam", "17:45", 16),
    P("epiphytes-dim-1745", "epiphytes", "dim", "17:45", 16),
    // La Vertu (2 formats par jour)
    P("lavertu-ven-1415", "lavertu", "ven", "14:15", 17, { duration: 30 }),
    P("lavertu-ven-1620", "lavertu", "ven", "16:20", 18, { duration: 55 }),
    P("lavertu-sam-1415", "lavertu", "sam", "14:15", 17, { duration: 30 }),
    P("lavertu-sam-1620", "lavertu", "sam", "16:20", 18, { duration: 55 }),
    P("lavertu-dim-1415", "lavertu", "dim", "14:15", 17, { duration: 30 }),
    P("lavertu-dim-1620", "lavertu", "dim", "16:20", 18, { duration: 55 }),
    // Baignoire publique
    P("baignoire-ven-1500", "baignoire", "ven", "15:00", 7),
    P("baignoire-ven-1900", "baignoire", "ven", "19:00", 7),
    P("baignoire-sam-1500", "baignoire", "sam", "15:00", 7),
    // ANTI
    P("anti-ven-1500", "anti", "ven", "15:00", 12),
    P("anti-ven-1800", "anti", "ven", "18:00", 12),
    P("anti-sam-1500", "anti", "sam", "15:00", 12),
    // Influence
    P("influence-ven-1645", "influence", "ven", "16:45", 8),
    P("influence-sam-1645", "influence", "sam", "16:45", 15),
    P("influence-dim-1645", "influence", "dim", "16:45", 15),
    // Comment faire les choses avec les mots
    P("commentfaire-sam-1145", "commentfaire", "sam", "11:45", 9),
    P("commentfaire-sam-1515", "commentfaire", "sam", "15:15", 9),
    P("commentfaire-dim-1015", "commentfaire", "dim", "10:15", 9),
    P("commentfaire-dim-1515", "commentfaire", "dim", "15:15", 9),
    // Comment se fondre dans l'ombre
    P("fondre-sam-1600", "fondre", "sam", "16:00", 10),
    P("fondre-sam-1900", "fondre", "sam", "19:00", 10),
    P("fondre-dim-1600", "fondre", "dim", "16:00", 10),
    P("fondre-dim-1900", "fondre", "dim", "19:00", 10),
    // Wake up
    P("wakeup-sam-1715", "wakeup", "sam", "17:15", 19),
    P("wakeup-dim-1715", "wakeup", "dim", "17:15", 19),
    // Plastic Boum Boum
    P("plasticboum-sam-1030", "plasticboum", "sam", "10:30", 8),
    P("plasticboum-dim-1130", "plasticboum", "dim", "11:30", 8),
    P("plasticboum-dim-1630", "plasticboum", "dim", "16:30", 8),
    // Gros débit
    P("grosdebit-sam-1130", "grosdebit", "sam", "11:30", 5),
    P("grosdebit-sam-1500", "grosdebit", "sam", "15:00", 5),
    P("grosdebit-dim-1130", "grosdebit", "dim", "11:30", 5),
    P("grosdebit-dim-1500", "grosdebit", "dim", "15:00", 5),
    // Pigments
    P("pigments-sam-2100", "pigments", "sam", "21:00", 2),
    P("pigments-dim-2000", "pigments", "dim", "20:00", 2),
    // Broglii
    P("broglii-sam-1900", "broglii", "sam", "19:00", 11),
    P("broglii-dim-1500", "broglii", "dim", "15:00", 11),
    P("broglii-dim-1900", "broglii", "dim", "19:00", 11),
    // Compost Collaps x Dr Gagouz
    P("compostcollaps-sam-2200", "compostcollaps", "sam", "22:00", 2),
    // Mon Monstre à Moi
    P("monmonstre-sam-1000", "monmonstre", "sam", "10:00", 6),
    P("monmonstre-sam-1615", "monmonstre", "sam", "16:15", 6),
    P("monmonstre-dim-1000", "monmonstre", "dim", "10:00", 6),
    P("monmonstre-dim-1615", "monmonstre", "dim", "16:15", 6),

    // Village du FARSe
    P("v-fresque-ven-1400", "v-fresque", "ven", "14:00", 20, { kind: "village" }),
    P("v-fresque-dim-1400", "v-fresque", "dim", "14:00", 20, { kind: "village" }),
    P("v-serigraphie-sam-1400", "v-serigraphie", "sam", "14:00", 20, { kind: "village" }),
    P("v-poesie-ven-1700", "v-poesie", "ven", "17:00", 20, { kind: "village" }),
    P("v-danse-sam-1700", "v-danse", "sam", "17:00", 20, { kind: "village" }),
    P("v-impro-dim-1700", "v-impro", "dim", "17:00", 20, { kind: "village" }),
    P("v-sand-ven-2000", "v-sand", "ven", "20:00", 20, { kind: "village" }),
    P("v-sand-sam-2000", "v-sand", "sam", "20:00", 20, { kind: "village" }),
    P("v-sand-dim-2000", "v-sand", "dim", "20:00", 20, { kind: "village" }),
    P("v-ludo-ven-1400", "v-ludo", "ven", "14:00", 20, { kind: "village", note: "En continu" }),
    P("v-ludo-sam-1400", "v-ludo", "sam", "14:00", 20, { kind: "village", note: "En continu" }),
    P("v-ludo-dim-1400", "v-ludo", "dim", "14:00", 20, { kind: "village", note: "En continu" }),
    P("v-jam-dim-2000", "v-jam", "dim", "20:00", 20, { kind: "village" }),

    // Rencontres publiques avec les artistes (animées par Laurence Méner)
    P("r-epiphytes-sam-1830", "epiphytes", "sam", "18:30", 16, { kind: "rencontre", duration: 60, note: "Aire de jeu du Jura — rencontre avec la Cie Les Chaussons Rouges" }),
    P("r-stek-sam-2015", "stek", "sam", "20:15", 3, { kind: "rencontre", duration: 60, note: "Rencontre avec Intrepidus Squad" }),
    P("r-commentfaire-dim-1100", "commentfaire", "dim", "11:00", 9, { kind: "rencontre", duration: 60, note: "Rencontre avec la Cie Joshua Monten" }),
    P("r-pelat-dim-1815", "pelat", "dim", "18:15", 10, { kind: "rencontre", duration: 60, note: "Rencontre avec Joan Català" }),
  ];

  // Parcours proposés par le festival (page « Ma visite au festival »).
  const PARCOURS = [
    {
      id: "famille-sam", name: "Famille", day: "sam", icon: "🎈",
      blurb: "Un parcours de spectacles et d'activités pour tous les âges et pour les familles.",
      items: [
        { perfId: "plasticboum-sam-1030" },
        { perfId: "commentfaire-sam-1145" },
        { perfId: "grosdebit-sam-1500" },
        { perfId: "monmonstre-sam-1615" },
        { perfId: "v-danse-sam-1700", start: "17:00", end: "18:00", label: "Village du FARSe · Initiation danse" },
        { perfId: "mirage-sam-1815" },
      ],
    },
    {
      id: "intensif-sam", name: "Intensif", day: "sam", icon: "⚡",
      blurb: "Un parcours pour les personnes qui veulent voir beaucoup de spectacles.",
      items: [
        { perfId: "monmonstre-sam-1000" },
        { perfId: "grosdebit-sam-1130" },
        { perfId: "anti-sam-1500" },
        { perfId: "influence-sam-1645" },
        { perfId: "mirage-sam-1815" },
        { perfId: "stek-sam-1915" },
        { perfId: "pigments-sam-2100" },
        { perfId: "compostcollaps-sam-2200" },
      ],
    },
    {
      id: "famille-dim", name: "Famille", day: "dim", icon: "🎈",
      blurb: "Un parcours de spectacles et d'activités pour tous les âges et pour les familles.",
      items: [
        { perfId: "commentfaire-dim-1015" },
        { perfId: "plasticboum-dim-1130" },
        { perfId: "grosdebit-dim-1500" },
        { perfId: "monmonstre-dim-1615" },
        { perfId: "v-impro-dim-1700", start: "17:00", end: "18:00", label: "Village du FARSe · Théâtre d'improvisation" },
        { perfId: "mirage-dim-1815" },
      ],
    },
    {
      id: "intensif-dim", name: "Intensif", day: "dim", icon: "⚡",
      blurb: "Un parcours pour les personnes qui veulent voir beaucoup de spectacles.",
      items: [
        { perfId: "monmonstre-dim-1000" },
        { perfId: "grosdebit-dim-1130" },
        { perfId: "broglii-dim-1500" },
        { perfId: "influence-dim-1645" },
        { perfId: "mirage-dim-1815" },
        { perfId: "stek-dim-1915" },
        { custom: { start: "20:15", end: "21:15", label: "Rencontre publique · Stek", venueId: 3, showId: "stek" } },
        { perfId: "v-jam-dim-2000", start: "21:30", end: "22:30", label: "Village du FARSe · Jam session" },
      ],
    },
  ];

  const INFOS = {
    festival: "FARSe 2026 — Le Festival des Arts de la Rue de Strasbourg",
    dates: "Du 28 au 30 août 2026",
    site: "https://ete.strasbourg.eu",
    facebook: "https://www.facebook.com/Festivalfarse",
    facebookName: "Festival FARSe de Strasbourg",
    hashtag: "#FARSe",
    phone: "03 68 98 68 69",
    email: "evenements-deva@strasbourg.eu",
    mediationEmail: "evenements-farse-festival@strasbourg.eu",
    pointInfo: {
      where: "Place Gutenberg (et au Village du FARSe, cour côté rue de la Krutenau)",
      hours: [
        "Jeudi : 14h – 18h",
        "Vendredi : 11h – 21h",
        "Samedi : 10h – 21h",
        "Dimanche : 10h – 20h",
      ],
    },
    village: {
      name: "Le Village du FARSe",
      where: "Manufacture des tabacs (cour côté rue de la Krutenau)",
      hours: "Du vendredi 28 au dimanche 30 août, de 12h à minuit",
      blurb: "Cette année, c'est l'Atelier NA avec Alexiane Magnin qui prend possession de l'espace : une ambiance à la fois ludique, colorée et apaisante, imaginée spécialement pour le FARSe. Lieu de rencontre des artistes, des organisateurs, des bénévoles (les FARS'eurs) et du public. Restauration sur place.",
    },
    access: [
      "Tous les spectacles sont gratuits et accessibles à tous les publics.",
      "Sur chaque site : devant, on s'assoit sur la moquette au sol ; juste derrière, bancs ou gradins ; à l'arrière, on reste debout.",
      "Merci de laisser les places assises en priorité aux personnes à mobilité réduite, aux femmes enceintes ou aux personnes âgées.",
      "Les enfants restent sous la surveillance des parents pendant toute la durée du spectacle.",
      "Bénévoles présents sur chaque site de jeu, au Point info du Village du FARSe et au Point info place Gutenberg.",
    ],
    tips: [
      "Portables en silencieux pendant les représentations",
      "Crème solaire, casquette et lunettes de soleil — ou k-way et parapluie",
      "Gourdes : de l'eau est disponible aux fontaines du centre-ville",
      "Vous pouvez amener vos propres chaises",
      "Toilettes publiques : place Kléber, place du Château, parc de la Citadelle",
    ],
    mediation: "Des ateliers sont proposés par le CirkVOST : découverte de la sensation du vide, échanges avec les équipes de la compagnie, visite du chantier et du montage du portique de cirque. Renseignements : evenements-farse-festival@strasbourg.eu",
    rencontres: "Des temps de rencontres publiques sont organisés avec les artistes internationaux, animés par Laurence Méner, devant chaque scène après les spectacles.",
  };

  // Index
  const showById = Object.fromEntries(SHOWS.map(s => [s.id, s]));
  const venueById = Object.fromEntries(VENUES.map(v => [v.id, v]));
  const dayById = Object.fromEntries(DAYS.map(d => [d.id, d]));
  PERFS.forEach(p => {
    p.show = showById[p.showId];
    p.venue = venueById[p.venueId];
    if (p.duration == null) p.duration = p.show.duration;
    p.startMin = +p.time.slice(0, 2) * 60 + +p.time.slice(3, 5);
    p.endMin = p.duration ? p.startMin + p.duration : null;
    p.date = dayById[p.day].date;
  });
  const perfById = Object.fromEntries(PERFS.map(p => [p.id, p]));
  SHOWS.forEach(s => { s.perfs = PERFS.filter(p => p.showId === s.id && p.kind !== "rencontre"); s.meets = PERFS.filter(p => p.showId === s.id && p.kind === "rencontre"); });

  return { DAYS, VENUES, SHOWS, PERFS, PARCOURS, INFOS, showById, venueById, perfById, dayById };
})();
