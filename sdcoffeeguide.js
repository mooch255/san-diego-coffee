// Hand-maintained @sdcoffeeguide drink ratings + review excerpts, keyed by location id.
// Scale: 1.0-10.0 (one decimal). Omit a field if not rated.
// reviewExcerpt: short 3-4 sentence summary of the Instagram review caption. Optional.
// To add a new spot: append a new key with the loc_XXX id and ratings.
window.SDCG_RATINGS = {
  'loc_201': {
    cortadoRating: 8.6,
    signatureDrinkName: 'Iced Jack Johnson Latte',
    signatureDrinkRating: 8.7,
    reviewExcerpt: "This design-forward North Park cafe opened in 2024 and is quietly stepping into roasting, with small-batch single origins that carry the same clean, dialed-in approach as the drink menu. They're best known for their matcha, but you'll also find rotating single-origin offerings on espresso. The beans aren't online yet, so a visit to the shop is the only way to take a bag home. A polished, thoughtful spot that punches above its low-key vibe."
  },
  'loc_225': {
    cortadoRating: 8.7,
    signatureDrinkName: 'Iced Bon Bon Latte',
    signatureDrinkRating: 8.8,
    reviewExcerpt: "Tucked on Girard Avenue in the heart of La Jolla Village, Cala pairs a deep prepared-food menu of salads, smoothies, flatbreads, and paninis with a coffee program that quietly outshines the simple menu board. Every brew method pours Torque Coffee, and manager Damon brings serious international coffee experience to the bar. Order a pour-over and you can pick your dripper, or even ask for it iced. A genuine specialty stop hiding inside an all-day cafe."
  },
  'loc_177': {
    cortadoRating: 8.9,
    signatureDrinkName: 'Iced Pistachio Latte',
    signatureDrinkRating: 8.4,
    reviewExcerpt: "Bird Rock has been part of San Diego's specialty coffee scene since 2006, when they introduced direct-trade, origin-sourced coffee to the city. This is the only one of their four locations with a Pacific view, sitting on Carmel Valley Road with a 1,000 sq ft patio looking over Los Penasquitos Lagoon. Inside you'll find a Slayer SteamX espresso machine, a MOD BAR pour-over system, and a BKON brewer. The obvious before-or-after stop if you're heading to Torrey Pines State Reserve or the beach."
  },
  'loc_028': {
    cortadoRating: 8.7,
    signatureDrinkName: 'Iced Honey Freddo',
    signatureDrinkRating: 8.3,
    reviewExcerpt: "Founder Chris O'Brien started in coffee at 16, spent years pedaling a tricked-out coffee tricycle around San Diego, and now roasts on a five-kilo machine at his Ocean Beach second storefront. The shop also doubles as the production home for Chuck's Roast, the new venture from Bird Rock founder Chuck Patton, who mentored O'Brien years ago. Two San Diego coffee legacies roasting side by side, with a backyard patio that nails the OB laid-back energy and a bright interior beloved by remote workers."
  },
  'loc_212': {
    cortadoRating: 8.5,
    signatureDrinkName: 'Iced Salted Honey Vanilla Latte',
    signatureDrinkRating: 7.9,
    reviewExcerpt: "On the 101 since 2011, Coffee Coffee was originally opened by the crew behind Surfy Surfy to keep the block in community hands. In 2023 the Harth sisters from Surfhouse Boutique Hotel across the street took over with co-owner Jordan Ward, rebranding while keeping the surf-town soul intact. The generous patio and big windows make it a natural post-Beacon's Beach coffee stop. Don't miss the 'Welcome to Leucadia' mural on the side of the building."
  },
  'loc_002': {
    cortadoRating: 9.0,
    signatureDrinkName: 'Iced Rosemary Latte',
    signatureDrinkRating: 8.1,
    reviewExcerpt: "Founder Elliot Reinecke started roasting in a Cardiff shed behind his home with an $8,000 eBay roaster, and grew Steady State into an award-winning small-batch roastery. Accolades include multiple top finishes at national roasting competitions and several Coffee Review scores above 90. The space is bright, open, and the kind of working cafe where the barista learns your name."
  },
  'loc_006': {
    cortadoRating: 9.3,
    signatureDrinkName: 'The Perfect Pear',
    signatureDrinkRating: 8.6,
    reviewExcerpt: "Jon Runion launched Necessity in 2023 from a small Encinitas alley before moving to a brighter spot on 2nd Street with twin skylights and floor-to-ceiling windows. He roasts his own single origins from Colombia, Costa Rica, and Ethiopia, partnering with farmers on experimental products like IPA co-ferments and nitro-macerated coffees. The menu rotates every six weeks, so each visit can surprise you. The 9.3 cortado is one of the highest scores we've ever given."
  },
  'loc_137': {
    cortadoRating: 8.8,
    signatureDrinkName: 'Iced Gateway Latte',
    signatureDrinkRating: 8.7,
    reviewExcerpt: "Co-owners Gia Giambalvo and Sarah Girdzius opened Mnemonic in September 2023 with 20+ years of combined coffee experience. The space is intentionally 70s-basement inspired, with sit-and-stay energy that feels more like a neighborhood bar than a typical cafe. Alongside coffee they pour a creative tea program and zero-proof mocktails, a rare find in San Diego. One of the most unique cafes in the city, and absolutely worth the trip."
  },
  'loc_090': {
    cortadoRating: 9.1,
    signatureDrinkName: 'Iced Latte w/ Mother Den Syrup',
    signatureDrinkRating: 9.0,
    reviewExcerpt: "Nearly five years on University Ave, Genteel has built its reputation on in-house syrups, a serene thoughtfully crafted space, and unusually friendly baristas. Despite the busy stretch outside, the room itself stays calm and welcoming, with WiFi for working and seating that invites lingering. They're pet-friendly and open 7am to 4pm every day. Parking is easiest on the side streets."
  },
  'loc_188': {
    cortadoRating: 7.4,
    signatureDrinkName: 'Iced Salted Maple Latte',
    signatureDrinkRating: 7.9,
    reviewExcerpt: "Founder Jason Simpson built Camp Coffee around childhood camping memories and a belief that everyone deserves a daily escape. They partner with Bird Rock Coffee Roasters for direct-trade beans, and the Oceanside Pier-adjacent space is built for community, with plenty of seating for working or hanging. The merch is also worth a look. Parking gets tight near the beach, so park a few blocks inland and walk over."
  },
  'loc_093': {
    cortadoRating: 7.8,
    signatureDrinkName: 'Iced Hawaiian Latte',
    signatureDrinkRating: 7.6,
    reviewExcerpt: "A few minutes from La Jolla Cove in La Plaza, Elixir leans into the lifestyle angle: alongside specialty coffee they pour wine, scoop gelato, and stack their counter with pastries. The space is welcoming and relaxed, with both indoor and outdoor seating to soak up the sun. Open 7am to 6pm every day, and there's a second location in Pacific Beach if La Jolla isn't on your route."
  },
  'loc_019': {
    cortadoRating: 8.9,
    signatureDrinkName: 'Iced Campfire Latte',
    signatureDrinkRating: 8.4,
    reviewExcerpt: "Roaster of the Year winners with roots in a 2009 Philippines volunteer build, where founders Beverly Magtanong and Jelynn Malone realized farmers needed fair wages more than charity. Their drinks were developed with Michelin-trained Chef Mike Arquines, including the standout Campfire (essentially a S'mores latte). The Bankers Hill space pairs sage velvet banquettes, marble tables, and floor-to-ceiling windows with an extended lobby area that doubles as laptop space. Outdoor patio too."
  },
  'loc_168': {
    cortadoRating: 7.9,
    signatureDrinkName: 'Churro de mi Corazon',
    signatureDrinkRating: 7.5,
    reviewExcerpt: "Specialty drinks rooted in the owner's Sonora, Mexico heritage and built on the motto 'we won't serve it unless we're proud of it.' The Chula Vista space is built for slow mornings, with free WiFi and outdoor seating to sip in the sun. Open early on weekdays and weekends, an easy go-to for work or weekend coffee runs. Creative recipes that pull from the owner's journey and culture."
  },
  'loc_055': {
    cortadoRating: 9.5,
    signatureDrinkName: 'Iced Piloncillo Latte',
    signatureDrinkRating: 9.6,
    reviewExcerpt: "Latin coffee roaster tucked inside Bread & Salt, a former Weber Bread Factory from the 1950s turned art space. You'll find a giant bread mixer still behind the bar in what was the old mixer room. The team sources directly from Mexican farmers with a focus on spotlighting Mexico's coffee-growing heritage. Plenty of room to sit indoors or out, friendly baristas, and art spaces to wander between cups."
  },
  'loc_040': {
    cortadoRating: 8.9,
    signatureDrinkName: 'Iced Palo Santo Honey Latte',
    signatureDrinkRating: 8.7,
    reviewExcerpt: "A thoughtful, sustainability-minded roaster in City Heights with deep commitment to fair-pay producer relationships and sustainable packaging. The menu is built around create-your-own-adventure customization, so you can craft your drink alongside the barista. Their tagline says it best: coffee that's 'wonderful, radical, equitable, and sustainable.' Eclectic vibes, a passionate team, and clear care for the supply chain."
  },
  'loc_118': {
    cortadoRating: 9.1,
    signatureDrinkName: 'Honey Cinnamon Latte',
    signatureDrinkRating: 9.3,
    reviewExcerpt: "Two Colombian entrepreneurs who've called San Diego home since 2012 roast and serve Colombian beans in this intimate Pacific Beach space. Their roaster sits right behind the bar with bags of green and roasted beans lining the walls, and the chill patio is perfect for an outdoor sip. The espresso here is some of the best in the city. The merch is also worth grabbing."
  },
  'loc_103': {
    cortadoRating: 8.8,
    signatureDrinkName: 'Crumbling Castle',
    signatureDrinkRating: 8.9,
    reviewExcerpt: "Record-shop-meets-cafe in North Park where you can browse vinyl while you sip. The space is artfully curated and welcoming whether you're with friends or flying solo. Their Crumbling Castle is a smoked maple cappuccino, and the baristas are friendly and knowledgeable. Don't be afraid to ask for recommendations."
  },
  'loc_186': {
    cortadoRating: 8.8,
    signatureDrinkName: 'Iced Salted Caramel Latte',
    signatureDrinkRating: 8.9,
    reviewExcerpt: "Women-owned San Diego roaster running a residency inside the Parlor Room at the Granger Hotel on Fifth Avenue downtown. The micro-batch program leans medium roast and fruit-forward, built around clean, approachable balance rather than intensity. The Iced Salted Caramel Latte scores 8.9 and shows off the range, with the cortado holding close behind at 8.8. The Granger lobby setting gives it a quieter, hotel-bar feel that's a refreshing break from the usual cafe energy."
  },
  'loc_089': {
    cortadoRating: 9.0,
    signatureDrinkName: 'Iced Blackberry Vanilla Latte',
    signatureDrinkRating: 9.2,
    reviewExcerpt: "Veteran-owned roaster tucked into the Cedros Avenue design district in Solana Beach since 2017. Micro-batch sourcing with both pour-over and rotating single-origin espresso, so the bar plays equally well for milk-drink and origin-forward drinkers. The Iced Blackberry Vanilla Latte pulls a 9.2, one of the highest signature scores we've given. Dog-friendly patio, food and pastries, and the rest of the Cedros shops are an easy walk away."
  },
  'loc_130': {
    cortadoRating: 8.4,
    signatureDrinkName: 'Iced Peach Cobbler Latte',
    signatureDrinkRating: 8.5,
    reviewExcerpt: "Mission-driven roaster a few steps from the Ocean Beach Pier, roasting in-house on a 10kg Mill City since 2015. Founder sourcing trips run direct-trade through Oaxaca, El Salvador, Guatemala, Costa Rica, Tanzania, Uganda, and Ethiopia. Beyond espresso the menu covers pour overs, teas, and local pastries, with proceeds going to local nonprofits. Sister operation to Sur Coffee Cafe & Roastery if you want a second OB stop."
  },
  'loc_138': {
    cortadoRating: 9.8,
    signatureDrinkName: 'Iced Cafe Cream Top',
    signatureDrinkRating: 9.5,
    reviewExcerpt: "Built its reputation as San Diego's go-to matcha cafe with a rotating multi-roaster bar pulling from domestic and international roasters most local shops would never touch. As of 2026, they've added their own small-scale light-roasting program, a quiet pivot already changing the conversation in the city's coffee scene. The 13th Street downtown space stays comfortable and unhurried, with sit-and-stay energy that rewards a long visit. The 9.8 cortado is the highest score we've ever given."
  },
  'loc_043': {
    cortadoRating: 9.1,
    signatureDrinkName: 'Iced Cafe de Olla Latte',
    signatureDrinkRating: 8.8,
    reviewExcerpt: "Point Loma cafe and roastery with the roasting facility right onsite, led by head roaster Luis, who's well regarded across the San Diego coffee scene. They rotate through multiple single-origin options, so there's always something worth exploring beyond the usual menu. The 9.1 cortado lands near the top of our scores, with the Iced Cafe de Olla Latte close behind at 8.8. A worthwhile stop for origin-curious drinkers."
  },
  'loc_145': {
    cortadoRating: 8.9,
    signatureDrinkName: 'Iced Rose Cardamomma',
    signatureDrinkRating: 8.0,
    reviewExcerpt: "A funky, psychedelic little coffee shop on Niagara Avenue in Ocean Beach, built around a colorful theme and a menu of creative, unexpected drinks. The Iced Rose Cardamomma leans floral and spiced at 8.0, but it's the 8.9 cortado that shows the bar is dialed in beyond the novelty. The vibe is pure OB, laid-back, artful, and a little trippy, and a fun stop whether you're chasing the specialty coffee or just the aesthetic. Easy to pair with a stroll down to the pier."
  },
  'loc_113': {
    cortadoRating: 7.9,
    signatureDrinkName: 'Iced Morning Maple Latte',
    signatureDrinkRating: 8.4,
    reviewExcerpt: "Sustainability-minded cafe and roaster on Lake Murray Blvd in La Mesa, roasting in house since 2017 with fresh single origins from across Central America and East Africa. The Iced Morning Maple Latte leads the visit at 8.4, with the cortado holding at 7.9. Ceramic cups and 100% compostable to-go ware back up the eco-conscious approach, and the space doubles as a neighborhood hub with open mics, trivia nights, and the Brew Community Market. A genuine La Mesa gathering spot with a strong local following."
  }
};
