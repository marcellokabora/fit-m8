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
- **Dance & Movement** — Salsa, Bachata, Hip Hop, Contemporary Dance, Barre, Trampolining
- **Fitness & Strength** — Gym Open Training, Functional Fitness, Cross-training, Bootcamp,
  Bodybuilding, Calisthenics
- **Mind & Body** — Yoga, Pilates, Meditation, Breathwork
- **Outdoor & Adventure** — Beach Volleyball, Bouldering, Rock Climbing, Running, Hiking,
  Skateboarding
- **Wellness & Recovery** — Sauna, Cryotherapy, Massage, Spa, Infrared Cabins

## Mapping to FIT-M8 activities

Relevant `ActivityId`s already defined in [types.ts](../src/lib/types.ts), organized by the
groups above. Entries with no `ActivityId` are not yet tracked as activities in the app.

| Group                 | Sport                   | FIT-M8 `ActivityId` |
| --------------------- | ----------------------- | ------------------- |
| Aerial & Acrobatics   | Aerial Hoops            | —                   |
| Aerial & Acrobatics   | Pole Dance              | —                   |
| Aqua & Water Sports   | Swimming                | `swimming`          |
| Aqua & Water Sports   | Kayak                   | —                   |
| Aqua & Water Sports   | Canoe                   | —                   |
| Aqua & Water Sports   | Stand-up Paddleboarding | `paddleboard`       |
| Aqua & Water Sports   | Surfing                 | `surf`              |
| Aqua & Water Sports   | Wakeboarding            | —                   |
| Ball & Racquet Sports | Padel                   | `padel`             |
| Ball & Racquet Sports | Tennis                  | `tennis`            |
| Ball & Racquet Sports | Badminton               | `badminton`         |
| Ball & Racquet Sports | Squash                  | `squash`            |
| Ball & Racquet Sports | Football                | `soccer`            |
| Ball & Racquet Sports | Basketball              | `basketball`        |
| Ball & Racquet Sports | Table Tennis            | `pingPong`          |
| Combat & Martial Arts | Boxing                  | `martialArts`       |
| Combat & Martial Arts | Kickboxing              | `martialArts`       |
| Combat & Martial Arts | Muay Thai               | `martialArts`       |
| Combat & Martial Arts | Brazilian Jiu-Jitsu     | `martialArts`       |
| Combat & Martial Arts | Judo                    | `martialArts`       |
| Combat & Martial Arts | Karate                  | `martialArts`       |
| Combat & Martial Arts | Krav Maga               | `martialArts`       |
| Cycling & Mobility    | Indoor Cycling/Spinning | `cycling`           |
| Cycling & Mobility    | Outdoor Cycling         | `cycling`           |
| Cycling & Mobility    | Mobility Workouts       | —                   |
| Dance & Movement      | Salsa                   | —                   |
| Dance & Movement      | Bachata                 | —                   |
| Dance & Movement      | Hip Hop                 | —                   |
| Dance & Movement      | Contemporary Dance      | —                   |
| Dance & Movement      | Barre                   | —                   |
| Dance & Movement      | Trampolining            | —                   |
| Fitness & Strength    | Gym Open Training       | `gym`               |
| Fitness & Strength    | Functional Fitness      | `functionalFitness` |
| Fitness & Strength    | Cross-training          | `crossTraining`     |
| Fitness & Strength    | Bootcamp                | `bootCamp`          |
| Fitness & Strength    | Bodybuilding            | `bodybuilding`      |
| Fitness & Strength    | Calisthenics            | `calisthenics`      |
| Mind & Body           | Yoga                    | `yoga`              |
| Mind & Body           | Pilates                 | —                   |
| Mind & Body           | Meditation              | —                   |
| Mind & Body           | Breathwork              | —                   |
| Outdoor & Adventure   | Beach Volleyball        | `beachVolley`       |
| Outdoor & Adventure   | Foot Volley             | `footvolley`        |
| Outdoor & Adventure   | Bouldering              | `rockClimbing`      |
| Outdoor & Adventure   | Rock Climbing           | `rockClimbing`      |
| Outdoor & Adventure   | Running                 | `jogging`           |
| Outdoor & Adventure   | Hiking                  | `hiking`            |
| Outdoor & Adventure   | Skateboarding           | `skateboard`        |
| Wellness & Recovery   | Sauna                   | —                   |
| Wellness & Recovery   | Cryotherapy             | —                   |
| Wellness & Recovery   | Massage                 | —                   |
| Wellness & Recovery   | Spa                     | —                   |
| Wellness & Recovery   | Infrared Cabins         | —                   |

Existing `ActivityId`s not covered by the list above: `frescobol`, `golf`, `pickleball`,
`rollerblade`.
