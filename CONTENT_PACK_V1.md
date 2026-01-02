# Content Pack v1 (Offline Scout Camp)

This file is a ready-to-use set of **sectors**, **stocks**, and **event cards** that match the defaults in [GAME_SPEC.md](GAME_SPEC.md):
- Ages 10–14
- GM-led, offline
- 15 stocks (3 per sector)
- 5 sectors
- Starting prices are simple integers
- Sector risk based loosely on “real world” patterns (simplified)

## 1) Sectors (5)
1. Technology & Media (higher volatility)
2. Energy (medium-high volatility)
3. Transport & Logistics (medium volatility)
4. Health & Wellness (medium volatility)
5. Food & Farming (lower volatility)

## 2) Stocks (15)
Numbers are intentionally simple.

Format:
- Name (Ticker) — Sector
  - Starting price
  - Volatility: Low / Med / High
  - Fundamentals: Profitability / Stability / Growth (Low/Med/High)
  - Kid description

### Technology & Media
- ByteBuddies (BBDY) — Tech & Media
  - Start: 120
  - Volatility: High
  - Fundamentals: Med / Low / High
  - A popular messaging app for kids and families.

- StreamSprout (SSRT) — Tech & Media
  - Start: 90
  - Volatility: High
  - Fundamentals: Low / Low / High
  - A video platform that grows fast when trends hit.

- CloudKit Crew (CKCR) — Tech & Media
  - Start: 110
  - Volatility: High
  - Fundamentals: Med / Med / High
  - Makes online tools for schools and clubs.

### Energy
- SolarSprout Energy (SSPR) — Energy
  - Start: 80
  - Volatility: Med-High
  - Fundamentals: Med / Med / High
  - Builds solar panels and batteries.

- WindWay Power (WWPW) — Energy
  - Start: 70
  - Volatility: Med
  - Fundamentals: Med / High / Med
  - Runs wind farms and sells steady electricity.

- HydroKite (HYDK) — Energy
  - Start: 65
  - Volatility: Med
  - Fundamentals: Med / Med / Med
  - Generates power from moving water with clever kites.

### Transport & Logistics
- RoboRoute (RBRT) — Transport & Logistics
  - Start: 100
  - Volatility: Med
  - Fundamentals: Med / Med / Med
  - Delivery robots that bring packages around town.

- TrailTrack Logistics (TTLG) — Transport & Logistics
  - Start: 60
  - Volatility: Med
  - Fundamentals: High / High / Low
  - A boring-but-reliable shipping company.

- BeaconHop Freight (BCHP) — Transport & Logistics
  - Start: 75
  - Volatility: Med
  - Fundamentals: Med / High / Med
  - Finds smart routes to move packages faster.

### Health & Wellness
- MediMints (MDMT) — Health & Wellness
  - Start: 50
  - Volatility: Med
  - Fundamentals: High / Med / Med
  - Healthy snacks and vitamins.

- PulsePatch (PLPT) — Health & Wellness
  - Start: 130
  - Volatility: High (the “spicier” health stock)
  - Fundamentals: Low / Low / High
  - A wearable health device that might be a big hit… or not.

- VitaNudge (VITN) — Health & Wellness
  - Start: 85
  - Volatility: Med
  - Fundamentals: Med / Med / Med
  - A wellness app that helps people build healthy habits.

### Food & Farming
- AquaHarvest (AQHV) — Food & Farming
  - Start: 60
  - Volatility: Low-Med
  - Fundamentals: Med / High / Med
  - Grows food in water-saving farms.

- GrainGuard Co-op (GGCP) — Food & Farming
  - Start: 40
  - Volatility: Low
  - Fundamentals: Med / High / Low
  - A farmers’ co-op that sells basic ingredients.

- SunnySide Dairy (SSDY) — Food & Farming
  - Start: 30
  - Volatility: Low
  - Fundamentals: Med / High / Low
  - Makes milk and yogurt—steady demand.

## 3) Event Cards (starter deck)
GM chooses one event per round.

Event format:
- Title
- Scope: Company / Sector / Market
- Target: (ticker or sector or ALL)
- Expected impact: Up/Down/Uncertain + Small/Medium/Large
- Suggested numeric impact (for the price model): percent change, e.g. +0.03 = +3%
- Why it moves prices (kid explanation)

### Company events (examples)
1) “ByteBuddies adds a great new feature!”
- Scope: Company | Target: BBDY
- Expected: Up, Medium | Impact: +0.05
- Why: More people might use it, so investors feel optimistic.

2) “StreamSprout trend fades faster than expected”
- Scope: Company | Target: SSRT
- Expected: Down, Medium | Impact: -0.05
- Why: If fewer people watch, the company may earn less.

3) “CloudKit wins a big school contract”
- Scope: Company | Target: CKCR
- Expected: Up, Medium | Impact: +0.04
- Why: A big customer can mean steadier income.

4) “SolarSprout’s factory has a delay”
- Scope: Company | Target: SSPR
- Expected: Down, Small | Impact: -0.03
- Why: Delays can mean slower growth for a while.

5) “WindWay turbines work better than planned”
- Scope: Company | Target: WWPW
- Expected: Up, Small | Impact: +0.02
- Why: Better efficiency can mean higher profit.

6) “RoboRoute robots break down in rainy weather”
- Scope: Company | Target: RBRT
- Expected: Down, Medium | Impact: -0.04
- Why: If deliveries fail, customers may leave.

7) “TrailTrack keeps costs low this month”
- Scope: Company | Target: TTLG
- Expected: Up, Small | Impact: +0.02
- Why: Saving money can increase profit.

8) “MediMints gets great reviews”
- Scope: Company | Target: MDMT
- Expected: Up, Small | Impact: +0.03
- Why: Happy customers often buy again.

9) “PulsePatch rumor: ‘New model is coming!’”
- Scope: Company | Target: PLPT
- Expected: Uncertain, Large | Impact: +0.06 OR -0.06 (GM chooses which)
- Why: Rumors can cause big moves even without proof.

10) “AquaHarvest harvest is bigger than expected”
- Scope: Company | Target: AQHV
- Expected: Up, Medium | Impact: +0.04
- Why: More food to sell can mean more revenue.

11) “SunnySide has a small supply issue”
- Scope: Company | Target: SSDY
- Expected: Down, Small | Impact: -0.02
- Why: If supply is tight, it’s harder to sell as much.

12) “GrainGuard signs a steady long-term deal”
- Scope: Company | Target: GGCP
- Expected: Up, Small | Impact: +0.02
- Why: Stable deals reduce surprise risks.

### Sector events (examples)
13) “New tech gadget trend spreads”
- Scope: Sector | Target: Technology & Media
- Expected: Up, Medium | Impact: +0.03
- Why: When a sector is exciting, many companies rise together.

14) “Tech privacy worries in the news”
- Scope: Sector | Target: Technology & Media
- Expected: Down, Medium | Impact: -0.03
- Why: Rules and trust can affect many tech companies.

15) “Energy prices jump”
- Scope: Sector | Target: Energy
- Expected: Uncertain, Medium | Impact: +0.03 OR -0.03 (GM chooses based on story)
- Why: Higher prices can help some energy companies but also raise costs.

16) “Fuel costs rise”
- Scope: Sector | Target: Transport & Logistics
- Expected: Down, Medium | Impact: -0.03
- Why: If fuel costs more, deliveries cost more.

17) “Healthy living challenge goes viral”
- Scope: Sector | Target: Health & Wellness
- Expected: Up, Medium | Impact: +0.03
- Why: If more people care about health, health companies may sell more.

18) “Bad weather hits farms”
- Scope: Sector | Target: Food & Farming
- Expected: Down, Medium | Impact: -0.03
- Why: Weather can affect how much food can be grown.

### Market events (examples)
19) “Good vibes day (confidence)” 
- Scope: Market | Target: ALL
- Expected: Up, Small | Impact: +0.01
- Why: Sometimes people feel optimistic and buy more.

20) “Worried day (uncertainty)”
- Scope: Market | Target: ALL
- Expected: Down, Small | Impact: -0.01
- Why: When people feel nervous, they may sell.

21) “Big surprise headline (lots of confusion)”
- Scope: Market | Target: ALL
- Expected: Down, Medium | Impact: -0.02
- Why: Confusion makes investors cautious.

### Mix-and-match “teachable moment” events
22) “Hype vs facts reminder”
- Scope: Market | Target: ALL
- Expected: Uncertain, Small | Impact: 0.00 to +0.01
- Why: Not every headline changes what a company really earns.

23) “Diversification pays off”
- Scope: Market | Target: ALL
- Expected: Mixed | Impact: 0.00 (use to prompt discussion instead of moving prices)
- Why: Even if one stock drops, others might not.

24) “Sector spotlight: Food stays steady”
- Scope: Sector | Target: Food & Farming
- Expected: Up, Small | Impact: +0.02
- Why: People need food even when other things change.

25) “Tech whiplash”
- Scope: Sector | Target: Technology & Media
- Expected: Uncertain, Large | Impact: +0.05 OR -0.05 (GM chooses)
- Why: High-risk sectors can swing quickly.

26) “ByteBuddies gets a safety award”
- Scope: Company | Target: BBDY
- Expected: Up, Small | Impact: +0.03
- Why: Trust can bring more users and partners.

27) “StreamSprout moderation problem”
- Scope: Company | Target: SSRT
- Expected: Down, Medium | Impact: -0.04
- Why: If people feel unsafe, they may stop using it.

28) “CloudKit has a short outage”
- Scope: Company | Target: CKCR
- Expected: Down, Small | Impact: -0.02
- Why: Reliability matters for subscription tools.

29) “SolarSprout gets a clean-energy grant”
- Scope: Company | Target: SSPR
- Expected: Up, Medium | Impact: +0.04
- Why: Extra funding can speed up building projects.

30) “WindWay faces a maintenance bill”
- Scope: Company | Target: WWPW
- Expected: Down, Small | Impact: -0.02
- Why: Surprise costs can reduce profit.

31) “RoboRoute signs a new delivery partner”
- Scope: Company | Target: RBRT
- Expected: Up, Medium | Impact: +0.04
- Why: More customers can mean more deliveries.

32) “TrailTrack drivers negotiate higher wages”
- Scope: Company | Target: TTLG
- Expected: Down, Small | Impact: -0.02
- Why: Higher costs can reduce profit.

33) “MediMints launches a new flavor”
- Scope: Company | Target: MDMT
- Expected: Up, Small | Impact: +0.02
- Why: New products can bring new customers.

34) “PulsePatch test results look promising”
- Scope: Company | Target: PLPT
- Expected: Up, Medium | Impact: +0.05
- Why: Good results can make investors more confident.

35) “PulsePatch recall rumor”
- Scope: Company | Target: PLPT
- Expected: Down, Medium | Impact: -0.05
- Why: Recalls can scare customers and investors.

36) “AquaHarvest water-saving breakthrough”
- Scope: Company | Target: AQHV
- Expected: Up, Medium | Impact: +0.04
- Why: Better efficiency can boost output and profits.

37) “GrainGuard warehouse cleanup costs”
- Scope: Company | Target: GGCP
- Expected: Down, Small | Impact: -0.02
- Why: Fixing problems costs money.

38) “SunnySide wins a school lunch deal”
- Scope: Company | Target: SSDY
- Expected: Up, Small | Impact: +0.03
- Why: Big steady buyers can stabilize sales.

39) “Tech talent competition heats up”
- Scope: Sector | Target: Technology & Media
- Expected: Down, Small | Impact: -0.02
- Why: Hiring gets expensive, which can reduce profit.

40) “Cyber-safety lesson boosts trusted apps”
- Scope: Sector | Target: Technology & Media
- Expected: Up, Small | Impact: +0.02
- Why: Trusted companies can gain users faster.

41) “Energy supply hiccup”
- Scope: Sector | Target: Energy
- Expected: Up, Medium | Impact: +0.03
- Why: When supply is tight, energy prices can rise.

42) “New efficiency rules for energy companies”
- Scope: Sector | Target: Energy
- Expected: Uncertain, Medium | Impact: +0.02 OR -0.02 (GM chooses)
- Why: Rules can add costs now, but improve long-term stability.

43) “Travel demand rises”
- Scope: Sector | Target: Transport & Logistics
- Expected: Up, Small | Impact: +0.02
- Why: More shipping and travel can mean more business.

44) “Road closures slow deliveries”
- Scope: Sector | Target: Transport & Logistics
- Expected: Down, Small | Impact: -0.02
- Why: Delays can frustrate customers and raise costs.

45) “Health awareness week”
- Scope: Sector | Target: Health & Wellness
- Expected: Up, Small | Impact: +0.02
- Why: People may buy more healthy products.

46) “New labeling rules for health products”
- Scope: Sector | Target: Health & Wellness
- Expected: Uncertain, Small | Impact: +0.01 OR -0.01 (GM chooses)
- Why: Rules can build trust, but may cost money to follow.

47) “Great growing season”
- Scope: Sector | Target: Food & Farming
- Expected: Up, Small | Impact: +0.02
- Why: Better harvests can mean more products to sell.

48) “Pest problem spreads”
- Scope: Sector | Target: Food & Farming
- Expected: Down, Medium | Impact: -0.03
- Why: Pests can damage crops and reduce supply.

49) “Market gets a bit wild (big swings)”
- Scope: Market | Target: ALL
- Expected: Uncertain, Medium | Impact: 0.00 overall; increase noise this round
- Why: Sometimes prices jump around even without clear reasons.

50) “Calm market day (small moves)”
- Scope: Market | Target: ALL
- Expected: Uncertain, Small | Impact: 0.00 overall; decrease noise this round
- Why: Some days are quieter with fewer big changes.

## 3B) Event Cards (expanded set, +50 more)
These are additional cards to increase variety. Numbering continues.

### Company events (more)
51) “ByteBuddies grows faster than expected”
- Scope: Company | Target: BBDY
- Expected: Up, Medium | Impact: +0.04
- Why: Faster growth can mean more future income.

52) “ByteBuddies loses a partner app”
- Scope: Company | Target: BBDY
- Expected: Down, Small | Impact: -0.03
- Why: Losing partners can slow growth.

53) “StreamSprout creators join in”
- Scope: Company | Target: SSRT
- Expected: Up, Medium | Impact: +0.05
- Why: More creators can attract more viewers.

54) “StreamSprout ad prices fall”
- Scope: Company | Target: SSRT
- Expected: Down, Medium | Impact: -0.04
- Why: Cheaper ads can reduce earnings.

55) “CloudKit adds a new tool schools love”
- Scope: Company | Target: CKCR
- Expected: Up, Small | Impact: +0.03
- Why: Better products can keep customers.

56) “CloudKit gets strong competition”
- Scope: Company | Target: CKCR
- Expected: Down, Small | Impact: -0.03
- Why: Competition can reduce sales.

57) “SolarSprout signs a big battery deal”
- Scope: Company | Target: SSPR
- Expected: Up, Medium | Impact: +0.05
- Why: Big deals can increase growth.

58) “SolarSprout faces a parts shortage”
- Scope: Company | Target: SSPR
- Expected: Down, Medium | Impact: -0.04
- Why: Shortages can slow production.

59) “WindWay finds a great new windy location”
- Scope: Company | Target: WWPW
- Expected: Up, Small | Impact: +0.03
- Why: More production can increase revenue.

60) “WindWay has a small turbine issue”
- Scope: Company | Target: WWPW
- Expected: Down, Small | Impact: -0.02
- Why: Repairs cost money.

61) “RoboRoute gets permission for a new route area”
- Scope: Company | Target: RBRT
- Expected: Up, Small | Impact: +0.03
- Why: More routes can mean more deliveries.

62) “RoboRoute has a battery problem”
- Scope: Company | Target: RBRT
- Expected: Down, Medium | Impact: -0.04
- Why: Reliability issues can hurt business.

63) “TrailTrack wins a reliability award”
- Scope: Company | Target: TTLG
- Expected: Up, Small | Impact: +0.02
- Why: Good reputation can bring customers.

64) “TrailTrack truck repairs cost more”
- Scope: Company | Target: TTLG
- Expected: Down, Small | Impact: -0.02
- Why: Higher costs reduce profit.

65) “MediMints gets featured in a magazine”
- Scope: Company | Target: MDMT
- Expected: Up, Small | Impact: +0.02
- Why: More attention can increase sales.

66) “MediMints ingredient prices rise”
- Scope: Company | Target: MDMT
- Expected: Down, Small | Impact: -0.02
- Why: Higher costs can reduce earnings.

67) “PulsePatch pre-orders exceed expectations”
- Scope: Company | Target: PLPT
- Expected: Up, Large | Impact: +0.06
- Why: Strong demand can boost confidence.

68) “PulsePatch review says ‘too expensive’”
- Scope: Company | Target: PLPT
- Expected: Down, Medium | Impact: -0.05
- Why: If people don’t buy it, sales drop.

69) “AquaHarvest opens a second farm”
- Scope: Company | Target: AQHV
- Expected: Up, Medium | Impact: +0.04
- Why: More farms can mean more food.

70) “AquaHarvest pump breaks (quick fix needed)”
- Scope: Company | Target: AQHV
- Expected: Down, Small | Impact: -0.03
- Why: Fixes cost money and slow production.

71) “GrainGuard improves storage to reduce waste”
- Scope: Company | Target: GGCP
- Expected: Up, Small | Impact: +0.02
- Why: Less waste can mean more profit.

72) “GrainGuard delivery delay”
- Scope: Company | Target: GGCP
- Expected: Down, Small | Impact: -0.02
- Why: Late deliveries can lose customers.

73) “SunnySide introduces a new yogurt flavor”
- Scope: Company | Target: SSDY
- Expected: Up, Small | Impact: +0.02
- Why: New products can boost sales.

74) “SunnySide fridge failure causes losses”
- Scope: Company | Target: SSDY
- Expected: Down, Small | Impact: -0.02
- Why: Spoiled goods reduce profit.

### Sector events (more)
75) “New app craze spreads”
- Scope: Sector | Target: Technology & Media
- Expected: Up, Medium | Impact: +0.03
- Why: Excitement can lift many tech companies.

76) “Online ads get less effective”
- Scope: Sector | Target: Technology & Media
- Expected: Down, Medium | Impact: -0.03
- Why: Lower ad income can hurt many media apps.

77) “Energy storage becomes cheaper”
- Scope: Sector | Target: Energy
- Expected: Up, Medium | Impact: +0.03
- Why: Cheaper storage can help renewables.

78) “Energy equipment costs rise”
- Scope: Sector | Target: Energy
- Expected: Down, Small | Impact: -0.02
- Why: Higher costs can slow building projects.

79) “Shipping demand spikes”
- Scope: Sector | Target: Transport & Logistics
- Expected: Up, Medium | Impact: +0.03
- Why: More deliveries can raise revenue.

80) “Fuel shortage worries”
- Scope: Sector | Target: Transport & Logistics
- Expected: Down, Medium | Impact: -0.03
- Why: Shortages raise costs and cause delays.

81) “Wellness trend grows”
- Scope: Sector | Target: Health & Wellness
- Expected: Up, Small | Impact: +0.02
- Why: More customers buy health products.

82) “New health study confuses shoppers”
- Scope: Sector | Target: Health & Wellness
- Expected: Uncertain, Small | Impact: +0.02 OR -0.02 (GM chooses)
- Why: Confusing info can change buying behavior.

83) “Farm equipment improves”
- Scope: Sector | Target: Food & Farming
- Expected: Up, Small | Impact: +0.02
- Why: Better tools can increase harvests.

84) “Food safety scare (minor)”
- Scope: Sector | Target: Food & Farming
- Expected: Down, Small | Impact: -0.02
- Why: Worries can reduce sales temporarily.

### Market events (more)
85) “Interest in saving grows (more investing)”
- Scope: Market | Target: ALL
- Expected: Up, Small | Impact: +0.01
- Why: More buyers can lift prices a bit.

86) “Big rumor spreads across the market”
- Scope: Market | Target: ALL
- Expected: Uncertain, Medium | Impact: +0.02 OR -0.02 (GM chooses)
- Why: Rumors can make people buy or sell quickly.

87) “Prices feel ‘too high’ today”
- Scope: Market | Target: ALL
- Expected: Down, Small | Impact: -0.01
- Why: Some investors take profit after a run-up.

88) “Market feels confident again”
- Scope: Market | Target: ALL
- Expected: Up, Small | Impact: +0.01
- Why: Confidence can bring buyers back.

### Market crash + recovery set
89) “Market crash: Panic selling!”
- Scope: Market | Target: ALL
- Expected: Down, Large | Impact: -0.10
- Why: Sometimes fear spreads and many people sell at once.

How to run this crash (simple):
- Apply a big negative move to most stocks (suggested: -10%).
- Optionally make Food & Farming fall a bit less (example: -6%) to teach defensive sectors.

90) “Aftershock day”
- Scope: Market | Target: ALL
- Expected: Down, Medium | Impact: -0.03
- Why: After a crash, people can still feel nervous.

91) “Bargain hunters buy (small bounce)”
- Scope: Market | Target: ALL
- Expected: Up, Medium | Impact: +0.03
- Why: Some investors buy when prices look cheap.

92) “Steady recovery”
- Scope: Market | Target: ALL
- Expected: Up, Small | Impact: +0.02
- Why: Markets can recover slowly over time.

93) “Recovery isn’t even”
- Scope: Market | Target: ALL
- Expected: Mixed | Impact: +0.02 overall; Tech & Media extra noise
- Why: Some sectors bounce more, others take longer.

94) “Lesson card: Diversification helps in crashes”
- Scope: Market | Target: ALL
- Expected: Mixed | Impact: 0.00
- Why: Owning different kinds of stocks can soften a big hit.

### Mix-and-match teachable scenarios
95) “Chasing winners”
- Scope: Market | Target: ALL
- Expected: Uncertain, Small | Impact: 0.00 to -0.01
- Why: Buying only what’s already up can be risky.

96) “Patience pays”
- Scope: Market | Target: ALL
- Expected: Up, Small | Impact: +0.01
- Why: Long-term thinking can reduce stress.

97) “Overreaction”
- Scope: Market | Target: ALL
- Expected: Uncertain, Small | Impact: +0.01 OR -0.01
- Why: People sometimes react too strongly to headlines.

98) “Sector rotation”
- Scope: Market | Target: ALL
- Expected: Mixed | Impact: Tech -0.02, Food +0.02 (GM can adapt)
- Why: Money can move from one sector to another.

99) “Slow and steady wins attention”
- Scope: Sector | Target: Food & Farming
- Expected: Up, Small | Impact: +0.02
- Why: Stable companies can feel safer in uncertain times.

100) “New invention excitement”
- Scope: Sector | Target: Technology & Media
- Expected: Up, Medium | Impact: +0.04
- Why: New ideas can create big optimism.

101) “HydroKite wins a river project”
- Scope: Company | Target: HYDK
- Expected: Up, Small | Impact: +0.03
- Why: A new contract can mean more income.

102) “HydroKite finds a maintenance surprise”
- Scope: Company | Target: HYDK
- Expected: Down, Small | Impact: -0.03
- Why: Fixing problems can cost money and time.

103) “BeaconHop opens a faster delivery route”
- Scope: Company | Target: BCHP
- Expected: Up, Small | Impact: +0.03
- Why: Faster delivery can attract more customers.

104) “BeaconHop faces a truck shortage”
- Scope: Company | Target: BCHP
- Expected: Down, Medium | Impact: -0.04
- Why: If the company can’t deliver, it may earn less.

105) “VitaNudge partners with a big school program”
- Scope: Company | Target: VITN
- Expected: Up, Medium | Impact: +0.04
- Why: More users can mean more sales and steady growth.

106) “VitaNudge study results are mixed”
- Scope: Company | Target: VITN
- Expected: Uncertain, Medium | Impact: +0.04 OR -0.04 (GM chooses which)
- Why: Mixed news can make investors unsure.

107) “ByteBuddies outage frustrates users”
- Scope: Company | Target: BBDY
- Expected: Down, Medium | Impact: -0.04
- Why: If the app isn’t working, people may leave.

108) “ByteBuddies adds a fun new sticker pack”
- Scope: Company | Target: BBDY
- Expected: Up, Small | Impact: +0.02
- Why: Small improvements can keep people excited.

109) “StreamSprout creator program boosts uploads”
- Scope: Company | Target: SSRT
- Expected: Up, Medium | Impact: +0.04
- Why: More creators can bring more viewers.

110) “StreamSprout trend cycle slows”
- Scope: Company | Target: SSRT
- Expected: Down, Small | Impact: -0.03
- Why: If fewer people watch, growth can cool off.

111) “CloudKit fixes a big bug fast”
- Scope: Company | Target: CKCR
- Expected: Up, Small | Impact: +0.02
- Why: Reliability makes customers trust the service.

112) “CloudKit subscription price increase backlash”
- Scope: Company | Target: CKCR
- Expected: Down, Small | Impact: -0.02
- Why: Some customers may cancel if it costs more.

113) “SolarSprout breaks a production record”
- Scope: Company | Target: SSPR
- Expected: Up, Medium | Impact: +0.04
- Why: Producing more can mean more sales.

114) “SolarSprout shipment delay hits timelines”
- Scope: Company | Target: SSPR
- Expected: Down, Small | Impact: -0.03
- Why: Delays can slow down revenue.

115) “WindWay signs a long-term power contract”
- Scope: Company | Target: WWPW
- Expected: Up, Small | Impact: +0.03
- Why: Long contracts can make income steadier.

116) “WindWay faces a windy-day shutdown”
- Scope: Company | Target: WWPW
- Expected: Down, Small | Impact: -0.02
- Why: If turbines stop, power sales drop.

117) “HydroKite prototype performs better than expected”
- Scope: Company | Target: HYDK
- Expected: Up, Medium | Impact: +0.04
- Why: Better performance can mean better profits later.

118) “HydroKite permit paperwork slows a project”
- Scope: Company | Target: HYDK
- Expected: Down, Small | Impact: -0.02
- Why: Waiting can delay earning money.

119) “RoboRoute robots deliver faster routes”
- Scope: Company | Target: RBRT
- Expected: Up, Small | Impact: +0.03
- Why: Faster delivery can win more customers.

120) “RoboRoute battery issues cause returns”
- Scope: Company | Target: RBRT
- Expected: Down, Medium | Impact: -0.04
- Why: Repairs cost money and hurt trust.

121) “TrailTrack lands a big steady client”
- Scope: Company | Target: TTLG
- Expected: Up, Small | Impact: +0.03
- Why: Steady clients can make sales predictable.

122) “TrailTrack fuel surcharge upsets customers”
- Scope: Company | Target: TTLG
- Expected: Down, Small | Impact: -0.02
- Why: Higher prices can push customers away.

123) “BeaconHop wins a delivery-speed award”
- Scope: Company | Target: BCHP
- Expected: Up, Small | Impact: +0.03
- Why: Awards can attract new customers.

124) “BeaconHop warehouse mix-up causes delays”
- Scope: Company | Target: BCHP
- Expected: Down, Small | Impact: -0.03
- Why: Mistakes can cost money and trust.

125) “MediMints influencer shout-out boosts sales”
- Scope: Company | Target: MDMT
- Expected: Up, Small | Impact: +0.03
- Why: More people hear about the product.

126) “MediMints supply shortage of ingredients”
- Scope: Company | Target: MDMT
- Expected: Down, Small | Impact: -0.02
- Why: If you can’t make it, you can’t sell it.

127) “PulsePatch new model leaks online”
- Scope: Company | Target: PLPT
- Expected: Uncertain, Medium | Impact: +0.05 OR -0.05 (GM chooses which)
- Why: Leaks can cause excitement or worry.

128) “PulsePatch app update improves accuracy”
- Scope: Company | Target: PLPT
- Expected: Up, Medium | Impact: +0.04
- Why: Better results can increase trust.

129) “VitaNudge streak challenge goes viral”
- Scope: Company | Target: VITN
- Expected: Up, Small | Impact: +0.03
- Why: Viral challenges can bring many new users.

130) “VitaNudge notifications annoy users”
- Scope: Company | Target: VITN
- Expected: Down, Small | Impact: -0.02
- Why: Annoyed users might uninstall.

131) “AquaHarvest expands to a new greenhouse”
- Scope: Company | Target: AQHV
- Expected: Up, Medium | Impact: +0.04
- Why: More farms can mean more food to sell.

132) “AquaHarvest pump repair costs spike”
- Scope: Company | Target: AQHV
- Expected: Down, Small | Impact: -0.03
- Why: Repairs reduce profit.

133) “GrainGuard improves storage to reduce waste”
- Scope: Company | Target: GGCP
- Expected: Up, Small | Impact: +0.02
- Why: Less waste can mean more profit.

134) “GrainGuard delivery trucks run late”
- Scope: Company | Target: GGCP
- Expected: Down, Small | Impact: -0.02
- Why: Late deliveries can lose customers.

135) “SunnySide launches a new yogurt flavor”
- Scope: Company | Target: SSDY
- Expected: Up, Small | Impact: +0.02
- Why: New products can bring new buyers.

136) “SunnySide cold-storage issue spoils product”
- Scope: Company | Target: SSDY
- Expected: Down, Small | Impact: -0.03
- Why: Spoiled product can cost money.

## 4) Next decisions
- Event deck size: current deck is ~136. Expand further if you want even more variety.
- Do you want any camp-themed events (e.g., “rainy day affects deliveries”) to tie it into scout life?

Update: deck is now ~136 (50 original + 50 added + 36 new-company cards), including a market crash + recovery mini-set.
