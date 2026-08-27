# Sports in Barcelona

Barcelona's climate and geography — wedged between the Mediterranean and the Collserola
hills — make it a major hub for both casual outdoor sports and organized club play.

## Beach & Coastal Sports

- **Beach Volleyball** — Hugely popular along Nova Icària, Bogatell, and Barceloneta. Dozens
  of nets are set up daily for pickup games and local leagues.
- **Paddlesurf (SUP) & Kayaking** — Very common during early mornings along the coastline,
  especially off Barceloneta and Port Fòrum.
- **Swimming & Open Water** — Popular year-round, both in public municipal pools (CEMs) and
  open-sea swimming lines.

## Urban & Racket Sports

- **Padel** — Massively popular across Catalonia. Courts are everywhere, from local municipal
  sports centers to rooftop clubs.
- **Skateboarding & Rollerblading** — Barcelona is widely considered the skateboarding capital
  of Europe. MACBA, Fòrum, and the seafront promenade are iconic spots.
- **Running & Cycling** — The seafront promenade, Carretera de les Aigües (in Collserola), and
  Montjuïc park are prime running routes. Road and gravel cycling are also huge for quick
  escapes into the mountains.

## Field & Team Sports

- **Football (7-a-side & 11-a-side)** — Played constantly across municipal turf fields. Apps
  like CeleBreak make it easy to join casual pickup matches.
- **Basketball** — Plenty of outdoor public courts (e.g. Parc de l'Espanya Industrial or Parc
  de Monterols) host regular pickup games.

## Mapping to FIT-M8 activities

Relevant `ActivityId`s already defined in [types.ts](../src/lib/types.ts) for the sports
mentioned above:

| Barcelona sport  | FIT-M8 `ActivityId` |
| ---------------- | ------------------- |
| Beach Volleyball | `beach-volley`      |
| Paddlesurf (SUP) | `paddleboard`       |
| Swimming         | `swimming`          |
| Padel            | `padel`             |
| Running          | `jogging`           |
| Cycling          | `cycling`           |
| Football         | `soccer`            |
| Basketball       | `basketball`        |
| Skateboarding    | `skateboard`        |
| Rollerblading    | `rollerblade`       |

Sports mentioned in the source material with no corresponding activity yet: kayaking. Not
added since it isn't currently tracked as an activity in the app.
