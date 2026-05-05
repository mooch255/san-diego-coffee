// neighborhoods.js
// Data for individual neighborhood landing pages (/neighborhoods/:id)
// Each entry's `name` must exactly match coffeeDetails.neighborhood in locations.js

window.NEIGHBORHOODS = [
  {
    id: 'north-park',
    name: 'North Park',
    metaTitle: 'Best Coffee in North Park, San Diego | Roasters & Cafes',
    metaDescription: 'Explore specialty coffee shops in North Park, San Diego - the city\'s densest roaster neighborhood. Dark Horse, Genteel, Caffè Calabria, Lovesong, and more.',
    about: 'North Park is San Diego\'s densest specialty coffee neighborhood, with more independent roasters per block than anywhere else in the city. The 30th Street corridor anchors the scene with Dark Horse, Caffè Calabria, and Communal, while Genteel, Inspired, Little While, and Coffee & Tea Collective fill the surrounding streets. Full range of roast profiles, from Italian dark to fruit-forward light; whatever you\'re looking for, this neighborhood has a shop for it.'
  },
  {
    id: 'downtown',
    name: 'Downtown',
    metaTitle: 'Best Coffee in Downtown San Diego | Roasters & Cafes',
    metaDescription: 'Browse specialty coffee shops in Downtown San Diego - Bird Rock, Achilles, Mostra, and more roasters concentrated in the East Village and Little Italy corridors.',
    about: 'Downtown San Diego packs more roaster outposts into a walkable stretch than any other neighborhood, anchored by Bird Rock, Achilles, and Mostra. The East Village and Little Italy corridors are the main action, with three or four serious cafes within easy walking distance of each other. Worth building a coffee itinerary around if you\'re spending time in the city center.'
  },
  {
    id: 'carlsbad',
    name: 'Carlsbad',
    metaTitle: 'Best Coffee in Carlsbad, San Diego | Roasters & Cafes',
    metaDescription: 'Find specialty coffee in Carlsbad, CA - Steady State, Baba Coffee, Origen, Interim, Ascend, and more along the coast highway and Village corridor.',
    about: 'Carlsbad has one of North County\'s strongest specialty coffee lineups, with a cluster of shops concentrated in the walkable Carlsbad Village area. Steady State, Baba, Interim, and others sit within easy walking distance of each other along State Street and the surrounding blocks, making it one of the few North County spots where you can genuinely hop between multiple cafes on foot. Lofty runs two locations in the area as well.'
  },
  {
    id: 'oceanside',
    name: 'Oceanside',
    metaTitle: 'Best Coffee in Oceanside, San Diego | Roasters & Cafes',
    metaDescription: 'Explore specialty coffee in Oceanside, CA - Revolution Roasters, Vigilante, Libra, Camp Coffee, Pannikin, and more in North County\'s most dynamic coffee scene.',
    about: 'Oceanside has emerged as one of North County\'s most dynamic coffee destinations, mixing beach-town energy with serious roasting credentials. Revolution Roasters anchors the scene alongside Vigilante, Libra, Camp Coffee, and Bound Coffee Company, with Pannikin, one of San Diego\'s oldest specialty cafes, still going strong. The walkable downtown strip makes Oceanside one of the better spots for a multi-shop visit on the coast.'
  },
  {
    id: 'encinitas',
    name: 'Encinitas',
    metaTitle: 'Best Coffee in Encinitas, San Diego | Roasters & Cafes',
    metaDescription: 'Browse specialty coffee in Encinitas, CA - Necessity Coffee, Ironsmith, Seven Seas, Crossings, Lofty, and more on the north coast.',
    about: 'Encinitas punches well above its size for specialty coffee quality, anchored by Necessity, Pannikin, and Seven Seas, three of North County\'s most respected shops. The spots are spread out along the coast highway rather than clustered, so plan accordingly, but the quality at each stop makes the drive between them worth it. Ironsmith, Crossings, and two Lofty locations round out a lineup that rivals any neighborhood in San Diego.'
  },
  {
    id: 'la-jolla',
    name: 'La Jolla',
    metaTitle: 'Best Coffee in La Jolla, San Diego | Roasters & Cafes',
    metaDescription: 'Find specialty coffee in La Jolla, CA - Bird Rock Coffee Roasters flagship, Elixir Espresso, Sands Coffee Roaster, and more in one of San Diego\'s top coffee neighborhoods.',
    about: 'La Jolla\'s coffee scene is anchored by Bird Rock Coffee Roasters, whose original La Jolla flagship remains one of San Diego\'s best cafes. Elixir and The Flower Pot round out a small but high-quality lineup. A destination neighborhood for quality over quantity.'
  },
  {
    id: 'point-loma',
    name: 'Point Loma',
    metaTitle: 'Best Coffee in Point Loma, San Diego | Roasters & Cafes',
    metaDescription: 'Explore specialty coffee in Point Loma, San Diego - Moniker Coffee Co., Bird Rock, Acento, Nectar, and more on the peninsula.',
    about: 'Point Loma has a compact but committed specialty scene, with Acento Coffee Roasters as the neighborhood\'s anchor and Bird Rock adding a well-regarded outpost. Moniker, Local Krave, and a handful of other independents fill out a lineup that serves the peninsula\'s residential community and rewards visitors who make the detour from downtown.'
  },
  {
    id: 'hillcrest',
    name: 'Hillcrest',
    metaTitle: 'Best Coffee in Hillcrest, San Diego | Roasters & Cafes',
    metaDescription: 'Find specialty coffee in Hillcrest, San Diego - Lestat\'s (open 24 hours), James Coffee, Mostra, and more in Uptown\'s coffee anchor neighborhood.',
    about: 'Hillcrest is Uptown San Diego\'s coffee anchor, with Lestat\'s as the neighborhood institution: open 24 hours and one of the city\'s true community gathering points. James Coffee and Mostra both run Hillcrest outposts, giving the neighborhood roaster depth alongside its reputation for late-night accessibility. If you need coffee after 4 PM, Hillcrest is your answer.'
  },
  {
    id: 'escondido',
    name: 'Escondido',
    metaTitle: 'Best Coffee in Escondido, San Diego | Roasters & Cafes',
    metaDescription: 'Browse specialty coffee in Escondido, CA - Manzanita Roasting Company, Safari Coffee, James Coffee, Ilustre, and more in inland San Diego\'s top coffee market.',
    about: 'Escondido is inland San Diego\'s strongest specialty coffee market, led by Manzanita Roasting Company, one of the county\'s most established production roasters. Safari Coffee, James Coffee, Ilustre, and Kettle On Grand round out a small but committed scene that punches above its size and rewards the visit from the coast.'
  },
  {
    id: 'ocean-beach',
    name: 'Ocean Beach',
    metaTitle: 'Best Coffee in Ocean Beach, San Diego | Roasters & Cafes',
    metaDescription: 'Find specialty coffee in Ocean Beach, San Diego - Coffee Cycle Roasting, Excelsa Coffee, OB Beans, Ultreya, and more in OB\'s independent coffee scene.',
    about: 'Ocean Beach keeps it local and independent, with a coffee scene that matches the neighborhood\'s distinctly anti-chain character. Coffee Cycle Roasting runs their OB roasting facility here, Excelsa and OB Beans both roast on-site, and Ultreya brings focused specialty execution to the beach-town strip. The right neighborhood if you want serious coffee with a side of OB\'s distinct community energy.'
  },
  {
    id: 'pacific-beach',
    name: 'Pacific Beach',
    metaTitle: 'Best Coffee in Pacific Beach, San Diego | Roasters & Cafes',
    metaDescription: 'Explore specialty coffee in Pacific Beach, San Diego - Coffee Cycle, Trident Coffee, Yipao, Elixir Espresso, and more along the Garnet Avenue corridor.',
    about: 'Pacific Beach is home to two of the more well-regarded roasters in the city: Coffee Cycle, whose PB location serves as their flagship cafe, and Yipao Coffee Roasters, a Colombian-owned operation drawing serious attention for their sourcing. Trident and Elixir round out a roaster-heavy neighborhood that punches well above its casual surf-town reputation.'
  },
  {
    id: 'carmel-valley',
    name: 'Carmel Valley',
    metaTitle: 'Best Coffee in Carmel Valley, San Diego | Roasters & Cafes',
    metaDescription: 'Find specialty coffee in Carmel Valley, San Diego - Mostra Coffee, Achilles Coffee Roasters, Bird Rock, and Parakeet Cafe in North County.',
    about: 'Carmel Valley\'s specialty coffee lineup is small but well-anchored, with Mostra, Achilles, Parakeet, and Bird Rock all running outposts in the North County suburb. Four solid options from some of San Diego\'s most respected roasters, worth knowing about if you\'re in the area.'
  },
  {
    id: 'bankers-hill',
    name: 'Bankers Hill',
    metaTitle: 'Best Coffee in Bankers Hill, San Diego | Roasters & Cafes',
    metaDescription: 'Browse specialty coffee in Bankers Hill, San Diego - Mnemonic Coffee, Mostra, Communal Coffee, Talitha Coffee Roasters, and more near Balboa Park.',
    about: 'Bankers Hill sits between downtown and Balboa Park, and its coffee scene has a quieter, more neighborhood feel than either. Mnemonic Coffee is the area\'s independent anchor, with Mostra, Communal, and Talitha rounding out a small lineup worth knowing about for park and zoo visits.'
  },
  {
    id: 'barrio-logan',
    name: 'Barrio Logan',
    metaTitle: 'Best Coffee in Barrio Logan, San Diego | Roasters & Cafes',
    metaDescription: 'Find specialty coffee in Barrio Logan, San Diego - Cafe Moto, Talitha Coffee, Ryan Bros Coffee, Longplay HiFi, and more in San Diego\'s artisan-industrial neighborhood.',
    about: 'Barrio Logan is home to Cafe Moto, one of San Diego\'s most storied independent roasters operating continuously since 1990. Talitha, Ryan Bros, Provecho! Coffee Co., and Longplay HiFi round out a scene rooted in the neighborhood\'s artisan-industrial character. A short drive from downtown but a world apart in atmosphere.'
  },
  {
    id: 'vista',
    name: 'Vista',
    metaTitle: 'Best Coffee in Vista, San Diego | Roasters & Cafes',
    metaDescription: 'Explore specialty coffee in Vista, CA - James Coffee Co., Ascend Coffee Roasters, Cosmic Bloom Coffee, Vigilante Coffee, and more in inland North County.',
    about: 'Vista\'s specialty coffee scene is small but growing, with James Coffee, Ascend, Cosmic Bloom, and Vigilante all operating in the inland North County city. Each brings a distinct identity, and you\'re unlikely to encounter a tourist crowd. A genuine neighborhood coffee experience.'
  },
  {
    id: 'normal-heights',
    name: 'Normal Heights',
    metaTitle: 'Best Coffee in Normal Heights, San Diego | Roasters & Cafes',
    metaDescription: 'Browse specialty coffee in Normal Heights, San Diego - Dark Horse Coffee, Parabola Coffee Roasting, Lestat\'s, and more just north of North Park.',
    about: 'Normal Heights runs quiet, just north of North Park, with a roaster-focused lineup anchored by Dark Horse and Parabola Coffee Roasting Co. Lestat\'s has two locations here, doing double duty as late-night community space and daytime cafe. Worth the slight detour off the main North Park circuit.'
  }
];

window.NEIGHBORHOOD_MAP = {};
window.NEIGHBORHOODS.forEach(function(n) { window.NEIGHBORHOOD_MAP[n.id] = n; });
