const ACTIVITY_POOL = [
    'jogging',
    'padel',
    'tennis',
    'beachTennis',
    'beachVolley',
    'basketball',
    'soccer',
    'cycling',
    'swimming',
    'hiking',
    'pingPong',
    'pickleball',
    'squash',
    'gym',
    'calisthenics',
    'rockClimbing',
    'golf',
    'boxing',
    'kickboxing',
    'muayThai',
    'karate',
    'jiuJitsu',
    'judo',
    'frescobol',
    'paddleboard',
    'surf',
    'windsurf',
    'kitesurf',
    'wingFoil',
    'paraWing',
    'yoga',
    'rollerblade',
    'bmx',
    'scooter',
    'electricScooter',
    'kayak',
    'surfskate',
    'skateboard',
    'footVolley',
    'bodybuilding',
    'crossTraining',
    'functionalFitness',
    'bootCamp',
    'pilates',
    'meditation',
    'breathwork',
    'salsa',
    'bachata',
    'kizomba',
    'barre',
    'poleDance',
    'trampoline'
];

const EXCLUDED_ACTIVITIES_BY_GENDER = {
    male: ['pilates', 'barre', 'poleDance', 'trampoline'],
    female: ['bodybuilding', 'boxing', 'kickboxing', 'muayThai']
};

const TARGET_ACTIVITY_COUNT = 10;
const FORMATS = ['1v1', '2v2', 'all'];
const LEVELS = ['basic', 'medium', 'expert'];

function shuffled(array) {
    const copy = [...array];
    for (let index = copy.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }
    return copy;
}

function fillActivities(activities, gender, pool = ACTIVITY_POOL) {
    const excludedIds = new Set(EXCLUDED_ACTIVITIES_BY_GENDER[gender] ?? []);
    const existingIds = new Set();
    const result = [];

    for (const activity of Array.isArray(activities) ? activities : []) {
        if (!activity || typeof activity.id !== 'string') continue;
        if (excludedIds.has(activity.id) || existingIds.has(activity.id)) continue;
        existingIds.add(activity.id);
        result.push(activity);
    }

    const eligibleIds = shuffled(
        pool.filter(id => !excludedIds.has(id) && !existingIds.has(id))
    );

    while (result.length < TARGET_ACTIVITY_COUNT && eligibleIds.length > 0) {
        const id = eligibleIds.pop();
        existingIds.add(id);
        result.push({
            id,
            format: FORMATS[Math.floor(Math.random() * FORMATS.length)],
            level: LEVELS[Math.floor(Math.random() * LEVELS.length)]
        });
    }

    if (result.length < TARGET_ACTIVITY_COUNT) {
        throw new Error(`Only ${result.length} eligible activities are available for gender "${gender}"`);
    }

    return result;
}

module.exports = {
    ACTIVITY_POOL,
    EXCLUDED_ACTIVITIES_BY_GENDER,
    TARGET_ACTIVITY_COUNT,
    fillActivities,
    shuffled
};