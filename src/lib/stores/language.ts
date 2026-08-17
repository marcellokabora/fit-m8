import { writable } from 'svelte/store';

export type LanguageCode = 'en' | 'es' | 'pt';

export interface LanguageOption {
    code: LanguageCode;
}

export const LANGUAGES: LanguageOption[] = [
    { code: 'en' },
    { code: 'es' },
    { code: 'pt' }
];

const MESSAGES = {
    en: {
        'nav.discover': 'Discover',
        'nav.matches': 'Matches',
        'nav.profile': 'Profile',
        'language.en': 'English',
        'language.es': 'Spanish',
        'language.pt': 'Portuguese',
        'common.all': 'All',
        'common.any': 'Any',
        'common.save': 'Save',
        'common.saving': 'Saving...',
        'common.refresh': 'Refresh',
        'common.close': 'Close',
        'common.cancel': 'Cancel',
        'common.clear': 'Clear',
        'common.keepSwiping': 'Keep swiping',
        'common.information': 'Information',
        'common.removeSport': 'Remove',
        'common.continue': 'Continue',
        'common.letsGo': "Let's go!",
        'common.like': 'Like',
        'common.pass': 'Pass',
        'common.back': 'Back',
        'common.loading': 'Loading...',
        'common.chat': 'Chat',
        'common.format': 'Format',
        'common.level': 'Level',
        'common.gender': 'Gender',
        'common.orientation': 'Orientation',
        'common.sports': 'Sports',
        'common.mySports': 'My Sports',
        'common.noActivities': 'No activities set',
        'common.profilePhoto': 'Profile photo',
        'common.profilePhotoNumber': 'Profile photo {count}',
        'common.removePhoto': 'Remove photo',
        'common.previousPhoto': 'Previous photo',
        'common.nextPhoto': 'Next photo',
        'common.main': 'Main',
        'home.tagline': 'Find your perfect sports partner.',
        'home.taglineSecond': 'Swipe. Match. Play.',
        'meta.description': 'Match people for sports activities near you',
        'home.google': 'Continue with Google',
        'home.email': 'Sign up or log in with email',
        'home.signingIn': 'Signing in...',
        'auth.welcome': 'Welcome back',
        'auth.join': 'Join Fit-M8',
        'auth.loginSubtitle': 'Sign in to find your next match',
        'auth.registerSubtitle': 'Create your sports profile',
        'auth.or': 'or',
        'auth.email': 'Email address',
        'auth.password': 'Password',
        'auth.confirmPassword': 'Confirm password',
        'auth.loading': 'Loading...',
        'auth.signIn': 'Sign in',
        'auth.createAccount': 'Create account',
        'auth.noAccount': "Don't have an account?",
        'auth.haveAccount': 'Already have an account?',
        'auth.signUp': 'Sign up',
        'auth.passwordMismatch': 'Passwords do not match',
        'errors.generic': 'Something went wrong',
        'onboarding.chooseLanguage': 'Choose your language',
        'onboarding.languageHint': 'You can change this later in your settings',
        'onboarding.aboutYou': 'About you',
        'onboarding.aboutYouHint': 'Tell us who you are',
        'onboarding.name': 'Your name',
        'onboarding.bioOptional': 'Short bio (optional)',
        'onboarding.age': 'Age',
        'onboarding.yourSports': 'Your sports',
        'onboarding.sportsHint': 'Pick the activities you enjoy',
        'onboarding.yourSettings': 'Your settings',
        'onboarding.settingsHint': 'For each sport, pick format and level',
        'onboarding.profilePhotos': 'Profile photos',
        'onboarding.photosHint': 'Add up to 3 photos so others can find you (optional). The first one is your main photo.',
        'onboarding.makeItYours': 'Make it yours',
        'onboarding.appearanceHint': 'Pick a look for the app',
        'intro.skip': 'Skip',
        'intro.next': 'Next',
        'intro.dating.title': 'Find a date',
        'intro.dating.body': 'Set your gender and orientation filters to meet people you click with while doing the sports you love.',
        'intro.friends.title': 'Make new friends',
        'intro.friends.body': 'Not looking to date? Turn the filters off and simply find training partners to share a session with.',
        'intro.experts.title': 'Learn from experts',
        'intro.experts.body': 'Filter by Expert level to find experienced players and trainers who can help you step up your game.',
        'discover.filters': 'Filters',
        'discover.ageRange': 'Age range',
        'discover.distance': 'Distance',
        'discover.locationHint': 'Enable location detection in your profile to filter by distance.',
        'discover.allSports': 'All sports',
        'discover.refresh': 'Refresh',
        'discover.tryFilters': 'Try changing your filters or check back later',
        'discover.withinKm': 'Within {count} km',
        'discover.noMorePlayers': 'No more players',
        'discover.matchTitle': "It's a Match!",
        'discover.matchHint': 'You can now chat and plan your session!',
        'matches.subtitle': 'People you matched with',
        'matches.loadError': "Couldn't load matches",
        'matches.emptyTitle': 'No matches yet',
        'matches.emptyHint': 'Keep swiping to find your sports partner!',
        'matches.goDiscover': 'Go to Discover',
        'matches.viewMatches': 'View matches',
        'matches.fallback': 'Match',
        'chat.fallbackTitle': 'Match Chat',
        'chat.emptyTitle': 'Say hi to your match!',
        'chat.emptyHint': 'Plan your activity session together',
        'chat.placeholder': 'Type a message...',
        'profile.edit': 'Edit',
        'profile.editTitle': 'Edit profile',
        'profile.bio': 'Your bio...',
        'profile.signOut': 'Sign out',
        'profile.notFound': 'User not found',
        'profile.distanceAway': '{count} km away',
        'profile.addSport': 'Add a sport',
        'profile.allSports': "You've added every sport already!",
        'profile.addSportButton': 'Add sport',
        'profile.resetSwipes': 'Reset swipes',
        'profile.resettingSwipes': 'Resetting...',
        'profile.discovery': 'Discovery',
        'profile.resetConfirm': "Reset all swipes? Everyone you've liked or passed will reappear in Discover. This can't be undone.",
        'appearance.title': 'Appearance',
        'appearance.light': 'Light',
        'appearance.dark': 'Dark',
        'appearance.appTheme': 'App Theme',
        'appearance.classic': 'Classic',
        'appearance.ocean': 'Ocean',
        'appearance.sunset': 'Sunset',
        'appearance.forest': 'Forest',
        'appearance.berry': 'Berry',
        'appearance.slate': 'Slate',
        'location.enterCity': 'Enter your city',
        'location.editCity': 'Edit city',
        'location.detecting': 'Detecting...',
        'location.useMyLocation': 'Use my location',
        'location.denied': 'Location access denied',
        'location.unsupported': "Geolocation isn't supported on this device",
        'location.detectFailed': "Couldn't detect your location",
        'location.resolveFailed': "Couldn't resolve your city",
        'photo.chooseImage': 'Please choose an image file',
        'photo.uploadFailed': 'Upload failed',
        'activity.jogging': 'Jogging',
        'activity.padel': 'Padel',
        'activity.tennis': 'Tennis',
        'activity.beach-volley': 'Beach Volley',
        'activity.basketball': 'Basketball',
        'activity.cycling': 'Cycling',
        'activity.swimming': 'Swimming',
        'activity.hiking': 'Hiking',
        'activity.badminton': 'Badminton',
        'activity.ping-pong': 'Ping Pong',
        'activity.pickleball': 'Pickleball',
        'activity.squash': 'Squash',
        'activity.frescobol': 'Frescobol',
        'activity.gym': 'Gym Training',
        'activity.calisthenics': 'Calisthenics',
        'activity.rock-climbing': 'Rock Climbing',
        'activity.golf': 'Golf',
        'activity.martial-arts': 'Martial Arts',
        'activity.paddleboard': 'Paddleboard',
        'format.all': 'All',
        'format.1v1': '1v1',
        'format.2v2': '2v2',
        'skill.basic': 'Basic',
        'skill.expert': 'Expert',
        'gender.male': 'Male',
        'gender.female': 'Female',
        'orientation.hetero': 'Hetero',
        'orientation.gay': 'Gay',
        'profile.addSports': 'Add {count} sports'
    },
    es: {
        'meta.description': 'Conecta con personas para hacer deporte cerca de ti', 'language.en': 'Inglés', 'language.es': 'Español', 'language.pt': 'Portugués',
        'nav.discover': 'Descubrir', 'nav.matches': 'Coincidencias', 'nav.profile': 'Perfil', 'common.all': 'Todos', 'common.any': 'Cualquiera', 'common.save': 'Guardar', 'common.saving': 'Guardando...', 'common.refresh': 'Actualizar', 'common.close': 'Cerrar', 'common.back': 'Volver', 'common.loading': 'Cargando...', 'common.chat': 'Chat', 'common.format': 'Formato', 'common.level': 'Nivel', 'common.gender': 'Género', 'common.orientation': 'Orientación', 'common.sports': 'Deportes', 'common.mySports': 'Mis deportes', 'common.noActivities': 'No hay actividades configuradas', 'common.profilePhoto': 'Foto de perfil', 'common.profilePhotoNumber': 'Foto de perfil {count}', 'common.removePhoto': 'Eliminar foto', 'common.previousPhoto': 'Foto anterior', 'common.nextPhoto': 'Foto siguiente', 'common.main': 'Principal', 'home.tagline': 'Encuentra tu pareja deportiva ideal.', 'home.taglineSecond': 'Desliza. Conecta. Juega.', 'home.google': 'Continuar con Google', 'home.signingIn': 'Iniciando sesión...', 'auth.welcome': 'Te damos la bienvenida', 'auth.join': 'Únete a Fit-M8', 'auth.loginSubtitle': 'Inicia sesión para encontrar tu próxima conexión', 'auth.registerSubtitle': 'Crea tu perfil deportivo', 'auth.or': 'o', 'auth.email': 'Correo electrónico', 'auth.password': 'Contraseña', 'auth.confirmPassword': 'Confirmar contraseña', 'auth.loading': 'Cargando...', 'auth.signIn': 'Iniciar sesión', 'auth.createAccount': 'Crear cuenta', 'auth.noAccount': '¿No tienes una cuenta?', 'auth.haveAccount': '¿Ya tienes una cuenta?', 'auth.signUp': 'Registrarse', 'auth.passwordMismatch': 'Las contraseñas no coinciden', 'errors.generic': 'Algo salió mal', 'onboarding.chooseLanguage': 'Elige tu idioma', 'onboarding.languageHint': 'Puedes cambiarlo más tarde en tus ajustes', 'onboarding.aboutYou': 'Sobre ti', 'onboarding.aboutYouHint': 'Cuéntanos quién eres', 'onboarding.name': 'Tu nombre', 'onboarding.bioOptional': 'Biografía breve (opcional)', 'onboarding.age': 'Edad', 'onboarding.yourSports': 'Tus deportes', 'onboarding.sportsHint': 'Elige las actividades que disfrutas', 'onboarding.yourSettings': 'Tus ajustes', 'onboarding.settingsHint': 'Elige formato y nivel para cada deporte', 'onboarding.profilePhotos': 'Fotos de perfil', 'onboarding.photosHint': 'Añade hasta 3 fotos para que otros puedan encontrarte (opcional). La primera será tu foto principal.', 'onboarding.makeItYours': 'Hazlo tuyo', 'onboarding.appearanceHint': 'Elige un estilo para la aplicación', 'discover.filters': 'Filtros', 'discover.ageRange': 'Rango de edad', 'discover.distance': 'Distancia', 'discover.withinKm': 'A menos de {count} km', 'discover.noMorePlayers': 'No hay más jugadores', 'discover.matchTitle': '¡Es una coincidencia!', 'discover.matchHint': '¡Ahora pueden chatear y planear su sesión!', 'matches.subtitle': 'Personas con las que coincidiste', 'matches.loadError': 'No se pudieron cargar las coincidencias', 'matches.emptyTitle': 'Aún no hay coincidencias', 'matches.emptyHint': '¡Sigue deslizando para encontrar tu pareja deportiva!', 'matches.goDiscover': 'Ir a Descubrir', 'matches.fallback': 'Coincidencia', 'chat.fallbackTitle': 'Chat de coincidencia', 'chat.emptyTitle': '¡Saluda a tu coincidencia!', 'chat.emptyHint': 'Planifiquen juntos su sesión deportiva', 'chat.placeholder': 'Escribe un mensaje...', 'profile.edit': 'Editar', 'profile.editTitle': 'Editar perfil', 'profile.bio': 'Tu biografía...', 'profile.signOut': 'Cerrar sesión', 'profile.notFound': 'Usuario no encontrado', 'profile.addSport': 'Añadir un deporte', 'profile.allSports': '¡Ya has añadido todos los deportes!', 'profile.addSportButton': 'Añadir deporte', 'profile.resetSwipes': 'Restablecer desplazamientos', 'profile.resettingSwipes': 'Restableciendo...', 'appearance.title': 'Apariencia', 'appearance.light': 'Claro', 'appearance.dark': 'Oscuro', 'appearance.appTheme': 'Tema de la aplicación', 'location.enterCity': 'Escribe tu ciudad', 'location.editCity': 'Editar ciudad', 'location.detecting': 'Detectando...', 'location.useMyLocation': 'Usar mi ubicación', 'location.denied': 'Acceso a la ubicación denegado', 'location.unsupported': 'La geolocalización no es compatible con este dispositivo', 'location.detectFailed': 'No se pudo detectar tu ubicación', 'location.resolveFailed': 'No se pudo encontrar tu ciudad', 'photo.chooseImage': 'Elige un archivo de imagen', 'photo.uploadFailed': 'No se pudo subir la imagen', 'activity.jogging': 'Correr', 'activity.padel': 'Pádel', 'activity.tennis': 'Tenis', 'activity.beach-volley': 'Vóley playa', 'activity.basketball': 'Baloncesto', 'activity.cycling': 'Ciclismo', 'activity.swimming': 'Natación', 'activity.hiking': 'Senderismo', 'activity.badminton': 'Bádminton', 'activity.ping-pong': 'Ping-pong', 'activity.pickleball': 'Pickleball', 'activity.squash': 'Squash', 'activity.frescobol': 'Frescobol', 'activity.gym': 'Entrenamiento en gimnasio', 'activity.calisthenics': 'Calistenia', 'activity.rock-climbing': 'Escalada', 'activity.golf': 'Golf', 'activity.martial-arts': 'Artes marciales', 'activity.paddleboard': 'Paddle surf', 'format.all': 'Todos', 'format.1v1': '1 contra 1', 'format.2v2': '2 contra 2', 'skill.basic': 'Básico', 'skill.expert': 'Experto', 'gender.male': 'Hombre', 'gender.female': 'Mujer', 'orientation.hetero': 'Hetero', 'orientation.gay': 'Gay'
    },
    pt: {
        'meta.description': 'Combina com pessoas para praticar desporto perto de ti', 'language.en': 'Inglês', 'language.es': 'Espanhol', 'language.pt': 'Português',
        'nav.discover': 'Descobrir', 'nav.matches': 'Combinações', 'nav.profile': 'Perfil', 'common.all': 'Todos', 'common.any': 'Qualquer', 'common.save': 'Guardar', 'common.saving': 'A guardar...', 'common.refresh': 'Atualizar', 'common.close': 'Fechar', 'common.back': 'Voltar', 'common.loading': 'A carregar...', 'common.chat': 'Chat', 'common.format': 'Formato', 'common.level': 'Nível', 'common.gender': 'Género', 'common.orientation': 'Orientação', 'common.sports': 'Desportos', 'common.mySports': 'Os meus desportos', 'common.noActivities': 'Nenhuma atividade definida', 'common.profilePhoto': 'Foto de perfil', 'common.profilePhotoNumber': 'Foto de perfil {count}', 'common.removePhoto': 'Remover foto', 'common.previousPhoto': 'Foto anterior', 'common.nextPhoto': 'Foto seguinte', 'common.main': 'Principal', 'home.tagline': 'Encontra o teu parceiro desportivo ideal.', 'home.taglineSecond': 'Desliza. Combina. Joga.', 'home.google': 'Continuar com o Google', 'home.signingIn': 'A iniciar sessão...', 'auth.welcome': 'Bem-vindo de volta', 'auth.join': 'Junta-te ao Fit-M8', 'auth.loginSubtitle': 'Inicia sessão para encontrar a tua próxima combinação', 'auth.registerSubtitle': 'Cria o teu perfil desportivo', 'auth.or': 'ou', 'auth.email': 'Endereço de email', 'auth.password': 'Palavra-passe', 'auth.confirmPassword': 'Confirmar palavra-passe', 'auth.loading': 'A carregar...', 'auth.signIn': 'Iniciar sessão', 'auth.createAccount': 'Criar conta', 'auth.noAccount': 'Ainda não tens conta?', 'auth.haveAccount': 'Já tens uma conta?', 'auth.signUp': 'Registar', 'auth.passwordMismatch': 'As palavras-passe não coincidem', 'errors.generic': 'Ocorreu um erro', 'onboarding.chooseLanguage': 'Escolhe o teu idioma', 'onboarding.languageHint': 'Podes alterar isto mais tarde nas definições', 'onboarding.aboutYou': 'Sobre ti', 'onboarding.aboutYouHint': 'Conta-nos quem és', 'onboarding.name': 'O teu nome', 'onboarding.bioOptional': 'Breve biografia (opcional)', 'onboarding.age': 'Idade', 'onboarding.yourSports': 'Os teus desportos', 'onboarding.sportsHint': 'Escolhe as atividades de que gostas', 'onboarding.yourSettings': 'As tuas definições', 'onboarding.settingsHint': 'Escolhe o formato e o nível de cada desporto', 'onboarding.profilePhotos': 'Fotos de perfil', 'onboarding.photosHint': 'Adiciona até 3 fotos para que te possam encontrar (opcional). A primeira será a principal.', 'onboarding.makeItYours': 'Personaliza', 'onboarding.appearanceHint': 'Escolhe o visual da aplicação', 'discover.filters': 'Filtros', 'discover.ageRange': 'Intervalo de idade', 'discover.distance': 'Distância', 'discover.withinKm': 'Num raio de {count} km', 'discover.noMorePlayers': 'Não há mais jogadores', 'discover.matchTitle': 'É uma combinação!', 'discover.matchHint': 'Agora podem conversar e planear a sessão!', 'matches.subtitle': 'Pessoas com quem combinaste', 'matches.loadError': 'Não foi possível carregar as combinações', 'matches.emptyTitle': 'Ainda não há combinações', 'matches.emptyHint': 'Continua a deslizar para encontrares o teu parceiro desportivo!', 'matches.goDiscover': 'Ir para Descobrir', 'matches.fallback': 'Combinação', 'chat.fallbackTitle': 'Chat da combinação', 'chat.emptyTitle': 'Diz olá à tua combinação!', 'chat.emptyHint': 'Planeiem juntos a vossa sessão desportiva', 'chat.placeholder': 'Escreve uma mensagem...', 'profile.edit': 'Editar', 'profile.editTitle': 'Editar perfil', 'profile.bio': 'A tua biografia...', 'profile.signOut': 'Terminar sessão', 'profile.notFound': 'Utilizador não encontrado', 'profile.addSport': 'Adicionar um desporto', 'profile.allSports': 'Já adicionaste todos os desportos!', 'profile.addSportButton': 'Adicionar desporto', 'profile.resetSwipes': 'Repor deslizes', 'profile.resettingSwipes': 'A repor...', 'appearance.title': 'Aparência', 'appearance.light': 'Claro', 'appearance.dark': 'Escuro', 'appearance.appTheme': 'Tema da aplicação', 'location.enterCity': 'Introduz a tua cidade', 'location.editCity': 'Editar cidade', 'location.detecting': 'A detetar...', 'location.useMyLocation': 'Usar a minha localização', 'location.denied': 'Acesso à localização negado', 'location.unsupported': 'A geolocalização não é suportada neste dispositivo', 'location.detectFailed': 'Não foi possível detetar a tua localização', 'location.resolveFailed': 'Não foi possível encontrar a tua cidade', 'photo.chooseImage': 'Escolhe um ficheiro de imagem', 'photo.uploadFailed': 'Não foi possível carregar a imagem', 'activity.jogging': 'Corrida', 'activity.padel': 'Padel', 'activity.tennis': 'Ténis', 'activity.beach-volley': 'Voleibol de praia', 'activity.basketball': 'Basquetebol', 'activity.cycling': 'Ciclismo', 'activity.swimming': 'Natação', 'activity.hiking': 'Caminhada', 'activity.badminton': 'Badminton', 'activity.ping-pong': 'Ténis de mesa', 'activity.pickleball': 'Pickleball', 'activity.squash': 'Squash', 'activity.frescobol': 'Frescobol', 'activity.gym': 'Treino de ginásio', 'activity.calisthenics': 'Calistenia', 'activity.rock-climbing': 'Escalada', 'activity.golf': 'Golfe', 'activity.martial-arts': 'Artes marciais', 'activity.paddleboard': 'Paddleboard', 'format.all': 'Todos', 'format.1v1': '1 contra 1', 'format.2v2': '2 contra 2', 'skill.basic': 'Básico', 'skill.expert': 'Perito', 'gender.male': 'Masculino', 'gender.female': 'Feminino', 'orientation.hetero': 'Heterossexual', 'orientation.gay': 'Gay'
    }
} as const;

export type TranslationKey = keyof typeof MESSAGES.en;
export type TranslationParams = Record<string, string | number>;

const EXTRA_MESSAGES: Record<LanguageCode, Partial<Record<TranslationKey, string>>> = {
    en: {},
    es: {
        'profile.distanceAway': 'A {count} km',
        'intro.skip': 'Omitir',
        'intro.next': 'Siguiente',
        'intro.dating.title': 'Encuentra una cita',
        'intro.dating.body': 'Configura tus filtros de género y orientación para conocer a personas con las que conectes mientras practicas los deportes que te gustan.',
        'intro.friends.title': 'Haz nuevos amigos',
        'intro.friends.body': '¿No buscas una cita? Desactiva los filtros y encuentra compañeros de entrenamiento para compartir una sesión.',
        'intro.experts.title': 'Aprende de expertos',
        'intro.experts.body': 'Filtra por nivel Experto para encontrar jugadores y entrenadores con experiencia que te ayuden a mejorar tu juego.'
    },
    pt: {
        'profile.distanceAway': 'A {count} km',
        'intro.skip': 'Saltar',
        'intro.next': 'Seguinte',
        'intro.dating.title': 'Encontra um par',
        'intro.dating.body': 'Define os teus filtros de género e orientação para conheceres pessoas com quem te identifiques enquanto praticas os teus desportos favoritos.',
        'intro.friends.title': 'Faz novos amigos',
        'intro.friends.body': 'Não procuras encontros? Desativa os filtros e encontra parceiros de treino para partilharem uma sessão.',
        'intro.experts.title': 'Aprende com especialistas',
        'intro.experts.body': 'Filtra pelo nível Especialista para encontrares jogadores e treinadores experientes que te podem ajudar a melhorar o teu jogo.'
    }
};

export interface Translator {
    t: (key: TranslationKey, params?: TranslationParams) => string;
    activity: (id: string) => string;
    format: (value: string) => string;
    skill: (value: string) => string;
    gender: (value: string) => string;
    orientation: (value: string) => string;
}

export function createTranslator(language: LanguageCode): Translator {
    const messages: Partial<Record<TranslationKey, string>> = {
        ...MESSAGES[language],
        ...EXTRA_MESSAGES[language]
    };
    const t = (key: TranslationKey, params: TranslationParams = {}) => {
        const template = messages[key] ?? MESSAGES.en[key] ?? key;
        return template.replace(/\{(\w+)\}/g, (_match: string, name: string) => String(params[name] ?? `{${name}}`));
    };
    const normalizeEnumValue = (value: string) => {
        const normalized = String(value ?? '').trim().toLowerCase();
        if (normalized === 'straight' || normalized === 'Hetero') return 'hetero';
        if (normalized === 'male' || normalized === 'female' || normalized === 'basic' || normalized === 'expert') return normalized;
        return normalized;
    };
    const humanize = (value: string) =>
        String(value ?? '')
            .split(/[-_\s]+/)
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');
    const label = (prefix: string, value: string) => {
        const key = `${prefix}.${normalizeEnumValue(value)}` as TranslationKey;
        const translated = t(key);
        return translated === key ? humanize(normalizeEnumValue(value)) : translated;
    };

    return {
        t,
        activity: (id) => label('activity', id),
        format: (value) => value === '1v1' || value === '2v2' ? value : label('format', value),
        skill: (value) => label('skill', value),
        gender: (value) => label('gender', value),
        orientation: (value) => label('orientation', value)
    };
}

const LANGUAGE_KEY = 'fitmate-language';
const DEFAULT_LANGUAGE: LanguageCode = 'en';

function browserLanguage(): LanguageCode {
    if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE;
    const language = navigator.language.toLowerCase().split('-')[0];
    return LANGUAGES.some((option) => option.code === language)
        ? (language as LanguageCode)
        : DEFAULT_LANGUAGE;
}

function applyLanguage(language: LanguageCode) {
    if (typeof document !== 'undefined') document.documentElement.lang = language;
}

function createLanguageStore() {
    const { subscribe, set } = writable<LanguageCode>(DEFAULT_LANGUAGE);

    return {
        subscribe,
        init: () => {
            if (typeof window === 'undefined') return;
            const savedLanguage = window.localStorage.getItem(LANGUAGE_KEY);
            const language = LANGUAGES.some((option) => option.code === savedLanguage)
                ? (savedLanguage as LanguageCode)
                : browserLanguage();
            applyLanguage(language);
            set(language);
        },
        selectLanguage: (language: LanguageCode) => {
            if (!LANGUAGES.some((option) => option.code === language)) return;
            applyLanguage(language);
            if (typeof window !== 'undefined') window.localStorage.setItem(LANGUAGE_KEY, language);
            set(language);
        }
    };
}

export const activeLanguage = createLanguageStore();