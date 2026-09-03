# Sports in Barcelona

Barcelona's climate and geography — wedged between the Mediterranean and the Collserola
hills — make it a major hub for both casual outdoor sports and organized club play.

## Activity groups

Candidate grouping for organizing the full activity catalog (existing + future additions)
into categories:

- **Aerial & Acrobatics** — Aerial Hoops, Pole Dance
- **Aqua & Water Sports** — Swimming, Kayak, Canoe, Stand-up Paddleboarding, Surfing,
  Wakeboarding
- **Ball & Racquet Sports** — Padel, Tennis, Badminton, Squash, Football, Basketball, Table
  Tennis
- **Combat & Martial Arts** — Boxing, Kickboxing, Muay Thai, Brazilian Jiu-Jitsu, Judo,
  Karate, Krav Maga
- **Cycling & Mobility** — Indoor Cycling/Spinning, Outdoor Cycling, Mobility Workouts
- **Dance & Movement** — Salsa, Bachata, Kizomba, Hip Hop, Contemporary Dance, Barre,
  Trampolining
- **Fitness & Strength** — Gym Open Training, Functional Fitness, Cross-training, Bootcamp,
  Bodybuilding, Calisthenics
- **Mind & Body** — Yoga, Pilates, Meditation, Breathwork
- **Outdoor & Adventure** — Beach Volleyball, Bouldering, Rock Climbing, Running, Hiking,
  Skateboarding, Rollerblading, Golf
- **Wellness & Recovery** — Sauna, Cryotherapy, Massage, Spa, Infrared Cabins

## Mapping to FIT-M8 activities

Relevant `ActivityId`s already defined in [types.ts](../src/lib/types.ts), organized by the
groups above. Entries with no `ActivityId` are not yet tracked as activities in the app.

| Group                 | Sport                   | FIT-M8 `ActivityId`         |
| --------------------- | ----------------------- | --------------------------- |
| Aerial & Acrobatics   | Aerial Hoops            | —                           |
| Aerial & Acrobatics   | Pole Dance              | `poleDance`                 |
| Aqua & Water Sports   | Swimming                | `swimming`                  |
| Aqua & Water Sports   | Kayak                   | `kayak`                     |
| Aqua & Water Sports   | Canoe                   | —                           |
| Aqua & Water Sports   | Stand-up Paddleboarding | `paddleboard`               |
| Aqua & Water Sports   | Surfing                 | `surf`                      |
| Aqua & Water Sports   | Wakeboarding            | —                           |
| Ball & Racquet Sports | Padel                   | `padel`                     |
| Ball & Racquet Sports | Tennis                  | `tennis`                    |
| Ball & Racquet Sports | Badminton               | — (removed, no replacement) |
| Ball & Racquet Sports | Squash                  | `squash`                    |
| Ball & Racquet Sports | Football                | `soccer`                    |
| Ball & Racquet Sports | Basketball              | `basketball`                |
| Ball & Racquet Sports | Table Tennis            | `pingPong`                  |
| Ball & Racquet Sports | Pickleball              | `pickleball`                |
| Ball & Racquet Sports | Frescobol               | `frescobol`                 |
| Combat & Martial Arts | Boxing                  | `boxing`                    |
| Combat & Martial Arts | Kickboxing              | `kickboxing`                |
| Combat & Martial Arts | Muay Thai               | `muayThai`                  |
| Combat & Martial Arts | Brazilian Jiu-Jitsu     | `jiuJitsu`                  |
| Combat & Martial Arts | Judo                    | `judo`                      |
| Combat & Martial Arts | Karate                  | `karate`                    |
| Combat & Martial Arts | Krav Maga               | —                           |
| Cycling & Mobility    | Indoor Cycling/Spinning | `cycling`                   |
| Cycling & Mobility    | Outdoor Cycling         | `cycling`                   |
| Cycling & Mobility    | Mobility Workouts       | —                           |
| Dance & Movement      | Salsa                   | `salsa`                     |
| Dance & Movement      | Bachata                 | `bachata`                   |
| Dance & Movement      | Kizomba                 | `kizomba`                   |
| Dance & Movement      | Hip Hop                 | —                           |
| Dance & Movement      | Contemporary Dance      | —                           |
| Dance & Movement      | Barre                   | `barre`                     |
| Dance & Movement      | Trampolining            | `trampoline`                |
| Fitness & Strength    | Gym Open Training       | `gym`                       |
| Fitness & Strength    | Functional Fitness      | `functionalFitness`         |
| Fitness & Strength    | Cross-training          | `crossTraining`             |
| Fitness & Strength    | Bootcamp                | `bootCamp`                  |
| Fitness & Strength    | Bodybuilding            | `bodybuilding`              |
| Fitness & Strength    | Calisthenics            | `calisthenics`              |
| Mind & Body           | Yoga                    | `yoga`                      |
| Mind & Body           | Pilates                 | `pilates`                   |
| Mind & Body           | Meditation              | `meditation`                |
| Mind & Body           | Breathwork              | `breathwork`                |
| Outdoor & Adventure   | Beach Volleyball        | `beachVolley`               |
| Outdoor & Adventure   | Foot Volley             | `footVolley`                |
| Outdoor & Adventure   | Bouldering              | `rockClimbing`              |
| Outdoor & Adventure   | Rock Climbing           | `rockClimbing`              |
| Outdoor & Adventure   | Running                 | `jogging`                   |
| Outdoor & Adventure   | Hiking                  | `hiking`                    |
| Outdoor & Adventure   | Skateboarding           | `skateboard`                |
| Outdoor & Adventure   | Rollerblading           | `rollerblade`               |
| Outdoor & Adventure   | Golf                    | `golf`                      |
| Wellness & Recovery   | Sauna                   | —                           |
| Wellness & Recovery   | Cryotherapy             | —                           |
| Wellness & Recovery   | Massage                 | —                           |
| Wellness & Recovery   | Spa                     | —                           |
| Wellness & Recovery   | Infrared Cabins         | —                           |

All 43 `ActivityId`s currently in [types.ts](../src/lib/types.ts) are accounted for above
(`cycling` and `rockClimbing` are each shared by two rows by design).

## Removed / merged activities

- `badminton` was removed outright (no replacement) — see
  [migrate-remove-badminton.cjs](../scripts/migrate-remove-badminton.cjs). Kept in the
  Barcelona-sports narrative above since it's still commonly played locally, just not
  trackable in the app.
- `martialArts` was split into six specific disciplines (`boxing`, `kickboxing`, `muayThai`,
  `karate`, `jiuJitsu`, `judo`) — see
  [migrate-martial-arts-group.cjs](../scripts/migrate-martial-arts-group.cjs). The generic
  `martialArts` id no longer exists.
- `beach-volley`, `ping-pong`, `rock-climbing` were renamed to camelCase (`beachVolley`,
  `pingPong`, `rockClimbing`) — see
  [migrate-activity-ids.cjs](../scripts/migrate-activity-ids.cjs).

## Still missing (no `ActivityId` yet)

Aerial Hoops, Canoe, Wakeboarding, Mobility Workouts, Hip Hop, Contemporary Dance, Krav Maga,
Sauna, Cryotherapy, Massage, Spa, Infrared Cabins — candidates for future additions if demand
shows up, but none are tracked as activities today.
