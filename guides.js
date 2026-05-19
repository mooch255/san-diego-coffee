// guides.js
// Neighborhood and specialty coffee guides for sandiegocoffee.co
//
// HOW TO EDIT:
// 1. Update the locations[] array - pick your spots, write your blurbs.
// 2. Update locationCount to match the final number of entries.
// 3. Update the about{} section with your own editorial copy.
// 4. Drop your hero image at /images/guides/north-park-hero.jpg

window.GUIDES = [
  {
    // ── Identifiers ───────────────────────────────────────────────────
    id: 'north-park',
    type: 'neighborhood',

    // ── Collection card fields ────────────────────────────────────────
    title: 'Best Coffee in North Park',
    displayTitle: 'The North Park Coffee Guide',
    subtitle: "San Diego's Densest Coffee Neighborhood",
    neighborhood: 'North Park',
    publishedDate: '2026-04-24',
    updatedDate: '2026-04-27',
    heroImage: '/images/guides/north-park-hero.jpg',
    cardImage: '/images/guides/north-park-hero.jpg',
    excerpt: "North Park packs more specialty roasters per block than any other San Diego neighborhood. Here are the standout spots and what each one does best.",
    locationCount: 8,

    // ── SEO fields ───────────────────────────────────────────────────
    metaTitle: 'Best Coffee in North Park, San Diego | Neighborhood Guide',
    metaDescription: 'The definitive guide to specialty coffee in North Park, San Diego. Must-visit roasters and cafes with an interactive map, editorial picks, and what to order.',
    metaKeywords: 'North Park coffee, San Diego specialty coffee, North Park roasters, best coffee 30th street, North Park cafes',
    canonicalUrl: 'https://sandiegocoffee.co/guides/north-park',
    ogImage: '/images/guides/north-park-hero.jpg',

    // ── About section ─────────────────────────────────────────────────
    about: {
      intro: "San Diego's densest coffee neighborhood - an indie roaster cluster anchored by 30th Street, each spot with its own distinct identity.",
      howToNavigate: "Dark Horse, Caffè Calabria, and Communal sit on 30th St. Coffee & Tea Collective (El Cajon Blvd), Genteel (University Ave), Inspired (Hamilton St), and Little While (Adams Ave) are a short walk off the main strip.",
      bestTimeToVisit: "Weekdays before 9 AM for the most relaxed experience. Weekend mornings get busy - especially at Lovesong and Dark Horse.",
      parking: "Metered on 30th St and North Park Way. Side streets west of 30th if those are full."
    },

    // ── Quick Stats (rendered as pill row above split) ────────────────
    quickStats: {
      totalPicks: 8,
      roasters: 7,
      cafes: 1,
      neighborhood: '30th Street core',
      vibe: 'Roaster-heavy'
    },

    // ── FAQ (renders as accordion + FAQPage JSON-LD) ──────────────────
    faq: [
      {
        q: "Which spots favor light roast vs. dark roast?",
        a: "Light and origin-forward: Inspired, Genteel, Little While, and Coffee & Tea Collective all run rotating single-origin programs with a lighter touch - expect fruit-forward, bright cups. Lovesong is in the same territory: medium to light, clean. Dark Horse has the most range on the menu; ask what's on single-origin if you want something lighter, or default to their drip for a more classic cup. Caffè Calabria is the exception - their Italian-style program is intentionally dark and full-bodied, and that's a feature, not a bug."
      },
      {
        q: "Which spots are best for working from? (wifi, seating, vibe)",
        a: "Genteel is the strongest pick - rustic-industrial space with wifi, indoor and outdoor seating, and hours until 4 PM. Little While is quieter and well-suited to focused work. Communal's back patio on 30th is the most comfortable extended outdoor option on the strip, with reliable wifi. Coffee & Tea Collective has an unhurried pace that suits long visits. Skip Lovesong for working - the space is designed for an experience, not a three-hour laptop session."
      },
      {
        q: "What's open late? What if I need coffee after 3 PM?",
        a: "Caffè Calabria is your answer - open until 10 PM Wednesday through Sunday (2:30 PM Monday and Tuesday). Every other spot on this list closes between 2 PM and 4 PM. If you're planning an afternoon or evening visit, Calabria is the only real option in this neighborhood and, unusually for a coffee roaster, also serves food and wood-fired pizza in the evenings."
      },
      {
        q: "Where should I take someone who's new to specialty coffee?",
        a: "Start at Caffè Calabria - the Italian espresso tradition is familiar enough for anyone used to standard coffee, the food takes the pressure off, and longer evening hours remove the rush. If they're curious about the third-wave side, take them to Genteel next: the rotating single-origin program is approachable, the space is comfortable, and the staff are used to explaining what's on the bar. Lovesong works well for anyone who responds to aesthetics - beautiful space, matcha on the menu alongside espresso, easy entry point."
      },
      {
        q: "Where can I buy bags of beans to take home?",
        a: "Most spots here sell whole bean. Coffee & Tea Collective roasts on-site and tends to have the freshest, most frequently rotating selection - ask what came off the roaster that week. Genteel and Inspired both sell their own roasts and change them seasonally. Dark Horse has the widest variety across roast profiles. Lovesong's market section carries beans plus brewing gear and is worth browsing even if you're not buying. Caffè Calabria sells their Italian-style roast, which makes a good gift if you know someone who drinks dark."
      }
    ],

    // ── Map config ────────────────────────────────────────────────────
    map: {
      center: { lat: 32.751, lng: -117.131 },
      zoom: 15
    },

    // ── Featured locations ────────────────────────────────────────────
    // Edit this list: write your own highlightPhrase, blurb, and mustOrder.
    locations: [
      {
        rank: 1,
        locationId: 'loc_090',
        highlightPhrase: 'Light roast, origin-forward',
        blurb: "Genteel Coffee Roasters is a micro-roaster and cafe on University Avenue, founded by Justin Esselstrom in 2016. The roasting program is light and fruit-forward, with a daily driver roast on espresso plus a rotating single origin that's often the most interesting cup in the neighborhood. The rustic-industrial space - indoor and outdoor seating - is a quiet favorite for working.",
        mustOrder: 'Rotating single-origin espresso or pour-over',
        localInsight: "Ask what just came off the roaster - Justin rotates seasonally and the lineup changes more than the menu suggests.",
        whatWeLove: [
          'Light, fruit-forward roasting program',
          'Rotating single origins worth coming back for',
          'Indoor + outdoor seating made for laptop sessions'
        ],
        bestFor: ['Roaster', 'Light Roast', 'Work-Friendly'],
        lat: 32.7482403,
        lng: -117.1355359
      },
      {
        rank: 2,
        locationId: 'loc_087',
        highlightPhrase: 'Detail-obsessed and brand new',
        blurb: "Little While opened on Adams Ave in 2025, just over the University Heights border but firmly part of the North Park coffee universe. The focus is on details - single-origin espresso, slow-bar pour-overs, and a small but precise menu. They roast their own beans and run a tight, considered program. Newer than most picks here, and worth visiting before everyone else figures it out.",
        mustOrder: 'Slow-bar pour-over, single-origin espresso, or one of their house pastries',
        localInsight: "The slow bar is the move - order one of their pour-overs and let the barista walk you through the coffee while it brews.",
        whatWeLove: [
          'Slow-bar pour-over program done with care',
          'Single-origin espresso option, not just a daily driver',
          'Quiet, considered space - not a bustling cafe'
        ],
        bestFor: ['Roaster', 'Pour Over', 'Pastries'],
        lat: 32.7627141,
        lng: -117.1297039
      },
      {
        rank: 3,
        locationId: 'loc_080',
        highlightPhrase: 'The production powerhouse',
        blurb: "Dark Horse Coffee Roasters runs one of San Diego's most recognizable operations, with multiple locations across the county and a production roastery backing them up. Their North Park spot on 30th is a reliable choice for well-crafted espresso drinks and beans to take home, with a quality-focused approach that has kept them relevant for years.",
        mustOrder: 'Drip coffee or a well-pulled espresso drink',
        localInsight: "If you're a dark-roast skeptic, ask about their lighter single-origin offerings - they have more range than the menu suggests.",
        whatWeLove: [
          'Reliable across every drink on the menu',
          'Roastery-backed quality control you can taste',
          'Wide bean selection covering light to dark'
        ],
        bestFor: ['Espresso', 'Multiple Locations', 'Roaster'],
        lat: 32.7471805,
        lng: -117.1304319
      },
      {
        rank: 4,
        locationId: 'loc_104',
        highlightPhrase: 'The Italian institution',
        blurb: "Caffè Calabria has anchored North Park since 1991, long before the neighborhood became a coffee destination. Their Italian-style dark roast and full-service cafe - espresso, food, wood-fired pizza on weekend evenings - make this a different experience from the third-wave shops on this list. Sometimes the right answer is the place that's been doing it for 30+ years.",
        mustOrder: 'Cappuccino or espresso, Italian-style',
        localInsight: "If you've only had third-wave coffee, treat this as the contrast. Order a cappuccino and pair it with whatever's coming out of the kitchen - Calabria does food, and it shows.",
        whatWeLove: [
          'North Park institution since 1991',
          'Italian-style roasting program with serious depth',
          'Full cafe - espresso plus actual food and dinner hours'
        ],
        bestFor: ['Established Roaster', 'Italian Style', 'Dark Roast'],
        lat: 32.7492135,
        lng: -117.1299926
      },
      {
        rank: 5,
        locationId: 'loc_201',
        highlightPhrase: 'Design-forward, market-included',
        blurb: "Lovesong Coffee + Market arrived on North Park Way and immediately drew a crowd. The space is design-forward and photogenic, with a curated market element that sets it apart from a standard cafe. They're also quietly stepping into roasting with small-batch releases, and the same dialed-in approach shows up in the drink menu - known for matcha but with thoughtful single-origin espresso too.",
        mustOrder: 'Their current featured espresso, a matcha, or a pour-over',
        localInsight: "The market section is half the reason to stop in - they carry beans, brewing gear, and a tight selection of pantry items you won't find at a normal cafe.",
        whatWeLove: [
          'Coffee + retail combo done thoughtfully',
          'Design-forward space worth the photo',
          'Matcha program is a genuine standout'
        ],
        bestFor: ['Aesthetics', 'Market', 'Matcha'],
        lat: 32.7475305,
        lng: -117.1294856
      },
      {
        rank: 6,
        locationId: 'loc_086',
        highlightPhrase: 'Craft Focus - Roasts On-Site',
        blurb: "Coffee & Tea Collective stands out because they roast right here in North Park on El Cajon Blvd - a full micro-batch roastery and cafe under one roof. You can often smell the roast in progress. The space has a laid-back vibe and the quality is consistently high across their filter and espresso menus.",
        mustOrder: 'Whatever single-origin filter coffee is on the bar that day',
        localInsight: "They roast Tuesday and Thursday mornings - time your visit right and you'll smell it the moment you walk in. Ask the barista what came off the roaster that week.",
        whatWeLove: [
          'On-site roastery - fresher coffee than almost anywhere',
          'Filter program rotates often, always something new',
          'Unhurried, neighborhood-cafe feel'
        ],
        bestFor: ['On-Site Roaster', 'Micro-Batch', 'Cafe Seating'],
        lat: 32.755089,
        lng: -117.130994
      },
      {
        rank: 7,
        locationId: 'loc_121',
        highlightPhrase: 'Micro-batch with purpose',
        blurb: "Inspired Coffee Roasters operates out of Hamilton Street just off the main corridor - owner-operated, community-first, and quietly running one of the most thoughtful coffee programs in the neighborhood. Their micro-batch approach means smaller production runs and more attention to each coffee, with a medium to medium-light roast profile and a rotating selection of limited-release coffees.",
        mustOrder: 'Current single-origin offering',
        localInsight: "Worth the small detour off 30th - they're tucked on Hamilton, so you have to know to look. Most visitors here are intentional, which makes for a calmer experience.",
        whatWeLove: [
          'Micro-batch attention to every coffee',
          'Off-the-main-strip means less crowded',
          'Rotating limited-release lineup keeps it interesting'
        ],
        bestFor: ['Micro-Batch', 'Roaster', 'Under the Radar'],
        lat: 32.7569503,
        lng: -117.1366232
      },
      {
        rank: 8,
        locationId: 'loc_139',
        highlightPhrase: 'The welcoming neighborhood cafe',
        blurb: "Communal Coffee on University Avenue is exactly what its name suggests - a community hub. One of the most established cafe spaces in North Park, the atmosphere is warm and unhurried. They're cafe-first rather than a roastery, which makes them a different fit on this list: come here for the space, the seating, and the consistency, not for a deep dive into roast profiles.",
        mustOrder: 'Flat white or a specialty latte',
        localInsight: "One of the earlier-opening spots on this list - doors at 6:30 AM if you need coffee before the rest of the neighborhood wakes up.",
        whatWeLove: [
          'Genuine neighborhood-hangout atmosphere',
          'Reliable flat white and drip program',
          'Comfortable for both work sessions and catch-ups'
        ],
        bestFor: ['Cafe Seating', 'Community Vibe', 'Work-Friendly'],
        lat: 32.7482968,
        lng: -117.1392238
      }
    ]
  },
  {
    // ── Identifiers ───────────────────────────────────────────────────
    id: 'downtown-barrio-logan-bankers-hill',
    type: 'neighborhood',

    // ── Collection card fields ────────────────────────────────────────
    title: 'Best Coffee in Downtown, Barrio Logan, Bankers Hill & Little Italy',
    displayTitle: "San Diego's Urban Core Coffee Guide",
    subtitle: "San Diego's Urban Core, Cup by Cup",
    neighborhood: 'Downtown · Barrio Logan · Bankers Hill · Little Italy',
    publishedDate: '2026-05-14',
    updatedDate: '2026-05-14',
    heroImage: '/images/guides/downtown-barrio-logan-bankers-hill-hero.jpg',
    heroImagePosition: 'center 40%',
    cardImage: '/images/guides/downtown-barrio-logan-bankers-hill-hero.jpg',
    excerpt: "From a 1931 solar-powered roaster in Barrio Logan to a Japanese listening lounge and a Fifth Ave minimalist favorite. Eight standout spots threading San Diego's urban core.",
    locationCount: 8,

    // ── SEO fields ───────────────────────────────────────────────────
    metaTitle: 'Best Coffee in Downtown, Barrio Logan, Bankers Hill & Little Italy, San Diego | Neighborhood Guide',
    metaDescription: 'The definitive guide to specialty coffee in Downtown, Barrio Logan, Bankers Hill, and Little Italy. Eight standout roasters and cafes with an interactive map, editorial picks, and what to order.',
    metaKeywords: 'Downtown San Diego coffee, Barrio Logan coffee, Bankers Hill coffee, Little Italy coffee, San Diego specialty roasters, best coffee downtown San Diego',
    canonicalUrl: 'https://sandiegocoffee.co/guides/downtown-barrio-logan-bankers-hill',
    ogImage: '/images/guides/downtown-barrio-logan-bankers-hill-hero.jpg',

    // ── About section ─────────────────────────────────────────────────
    about: {
      intro: "San Diego's most varied coffee corridor. Eight standout specialty roasters and cafes threaded across Downtown, Barrio Logan, Bankers Hill, and Little Italy. A 1931 solar-powered roaster, a Japanese listening lounge, and a Mexican-origin micro-roaster, all within a 10-minute drive.",
      howToNavigate: "Three clusters within a 10-minute drive. Bankers Hill: Mnemonic and Talitha sit a block apart on Fifth Ave. Downtown core: Goldchild on Broadway, Rikka Fika a few minutes east on 13th St, and Bird Rock at the western edge on Kettner Blvd in Little Italy. Barrio Logan: Provecho on Julian, Longplay HiFi on Imperial, and Cafe Moto further south on National. Cluster them together for a single Barrio Logan loop.",
      bestTimeToVisit: "Weekday mornings before 9 AM for parking and pace. Several spots are closed Mondays (Mnemonic, Rikka Fika), and Longplay HiFi doesn't open until 10 AM with an intentionally slow service model. Not a quick-stop cafe.",
      parking: "Metered in Downtown and parts of Little Italy (paid lots near Bird Rock). Free street parking is generally easy in Barrio Logan. Bankers Hill has metered street parking on Fifth Ave with mostly-free side streets."
    },

    // ── Quick Stats (rendered as pill row above split) ────────────────
    quickStats: {
      totalPicks: 8,
      roasters: 6,
      cafes: 2,
      neighborhood: 'Urban core',
      vibe: 'Eclectic · roasters + listening lounges'
    },

    // ── FAQ (renders as accordion + FAQPage JSON-LD) ──────────────────
    faq: [
      {
        q: "How do I hit several of these in one day?",
        a: "Cluster by neighborhood. Bankers Hill (Mnemonic + Talitha) sits a block apart on Fifth Avenue, an easy back-to-back. From there it's a 10-minute drive south to the Downtown core for Goldchild on Broadway and Rikka Fika on 13th. Bird Rock in Little Italy is the western anchor; pair it with a Little Italy walk. Barrio Logan is its own loop: Provecho on Julian, Longplay HiFi on Imperial, and Cafe Moto further south on National. Doing all eight in a day is doable but exhausting. Three to four spots is a more realistic specialty-coffee crawl."
      },
      {
        q: "Which spots roast on-site vs. source beans from elsewhere?",
        a: "Roasting in-house: Provecho, Cafe Moto, and Goldchild all roast on-site or directly behind the cafe. Bird Rock's main production is on Morena Blvd but the program is theirs, and Talitha roasts in Barrio Logan with Bankers Hill as a cafe outpost. Rikka Fika is newly roasting light at small scale as of 2026. Mnemonic is cafe-first; they pull from outside roasters, not their own. Longplay HiFi serves Provecho coffee, so the bean program there is Provecho's."
      },
      {
        q: "Where can I work from? Which have wifi and seating?",
        a: "Provecho and Goldchild both work well for work sessions: wifi, comfortable seating, and an unhurried pace. Mnemonic is good if you can work in a quieter, design-forward space. Talitha and Bird Rock both have wifi and seating but get busier than the cafes that lean work-friendly. Skip Longplay HiFi for laptop work entirely. The space is designed for being present, not productive. Cafe Moto has wifi but the production-roaster vibe makes it less of a default work spot."
      },
      {
        q: "What's open late or on weekends?",
        a: "Most spots here close between 2 and 4 PM, so this isn't the neighborhood for an afternoon crawl. Longplay HiFi is the exception; they open at 10 AM and stay open into the evening, with a bar program that extends the visit past coffee hours. Closed Mondays: Mnemonic and Rikka Fika. Weekends are reliably open across the list with similar hours to weekdays, but plan around the early-afternoon close at Cafe Moto, Talitha, and a few others."
      },
      {
        q: "Where should I take someone new to specialty coffee?",
        a: "Start at Provecho. The baristas are dialed in, the menu is approachable, and the Mexican-origin focus makes the conversation easier than 'this is from Ethiopia and tastes like blueberries.' From there, Goldchild on Broadway is a good second stop for someone curious about what micro-batch roasting means in practice. If they're more interested in the experience than the bean, take them straight to Longplay HiFi; the listening lounge does the work of selling them on slowing down with a cup. Rikka Fika is the move for matcha lovers or anyone who wants a slower, quieter cup. Mnemonic skews funkier and more playful, a good pick when you want the menu itself to be part of the conversation."
      }
    ],

    // ── Map config ────────────────────────────────────────────────────
    map: {
      center: { lat: 32.714, lng: -117.154 },
      zoom: 13
    },

    // ── Featured locations ────────────────────────────────────────────
    locations: [
      {
        rank: 1,
        locationId: 'loc_055',
        highlightPhrase: 'Mexican origins, Barrio Logan flagship',
        blurb: "Provecho Coffee Co. anchors Barrio Logan's specialty scene from a sunlit cafe on Julian Avenue. Founded in 2022, the team sources beans from around the world but consistently highlights Mexican producers, a sourcing philosophy that ties the cup back to the neighborhood. The baristas are dialed in, the espresso program is precise, and the space is one of the most genuinely warm in the urban core.",
        mustOrder: 'Espresso on a Mexican single origin, or a piloncillo latte',
        localInsight: "Their Mexican-origin lineup rotates. If you've never had Chiapas or Oaxaca beans pulled by people who care, this is the cup to ask about.",
        whatWeLove: [
          "Mexican-origin focus you won't find elsewhere in the city",
          'Barista skill that backs up the bean selection',
          'Dog-friendly, work-friendly Logan Heights flagship'
        ],
        bestFor: ['Roaster', 'Mexican Origins', 'Barista Standout'],
        lat: 32.7020284,
        lng: -117.1417158
      },
      {
        rank: 2,
        locationId: 'loc_138',
        highlightPhrase: 'Intentional sourcing, minimalist cafe',
        blurb: "Rikka Fika built its reputation as the city's go-to matcha cafe, with a rotating multi-roaster bar that pulled from domestic and international roasters most San Diego shops would never touch. As of 2026, they've added their own small-scale light-roasting program, a quiet pivot that's already changing the conversation. The 13th Street cafe stays comfortable and unhurried.",
        mustOrder: 'Matcha latte, a pour-over of their current light roast, or whatever guest roaster is on bar',
        localInsight: "Closed Mondays and Tuesdays, so plan ahead. If you want to taste their roasting evolution, ask which beans came off the roaster that week.",
        whatWeLove: [
          'Matcha program that built their reputation',
          'Curated guest-roaster bar from out-of-town producers',
          'Newly-launched light-roast program worth tracking'
        ],
        bestFor: ['Matcha', 'Multi-Roaster', 'Light Roast'],
        lat: 32.7140502,
        lng: -117.1530181
      },
      {
        rank: 3,
        locationId: 'loc_137',
        highlightPhrase: 'Curated space, creative menu',
        blurb: "Mnemonic Coffee on Fifth Avenue is the most design-forward cafe on this list: clean lines, restrained palette, and a menu that approaches each drink as a small experiment. Opened in 2023, the team takes a more presentation-conscious approach than the average specialty shop, and the Bankers Hill location has quietly become a favorite for anyone who pays attention to how their coffee is built.",
        mustOrder: 'Whatever seasonal signature drink is on the menu, or a precisely-pulled espresso',
        localInsight: "Closed Mondays. The seasonal menu rotates more often than you'd guess, so anything labeled 'experimental' is usually the move.",
        whatWeLove: [
          'Minimalist design that takes itself seriously',
          'Experimental drink menu, not just a fixed list',
          'Dog-friendly Bankers Hill staple'
        ],
        bestFor: ['Cafe', 'Design-Forward', 'Experimental'],
        lat: 32.732609,
        lng: -117.1606254
      },
      {
        rank: 4,
        locationId: 'loc_061',
        highlightPhrase: 'Downtown micro-roaster on Broadway',
        blurb: "Goldchild opened on Broadway in 2024 and made an immediate impression. They roast in-house on a small scale and have appeared on local 'best specialty coffee' lists alongside names like Mostra, Bird Rock, and Torque despite being one of the youngest roasters in town. The Downtown location keeps things tight: a focused menu and a small, well-run cafe.",
        mustOrder: 'A single-origin espresso or pour-over from their current rotation',
        localInsight: "They're newer than most of the city's named roasters, so the lineup changes fast. Ask what came off the roaster recently; there's usually something they're excited about.",
        whatWeLove: [
          'In-house roasting on a Downtown footprint',
          "Already mentioned alongside the city's established names",
          'Small, focused menu done well'
        ],
        bestFor: ['Roaster', 'Micro-Batch', 'Downtown'],
        lat: 32.7159267,
        lng: -117.1624203
      },
      {
        rank: 5,
        locationId: 'loc_046',
        highlightPhrase: 'Cornerstone of San Diego specialty coffee',
        blurb: "Cafe Moto is one of San Diego's longest-running specialty roasters, in the family since the late 1960s and officially launched in 1990. The Barrio Logan roastery runs on a 1931 Jabez Burns roaster powered entirely by solar panels, and every bean is Fair Trade, organic, and kosher certified. The National Avenue cafe is where you taste the history, alongside the institutional consistency that comes with 35+ years of roasting.",
        mustOrder: 'Drip coffee or a classic espresso drink. The certified-organic beans are the story',
        localInsight: "Worth a tour-style stop even if you don't buy a drink. The solar-powered 1931 Jabez Burns roaster on-site is one of the more remarkable pieces of equipment in any roastery in the country.",
        whatWeLove: [
          'Solar-powered 1931 roaster, the real deal',
          'Fair Trade, organic, and kosher across the entire program',
          '35+ years of San Diego coffee history under one roof'
        ],
        bestFor: ['Established Roaster', 'Organic', 'Solar Powered'],
        lat: 32.6956629,
        lng: -117.1377639
      },
      {
        rank: 6,
        locationId: 'loc_170',
        highlightPhrase: 'Japanese listening lounge meets pour-over',
        blurb: "Longplay HiFi is unlike anything else on this list: a Japanese-inspired cafe, listening lounge, and bar where the pace is deliberately, intentionally slow. Provecho coffee is currently offered as pour-over alongside a few specialty drinks, but the real experience is the music: a curated audio system, vinyl, and a room designed for being present, not productive. Don't bring a laptop.",
        mustOrder: 'Provecho pour-over and whichever record is queued up',
        localInsight: "The 10 AM opening time and no-rush philosophy make this an afternoon/evening visit, not a morning errand. The bar opens later in the day for cocktails. Make a night of it.",
        whatWeLove: [
          "Listening-lounge format you won't find elsewhere in SD",
          'Provecho pour-over as the coffee anchor',
          'Intentional pace, no laptops, no rush'
        ],
        bestFor: ['Listening Lounge', 'Pour Over', 'Date Spot'],
        lat: 32.7061999,
        lng: -117.1389758
      },
      {
        rank: 7,
        locationId: 'loc_176',
        highlightPhrase: 'Award-winning roaster on Kettner',
        blurb: "Bird Rock Coffee Roasters' Little Italy outpost on Kettner Boulevard brings the same direct-trade beans and award-winning program that put them on the national map. Founded in 2002, Bird Rock won Roast Magazine's Micro-Roaster of the Year in 2012 and has racked up Good Food Awards across the years. The Little Italy location pairs the roasting program with a comfortable cafe footprint near the heart of the neighborhood.",
        mustOrder: 'Single-origin pour-over from their direct-trade lineup',
        localInsight: "Bird Rock has 11 locations across the county. This Little Italy spot is one of the most foot-traffic-friendly. Pair it with a Little Italy walk if you're already in the neighborhood.",
        whatWeLove: [
          'Roast Magazine Micro-Roaster of the Year (2012)',
          'Long-running direct-trade program',
          'Comfortable Little Italy cafe with full pour-over service'
        ],
        bestFor: ['Roaster', 'Direct Trade', 'Award Winner'],
        lat: 32.7291,
        lng: -117.1697
      },
      {
        rank: 8,
        locationId: 'loc_173',
        highlightPhrase: 'Mission-driven roaster on Fifth Ave',
        blurb: "Talitha Coffee Roasters is a Barrio Logan-based, mission-driven roaster with four San Diego cafes. The Bankers Hill outpost on Fifth Avenue is the most centrally located way to taste their program. Three-time bronze medalists at the Golden Bean North America competition, Talitha emphasizes transparency and quality across espresso, pour-over, and cold brew. The Bankers Hill cafe is comfortable and consistent.",
        mustOrder: 'Cold brew or a single-origin pour-over',
        localInsight: "Closes earlier than most spots on this list (2 PM most days). If you want to hit Mnemonic and Talitha on the same Fifth Ave walk, do Talitha first.",
        whatWeLove: [
          'Three-time Golden Bean bronze medalist',
          'Mission-driven roasting with transparency focus',
          'Easy walk from Mnemonic for back-to-back tasting'
        ],
        bestFor: ['Roaster', 'Mission-Driven', 'Bankers Hill'],
        lat: 32.7315886,
        lng: -117.1610298
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────
  // Reviewer guide: @sdcoffeeguide review index
  // Lat/lng resolve from locations.js via locationId (no inline coords).
  // Ratings live in sdcoffeeguide.js (window.SDCG_RATINGS).
  // ─────────────────────────────────────────────────────────────────────
  {
    id: 'sdcoffeeguide',
    type: 'reviewer',
    reviewer: {
      handle: '@sdcoffeeguide',
      displayName: 'SDCoffeeGuide',
      instagramUrl: 'https://www.instagram.com/sdcoffeeguide/'
    },

    title: 'San Diego Coffee Shops Reviewed by @sdcoffeeguide',
    displayTitle: "Tyler & Margarita's San Diego Picks",
    subtitle: "Every cafe @sdcoffeeguide has reviewed, scored drink-by-drink",
    neighborhood: 'By @sdcoffeeguide',
    publishedDate: '2026-05-18',
    updatedDate: '2026-05-18',
    heroImage: '/images/guides/sdcoffeeguide-hero.jpg',  // mobile + fallback
    heroImages: [
      '/images/guides/sdcoffeeguide-hero-1.jpg',  // World of Coffee SD 2026
      '/images/guides/sdcoffeeguide-hero-2.jpg',  // Yipao Coffee (Pacific Beach)
      '/images/guides/sdcoffeeguide-hero-3.jpg'   // Coffee Klatch
    ],
    cardImage: '/images/guides/sdcoffeeguide-hero.jpg',
    excerpt: "Every San Diego coffee shop the duo has reviewed on Instagram, scored drink-by-drink and gathered in one place.",
    locationCount: 15,

    metaTitle: 'Coffee Shops Reviewed by @sdcoffeeguide | San Diego',
    metaDescription: "Every San Diego coffee shop reviewed by @sdcoffeeguide, scored on cortado and signature drink on a 1-10 scale. Sortable, mapped.",
    metaKeywords: 'sdcoffeeguide, San Diego coffee reviews, cortado ratings, Instagram coffee reviewer, San Diego coffee guide',
    canonicalUrl: 'https://sandiegocoffee.co/guides/sdcoffeeguide',
    ogImage: '/images/guides/sdcoffeeguide-og.jpg',

    about: {
      intro: "@sdcoffeeguide is Tyler and Margarita, a San Diego coffee-reviewing duo who visit one local cafe each week to spotlight the places making truly exceptional coffee. Their weekly reviews have built a following around honest scores, drink-by-drink notes, and clear respect for the people behind every bar. This index gathers every shop they've reviewed in one place, sortable and mapped, so you can plan your next coffee run by score, drink, or distance.",
      methodology: "The cortado is the anchor rating: a one-bite test of how well a cafe handles espresso and milk in perfect balance. It's where barista skill shows up most clearly, and where small differences in extraction and steaming become obvious. The signature drink rating captures whatever each cafe is known for, the seasonal or signature build the bar takes the most pride in. Both are scored 1-10 with one decimal, and reflect Tyler and Margarita's own reviews posted on Instagram.",
      howToUse: "Sort by cortado for the cleanest espresso-and-milk craft, or by signature drink to find the most creative builds in the city. Use 'Nearest to me' when you're already out and want the closest pick. Tap any card or pin to open the original Instagram review with photos and full notes, or click through to the location's full details page for hours, address, and everything else that makes the spot worth a trip."
    },

    quickStats: {
      totalPicks: 15,
      neighborhood: 'San Diego County',
      vibe: 'Reviewer Picks'
    },

    map: { center: { lat: 32.85, lng: -117.18 }, zoom: 10 },

    locations: [
      { locationId: 'loc_177' }, { locationId: 'loc_028' }, { locationId: 'loc_212' },
      { locationId: 'loc_002' }, { locationId: 'loc_006' }, { locationId: 'loc_137' },
      { locationId: 'loc_090' }, { locationId: 'loc_188' }, { locationId: 'loc_093' },
      { locationId: 'loc_019' }, { locationId: 'loc_168' }, { locationId: 'loc_055' },
      { locationId: 'loc_040' }, { locationId: 'loc_118' }, { locationId: 'loc_103' }
    ]
  }
];

// Build quick lookup map for guide.html
window.GUIDE_MAP = {};
window.GUIDES.forEach(function(g) { window.GUIDE_MAP[g.id] = g; });
