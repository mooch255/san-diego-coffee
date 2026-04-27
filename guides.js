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
    canonicalUrl: 'https://sandiegocoffee.co/guide.html?id=north-park',
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
  }
];

// Build quick lookup map for guide.html
window.GUIDE_MAP = {};
window.GUIDES.forEach(function(g) { window.GUIDE_MAP[g.id] = g; });
