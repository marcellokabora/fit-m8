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
        'common.search': 'Search',
        'common.noResults': 'No results',
        'common.showMore': 'More +',
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
        'common.message': 'Message',
        'common.gotIt': 'Got it',
        'common.back': 'Back',
        'common.loading': 'Loading...',
        'common.chat': 'Chat',
        'common.format': 'Format',
        'common.level': 'Level',
        'common.gender': 'Gender',
        'common.orientation': 'Orientation',
        'common.name': 'Name',
        'common.biography': 'Biography',
        'common.location': 'Location',
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
        'auth.forgotPassword': 'Forgot password?',
        'auth.enterEmailFirst': 'Enter your email address above first',
        'auth.resetEmailSent': 'Password reset email sent. Check your inbox.',
        'auth.verifyEmailTitle': 'Verify your email',
        'auth.verifyEmailHint': "We've sent a verification link to {email}. Confirm it to start appearing in Discover.",
        'auth.resendVerification': 'Resend verification email',
        'auth.verificationEmailSent': 'Verification email sent. Check your inbox.',
        'auth.iHaveVerified': "I've verified my email",
        'auth.stillNotVerified': "Still not verified. Check your inbox (and spam folder).",
        'auth.errorEmailInUse': 'An account with this email already exists. Try signing in instead.',
        'auth.errorInvalidEmail': 'Enter a valid email address.',
        'auth.errorWeakPassword': 'Choose a stronger password (at least 6 characters).',
        'auth.errorInvalidCredential': 'Incorrect email or password.',
        'auth.errorTooManyRequests': 'Too many attempts. Please wait a moment and try again.',
        'auth.emailVerifiedSuccess': 'Your email has been verified!',
        'errors.generic': 'Something went wrong',
        'onboarding.chooseLanguage': 'Choose your language',
        'onboarding.languageHint': 'You can change this later in your settings',
        'onboarding.permissionsTitle': 'Stay in the loop',
        'onboarding.permissionsHint': "We'll ask for a couple of permissions to get you set up",
        'onboarding.notificationsTitle': 'Push notifications',
        'onboarding.notificationsHint': 'Get notified about new matches and messages',
        'onboarding.enableNotifications': 'Enable notifications',
        'onboarding.notificationsEnabled': 'Notifications enabled',
        'onboarding.notificationsBlocked': 'Blocked — enable notifications in your browser settings',
        'onboarding.locationTitle': 'Location',
        'onboarding.locationHint': 'Used to find sports partners near you',
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
        'discover.datingPreset': 'Dating',
        'discover.friendsPreset': 'Friends',
        'discover.trainerPreset': 'Trainer',
        'discover.ageRange': 'Age range',
        'discover.distance': 'Distance',
        'discover.locationHint': 'Enable location detection in your profile to filter by distance.',
        'discover.allSports': 'All sports',
        'discover.refresh': 'Refresh',
        'discover.tryFilters': 'Try changing your filters or check back later',
        'discover.withinKm': 'Within {count} km',
        'discover.noMorePlayers': 'No more players',
        'discover.singleFilter': 'Only show singles',
        'discover.trainerFilter': 'Only show trainers',
        'discover.matchTitle': "It's a Match!",
        'discover.matchHint': 'You can now chat and plan your session!',
        'discover.matchNone': 'No matches found',
        'discover.matchOne': 'Match 1 person',
        'discover.matchMany': 'Match {count} people',
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
        'profile.share': 'Share',
        'profile.messageLockedTitle': 'Messaging coming soon',
        'profile.messageLockedHint': 'Direct messages unlock once this person subscribes to Fit-M8. Match with them to start chatting instead!',
        'profile.bio': 'Your bio...',
        'profile.signOut': 'Sign out',
        'profile.notFound': 'User not found',
        'profile.inCommon': 'In common',
        'profile.distanceAway': '{count} km away',
        'profile.addSport': 'Add a sport',
        'profile.allSports': "You've added every sport already!",
        'profile.addSportButton': 'Add sport',
        'profile.resetSwipes': 'Reset swipes',
        'profile.resettingSwipes': 'Resetting...',
        'profile.resetSwipesTitle': 'Reset swipes?',
        'profile.resetSwipesHint': "This also removes your current matches. This can't be undone.",
        'profile.discovery': 'Discovery',
        'profile.dangerZone': 'Danger zone',
        'profile.deleteAccount': 'Delete account',
        'profile.deletingAccount': 'Deleting...',
        'profile.deleteAccountTitle': 'Delete account?',
        'profile.deleteAccountHint': "This permanently deletes your profile, photos, swipes, matches and messages. This can't be undone.",
        'errors.requiresRecentLogin': 'Please sign out and sign back in, then try again.',
        'common.delete': 'Delete',
        'profile.statusTitle': 'Status',
        'profile.single': 'Single',
        'profile.trainer': 'Trainer',
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
        'format.group': '4+',
        'skill.basic': 'Basic',
        'skill.medium': 'Medium',
        'skill.expert': 'Expert',
        'gender.male': 'Male',
        'gender.female': 'Female',
        'orientation.hetero': 'Hetero',
        'orientation.gay': 'Gay',
        'profile.addSports': 'Add {count} sports',
        'common.language': 'Language',
        'sports.maxHint': 'You can pick up to {max} sports',
        'sports.maxReached': "You've reached the {max}-sport limit",
        'premium.title': 'Fit-M8 Premium',
        'premium.subtitle': 'Unlock more from your Fit-M8 experience',
        'premium.priceLine': '$9.99 / month',
        'premium.featureMoreSportsTitle': 'Add more sports',
        'premium.featureMoreSportsHint': 'Track up to {max} sports instead of {free}',
        'premium.featureDirectMessageTitle': 'Message anyone directly',
        'premium.featureDirectMessageHint': "Skip the match — reach out to any profile you're interested in",
        'premium.featureTrainerEventsTitle': 'Host events as a trainer',
        'premium.featureTrainerEventsHint': 'Create and promote sessions for people to join',
        'premium.comingSoon': 'Coming soon',
        'premium.subscribeButton': 'Subscribe now',
        'premium.activeTitle': "You're Premium",
        'premium.activeHint': 'Thanks for supporting Fit-M8! Every premium feature is unlocked.',
        'premium.cancelButton': 'Cancel subscription',
        'profile.goPremium': 'Go Premium',
        'profile.premiumMember': 'Premium member',
        'profile.premiumFeature': 'Premium'
    },
    es: {
        'meta.description': 'Conecta con personas para hacer deporte cerca de ti', 'language.en': 'Inglés', 'language.es': 'Español', 'language.pt': 'Portugués',
        'nav.discover': 'Descubrir', 'nav.matches': 'Coincidencias', 'nav.profile': 'Perfil', 'common.all': 'Todos', 'common.any': 'Cualquiera', 'common.search': 'Buscar', 'common.noResults': 'Sin resultados', 'common.showMore': 'Más +', 'common.save': 'Guardar', 'common.saving': 'Guardando...', 'common.refresh': 'Actualizar', 'common.close': 'Cerrar', 'common.back': 'Volver', 'common.loading': 'Cargando...', 'common.chat': 'Chat', 'common.format': 'Formato', 'common.level': 'Nivel', 'common.gender': 'Género', 'common.orientation': 'Orientación', 'common.sports': 'Deportes', 'common.mySports': 'Mis deportes', 'common.noActivities': 'No hay actividades configuradas', 'common.profilePhoto': 'Foto de perfil', 'common.profilePhotoNumber': 'Foto de perfil {count}', 'common.removePhoto': 'Eliminar foto', 'common.previousPhoto': 'Foto anterior', 'common.nextPhoto': 'Foto siguiente', 'common.main': 'Principal', 'home.tagline': 'Encuentra tu pareja deportiva ideal.', 'home.taglineSecond': 'Desliza. Conecta. Juega.', 'home.google': 'Continuar con Google', 'home.signingIn': 'Iniciando sesión...', 'auth.welcome': 'Te damos la bienvenida', 'auth.join': 'Únete a Fit-M8', 'auth.loginSubtitle': 'Inicia sesión para encontrar tu próxima conexión', 'auth.registerSubtitle': 'Crea tu perfil deportivo', 'auth.or': 'o', 'auth.email': 'Correo electrónico', 'auth.password': 'Contraseña', 'auth.confirmPassword': 'Confirmar contraseña', 'auth.loading': 'Cargando...', 'auth.signIn': 'Iniciar sesión', 'auth.createAccount': 'Crear cuenta', 'auth.noAccount': '¿No tienes una cuenta?', 'auth.haveAccount': '¿Ya tienes una cuenta?', 'auth.signUp': 'Registrarse', 'auth.passwordMismatch': 'Las contraseñas no coinciden', 'errors.generic': 'Algo salió mal', 'onboarding.chooseLanguage': 'Elige tu idioma', 'onboarding.languageHint': 'Puedes cambiarlo más tarde en tus ajustes', 'onboarding.permissionsTitle': 'Mantente al día', 'onboarding.permissionsHint': 'Te pediremos un par de permisos para configurarlo todo', 'onboarding.notificationsTitle': 'Notificaciones push', 'onboarding.notificationsHint': 'Recibe avisos de nuevos matches y mensajes', 'onboarding.enableNotifications': 'Activar notificaciones', 'onboarding.notificationsEnabled': 'Notificaciones activadas', 'onboarding.notificationsBlocked': 'Bloqueadas — actívalas en los ajustes de tu navegador', 'onboarding.locationTitle': 'Ubicación', 'onboarding.locationHint': 'Se usa para encontrar compañeros de deporte cerca de ti', 'onboarding.aboutYou': 'Sobre ti', 'onboarding.aboutYouHint': 'Cuéntanos quién eres', 'onboarding.name': 'Tu nombre', 'onboarding.bioOptional': 'Biografía breve (opcional)', 'onboarding.age': 'Edad', 'onboarding.yourSports': 'Tus deportes', 'onboarding.sportsHint': 'Elige las actividades que disfrutas', 'onboarding.yourSettings': 'Tus ajustes', 'onboarding.settingsHint': 'Elige formato y nivel para cada deporte', 'onboarding.profilePhotos': 'Fotos de perfil', 'onboarding.photosHint': 'Añade hasta 3 fotos para que otros puedan encontrarte (opcional). La primera será tu foto principal.', 'onboarding.makeItYours': 'Hazlo tuyo', 'onboarding.appearanceHint': 'Elige un estilo para la aplicación', 'discover.filters': 'Filtros', 'discover.datingPreset': 'Citas', 'discover.friendsPreset': 'Amistad', 'discover.trainerPreset': 'Entrenador', 'discover.ageRange': 'Rango de edad', 'discover.distance': 'Distancia', 'discover.withinKm': 'A menos de {count} km', 'discover.noMorePlayers': 'No hay más jugadores', 'discover.matchTitle': '¡Es una coincidencia!', 'discover.matchHint': '¡Ahora pueden chatear y planear su sesión!', 'matches.subtitle': 'Personas con las que coincidiste', 'matches.loadError': 'No se pudieron cargar las coincidencias', 'matches.emptyTitle': 'Aún no hay coincidencias', 'matches.emptyHint': '¡Sigue deslizando para encontrar tu pareja deportiva!', 'matches.goDiscover': 'Ir a Descubrir', 'matches.fallback': 'Coincidencia', 'chat.fallbackTitle': 'Chat de coincidencia', 'chat.emptyTitle': '¡Saluda a tu coincidencia!', 'chat.emptyHint': 'Planifiquen juntos su sesión deportiva', 'chat.placeholder': 'Escribe un mensaje...', 'profile.edit': 'Editar', 'profile.editTitle': 'Editar perfil', 'profile.bio': 'Tu biografía...', 'profile.signOut': 'Cerrar sesión', 'profile.notFound': 'Usuario no encontrado', 'profile.inCommon': 'En común', 'profile.addSport': 'Añadir un deporte', 'profile.allSports': '¡Ya has añadido todos los deportes!', 'profile.addSportButton': 'Añadir deporte', 'profile.resetSwipes': 'Restablecer deslizes', 'profile.resettingSwipes': 'Restableciendo...', 'appearance.title': 'Apariencia', 'appearance.light': 'Claro', 'appearance.dark': 'Oscuro', 'appearance.appTheme': 'Tema de la aplicación', 'location.enterCity': 'Escribe tu ciudad', 'location.editCity': 'Editar ciudad', 'location.detecting': 'Detectando...', 'location.useMyLocation': 'Usar mi ubicación', 'location.denied': 'Acceso a la ubicación denegado', 'location.unsupported': 'La geolocalización no es compatible con este dispositivo', 'location.detectFailed': 'No se pudo detectar tu ubicación', 'location.resolveFailed': 'No se pudo encontrar tu ciudad', 'photo.chooseImage': 'Elige un archivo de imagen', 'photo.uploadFailed': 'No se pudo subir la imagen', 'activity.jogging': 'Correr', 'activity.padel': 'Pádel', 'activity.tennis': 'Tenis', 'activity.beach-volley': 'Vóley playa', 'activity.basketball': 'Baloncesto', 'activity.cycling': 'Ciclismo', 'activity.swimming': 'Natación', 'activity.hiking': 'Senderismo', 'activity.badminton': 'Bádminton', 'activity.ping-pong': 'Ping-pong', 'activity.pickleball': 'Pickleball', 'activity.squash': 'Squash', 'activity.frescobol': 'Frescobol', 'activity.gym': 'Entrenamiento en gimnasio', 'activity.calisthenics': 'Calistenia', 'activity.rock-climbing': 'Escalada', 'activity.golf': 'Golf', 'activity.martial-arts': 'Artes marciales', 'activity.paddleboard': 'Paddle surf', 'format.all': 'Todos', 'format.1v1': '1 contra 1', 'format.2v2': '2 contra 2', 'format.group': '4+', 'skill.basic': 'Básico', 'skill.medium': 'Medio', 'skill.expert': 'Experto', 'gender.male': 'Hombre', 'gender.female': 'Mujer', 'orientation.hetero': 'Hetero', 'orientation.gay': 'Gay'
    },
    pt: {
        'meta.description': 'Combina com pessoas para praticar desporto perto de ti', 'language.en': 'Inglês', 'language.es': 'Espanhol', 'language.pt': 'Português',
        'nav.discover': 'Descobrir', 'nav.matches': 'Combinações', 'nav.profile': 'Perfil', 'common.all': 'Todos', 'common.any': 'Qualquer', 'common.search': 'Pesquisar', 'common.noResults': 'Sem resultados', 'common.showMore': 'Mais +', 'common.save': 'Guardar', 'common.saving': 'A guardar...', 'common.refresh': 'Atualizar', 'common.close': 'Fechar', 'common.back': 'Voltar', 'common.loading': 'A carregar...', 'common.chat': 'Chat', 'common.format': 'Formato', 'common.level': 'Nível', 'common.gender': 'Género', 'common.orientation': 'Orientação', 'common.sports': 'Desportos', 'common.mySports': 'Os meus desportos', 'common.noActivities': 'Nenhuma atividade definida', 'common.profilePhoto': 'Foto de perfil', 'common.profilePhotoNumber': 'Foto de perfil {count}', 'common.removePhoto': 'Remover foto', 'common.previousPhoto': 'Foto anterior', 'common.nextPhoto': 'Foto seguinte', 'common.main': 'Principal', 'home.tagline': 'Encontra o teu parceiro desportivo ideal.', 'home.taglineSecond': 'Desliza. Combina. Joga.', 'home.google': 'Continuar com o Google', 'home.signingIn': 'A iniciar sessão...', 'auth.welcome': 'Bem-vindo de volta', 'auth.join': 'Junta-te ao Fit-M8', 'auth.loginSubtitle': 'Inicia sessão para encontrar a tua próxima combinação', 'auth.registerSubtitle': 'Cria o teu perfil desportivo', 'auth.or': 'ou', 'auth.email': 'Endereço de email', 'auth.password': 'Palavra-passe', 'auth.confirmPassword': 'Confirmar palavra-passe', 'auth.loading': 'A carregar...', 'auth.signIn': 'Iniciar sessão', 'auth.createAccount': 'Criar conta', 'auth.noAccount': 'Ainda não tens conta?', 'auth.haveAccount': 'Já tens uma conta?', 'auth.signUp': 'Registar', 'auth.passwordMismatch': 'As palavras-passe não coincidem', 'errors.generic': 'Ocorreu um erro', 'onboarding.chooseLanguage': 'Escolhe o teu idioma', 'onboarding.languageHint': 'Podes alterar isto mais tarde nas definições', 'onboarding.permissionsTitle': 'Mantém-te a par', 'onboarding.permissionsHint': 'Vamos pedir-te algumas permissões para tudo ficar pronto', 'onboarding.notificationsTitle': 'Notificações push', 'onboarding.notificationsHint': 'Recebe avisos de novos matches e mensagens', 'onboarding.enableNotifications': 'Ativar notificações', 'onboarding.notificationsEnabled': 'Notificações ativadas', 'onboarding.notificationsBlocked': 'Bloqueadas — ativa-as nas definições do teu navegador', 'onboarding.locationTitle': 'Localização', 'onboarding.locationHint': 'Usada para encontrar parceiros de desporto perto de ti', 'onboarding.aboutYou': 'Sobre ti', 'onboarding.aboutYouHint': 'Conta-nos quem és', 'onboarding.name': 'O teu nome', 'onboarding.bioOptional': 'Breve biografia (opcional)', 'onboarding.age': 'Idade', 'onboarding.yourSports': 'Os teus desportos', 'onboarding.sportsHint': 'Escolhe as atividades de que gostas', 'onboarding.yourSettings': 'As tuas definições', 'onboarding.settingsHint': 'Escolhe o formato e o nível de cada desporto', 'onboarding.profilePhotos': 'Fotos de perfil', 'onboarding.photosHint': 'Adiciona até 3 fotos para que te possam encontrar (opcional). A primeira será a principal.', 'onboarding.makeItYours': 'Personaliza', 'onboarding.appearanceHint': 'Escolhe o visual da aplicação', 'discover.filters': 'Filtros', 'discover.datingPreset': 'Encontros', 'discover.friendsPreset': 'Amizade', 'discover.trainerPreset': 'Treinador', 'discover.ageRange': 'Intervalo de idade', 'discover.distance': 'Distância', 'discover.withinKm': 'Num raio de {count} km', 'discover.noMorePlayers': 'Não há mais jogadores', 'discover.matchTitle': 'É uma combinação!', 'discover.matchHint': 'Agora podem conversar e planear a sessão!', 'matches.subtitle': 'Pessoas com quem combinaste', 'matches.loadError': 'Não foi possível carregar as combinações', 'matches.emptyTitle': 'Ainda não há combinações', 'matches.emptyHint': 'Continua a deslizar para encontrares o teu parceiro desportivo!', 'matches.goDiscover': 'Ir para Descobrir', 'matches.fallback': 'Combinação', 'chat.fallbackTitle': 'Chat da combinação', 'chat.emptyTitle': 'Diz olá à tua combinação!', 'chat.emptyHint': 'Planeiem juntos a vossa sessão desportiva', 'chat.placeholder': 'Escreve uma mensagem...', 'profile.edit': 'Editar', 'profile.editTitle': 'Editar perfil', 'profile.bio': 'A tua biografia...', 'profile.signOut': 'Terminar sessão', 'profile.notFound': 'Utilizador não encontrado', 'profile.inCommon': 'Em comum', 'profile.addSport': 'Adicionar um desporto', 'profile.allSports': 'Já adicionaste todos os desportos!', 'profile.addSportButton': 'Adicionar desporto', 'profile.resetSwipes': 'Repor deslizes', 'profile.resettingSwipes': 'A repor...', 'appearance.title': 'Aparência', 'appearance.light': 'Claro', 'appearance.dark': 'Escuro', 'appearance.appTheme': 'Tema da aplicação', 'location.enterCity': 'Introduz a tua cidade', 'location.editCity': 'Editar cidade', 'location.detecting': 'A detetar...', 'location.useMyLocation': 'Usar a minha localização', 'location.denied': 'Acesso à localização negado', 'location.unsupported': 'A geolocalização não é suportada neste dispositivo', 'location.detectFailed': 'Não foi possível detetar a tua localização', 'location.resolveFailed': 'Não foi possível encontrar a tua cidade', 'photo.chooseImage': 'Escolhe um ficheiro de imagem', 'photo.uploadFailed': 'Não foi possível carregar a imagem', 'activity.jogging': 'Corrida', 'activity.padel': 'Padel', 'activity.tennis': 'Ténis', 'activity.beach-volley': 'Voleibol de praia', 'activity.basketball': 'Basquetebol', 'activity.cycling': 'Ciclismo', 'activity.swimming': 'Natação', 'activity.hiking': 'Caminhada', 'activity.badminton': 'Badminton', 'activity.ping-pong': 'Ténis de mesa', 'activity.pickleball': 'Pickleball', 'activity.squash': 'Squash', 'activity.frescobol': 'Frescobol', 'activity.gym': 'Treino de ginásio', 'activity.calisthenics': 'Calistenia', 'activity.rock-climbing': 'Escalada', 'activity.golf': 'Golfe', 'activity.martial-arts': 'Artes marciais', 'activity.paddleboard': 'Paddleboard', 'format.all': 'Todos', 'format.1v1': '1 contra 1', 'format.2v2': '2 contra 2', 'format.group': '4+', 'skill.basic': 'Básico', 'skill.medium': 'Médio', 'skill.expert': 'Perito', 'gender.male': 'Masculino', 'gender.female': 'Feminino', 'orientation.hetero': 'Hetero', 'orientation.gay': 'Gay'
    }
} as const;

export type TranslationKey = keyof typeof MESSAGES.en;
export type TranslationParams = Record<string, string | number>;

const EXTRA_MESSAGES: Record<LanguageCode, Partial<Record<TranslationKey, string>>> = {
    en: {},
    es: {
        'auth.forgotPassword': '¿Olvidaste tu contraseña?',
        'auth.enterEmailFirst': 'Introduce primero tu correo electrónico',
        'auth.resetEmailSent': 'Correo de restablecimiento enviado. Revisa tu bandeja de entrada.',
        'auth.verifyEmailTitle': 'Verifica tu correo electrónico',
        'auth.verifyEmailHint': 'Hemos enviado un enlace de verificación a {email}. Confírmalo para empezar a aparecer en Descubrir.',
        'auth.resendVerification': 'Reenviar correo de verificación',
        'auth.verificationEmailSent': 'Correo de verificación enviado. Revisa tu bandeja de entrada.',
        'auth.iHaveVerified': 'Ya he verificado mi correo',
        'auth.stillNotVerified': 'Todavía no está verificado. Revisa tu bandeja de entrada (y spam).',
        'auth.errorEmailInUse': 'Ya existe una cuenta con este correo. Intenta iniciar sesión.',
        'auth.errorInvalidEmail': 'Introduce un correo electrónico válido.',
        'auth.errorWeakPassword': 'Elige una contraseña más segura (al menos 6 caracteres).',
        'auth.errorInvalidCredential': 'Correo o contraseña incorrectos.',
        'auth.errorTooManyRequests': 'Demasiados intentos. Espera un momento e intenta de nuevo.',
        'auth.emailVerifiedSuccess': '¡Tu correo electrónico ha sido verificado!',
        'discover.matchNone': 'Ningún resultado',
        'discover.matchOne': 'Conectar con 1 persona',
        'discover.matchMany': 'Conectar con {count} personas',
        'profile.distanceAway': 'A {count} km',
        'intro.skip': 'Omitir',
        'intro.next': 'Siguiente',
        'intro.dating.title': 'Encuentra una cita',
        'intro.dating.body': 'Configura tus filtros de género y orientación para conocer a personas con las que conectes mientras practicas los deportes que te gustan.',
        'intro.friends.title': 'Haz nuevos amigos',
        'intro.friends.body': '¿No buscas una cita? Desactiva los filtros y encuentra compañeros de entrenamiento para compartir una sesión.',
        'intro.experts.title': 'Aprende de expertos',
        'intro.experts.body': 'Filtra por nivel Experto para encontrar jugadores y entrenadores con experiencia que te ayuden a mejorar tu juego.',
        'common.language': 'Idioma',
        'common.name': 'Nombre',
        'common.biography': 'Biografía',
        'common.location': 'Ubicación',
        'discover.singleFilter': 'Mostrar solo solteros',
        'discover.trainerFilter': 'Mostrar solo entrenadores',
        'profile.statusTitle': 'Estado',
        'profile.single': 'Soltero/a',
        'profile.trainer': 'Entrenador/a',
        'common.message': 'Mensaje',
        'common.gotIt': 'Entendido',
        'profile.share': 'Compartir',
        'profile.messageLockedTitle': 'Mensajería próximamente',
        'profile.messageLockedHint': 'Los mensajes directos se desbloquean cuando esta persona se suscriba a Fit-M8. ¡Conecta con ella para poder chatear!',
        'profile.resetSwipesTitle': '¿Restablecer desplazamientos?',
        'profile.resetSwipesHint': 'Esto también eliminará tus coincidencias actuales. Esta acción no se puede deshacer.',
        'profile.dangerZone': 'Zona de peligro',
        'profile.deleteAccount': 'Eliminar cuenta',
        'profile.deletingAccount': 'Eliminando...',
        'profile.deleteAccountTitle': '¿Eliminar cuenta?',
        'profile.deleteAccountHint': 'Esto elimina permanentemente tu perfil, fotos, deslizamientos, coincidencias y mensajes. Esta acción no se puede deshacer.',
        'errors.requiresRecentLogin': 'Por seguridad, cierra sesión y vuelve a iniciar sesión antes de continuar.',
        'common.delete': 'Eliminar',
        'sports.maxHint': 'Puedes elegir hasta {max} deportes',
        'sports.maxReached': 'Has alcanzado el límite de {max} deportes',
        'premium.title': 'Fit-M8 Premium',
        'premium.subtitle': 'Desbloquea más funciones de Fit-M8',
        'premium.priceLine': '9,99 $ / mes',
        'premium.featureMoreSportsTitle': 'Añade más deportes',
        'premium.featureMoreSportsHint': 'Sigue hasta {max} deportes en lugar de {free}',
        'premium.featureDirectMessageTitle': 'Escribe directamente a cualquiera',
        'premium.featureDirectMessageHint': 'Sin esperar a hacer match: contacta con cualquier perfil que te interese',
        'premium.featureTrainerEventsTitle': 'Organiza eventos como entrenador',
        'premium.featureTrainerEventsHint': 'Crea y promociona sesiones para que la gente se apunte',
        'premium.comingSoon': 'Próximamente',
        'premium.subscribeButton': 'Suscribirme ahora',
        'premium.activeTitle': 'Ya eres Premium',
        'premium.activeHint': '¡Gracias por apoyar a Fit-M8! Todas las funciones premium están desbloqueadas.',
        'premium.cancelButton': 'Cancelar suscripción',
        'profile.goPremium': 'Hazte Premium',
        'profile.premiumMember': 'Miembro Premium',
        'profile.premiumFeature': 'Premium',
        'common.keepSwiping': 'Seguir deslizando',
        'matches.viewMatches': 'Ver coincidencias'
    },
    pt: {
        'auth.forgotPassword': 'Esqueceste-te da palavra-passe?',
        'auth.enterEmailFirst': 'Introduz primeiro o teu email',
        'auth.resetEmailSent': 'Email de redefinição enviado. Verifica a tua caixa de entrada.',
        'auth.verifyEmailTitle': 'Verifica o teu email',
        'auth.verifyEmailHint': 'Enviámos um link de verificação para {email}. Confirma-o para começares a aparecer em Descobrir.',
        'auth.resendVerification': 'Reenviar email de verificação',
        'auth.verificationEmailSent': 'Email de verificação enviado. Verifica a tua caixa de entrada.',
        'auth.iHaveVerified': 'Já verifiquei o meu email',
        'auth.stillNotVerified': 'Ainda não verificado. Verifica a tua caixa de entrada (e spam).',
        'auth.errorEmailInUse': 'Já existe uma conta com este email. Tenta iniciar sessão.',
        'auth.errorInvalidEmail': 'Introduz um email válido.',
        'auth.errorWeakPassword': 'Escolhe uma palavra-passe mais forte (pelo menos 6 caracteres).',
        'auth.errorInvalidCredential': 'Email ou palavra-passe incorretos.',
        'auth.errorTooManyRequests': 'Demasiadas tentativas. Espera um momento e tenta novamente.',
        'auth.emailVerifiedSuccess': 'O teu email foi verificado!',
        'discover.matchNone': 'Nenhum resultado',
        'discover.matchOne': 'Ligar com 1 pessoa',
        'discover.matchMany': 'Ligar com {count} pessoas',
        'profile.distanceAway': 'A {count} km',
        'intro.skip': 'Saltar',
        'intro.next': 'Seguinte',
        'intro.dating.title': 'Encontra um par',
        'intro.dating.body': 'Define os teus filtros de género e orientação para conheceres pessoas com quem te identifiques enquanto praticas os teus desportos favoritos.',
        'intro.friends.title': 'Faz novos amigos',
        'intro.friends.body': 'Não procuras encontros? Desativa os filtros e encontra parceiros de treino para partilharem uma sessão.',
        'intro.experts.title': 'Aprende com especialistas',
        'intro.experts.body': 'Filtra pelo nível Especialista para encontrares jogadores e treinadores experientes que te podem ajudar a melhorar o teu jogo.',
        'common.language': 'Idioma',
        'common.name': 'Nome',
        'common.biography': 'Biografia',
        'common.location': 'Localização',
        'common.message': 'Mensagem',
        'common.gotIt': 'Entendido',
        'profile.share': 'Partilhar',
        'profile.messageLockedTitle': 'Mensagens brevemente',
        'profile.messageLockedHint': 'As mensagens diretas ficam disponíveis quando esta pessoa subscrever o Fit-M8. Combina com ela para poderes conversar!',
        'profile.resetSwipesTitle': 'Repor deslizes?',
        'profile.resetSwipesHint': 'Isto também remove as tuas combinações atuais. Esta ação não pode ser revertida.',
        'profile.dangerZone': 'Zona de perigo',
        'profile.deleteAccount': 'Eliminar conta',
        'profile.deletingAccount': 'A eliminar...',
        'profile.deleteAccountTitle': 'Eliminar conta?',
        'profile.deleteAccountHint': 'Isto elimina permanentemente o teu perfil, fotos, deslizes, combinações e mensagens. Esta ação não pode ser revertida.',
        'errors.requiresRecentLogin': 'Por segurança, termina sessão e inicia sessão novamente antes de continuar.',
        'common.delete': 'Eliminar',
        'sports.maxHint': 'Podes escolher até {max} desportos',
        'sports.maxReached': 'Atingiste o limite de {max} desportos',
        'premium.title': 'Fit-M8 Premium',
        'premium.subtitle': 'Desbloqueia mais funcionalidades do Fit-M8',
        'premium.priceLine': '9,99 $ / mês',
        'premium.featureMoreSportsTitle': 'Adiciona mais desportos',
        'premium.featureMoreSportsHint': 'Acompanha até {max} desportos em vez de {free}',
        'premium.featureDirectMessageTitle': 'Envia mensagens diretas a qualquer pessoa',
        'premium.featureDirectMessageHint': 'Sem esperar por um match: contacta qualquer perfil que te interesse',
        'premium.featureTrainerEventsTitle': 'Organiza eventos como treinador',
        'premium.featureTrainerEventsHint': 'Cria e promove sessões para as pessoas se juntarem',
        'premium.comingSoon': 'Brevemente',
        'premium.subscribeButton': 'Subscrever agora',
        'premium.activeTitle': 'Já és Premium',
        'premium.activeHint': 'Obrigado por apoiares o Fit-M8! Todas as funcionalidades premium estão desbloqueadas.',
        'premium.cancelButton': 'Cancelar subscrição',
        'profile.goPremium': 'Torna-te Premium',
        'profile.premiumMember': 'Membro Premium',
        'profile.premiumFeature': 'Premium',
        'common.keepSwiping': 'Continuar a deslizar',
        'matches.viewMatches': 'Ver combinações'
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

const LANGUAGE_KEY = 'fit-m8-language';
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
        },
        // Clears the saved preference and reverts to the browser/default language, e.g. after account deletion.
        reset: () => {
            if (typeof window !== 'undefined') window.localStorage.removeItem(LANGUAGE_KEY);
            const language = browserLanguage();
            applyLanguage(language);
            set(language);
        }
    };
}

export const activeLanguage = createLanguageStore();