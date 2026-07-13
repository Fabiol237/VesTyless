const coursesDataPart3 = [
  // =====================================================
  // g) Configuration (id 68-70)
  // =====================================================
  {
    id: 68,
    title: 'QoS basique (Quality of Service)',
    category: 'Configuration',
    level: 'Intermédiaire',
    duration: '1h30',
    description: 'Comprendre et configurer la qualité de service pour prioriser le trafic réseau et garantir les performances des applications critiques.',
    content: '<h4>Introduction à la QoS</h4>' +
      '<p>La Quality of Service (QoS) désigne l\'ensemble des mécanismes permettant de différencier et prioriser le trafic réseau. Sans QoS, tous les paquets sont traités de manière identique selon le principe du \"best effort\". Or, certaines applications comme la VoIP ou la visioconférence nécessitent une latence faible et un débit garanti pour fonctionner correctement.</p>' +
      '<p>La QoS repose sur trois piliers fondamentaux : la classification du trafic, le marquage des paquets et l\'application de politiques de gestion des files d\'attente. Chaque pilier joue un rôle essentiel dans la chaîne de traitement du trafic.</p>' +
      '<h4>Classification et marquage</h4>' +
      '<p>La classification consiste à identifier le type de trafic traversant le réseau. On peut classifier selon l\'adresse IP source ou destination, le port TCP/UDP, le protocole utilisé ou encore le DSCP (Differentiated Services Code Point). Le marquage intervient ensuite pour étiqueter les paquets avec une valeur de priorité.</p>' +
      '<p>Le champ DSCP utilise 6 bits du champ ToS (Type of Service) de l\'en-tête IPv4, permettant 64 valeurs possibles. Les classes les plus courantes sont :</p>' +
      '<ul>' +
      '<li><strong>EF (Expedited Forwarding - DSCP 46)</strong> : réservé au trafic temps réel comme la VoIP</li>' +
      '<li><strong>AF (Assured Forwarding)</strong> : 4 classes (AF1x à AF4x) avec 3 niveaux de drop par classe</li>' +
      '<li><strong>CS (Class Selector)</strong> : compatibilité avec l\'ancien champ IP Precedence</li>' +
      '<li><strong>BE (Best Effort - DSCP 0)</strong> : trafic par défaut sans garantie</li>' +
      '</ul>' +
      '<h4>Mécanismes de file d\'attente</h4>' +
      '<p>Les mécanismes de queuing déterminent l\'ordre dans lequel les paquets sont transmis. Les principaux algorithmes sont :</p>' +
      '<ul>' +
      '<li><strong>FIFO (First In First Out)</strong> : traitement dans l\'ordre d\'arrivée, sans distinction</li>' +
      '<li><strong>PQ (Priority Queuing)</strong> : les files de haute priorité sont toujours servies en premier</li>' +
      '<li><strong>WFQ (Weighted Fair Queuing)</strong> : répartition proportionnelle selon les poids attribués</li>' +
      '<li><strong>CBWFQ (Class-Based WFQ)</strong> : WFQ avec des classes définies par l\'administrateur</li>' +
      '<li><strong>LLQ (Low Latency Queuing)</strong> : combinaison de CBWFQ avec une file strictement prioritaire</li>' +
      '</ul>' +
      '<h4>Configuration Cisco basique</h4>' +
      '<p>Sur un routeur Cisco, la configuration QoS suit une approche modulaire appelée MQC (Modular QoS CLI) qui comprend trois étapes :</p>' +
      '<pre>! 1. Définir les classes de trafic\n' +
      'class-map match-any VOIX\n' +
      '  match dscp ef\n' +
      '  match protocol rtp\n' +
      '\n' +
      'class-map match-any VIDEO\n' +
      '  match dscp af41\n' +
      '\n' +
      '! 2. Définir la politique\n' +
      'policy-map QOS-POLICY\n' +
      '  class VOIX\n' +
      '    priority percent 30\n' +
      '  class VIDEO\n' +
      '    bandwidth percent 20\n' +
      '  class class-default\n' +
      '    fair-queue\n' +
      '\n' +
      '! 3. Appliquer sur l\'interface\n' +
      'interface GigabitEthernet0/1\n' +
      '  service-policy output QOS-POLICY</pre>' +
      '<h4>Policing et shaping</h4>' +
      '<p>Le policing et le shaping sont deux techniques de régulation du débit. Le policing impose une limite stricte : les paquets excédant le débit configuré sont immédiatement marqués ou supprimés. Le shaping, en revanche, lisse le trafic en mettant en tampon les paquets excédentaires pour les transmettre ultérieurement. Le shaping est généralement préféré car il évite les pertes de paquets, mais il introduit un léger délai supplémentaire.</p>' +
      '<h4>Bonnes pratiques</h4>' +
      '<p>Pour une implémentation QoS efficace, il est recommandé de classifier et marquer le trafic au plus près de la source, d\'utiliser un modèle de QoS de bout en bout (end-to-end), de réserver au maximum 33% de la bande passante pour la file prioritaire, et de toujours laisser au moins 25% de bande passante pour la classe par défaut. Un audit régulier du trafic permet d\'ajuster les politiques en fonction de l\'évolution des besoins.</p>'
  },
  {
    id: 69,
    title: 'HSRP et VRRP (redondance de passerelle)',
    category: 'Configuration',
    level: 'Intermédiaire',
    duration: '1h30',
    description: 'Maîtriser les protocoles de redondance de passerelle par défaut pour assurer la haute disponibilité du réseau.',
    content: '<h4>Pourquoi la redondance de passerelle ?</h4>' +
      '<p>Dans un réseau local, chaque machine est configurée avec une passerelle par défaut (default gateway) unique. Si ce routeur tombe en panne, toutes les machines du sous-réseau perdent leur accès au reste du réseau et à Internet. Les protocoles de redondance de passerelle résolvent ce problème en permettant à plusieurs routeurs de partager une adresse IP virtuelle commune, offrant ainsi un basculement automatique et transparent.</p>' +
      '<h4>HSRP - Hot Standby Router Protocol</h4>' +
      '<p>HSRP est un protocole propriétaire Cisco qui permet à un groupe de routeurs de présenter une adresse IP virtuelle unique aux hôtes du réseau. Un seul routeur est actif à tout moment et répond aux requêtes ARP pour l\'adresse IP virtuelle. Les autres routeurs restent en standby et prennent le relais en cas de défaillance du routeur actif.</p>' +
      '<p>HSRP fonctionne grâce à l\'échange de messages Hello entre les routeurs du groupe. Le routeur avec la priorité la plus élevée (par défaut 100, maximum 255) devient le routeur actif. Les timers par défaut sont : Hello = 3 secondes, Hold = 10 secondes.</p>' +
      '<pre>! Configuration HSRP sur Routeur 1 (Actif)\n' +
      'interface GigabitEthernet0/0\n' +
      '  ip address 192.168.1.2 255.255.255.0\n' +
      '  standby 1 ip 192.168.1.1\n' +
      '  standby 1 priority 110\n' +
      '  standby 1 preempt\n' +
      '  standby 1 timers 1 3\n' +
      '  standby 1 track GigabitEthernet0/1 20\n' +
      '\n' +
      '! Configuration HSRP sur Routeur 2 (Standby)\n' +
      'interface GigabitEthernet0/0\n' +
      '  ip address 192.168.1.3 255.255.255.0\n' +
      '  standby 1 ip 192.168.1.1\n' +
      '  standby 1 priority 100\n' +
      '  standby 1 preempt</pre>' +
      '<h4>Les états HSRP</h4>' +
      '<p>Un routeur HSRP passe par plusieurs états au cours de son fonctionnement :</p>' +
      '<ul>' +
      '<li><strong>Initial</strong> : état de démarrage, HSRP n\'est pas encore en fonctionnement</li>' +
      '<li><strong>Learn</strong> : le routeur attend de recevoir un message du routeur actif pour connaître l\'IP virtuelle</li>' +
      '<li><strong>Listen</strong> : le routeur connaît l\'IP virtuelle mais n\'est ni actif ni standby</li>' +
      '<li><strong>Speak</strong> : le routeur participe à l\'élection et envoie des messages Hello</li>' +
      '<li><strong>Standby</strong> : le routeur est candidat pour devenir actif en cas de défaillance</li>' +
      '<li><strong>Active</strong> : le routeur transmet le trafic pour l\'adresse IP virtuelle</li>' +
      '</ul>' +
      '<h4>VRRP - Virtual Router Redundancy Protocol</h4>' +
      '<p>VRRP (RFC 5798) est le standard ouvert équivalent à HSRP. Contrairement à HSRP, VRRP permet au routeur Master d\'utiliser son adresse IP réelle comme adresse IP virtuelle du groupe, ce qui simplifie la configuration. Le routeur avec la priorité la plus élevée (par défaut 100, maximum 254) devient le Master. La priorité 255 est réservée au routeur dont l\'adresse IP réelle correspond à l\'IP virtuelle.</p>' +
      '<pre>! Configuration VRRP sur Routeur 1\n' +
      'interface GigabitEthernet0/0\n' +
      '  ip address 192.168.1.2 255.255.255.0\n' +
      '  vrrp 1 ip 192.168.1.1\n' +
      '  vrrp 1 priority 120\n' +
      '  vrrp 1 preempt\n' +
      '\n' +
      '! Configuration VRRP sur Routeur 2\n' +
      'interface GigabitEthernet0/0\n' +
      '  ip address 192.168.1.3 255.255.255.0\n' +
      '  vrrp 1 ip 192.168.1.1\n' +
      '  vrrp 1 priority 100</pre>' +
      '<h4>Comparaison HSRP vs VRRP</h4>' +
      '<p>Les principales différences entre HSRP et VRRP sont les suivantes : HSRP est propriétaire Cisco alors que VRRP est un standard IETF. HSRP utilise l\'adresse multicast 224.0.0.2 (v1) ou 224.0.0.102 (v2), VRRP utilise 224.0.0.18. HSRP a un timer Hello de 3 secondes par défaut contre 1 seconde pour VRRP. VRRP permet l\'utilisation de l\'IP réelle comme IP virtuelle, ce que HSRP ne supporte pas. Enfin, HSRPv2 supporte IPv6 et les groupes étendus (0-4095).</p>' +
      '<h4>Tracking et optimisation</h4>' +
      '<p>Le tracking permet de modifier dynamiquement la priorité d\'un routeur en fonction de l\'état d\'une interface ou d\'un objet de suivi. Par exemple, si l\'interface WAN du routeur actif tombe en panne, sa priorité est automatiquement diminuée, provoquant un basculement vers le routeur standby. Cette fonctionnalité est essentielle pour garantir que le routeur actif dispose toujours d\'une connectivité fonctionnelle vers le réseau de destination.</p>'
  },
  {
    id: 70,
    title: 'Configuration serveur DHCP',
    category: 'Configuration',
    level: 'Débutant',
    duration: '1h',
    description: 'Apprendre à configurer un serveur DHCP pour l\'attribution automatique d\'adresses IP et la gestion centralisée de l\'adressage réseau.',
    content: '<h4>Principe du DHCP</h4>' +
      '<p>Le protocole DHCP (Dynamic Host Configuration Protocol) permet l\'attribution automatique de paramètres réseau aux machines d\'un réseau local. Au lieu de configurer manuellement chaque poste avec une adresse IP, un masque de sous-réseau, une passerelle et des serveurs DNS, le DHCP automatise entièrement ce processus. Ce protocole fonctionne sur le modèle client-serveur et utilise les ports UDP 67 (serveur) et 68 (client).</p>' +
      '<h4>Le processus DORA</h4>' +
      '<p>L\'attribution d\'une adresse DHCP suit un échange en quatre étapes connu sous l\'acronyme DORA :</p>' +
      '<ul>' +
      '<li><strong>Discover</strong> : le client envoie un message broadcast (255.255.255.255) pour découvrir les serveurs DHCP disponibles sur le réseau</li>' +
      '<li><strong>Offer</strong> : chaque serveur DHCP qui reçoit le Discover répond avec une offre contenant une adresse IP proposée et les paramètres réseau associés</li>' +
      '<li><strong>Request</strong> : le client sélectionne une offre (généralement la première reçue) et envoie un message broadcast pour informer tous les serveurs de son choix</li>' +
      '<li><strong>Acknowledge</strong> : le serveur sélectionné confirme l\'attribution en envoyant un ACK contenant tous les paramètres définitifs et la durée du bail</li>' +
      '</ul>' +
      '<h4>Configuration sur un routeur Cisco</h4>' +
      '<p>Un routeur Cisco peut servir de serveur DHCP pour les réseaux qu\'il dessert. Voici une configuration complète :</p>' +
      '<pre>! Exclure les adresses réservées (routeurs, serveurs, imprimantes)\n' +
      'ip dhcp excluded-address 192.168.10.1 192.168.10.20\n' +
      'ip dhcp excluded-address 192.168.10.250 192.168.10.254\n' +
      '\n' +
      '! Créer le pool DHCP pour le réseau LAN\n' +
      'ip dhcp pool LAN-POOL\n' +
      '  network 192.168.10.0 255.255.255.0\n' +
      '  default-router 192.168.10.1\n' +
      '  dns-server 8.8.8.8 8.8.4.4\n' +
      '  domain-name entreprise.local\n' +
      '  lease 7\n' +
      '\n' +
      '! Vérification\n' +
      'show ip dhcp binding\n' +
      'show ip dhcp pool\n' +
      'show ip dhcp server statistics</pre>' +
      '<h4>Configuration sur Linux (ISC DHCP)</h4>' +
      '<p>Sur un serveur Linux, le démon isc-dhcp-server est couramment utilisé. La configuration se fait dans le fichier <code>/etc/dhcp/dhcpd.conf</code> :</p>' +
      '<pre>subnet 192.168.10.0 netmask 255.255.255.0 {\n' +
      '  range 192.168.10.50 192.168.10.200;\n' +
      '  option routers 192.168.10.1;\n' +
      '  option domain-name-servers 8.8.8.8, 8.8.4.4;\n' +
      '  option domain-name "entreprise.local";\n' +
      '  default-lease-time 600;\n' +
      '  max-lease-time 7200;\n' +
      '}\n' +
      '\n' +
      '# Réservation d\'adresse par MAC\n' +
      'host imprimante-rdc {\n' +
      '  hardware ethernet 00:1A:2B:3C:4D:5E;\n' +
      '  fixed-address 192.168.10.30;\n' +
      '}</pre>' +
      '<h4>DHCP Relay Agent</h4>' +
      '<p>Les messages DHCP Discover étant des broadcasts, ils ne traversent pas les routeurs par défaut. Dans un réseau multi-sous-réseaux avec un seul serveur DHCP centralisé, il faut configurer un agent relais DHCP (ip helper-address) sur chaque routeur pour retransmettre les requêtes DHCP en unicast vers le serveur :</p>' +
      '<pre>interface GigabitEthernet0/0\n' +
      '  ip address 192.168.20.1 255.255.255.0\n' +
      '  ip helper-address 192.168.10.5</pre>' +
      '<h4>Durée du bail et renouvellement</h4>' +
      '<p>Le bail DHCP détermine combien de temps un client peut utiliser une adresse IP attribuée. À 50% de la durée du bail (T1), le client tente de renouveler son bail auprès du serveur d\'origine. À 87,5% (T2), si le renouvellement a échoué, le client tente un rebinding auprès de n\'importe quel serveur DHCP. Si le bail expire sans renouvellement, le client libère l\'adresse et recommence le processus DORA. Un bail trop court génère du trafic inutile, un bail trop long gaspille des adresses.</p>' +
      '<h4>Sécurité DHCP</h4>' +
      '<p>Le DHCP Snooping est une fonctionnalité de sécurité essentielle sur les commutateurs qui protège contre les serveurs DHCP pirates (rogue DHCP). Il permet de désigner les ports de confiance (trusted) connectés aux vrais serveurs DHCP et de filtrer les réponses DHCP sur les ports non fiables (untrusted). Cette mesure empêche un attaquant de distribuer de fausses configurations réseau pour intercepter le trafic.</p>'
  },

  // =====================================================
  // h) Sans Fil & VPN (id 71-80)
  // =====================================================
  {
    id: 71,
    title: 'Standards WiFi (802.11a/b/g/n/ac/ax)',
    category: 'Sans Fil & VPN',
    level: 'Débutant',
    duration: '1h',
    description: 'Découvrir l\'évolution des standards WiFi, leurs caractéristiques techniques et les performances de chaque génération.',
    content: '<h4>L\'évolution du WiFi</h4>' +
      '<p>Le WiFi, basé sur la famille de standards IEEE 802.11, a considérablement évolué depuis sa création en 1997. Chaque nouvelle génération apporte des améliorations en termes de débit, de portée, d\'efficacité spectrale et de gestion des environnements denses. L\'alliance Wi-Fi a introduit en 2018 une nomenclature simplifiée : WiFi 4 (802.11n), WiFi 5 (802.11ac), WiFi 6 (802.11ax), et WiFi 7 (802.11be).</p>' +
      '<h4>Les premiers standards</h4>' +
      '<p>Le standard <strong>802.11b</strong> (1999) a été le premier à connaître un succès commercial. Opérant sur la bande 2,4 GHz, il offrait un débit maximal de 11 Mbps avec une bonne portée grâce aux propriétés de propagation de cette fréquence. Le <strong>802.11a</strong> (1999 également) utilisait la bande 5 GHz avec un débit théorique de 54 Mbps mais une portée réduite. Le <strong>802.11g</strong> (2003) combinait le meilleur des deux : bande 2,4 GHz avec un débit de 54 Mbps et une compatibilité descendante avec le 802.11b.</p>' +
      '<h4>802.11n (WiFi 4)</h4>' +
      '<p>Ratifié en 2009, le 802.11n a marqué une rupture technologique majeure avec l\'introduction du MIMO (Multiple Input Multiple Output). Cette technologie utilise plusieurs antennes en émission et réception pour multiplier les flux de données simultanés. Avec jusqu\'à 4 flux spatiaux et des canaux de 40 MHz, le 802.11n atteint un débit théorique maximal de 600 Mbps. Il fonctionne sur les bandes 2,4 GHz et 5 GHz (dual-band).</p>' +
      '<h4>802.11ac (WiFi 5)</h4>' +
      '<p>Le 802.11ac (2013) opère exclusivement sur la bande 5 GHz et introduit plusieurs innovations :</p>' +
      '<ul>' +
      '<li><strong>Canaux plus larges</strong> : jusqu\'à 160 MHz (contre 40 MHz pour le 802.11n)</li>' +
      '<li><strong>MU-MIMO</strong> : transmission simultanée vers plusieurs clients (downlink uniquement)</li>' +
      '<li><strong>Modulation 256-QAM</strong> : encodage plus dense de l\'information</li>' +
      '<li><strong>Beamforming</strong> : focalisation du signal vers les clients pour améliorer la portée</li>' +
      '<li><strong>Débit théorique</strong> : jusqu\'à 6,93 Gbps avec 8 flux spatiaux (Wave 2)</li>' +
      '</ul>' +
      '<h4>802.11ax (WiFi 6 / WiFi 6E)</h4>' +
      '<p>Le WiFi 6 (2020) se concentre sur l\'efficacité en environnement dense plutôt que sur le débit brut maximal. Il introduit l\'OFDMA (Orthogonal Frequency Division Multiple Access), inspiré de la 4G/LTE, qui permet de diviser un canal en sous-canaux attribués à différents clients simultanément. Le MU-MIMO est étendu à l\'uplink, et la modulation passe à 1024-QAM. Le mécanisme BSS Coloring réduit les interférences entre réseaux voisins. Le WiFi 6E étend ces capacités à la bande 6 GHz (5,925 - 7,125 GHz), offrant jusqu\'à 1200 MHz de spectre supplémentaire.</p>' +
      '<h4>WiFi 7 (802.11be)</h4>' +
      '<p>Le WiFi 7, en cours de déploiement, promet des débits théoriques dépassant 46 Gbps grâce à des canaux de 320 MHz, la modulation 4096-QAM, et le MLO (Multi-Link Operation) qui permet d\'agréger simultanément les bandes 2,4 GHz, 5 GHz et 6 GHz. Cette dernière fonctionnalité améliore considérablement la latence et la fiabilité en utilisant plusieurs liens radio en parallèle.</p>' +
      '<h4>Choisir le bon standard</h4>' +
      '<p>Le choix du standard dépend des besoins : pour un usage domestique basique, le WiFi 5 reste suffisant. Pour les entreprises avec de nombreux utilisateurs, le WiFi 6 est recommandé. Le WiFi 6E est idéal pour les environnements très denses ou nécessitant une latence ultra-faible. Il est important de noter que le débit réel est toujours significativement inférieur au débit théorique, généralement d\'un facteur 2 à 3.</p>'
  },
  {
    id: 72,
    title: 'Fréquences et canaux WiFi',
    category: 'Sans Fil & VPN',
    level: 'Débutant',
    duration: '45 min',
    description: 'Comprendre le spectre radio utilisé par le WiFi, la sélection des canaux et la gestion des interférences.',
    content: '<h4>Le spectre radio WiFi</h4>' +
      '<p>Le WiFi utilise principalement trois bandes de fréquences : 2,4 GHz (2400-2483,5 MHz), 5 GHz (5150-5850 MHz selon les régions) et plus récemment 6 GHz (5925-7125 MHz avec le WiFi 6E). Ces fréquences font partie du spectre ISM (Industrial, Scientific and Medical) et ne nécessitent pas de licence d\'émission, ce qui explique leur adoption massive mais aussi les risques d\'interférences.</p>' +
      '<h4>La bande 2,4 GHz</h4>' +
      '<p>La bande 2,4 GHz est divisée en 14 canaux espacés de 5 MHz chacun (seuls les canaux 1 à 13 sont disponibles en Europe, 1 à 11 aux États-Unis). Chaque canal WiFi a une largeur réelle de 22 MHz, ce qui signifie que les canaux se chevauchent. Pour éviter les interférences, il faut utiliser des canaux non-chevauchants :</p>' +
      '<ul>' +
      '<li><strong>Canaux 1, 6, 11</strong> : la combinaison la plus courante, offrant 3 canaux sans recouvrement</li>' +
      '<li><strong>Canaux 1, 5, 9, 13</strong> : possible en Europe avec 4 canaux (léger recouvrement marginal)</li>' +
      '</ul>' +
      '<p>La bande 2,4 GHz offre une meilleure portée grâce à sa longueur d\'onde plus grande (environ 12,5 cm) qui traverse mieux les obstacles. En revanche, elle est fortement encombrée car partagée avec le Bluetooth, les fours micro-ondes, les téléphones sans fil DECT et de nombreux autres appareils IoT.</p>' +
      '<h4>La bande 5 GHz</h4>' +
      '<p>La bande 5 GHz offre beaucoup plus de canaux disponibles (jusqu\'à 25 canaux de 20 MHz en Europe) et est moins sujette aux interférences. Les canaux sont regroupés en sous-bandes appelées UNII (Unlicensed National Information Infrastructure) :</p>' +
      '<ul>' +
      '<li><strong>UNII-1 (5150-5250 MHz)</strong> : canaux 36, 40, 44, 48 - usage intérieur</li>' +
      '<li><strong>UNII-2 (5250-5350 MHz)</strong> : canaux 52, 56, 60, 64 - DFS requis</li>' +
      '<li><strong>UNII-2 Extended (5470-5725 MHz)</strong> : canaux 100 à 140 - DFS requis</li>' +
      '<li><strong>UNII-3 (5725-5850 MHz)</strong> : canaux 149, 153, 157, 161, 165</li>' +
      '</ul>' +
      '<h4>DFS et TPC</h4>' +
      '<p>Le DFS (Dynamic Frequency Selection) est un mécanisme obligatoire sur certains canaux 5 GHz qui impose aux points d\'accès de détecter la présence de radars (météorologiques, militaires) et de changer automatiquement de canal en cas de détection. Le TPC (Transmit Power Control) ajuste la puissance d\'émission pour limiter les interférences. Ces mécanismes peuvent provoquer des interruptions temporaires, il est donc préférable d\'utiliser les canaux UNII-1 pour les applications sensibles à la latence.</p>' +
      '<h4>Largeur de canal</h4>' +
      '<p>Les standards modernes permettent d\'agréger des canaux pour augmenter le débit : 20 MHz (standard), 40 MHz (2 canaux), 80 MHz (4 canaux), 160 MHz (8 canaux) et 320 MHz (WiFi 7). Des canaux plus larges offrent un débit supérieur mais réduisent le nombre de canaux disponibles et augmentent la sensibilité aux interférences. En environnement dense, il est souvent préférable de rester en 20 ou 40 MHz pour maximiser le nombre de canaux indépendants.</p>' +
      '<h4>Planification des canaux</h4>' +
      '<p>Une bonne planification des canaux est essentielle pour optimiser les performances WiFi. Les règles fondamentales sont : ne jamais utiliser de canaux partiellement chevauchants (par exemple les canaux 1 et 3 en 2,4 GHz), espacer les points d\'accès utilisant le même canal d\'au moins 3 cellules, et utiliser un outil d\'analyse spectrale pour identifier les sources d\'interférences avant le déploiement. Les contrôleurs WiFi modernes automatisent cette planification grâce à des algorithmes RRM (Radio Resource Management).</p>'
  },
  {
    id: 73,
    title: 'Sécurité WiFi avancée',
    category: 'Sans Fil & VPN',
    level: 'Avancé',
    duration: '2h',
    description: 'Approfondir les mécanismes de sécurité WiFi modernes, de WPA3 aux architectures d\'authentification 802.1X/RADIUS.',
    content: '<h4>Évolution de la sécurité WiFi</h4>' +
      '<p>La sécurité WiFi a traversé plusieurs générations, chacune corrigeant les failles de la précédente. Le WEP (Wired Equivalent Privacy), premier protocole de sécurité WiFi, a été cassé dès 2001 en raison de faiblesses fondamentales dans l\'utilisation du chiffrement RC4 avec des vecteurs d\'initialisation courts. Le WPA (WiFi Protected Access) a apporté le protocole TKIP comme solution temporaire, avant que le WPA2 n\'introduise le chiffrement AES-CCMP robuste en 2004. Aujourd\'hui, WPA3 représente l\'état de l\'art en matière de sécurité sans fil.</p>' +
      '<h4>WPA3 en détail</h4>' +
      '<p>WPA3, certifié en 2018, apporte des améliorations significatives :</p>' +
      '<ul>' +
      '<li><strong>SAE (Simultaneous Authentication of Equals)</strong> : remplace le PSK par un échange Dragonfly qui résiste aux attaques par dictionnaire hors ligne, même si le mot de passe est faible</li>' +
      '<li><strong>Forward Secrecy</strong> : chaque session utilise des clés éphémères uniques ; la compromission d\'une session ne compromet pas les autres</li>' +
      '<li><strong>PMF (Protected Management Frames)</strong> : obligatoire, protège contre les attaques de désauthentification et de dissociation</li>' +
      '<li><strong>Chiffrement individualisé</strong> : sur les réseaux ouverts (OWE - Opportunistic Wireless Encryption), chaque connexion est chiffrée même sans mot de passe</li>' +
      '<li><strong>Suite B 192 bits</strong> : pour les environnements gouvernementaux et militaires (WPA3-Enterprise 192 bits)</li>' +
      '</ul>' +
      '<h4>Authentification 802.1X / EAP</h4>' +
      '<p>Pour les réseaux d\'entreprise, l\'authentification WPA2/WPA3-Enterprise s\'appuie sur le framework 802.1X qui utilise trois acteurs : le supplicant (le client WiFi), l\'authenticator (le point d\'accès) et le serveur d\'authentification (RADIUS). Le protocole EAP (Extensible Authentication Protocol) transporte les données d\'authentification entre le supplicant et le serveur RADIUS.</p>' +
      '<p>Les méthodes EAP les plus courantes sont :</p>' +
      '<ul>' +
      '<li><strong>EAP-TLS</strong> : authentification mutuelle par certificats X.509, la plus sécurisée mais complexe à déployer</li>' +
      '<li><strong>PEAP (Protected EAP)</strong> : tunnel TLS avec authentification MSCHAPv2 interne, très répandu en entreprise</li>' +
      '<li><strong>EAP-TTLS</strong> : similaire à PEAP mais plus flexible dans les méthodes internes supportées</li>' +
      '<li><strong>EAP-FAST</strong> : développé par Cisco, utilise des PAC (Protected Access Credentials) pour accélérer la reconnexion</li>' +
      '</ul>' +
      '<h4>Configuration RADIUS</h4>' +
      '<p>Le serveur RADIUS (Remote Authentication Dial-In User Service) centralise l\'authentification, l\'autorisation et la comptabilité (AAA). FreeRADIUS est la solution open source la plus déployée. La configuration implique la définition des clients NAS (points d\'accès), des utilisateurs ou de la connexion LDAP/Active Directory, et des politiques d\'authentification. Chaque point d\'accès est déclaré comme client RADIUS avec un secret partagé unique.</p>' +
      '<h4>Attaques WiFi courantes</h4>' +
      '<p>Les principales menaces contre les réseaux WiFi incluent : l\'Evil Twin (point d\'accès pirate imitant un réseau légitime), les attaques KRACK contre WPA2 (réinstallation de clés), le wardriving (cartographie des réseaux vulnérables), le jamming radio (brouillage délibéré), et les attaques par fragmentation (FragAttacks). Un système WIDS/WIPS (Wireless Intrusion Detection/Prevention System) surveille l\'environnement radio et détecte ces menaces en temps réel.</p>' +
      '<h4>Segmentation et politiques</h4>' +
      '<p>Une architecture WiFi sécurisée doit segmenter les réseaux par usage : réseau d\'entreprise authentifié par 802.1X, réseau invité isolé avec portail captif, réseau IoT dédié avec restrictions d\'accès strictes. Chaque SSID doit être associé à un VLAN distinct, et des ACL doivent contrôler le trafic entre les segments. L\'isolation client (client isolation) empêche la communication directe entre les appareils connectés au même SSID, ce qui est critique pour les réseaux invités.</p>'
  },
  {
    id: 74,
    title: 'Contrôleurs WiFi',
    category: 'Sans Fil & VPN',
    level: 'Intermédiaire',
    duration: '1h30',
    description: 'Comprendre l\'architecture centralisée des contrôleurs WiFi et leur rôle dans la gestion des déploiements sans fil d\'entreprise.',
    content: '<h4>Architecture autonome vs centralisée</h4>' +
      '<p>Dans une architecture WiFi autonome (standalone), chaque point d\'accès est configuré individuellement et fonctionne de manière indépendante. Cette approche devient rapidement ingérable au-delà de quelques points d\'accès. L\'architecture centralisée utilise un contrôleur WiFi (WLC - Wireless LAN Controller) qui gère l\'ensemble des points d\'accès depuis un point unique. Les points d\'accès deviennent des points d\'accès légers (Lightweight AP) qui délèguent toutes les décisions au contrôleur.</p>' +
      '<h4>Le protocole CAPWAP</h4>' +
      '<p>Le protocole CAPWAP (Control and Provisioning of Wireless Access Points, RFC 5415) est le standard utilisé pour la communication entre le contrôleur et les points d\'accès. Il établit deux tunnels :</p>' +
      '<ul>' +
      '<li><strong>Tunnel de contrôle</strong> (port UDP 5246) : transporte les messages de gestion, de configuration et de supervision, chiffré par DTLS</li>' +
      '<li><strong>Tunnel de données</strong> (port UDP 5247) : transporte le trafic utilisateur entre l\'AP et le WLC, optionnellement chiffré</li>' +
      '</ul>' +
      '<p>Le processus de découverte du contrôleur par un AP suit plusieurs méthodes : broadcast local, requête DNS (CISCO-CAPWAP-CONTROLLER.domain), option DHCP (option 43), ou adresse configurée en dur. Une fois le tunnel CAPWAP établi, le contrôleur pousse la configuration complète vers l\'AP, y compris les SSID, les politiques de sécurité et les paramètres radio.</p>' +
      '<h4>Fonctionnalités du contrôleur</h4>' +
      '<p>Le contrôleur WiFi offre une gamme complète de fonctionnalités :</p>' +
      '<ul>' +
      '<li><strong>RRM (Radio Resource Management)</strong> : ajustement automatique de la puissance et des canaux pour optimiser la couverture et minimiser les interférences</li>' +
      '<li><strong>Roaming transparent</strong> : gestion de la mobilité des clients entre les AP avec handoff rapide (802.11r)</li>' +
      '<li><strong>Load balancing</strong> : répartition équilibrée des clients entre les AP adjacents</li>' +
      '<li><strong>Rogue AP detection</strong> : détection des points d\'accès non autorisés</li>' +
      '<li><strong>Portail captif</strong> : authentification web pour les réseaux invités</li>' +
      '<li><strong>Gestion centralisée des politiques</strong> : application cohérente des règles de sécurité et de QoS</li>' +
      '</ul>' +
      '<h4>Modes de déploiement</h4>' +
      '<p>Les contrôleurs WiFi modernes supportent plusieurs modes de déploiement des AP :</p>' +
      '<ul>' +
      '<li><strong>Mode local</strong> : le trafic est tunnelisé vers le contrôleur (centralised switching)</li>' +
      '<li><strong>Mode FlexConnect</strong> : le trafic peut être commuté localement sur le site distant, même si la connexion au WLC est perdue</li>' +
      '<li><strong>Mode Monitor</strong> : l\'AP ne sert pas de clients mais surveille le spectre radio pour détecter les menaces</li>' +
      '<li><strong>Mode Sniffer</strong> : l\'AP capture le trafic radio et l\'envoie à un analyseur comme Wireshark</li>' +
      '</ul>' +
      '<h4>Haute disponibilité</h4>' +
      '<p>Pour garantir la continuité de service, les contrôleurs sont déployés en haute disponibilité avec un WLC primaire et un WLC secondaire. En cas de défaillance du primaire, les AP basculent automatiquement vers le secondaire. Le N+1 HA utilise un contrôleur de secours pour plusieurs contrôleurs primaires, tandis que le SSO (Stateful Switchover) maintient les sessions client actives pendant le basculement, offrant une transition transparente.</p>' +
      '<h4>Évolution vers le cloud</h4>' +
      '<p>La tendance actuelle est aux contrôleurs cloud (Cisco Meraki, Aruba Central, Juniper Mist) qui éliminent le besoin de matériel dédié sur site. Les AP communiquent directement avec la plateforme cloud pour la gestion et la supervision, tandis que le trafic utilisateur est commuté localement. Cette approche simplifie la gestion des déploiements multi-sites et offre des capacités d\'analyse avancées basées sur l\'intelligence artificielle.</p>'
  },
  {
    id: 75,
    title: 'Site survey WiFi',
    category: 'Sans Fil & VPN',
    level: 'Intermédiaire',
    duration: '1h30',
    description: 'Apprendre à planifier et réaliser une étude de site WiFi pour concevoir un déploiement sans fil optimal.',
    content: '<h4>Qu\'est-ce qu\'un site survey ?</h4>' +
      '<p>Un site survey (étude de site) WiFi est une analyse méthodique d\'un espace physique visant à déterminer le nombre, l\'emplacement et la configuration optimale des points d\'accès pour fournir une couverture WiFi adaptée aux besoins. Cette étape est cruciale avant tout déploiement professionnel et permet d\'éviter les problèmes de couverture insuffisante, d\'interférences et de capacité inadéquate.</p>' +
      '<h4>Types de site survey</h4>' +
      '<p>Il existe trois types principaux de site survey :</p>' +
      '<ul>' +
      '<li><strong>Predictive survey</strong> : réalisé sur plan avec un logiciel de simulation (Ekahau, iBwave). On importe les plans du bâtiment, on définit les matériaux des murs et cloisons, et le logiciel calcule la propagation radio théorique. C\'est le point de départ de tout projet.</li>' +
      '<li><strong>Active survey (AP-on-a-stick)</strong> : un point d\'accès temporaire est positionné à chaque emplacement prévu, et un technicien parcourt la zone avec un outil de mesure pour vérifier la couverture réelle. Cette méthode valide le predictive survey.</li>' +
      '<li><strong>Passive survey</strong> : mesure de l\'environnement radio existant sans émettre de signal. Utile pour identifier les sources d\'interférences, les réseaux voisins et les canaux déjà utilisés.</li>' +
      '</ul>' +
      '<h4>Paramètres à mesurer</h4>' +
      '<p>Lors d\'un site survey, les indicateurs clés à relever sont :</p>' +
      '<ul>' +
      '<li><strong>RSSI (Received Signal Strength Indicator)</strong> : puissance du signal reçu, objectif minimum de -67 dBm pour la VoIP et -70 dBm pour le data</li>' +
      '<li><strong>SNR (Signal-to-Noise Ratio)</strong> : rapport signal/bruit, minimum 25 dB recommandé</li>' +
      '<li><strong>Overlap entre cellules</strong> : recouvrement de 15-20% entre les zones de couverture des AP adjacents pour un roaming fluide</li>' +
      '<li><strong>Nombre de canaux co-canal</strong> : CCI (Co-Channel Interference) doit être minimisé</li>' +
      '<li><strong>Débit réel</strong> : throughput mesuré à différents points de la zone</li>' +
      '</ul>' +
      '<h4>Outils de site survey</h4>' +
      '<p>Les outils professionnels les plus utilisés incluent Ekahau AI Pro (anciennement Ekahau Site Survey), qui est le standard de l\'industrie avec des fonctionnalités de simulation, de mesure active/passive et de reporting. NetSpot est une alternative plus accessible pour les petits déploiements. AirMagnet de NetAlly offre des capacités avancées d\'analyse spectrale. Pour les budgets limités, des outils gratuits comme WiFi Analyzer (Android) ou inSSIDer permettent des relevés basiques.</p>' +
      '<h4>Atténuation des matériaux</h4>' +
      '<p>La connaissance de l\'atténuation des matériaux est essentielle pour un predictive survey précis. Voici les valeurs typiques à 5 GHz : cloison plâtre = 3-5 dB, mur en briques = 10-15 dB, mur en béton armé = 15-25 dB, fenêtre simple vitrage = 3 dB, fenêtre double vitrage avec film métallique = 10-15 dB, plancher/plafond béton = 15-20 dB. Ces valeurs augmentent significativement avec la fréquence, ce qui explique la portée réduite en 5 GHz et 6 GHz.</p>' +
      '<h4>Bonnes pratiques de déploiement</h4>' +
      '<p>Un déploiement WiFi réussi respecte plusieurs principes : concevoir pour la capacité et non seulement pour la couverture, tenir compte de la densité d\'utilisateurs par zone, positionner les AP au plafond avec les antennes orientées vers le bas, éviter de placer les AP près de structures métalliques, et planifier les canaux pour minimiser les interférences. Après le déploiement, un post-deployment survey vérifie que les objectifs de couverture et de performance sont atteints et permet les ajustements finaux.</p>'
  },
  {
    id: 76,
    title: 'VPN site-to-site',
    category: 'Sans Fil & VPN',
    level: 'Intermédiaire',
    duration: '1h30',
    description: 'Comprendre et configurer les VPN site-to-site pour interconnecter de manière sécurisée des réseaux distants via Internet.',
    content: '<h4>Principe du VPN site-to-site</h4>' +
      '<p>Un VPN site-to-site (ou VPN LAN-to-LAN) établit un tunnel chiffré permanent entre deux réseaux distants à travers Internet. Contrairement au VPN client-to-site, il connecte des réseaux entiers et non des utilisateurs individuels. Les routeurs ou pare-feu de chaque site gèrent le chiffrement/déchiffrement de manière transparente pour les utilisateurs. Le trafic entre les deux réseaux locaux transite par Internet comme s\'ils étaient directement connectés.</p>' +
      '<h4>IPsec - Le protocole fondamental</h4>' +
      '<p>IPsec (Internet Protocol Security) est la suite de protocoles standard pour les VPN site-to-site. Il opère au niveau de la couche 3 (réseau) et comprend deux protocoles de sécurité :</p>' +
      '<ul>' +
      '<li><strong>AH (Authentication Header)</strong> : fournit l\'authentification et l\'intégrité des données, mais pas le chiffrement. Rarement utilisé seul car il n\'assure pas la confidentialité.</li>' +
      '<li><strong>ESP (Encapsulating Security Payload)</strong> : fournit le chiffrement, l\'authentification et l\'intégrité. C\'est le protocole le plus utilisé dans les déploiements VPN modernes.</li>' +
      '</ul>' +
      '<p>IPsec fonctionne en deux modes : le mode transport (chiffre uniquement la charge utile) et le mode tunnel (chiffre le paquet IP entier et l\'encapsule dans un nouveau paquet IP), ce dernier étant le standard pour les VPN site-to-site.</p>' +
      '<h4>Les deux phases IKE</h4>' +
      '<p>L\'établissement d\'un tunnel IPsec utilise le protocole IKE (Internet Key Exchange) en deux phases :</p>' +
      '<ul>' +
      '<li><strong>Phase 1 (IKE SA / ISAKMP)</strong> : les deux pairs s\'authentifient mutuellement (par clé pré-partagée ou certificat) et négocient un canal sécurisé pour la phase 2. Les paramètres négociés incluent : algorithme de chiffrement (AES-256), algorithme de hachage (SHA-256), groupe Diffie-Hellman (DH14 ou plus), et durée de vie de la SA.</li>' +
      '<li><strong>Phase 2 (IPsec SA)</strong> : dans le tunnel sécurisé de la phase 1, les pairs négocient les paramètres de chiffrement pour le trafic utilisateur (transform set). Ils définissent le trafic intéressant via des ACL crypto et établissent les SA IPsec bidirectionnelles.</li>' +
      '</ul>' +
      '<h4>Configuration Cisco</h4>' +
      '<pre>! Configuration Phase 1\n' +
      'crypto isakmp policy 10\n' +
      '  encryption aes 256\n' +
      '  hash sha256\n' +
      '  authentication pre-share\n' +
      '  group 14\n' +
      '  lifetime 86400\n' +
      '\n' +
      'crypto isakmp key MonSecretVPN address 203.0.113.1\n' +
      '\n' +
      '! Configuration Phase 2\n' +
      'crypto ipsec transform-set MON-TS esp-aes 256 esp-sha256-hmac\n' +
      '  mode tunnel\n' +
      '\n' +
      '! ACL définissant le trafic à chiffrer\n' +
      'access-list 100 permit ip 192.168.1.0 0.0.0.255 192.168.2.0 0.0.0.255\n' +
      '\n' +
      '! Crypto map\n' +
      'crypto map VPN-MAP 10 ipsec-isakmp\n' +
      '  set peer 203.0.113.1\n' +
      '  set transform-set MON-TS\n' +
      '  match address 100\n' +
      '\n' +
      'interface GigabitEthernet0/0\n' +
      '  crypto map VPN-MAP</pre>' +
      '<h4>GRE over IPsec</h4>' +
      '<p>Le GRE (Generic Routing Encapsulation) est souvent combiné avec IPsec pour bénéficier des avantages des deux protocoles. GRE seul permet le transport de trafic multicast et de protocoles de routage dynamique (OSPF, EIGRP) dans le tunnel, mais ne fournit aucun chiffrement. En encapsulant le tunnel GRE dans IPsec, on obtient un tunnel sécurisé qui supporte le routage dynamique, simplifiant considérablement la gestion des VPN multi-sites.</p>' +
      '<h4>Considérations pratiques</h4>' +
      '<p>Le déploiement de VPN site-to-site nécessite une attention particulière au MTU : l\'encapsulation IPsec ajoute un overhead de 50 à 73 octets, ce qui peut provoquer de la fragmentation. Le MSS (Maximum Segment Size) doit être ajusté en conséquence (commande <code>ip tcp adjust-mss 1360</code>). Le NAT-T (NAT Traversal, port UDP 4500) est nécessaire lorsqu\'un pair se trouve derrière un NAT. Enfin, il est recommandé d\'utiliser IKEv2 plutôt qu\'IKEv1 pour une négociation plus rapide et plus fiable.</p>'
  },
  {
    id: 77,
    title: 'VPN client-to-site (Remote Access)',
    category: 'Sans Fil & VPN',
    level: 'Intermédiaire',
    duration: '1h',
    description: 'Mettre en place un VPN d\'accès distant pour permettre aux utilisateurs nomades de se connecter au réseau de l\'entreprise.',
    content: '<h4>Principe du VPN Remote Access</h4>' +
      '<p>Le VPN client-to-site (ou Remote Access VPN) permet à un utilisateur individuel de se connecter à distance au réseau de l\'entreprise depuis n\'importe quel point d\'accès Internet. Contrairement au VPN site-to-site qui relie deux réseaux, le Remote Access crée un tunnel sécurisé entre le poste de travail de l\'utilisateur et le concentrateur VPN de l\'entreprise. L\'utilisateur reçoit une adresse IP du réseau interne et peut accéder aux ressources comme s\'il était physiquement présent.</p>' +
      '<h4>Technologies de VPN Remote Access</h4>' +
      '<p>Plusieurs technologies sont disponibles pour le VPN d\'accès distant :</p>' +
      '<ul>' +
      '<li><strong>IPsec avec client lourd</strong> : nécessite l\'installation d\'un logiciel client (Cisco AnyConnect, FortiClient). Offre un tunnel complet de couche 3 avec accès à toutes les ressources réseau.</li>' +
      '<li><strong>SSL/TLS VPN</strong> : utilise le protocole HTTPS (port 443) pour établir le tunnel. Avantage majeur : traverse facilement les pare-feu et les proxys car il utilise un port généralement autorisé.</li>' +
      '<li><strong>VPN clientless (WebVPN)</strong> : accès via un navigateur web sans logiciel client. Limité aux applications web, au partage de fichiers et aux accès RDP/SSH via un portail web.</li>' +
      '<li><strong>L2TP/IPsec</strong> : combinaison du protocole de tunneling L2TP avec le chiffrement IPsec. Supporté nativement par Windows, macOS et les mobiles.</li>' +
      '</ul>' +
      '<h4>Split tunneling vs Full tunneling</h4>' +
      '<p>Le choix entre split tunneling et full tunneling a un impact majeur sur la sécurité et les performances :</p>' +
      '<p>En <strong>full tunneling</strong>, tout le trafic de l\'utilisateur (y compris la navigation web personnelle) passe par le tunnel VPN. Cela garantit que tout le trafic est inspecté par les outils de sécurité de l\'entreprise, mais augmente la charge sur le concentrateur VPN et la latence perçue par l\'utilisateur.</p>' +
      '<p>En <strong>split tunneling</strong>, seul le trafic destiné au réseau de l\'entreprise emprunte le tunnel VPN. Le reste du trafic (navigation Internet, streaming) sort directement par la connexion locale de l\'utilisateur. Cette approche réduit la charge réseau mais expose l\'utilisateur car sa machine se trouve simultanément sur deux réseaux.</p>' +
      '<h4>Configuration AnyConnect sur ASA</h4>' +
      '<pre>! Pool d\'adresses pour les clients VPN\n' +
      'ip local pool VPN-POOL 10.10.10.100-10.10.10.200 mask 255.255.255.0\n' +
      '\n' +
      '! Group policy\n' +
      'group-policy GP-REMOTE internal\n' +
      'group-policy GP-REMOTE attributes\n' +
      '  vpn-tunnel-protocol ssl-client\n' +
      '  split-tunnel-policy tunnelspecified\n' +
      '  split-tunnel-network-list value SPLIT-ACL\n' +
      '  dns-server value 10.0.0.53\n' +
      '  default-domain value entreprise.local\n' +
      '\n' +
      '! Tunnel group\n' +
      'tunnel-group REMOTE-ACCESS type remote-access\n' +
      'tunnel-group REMOTE-ACCESS general-attributes\n' +
      '  address-pool VPN-POOL\n' +
      '  default-group-policy GP-REMOTE\n' +
      '  authentication-server-group RADIUS-SRV</pre>' +
      '<h4>Authentification multifacteur (MFA)</h4>' +
      '<p>L\'authentification multifacteur est devenue indispensable pour les VPN d\'accès distant. Elle combine au minimum deux facteurs : quelque chose que l\'utilisateur connaît (mot de passe), quelque chose qu\'il possède (token, smartphone), ou quelque chose qu\'il est (biométrie). Les solutions courantes incluent Duo Security, Microsoft Authenticator, RSA SecurID et les clés FIDO2. Le MFA réduit drastiquement le risque d\'accès non autorisé même si les identifiants sont compromis.</p>' +
      '<h4>Always-On VPN et Zero Trust</h4>' +
      '<p>Le concept d\'Always-On VPN (Windows) ou Per-App VPN (mobile) établit automatiquement le tunnel VPN dès que l\'appareil se connecte à un réseau non fiable. Cette approche évolue vers le modèle Zero Trust Network Access (ZTNA) où l\'accès est accordé application par application après vérification continue de l\'identité et de la posture de sécurité de l\'appareil. Des solutions comme Zscaler Private Access ou Cloudflare Access remplacent progressivement les VPN traditionnels dans cette architecture.</p>'
  },
  {
    id: 78,
    title: 'WireGuard',
    category: 'Sans Fil & VPN',
    level: 'Intermédiaire',
    duration: '1h',
    description: 'Découvrir WireGuard, le protocole VPN moderne ultra-performant, et apprendre à le configurer sur Linux.',
    content: '<h4>Présentation de WireGuard</h4>' +
      '<p>WireGuard est un protocole VPN moderne, conçu pour être simple, rapide et sécurisé. Créé par Jason A. Donenfeld, il a été intégré au noyau Linux en mars 2020 (version 5.6). Avec seulement environ 4 000 lignes de code (contre 400 000+ pour OpenVPN ou IPsec), WireGuard est considérablement plus facile à auditer, à maintenir et à déboguer. Sa simplicité n\'est pas un compromis : elle résulte de choix cryptographiques modernes et d\'un design minimaliste délibéré.</p>' +
      '<h4>Cryptographie</h4>' +
      '<p>WireGuard utilise une suite cryptographique fixe et moderne, éliminant la complexité de la négociation d\'algorithmes :</p>' +
      '<ul>' +
      '<li><strong>Curve25519</strong> : échange de clés Diffie-Hellman sur courbe elliptique</li>' +
      '<li><strong>ChaCha20</strong> : chiffrement symétrique (alternative à AES, optimisé pour les processeurs sans accélération matérielle AES)</li>' +
      '<li><strong>Poly1305</strong> : authentification des messages (MAC)</li>' +
      '<li><strong>BLAKE2s</strong> : fonction de hachage</li>' +
      '<li><strong>SipHash24</strong> : clés de table de hachage</li>' +
      '<li><strong>HKDF</strong> : dérivation de clés</li>' +
      '</ul>' +
      '<p>Si une vulnérabilité est découverte dans l\'un de ces algorithmes, WireGuard incrémentera simplement son numéro de version avec de nouveaux algorithmes, plutôt que de supporter un mécanisme de négociation complexe.</p>' +
      '<h4>Fonctionnement</h4>' +
      '<p>WireGuard fonctionne au niveau de la couche 3 et crée une interface réseau virtuelle (par exemple <code>wg0</code>). Chaque pair (peer) est identifié par sa clé publique Curve25519. Le concept de \"Cryptokey Routing\" associe chaque clé publique à une liste d\'adresses IP autorisées (AllowedIPs), combinant ainsi le routage et la liste de contrôle d\'accès en un seul mécanisme élégant. WireGuard utilise UDP et peut fonctionner sur n\'importe quel port.</p>' +
      '<h4>Installation et configuration</h4>' +
      '<pre># Installation sur Debian/Ubuntu\n' +
      'sudo apt install wireguard\n' +
      '\n' +
      '# Génération des clés\n' +
      'wg genkey | tee privatekey | wg pubkey > publickey\n' +
      '\n' +
      '# Configuration serveur (/etc/wireguard/wg0.conf)\n' +
      '[Interface]\n' +
      'PrivateKey = cLé_PRiVéE_du_Serveur=\n' +
      'Address = 10.0.0.1/24\n' +
      'ListenPort = 51820\n' +
      'PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE\n' +
      'PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE\n' +
      '\n' +
      '[Peer]\n' +
      'PublicKey = cLé_PuBLiQuE_du_Client=\n' +
      'AllowedIPs = 10.0.0.2/32\n' +
      '\n' +
      '# Configuration client (/etc/wireguard/wg0.conf)\n' +
      '[Interface]\n' +
      'PrivateKey = cLé_PRiVéE_du_Client=\n' +
      'Address = 10.0.0.2/24\n' +
      'DNS = 1.1.1.1\n' +
      '\n' +
      '[Peer]\n' +
      'PublicKey = cLé_PuBLiQuE_du_Serveur=\n' +
      'Endpoint = vpn.example.com:51820\n' +
      'AllowedIPs = 0.0.0.0/0\n' +
      'PersistentKeepalive = 25\n' +
      '\n' +
      '# Activation\n' +
      'sudo wg-quick up wg0\n' +
      'sudo systemctl enable wg-quick@wg0</pre>' +
      '<h4>Performances</h4>' +
      '<p>WireGuard surpasse largement IPsec et OpenVPN en termes de performances. Les benchmarks montrent des débits 3 à 4 fois supérieurs à OpenVPN et environ 15% supérieurs à IPsec, avec une latence significativement réduite. Son intégration au noyau Linux élimine les changements de contexte coûteux entre l\'espace noyau et l\'espace utilisateur. Le handshake initial prend environ 1 RTT (contre 2-4 pour IKEv2), ce qui accélère considérablement l\'établissement de la connexion.</p>' +
      '<h4>Cas d\'utilisation et limites</h4>' +
      '<p>WireGuard excelle comme VPN personnel, VPN site-to-site entre serveurs, et tunnels mesh entre nœuds cloud. Cependant, il présente certaines limitations : il ne supporte pas nativement l\'attribution dynamique d\'adresses (pas de DHCP dans le tunnel), la gestion des clés à grande échelle nécessite des outils tiers (comme wg-dynamic ou des solutions comme Tailscale/Netmaker), et l\'absence de négociation de protocole signifie qu\'il ne peut pas se dissimuler dans du trafic HTTPS pour contourner la censure, contrairement à certaines configurations OpenVPN.</p>'
  },
  {
    id: 79,
    title: 'OpenVPN',
    category: 'Sans Fil & VPN',
    level: 'Intermédiaire',
    duration: '1h30',
    description: 'Maîtriser OpenVPN, la solution VPN open source la plus déployée, de l\'architecture à la configuration avancée.',
    content: '<h4>Présentation d\'OpenVPN</h4>' +
      '<p>OpenVPN est une solution VPN open source mature, créée en 2001 par James Yonan. Elle utilise la bibliothèque OpenSSL pour le chiffrement et fonctionne en espace utilisateur (userspace), ce qui facilite le portage sur de nombreuses plateformes : Linux, Windows, macOS, Android, iOS, et même les routeurs embarqués. Sa flexibilité et sa robustesse en font la solution VPN open source la plus déployée au monde, avec des millions d\'installations actives.</p>' +
      '<h4>Architecture et modes de fonctionnement</h4>' +
      '<p>OpenVPN supporte deux modes de tunneling :</p>' +
      '<ul>' +
      '<li><strong>Mode TUN (routed)</strong> : crée un tunnel de couche 3 (IP). Chaque pair reçoit une adresse IP du tunnel. C\'est le mode le plus courant et le plus efficace, adapté à la majorité des cas d\'utilisation.</li>' +
      '<li><strong>Mode TAP (bridged)</strong> : crée un tunnel de couche 2 (Ethernet). Permet de transporter le trafic broadcast et les protocoles non-IP (NetBIOS, IPX). Nécessaire pour les applications qui requièrent d\'être sur le même segment de réseau local.</li>' +
      '</ul>' +
      '<p>OpenVPN peut utiliser TCP ou UDP comme protocole de transport. UDP est recommandé pour de meilleures performances (pas de problème de \"TCP over TCP\"), tandis que TCP port 443 est utile pour traverser les pare-feu restrictifs en se faisant passer pour du trafic HTTPS.</p>' +
      '<h4>Infrastructure PKI</h4>' +
      '<p>OpenVPN utilise une infrastructure à clé publique (PKI) basée sur des certificats X.509 pour l\'authentification. La mise en place d\'une PKI implique :</p>' +
      '<pre># Initialisation de la CA avec EasyRSA\n' +
      './easyrsa init-pki\n' +
      './easyrsa build-ca\n' +
      '\n' +
      '# Génération du certificat serveur\n' +
      './easyrsa gen-req server nopass\n' +
      './easyrsa sign-req server server\n' +
      '\n' +
      '# Génération des paramètres Diffie-Hellman\n' +
      './easyrsa gen-dh\n' +
      '\n' +
      '# Génération du certificat client\n' +
      './easyrsa gen-req client1\n' +
      './easyrsa sign-req client client1\n' +
      '\n' +
      '# Génération de la clé TLS-Auth (protection anti-DoS)\n' +
      'openvpn --genkey secret ta.key</pre>' +
      '<h4>Configuration serveur</h4>' +
      '<pre># /etc/openvpn/server.conf\n' +
      'port 1194\n' +
      'proto udp\n' +
      'dev tun\n' +
      'ca ca.crt\n' +
      'cert server.crt\n' +
      'key server.key\n' +
      'dh dh.pem\n' +
      'tls-auth ta.key 0\n' +
      'cipher AES-256-GCM\n' +
      'auth SHA256\n' +
      'server 10.8.0.0 255.255.255.0\n' +
      'push "redirect-gateway def1 bypass-dhcp"\n' +
      'push "dhcp-option DNS 1.1.1.1"\n' +
      'push "dhcp-option DNS 1.0.0.1"\n' +
      'keepalive 10 120\n' +
      'persist-key\n' +
      'persist-tun\n' +
      'status /var/log/openvpn-status.log\n' +
      'verb 3\n' +
      'max-clients 100\n' +
      'user nobody\n' +
      'group nogroup</pre>' +
      '<h4>Configuration client</h4>' +
      '<pre># client.ovpn\n' +
      'client\n' +
      'dev tun\n' +
      'proto udp\n' +
      'remote vpn.entreprise.com 1194\n' +
      'resolv-retry infinite\n' +
      'nobind\n' +
      'persist-key\n' +
      'persist-tun\n' +
      'ca ca.crt\n' +
      'cert client1.crt\n' +
      'key client1.key\n' +
      'tls-auth ta.key 1\n' +
      'cipher AES-256-GCM\n' +
      'auth SHA256\n' +
      'verb 3</pre>' +
      '<h4>Fonctionnalités avancées</h4>' +
      '<p>OpenVPN offre de nombreuses fonctionnalités avancées : les scripts <code>client-connect</code> et <code>client-disconnect</code> permettent d\'exécuter des actions personnalisées lors de la connexion/déconnexion des clients. Le CCD (Client Configuration Directory) permet d\'attribuer des configurations spécifiques par client (adresse IP fixe, routes). La directive <code>crl-verify</code> permet de révoquer des certificats compromis. Le plugin LDAP/RADIUS permet l\'authentification centralisée via l\'annuaire d\'entreprise.</p>' +
      '<h4>Optimisation et sécurité</h4>' +
      '<p>Pour optimiser OpenVPN, activez la compression LZ4 (<code>compress lz4-v2</code>) si le trafic est compressible, utilisez le chiffrement AES-256-GCM plutôt que AES-256-CBC pour bénéficier de l\'accélération matérielle et de l\'authentification intégrée. La directive <code>tls-crypt</code> (successeur de tls-auth) chiffre entièrement le canal de contrôle, rendant le tunnel indétectable par l\'inspection DPI. Enfin, limitez les droits du processus OpenVPN avec <code>user nobody</code> et <code>chroot</code>.</p>'
  },
  {
    id: 80,
    title: 'SD-WAN',
    category: 'Sans Fil & VPN',
    level: 'Avancé',
    duration: '2h',
    description: 'Comprendre l\'architecture SD-WAN et son rôle dans la transformation des réseaux étendus d\'entreprise.',
    content: '<h4>Qu\'est-ce que le SD-WAN ?</h4>' +
      '<p>Le SD-WAN (Software-Defined Wide Area Network) est une approche moderne de la gestion des réseaux étendus qui applique les principes du SDN (Software-Defined Networking) aux connexions WAN. Il permet d\'utiliser intelligemment plusieurs liens WAN hétérogènes (MPLS, Internet, 4G/5G) pour acheminer le trafic de manière optimale, tout en simplifiant considérablement la gestion du réseau. Le SD-WAN abstrait le transport réseau de la couche applicative.</p>' +
      '<h4>Limites du WAN traditionnel</h4>' +
      '<p>Les réseaux WAN traditionnels basés sur MPLS présentent plusieurs inconvénients : coûts élevés de la bande passante MPLS, délais de déploiement longs (plusieurs semaines à mois), manque de flexibilité pour ajouter de nouveaux sites, routage rigide qui fait transiter tout le trafic cloud par le datacenter central (backhauling), et complexité de gestion avec des configurations individuelles sur chaque routeur de site. Avec l\'adoption massive du cloud (SaaS, IaaS), ce modèle centralisé devient un goulet d\'étranglement.</p>' +
      '<h4>Architecture SD-WAN</h4>' +
      '<p>L\'architecture SD-WAN repose sur trois composants principaux :</p>' +
      '<ul>' +
      '<li><strong>Plan de gestion (Management Plane)</strong> : orchestrateur centralisé qui fournit une interface de gestion unique pour définir les politiques, provisionner les équipements et superviser le réseau. Souvent hébergé dans le cloud.</li>' +
      '<li><strong>Plan de contrôle (Control Plane)</strong> : contrôleur qui distribue les politiques de routage et de sécurité vers les équipements de bordure. Il maintient une vue globale de la topologie et de l\'état du réseau.</li>' +
      '<li><strong>Plan de données (Data Plane)</strong> : les appliances SD-WAN (physiques ou virtuelles) déployées sur chaque site gèrent le trafic, établissent les tunnels overlay et appliquent les politiques de routage.</li>' +
      '</ul>' +
      '<h4>Fonctionnalités clés</h4>' +
      '<p>Le SD-WAN apporte des fonctionnalités essentielles :</p>' +
      '<ul>' +
      '<li><strong>Sélection dynamique du chemin</strong> : le trafic est routé en temps réel sur le meilleur lien disponible en fonction de critères de performance (latence, jitter, perte de paquets)</li>' +
      '<li><strong>Identification applicative</strong> : classification DPI (Deep Packet Inspection) pour reconnaître les applications et appliquer des politiques spécifiques</li>' +
      '<li><strong>Local Internet Breakout</strong> : le trafic cloud/SaaS sort directement vers Internet sur le site distant, sans repasser par le datacenter central</li>' +
      '<li><strong>Zero-Touch Provisioning (ZTP)</strong> : déploiement automatique des équipements sans intervention technique sur site</li>' +
      '<li><strong>Chiffrement overlay</strong> : tunnels IPsec automatiques entre tous les sites (full mesh ou hub-and-spoke)</li>' +
      '</ul>' +
      '<h4>Acteurs du marché</h4>' +
      '<p>Le marché du SD-WAN est dominé par plusieurs acteurs :</p>' +
      '<ul>' +
      '<li><strong>Cisco SD-WAN (Viptela)</strong> : intégration forte avec l\'écosystème Cisco et la sécurité Umbrella</li>' +
      '<li><strong>VMware SD-WAN (VeloCloud)</strong> : excellente intégration avec l\'environnement VMware et multi-cloud</li>' +
      '<li><strong>Fortinet Secure SD-WAN</strong> : convergence SD-WAN et sécurité NGFW intégrée</li>' +
      '<li><strong>Palo Alto Prisma SD-WAN</strong> : approche cloud-native avec sécurité avancée</li>' +
      '<li><strong>Versa Networks</strong> : solution flexible avec fonctions réseau virtualisées intégrées</li>' +
      '</ul>' +
      '<h4>SASE : la convergence SD-WAN et sécurité</h4>' +
      '<p>Le modèle SASE (Secure Access Service Edge), défini par Gartner, représente la convergence du SD-WAN avec les services de sécurité cloud : CASB (Cloud Access Security Broker), SWG (Secure Web Gateway), ZTNA (Zero Trust Network Access) et FWaaS (Firewall-as-a-Service). Cette approche unifiée permet de sécuriser le trafic au plus près de l\'utilisateur, quel que soit son emplacement, tout en simplifiant l\'architecture globale. Les principaux fournisseurs SASE incluent Zscaler, Cloudflare, Cato Networks et Netskope.</p>'
  },

  // =====================================================
  // i) Dépannage (id 81-90)
  // =====================================================
  {
    id: 81,
    title: 'Méthodologie de dépannage réseau',
    category: 'Dépannage',
    level: 'Débutant',
    duration: '45 min',
    description: 'Acquérir une approche structurée et méthodique pour diagnostiquer et résoudre efficacement les problèmes réseau.',
    content: '<h4>L\'importance d\'une méthodologie</h4>' +
      '<p>Le dépannage réseau est une compétence fondamentale pour tout administrateur. Sans méthodologie structurée, le diagnostic devient un processus aléatoire et inefficace, souvent basé sur l\'intuition ou les essais-erreurs. Une approche systématique permet de résoudre les problèmes plus rapidement, de documenter les solutions et de capitaliser sur l\'expérience acquise.</p>' +
      '<h4>Les étapes du dépannage</h4>' +
      '<p>Le processus de dépannage recommandé par CompTIA et Cisco suit sept étapes :</p>' +
      '<ul>' +
      '<li><strong>1. Identifier le problème</strong> : recueillir les informations auprès des utilisateurs, vérifier les symptômes, déterminer la portée du problème (un utilisateur, un service, un site entier)</li>' +
      '<li><strong>2. Établir une théorie</strong> : formuler des hypothèses sur la cause probable en se basant sur les symptômes observés et en éliminant les causes les plus courantes en premier</li>' +
      '<li><strong>3. Tester la théorie</strong> : vérifier chaque hypothèse à l\'aide d\'outils de diagnostic et de tests ciblés</li>' +
      '<li><strong>4. Établir un plan d\'action</strong> : une fois la cause identifiée, planifier la résolution en évaluant l\'impact potentiel des changements</li>' +
      '<li><strong>5. Implémenter la solution</strong> : appliquer le correctif en suivant les procédures de gestion du changement</li>' +
      '<li><strong>6. Vérifier la résolution</strong> : confirmer que le problème est résolu et qu\'aucun effet secondaire n\'est apparu</li>' +
      '<li><strong>7. Documenter</strong> : consigner le problème, la cause et la solution pour référence future</li>' +
      '</ul>' +
      '<h4>Approches de diagnostic</h4>' +
      '<p>Trois approches classiques de diagnostic s\'appuient sur le modèle OSI :</p>' +
      '<ul>' +
      '<li><strong>Bottom-up (de bas en haut)</strong> : commencer par la couche physique (câbles, connecteurs, LEDs) et remonter couche par couche. Efficace quand le problème semble matériel.</li>' +
      '<li><strong>Top-down (de haut en bas)</strong> : commencer par l\'application et descendre vers les couches inférieures. Adapté quand le problème semble applicatif.</li>' +
      '<li><strong>Divide and conquer</strong> : tester une couche intermédiaire (par exemple la couche 3 avec un ping) pour déterminer si le problème se situe en dessous ou au-dessus, puis affiner. C\'est l\'approche la plus efficace dans la majorité des cas.</li>' +
      '</ul>' +
      '<h4>Questions clés à poser</h4>' +
      '<p>Lors de la collecte d\'informations, les questions essentielles à poser sont : \"Quand le problème a-t-il commencé ?\", \"Qu\'est-ce qui a changé récemment ?\", \"Le problème est-il intermittent ou permanent ?\", \"Combien d\'utilisateurs sont affectés ?\", \"Le problème concerne-t-il un service spécifique ou toute la connectivité ?\", \"Le problème se produit-il depuis un poste spécifique ou depuis n\'importe lequel ?\". Ces réponses orientent considérablement le diagnostic.</p>' +
      '<h4>Outils essentiels</h4>' +
      '<p>L\'administrateur réseau doit maîtriser un ensemble d\'outils de diagnostic : <code>ping</code> pour tester la connectivité de base, <code>traceroute</code> pour identifier les problèmes de routage, <code>nslookup/dig</code> pour le DNS, <code>netstat/ss</code> pour les connexions actives, <code>arp</code> pour la table de correspondance IP/MAC, et <code>ipconfig/ifconfig</code> pour la configuration locale. Wireshark reste l\'outil ultime pour l\'analyse approfondie du trafic.</p>' +
      '<h4>Documenter et prévenir</h4>' +
      '<p>La documentation est souvent négligée mais elle est cruciale. Chaque incident résolu doit être consigné dans une base de connaissances avec : la description des symptômes, la cause identifiée, la procédure de résolution, et les mesures préventives. Un système de monitoring proactif (Nagios, Zabbix, PRTG) permet de détecter les problèmes avant qu\'ils n\'impactent les utilisateurs. L\'analyse des tendances aide à anticiper les pannes et à planifier les évolutions d\'infrastructure.</p>'
  },
  {
    id: 82,
    title: 'Outils CLI réseau (ping, tracert, nslookup, netstat, ipconfig)',
    category: 'Dépannage',
    level: 'Débutant',
    duration: '1h',
    description: 'Maîtriser les outils en ligne de commande indispensables pour le diagnostic réseau au quotidien.',
    content: '<h4>ping - Test de connectivité</h4>' +
      '<p>La commande <code>ping</code> est l\'outil de diagnostic réseau le plus fondamental. Elle envoie des paquets ICMP Echo Request à une destination et attend les ICMP Echo Reply. Elle permet de vérifier la connectivité, de mesurer la latence (RTT - Round Trip Time) et de détecter les pertes de paquets.</p>' +
      '<pre># Ping basique\n' +
      'ping 192.168.1.1\n' +
      'ping www.google.com\n' +
      '\n' +
      '# Ping continu (Linux)\n' +
      'ping -c 100 192.168.1.1\n' +
      '\n' +
      '# Ping avec taille de paquet spécifique (test MTU)\n' +
      'ping -l 1472 -f 192.168.1.1   (Windows, -f = Don\'t Fragment)\n' +
      'ping -s 1472 -M do 192.168.1.1 (Linux)\n' +
      '\n' +
      '# Interprétation des résultats\n' +
      '# TTL élevé (64, 128) = peu de sauts\n' +
      '# TTL faible = beaucoup de sauts ou boucle possible\n' +
      '# "Request timed out" = pas de réponse\n' +
      '# "Destination unreachable" = problème de routage</pre>' +
      '<h4>tracert / traceroute - Traçage de route</h4>' +
      '<p>La commande <code>tracert</code> (Windows) ou <code>traceroute</code> (Linux) affiche le chemin emprunté par les paquets pour atteindre une destination, en listant tous les routeurs intermédiaires (sauts). Elle fonctionne en envoyant des paquets avec un TTL incrémenté progressivement de 1 jusqu\'à atteindre la destination.</p>' +
      '<pre># Traçage standard\n' +
      'tracert www.google.com        (Windows, utilise ICMP)\n' +
      'traceroute www.google.com     (Linux, utilise UDP par défaut)\n' +
      'traceroute -I www.google.com  (Linux, utilise ICMP)\n' +
      '\n' +
      '# Interprétation\n' +
      '# * * * = le routeur ne répond pas (filtrage ICMP, pas forcément une panne)\n' +
      '# Latence élevée sur un saut = congestion potentielle\n' +
      '# Augmentation soudaine = goulet d\'étranglement</pre>' +
      '<h4>nslookup / dig - Diagnostic DNS</h4>' +
      '<p>Ces outils interrogent les serveurs DNS pour résoudre les noms de domaine et diagnostiquer les problèmes de résolution :</p>' +
      '<pre># nslookup (multiplateforme)\n' +
      'nslookup www.example.com\n' +
      'nslookup www.example.com 8.8.8.8   # interroger un serveur spécifique\n' +
      'nslookup -type=MX example.com       # enregistrements mail\n' +
      'nslookup -type=NS example.com       # serveurs de noms\n' +
      '\n' +
      '# dig (Linux, plus détaillé)\n' +
      'dig www.example.com\n' +
      'dig @8.8.8.8 example.com ANY       # tous les enregistrements\n' +
      'dig +trace example.com             # résolution complète depuis la racine\n' +
      'dig +short example.com             # résultat condensé</pre>' +
      '<h4>netstat / ss - Connexions réseau</h4>' +
      '<p>La commande <code>netstat</code> (ou <code>ss</code> sur Linux moderne, plus rapide) affiche les connexions réseau actives, les ports en écoute et les statistiques réseau :</p>' +
      '<pre># Connexions actives et ports en écoute\n' +
      'netstat -an                    # toutes les connexions, format numérique\n' +
      'netstat -ano                   # avec PID du processus (Windows)\n' +
      'netstat -tulnp                 # ports TCP/UDP en écoute avec PID (Linux)\n' +
      'ss -tulnp                      # équivalent ss (Linux)\n' +
      '\n' +
      '# Statistiques par protocole\n' +
      'netstat -s                     # statistiques détaillées\n' +
      '\n' +
      '# Table de routage\n' +
      'netstat -r                     # afficher la table de routage\n' +
      'route print                    # alternative Windows</pre>' +
      '<h4>ipconfig / ifconfig / ip - Configuration IP</h4>' +
      '<p>Ces commandes affichent et gèrent la configuration réseau locale :</p>' +
      '<pre># Windows\n' +
      'ipconfig                       # configuration basique\n' +
      'ipconfig /all                  # configuration détaillée (MAC, DHCP, DNS)\n' +
      'ipconfig /release              # libérer le bail DHCP\n' +
      'ipconfig /renew                # renouveler le bail DHCP\n' +
      'ipconfig /flushdns             # vider le cache DNS local\n' +
      'ipconfig /displaydns           # afficher le cache DNS\n' +
      '\n' +
      '# Linux (commande ip moderne)\n' +
      'ip addr show                   # afficher les interfaces\n' +
      'ip route show                  # afficher les routes\n' +
      'ip neigh show                  # table ARP\n' +
      'ip link set eth0 up/down       # activer/désactiver une interface</pre>' +
      '<h4>Commandes complémentaires</h4>' +
      '<p>D\'autres commandes utiles complètent cette boîte à outils : <code>arp -a</code> pour afficher la table ARP (correspondance IP/MAC), <code>pathping</code> (Windows) qui combine ping et tracert avec des statistiques de perte par saut, <code>mtr</code> (Linux) qui est l\'équivalent de pathping en temps réel, et <code>curl</code> ou <code>wget</code> pour tester la connectivité HTTP/HTTPS au niveau applicatif. La maîtrise de ces outils de base est le prérequis indispensable à tout dépannage réseau efficace.</p>'
  },
  {
    id: 83,
    title: 'Wireshark - Les bases',
    category: 'Dépannage',
    level: 'Intermédiaire',
    duration: '2h',
    description: 'Apprendre à utiliser Wireshark pour capturer et analyser le trafic réseau, avec les filtres essentiels.',
    content: '<h4>Présentation de Wireshark</h4>' +
      '<p>Wireshark est l\'analyseur de protocoles réseau le plus utilisé au monde. Cet outil open source permet de capturer et d\'analyser en détail chaque paquet traversant une interface réseau. Il décode plus de 3 000 protocoles et offre une interface graphique intuitive pour naviguer dans les captures. Wireshark est indispensable pour le dépannage réseau avancé, l\'analyse de sécurité et la compréhension des protocoles.</p>' +
      '<h4>Capture de trafic</h4>' +
      '<p>Pour capturer du trafic, sélectionnez l\'interface réseau appropriée au démarrage de Wireshark. Sur un réseau commuté, vous ne verrez que le trafic destiné à votre machine, le broadcast et le multicast. Pour capturer le trafic d\'autres machines, configurez un port miroir (SPAN) sur le commutateur ou utilisez un TAP réseau. Sur Linux, la capture nécessite les droits root ou les capabilities CAP_NET_RAW et CAP_NET_ADMIN.</p>' +
      '<h4>Filtres de capture</h4>' +
      '<p>Les filtres de capture (BPF - Berkeley Packet Filter) limitent les paquets enregistrés pendant la capture. Ils utilisent une syntaxe spécifique :</p>' +
      '<pre># Filtrer par hôte\n' +
      'host 192.168.1.100\n' +
      'src host 10.0.0.1\n' +
      'dst host 8.8.8.8\n' +
      '\n' +
      '# Filtrer par réseau\n' +
      'net 192.168.1.0/24\n' +
      '\n' +
      '# Filtrer par port\n' +
      'port 80\n' +
      'tcp port 443\n' +
      'udp port 53\n' +
      '\n' +
      '# Combinaisons\n' +
      'host 192.168.1.100 and port 80\n' +
      'not port 22\n' +
      'tcp and (port 80 or port 443)</pre>' +
      '<h4>Filtres d\'affichage</h4>' +
      '<p>Les filtres d\'affichage s\'appliquent après la capture pour isoler les paquets d\'intérêt. Leur syntaxe est plus riche et plus intuitive :</p>' +
      '<pre># Par protocole\n' +
      'http\n' +
      'dns\n' +
      'tcp\n' +
      'icmp\n' +
      'arp\n' +
      '\n' +
      '# Par adresse IP\n' +
      'ip.addr == 192.168.1.100\n' +
      'ip.src == 10.0.0.1\n' +
      'ip.dst == 8.8.8.8\n' +
      '\n' +
      '# Par port\n' +
      'tcp.port == 80\n' +
      'tcp.dstport == 443\n' +
      'udp.port == 53\n' +
      '\n' +
      '# Filtres avancés\n' +
      'http.request.method == "GET"\n' +
      'dns.qry.name contains "example"\n' +
      'tcp.flags.syn == 1 and tcp.flags.ack == 0  # SYN initiaux\n' +
      'tcp.analysis.retransmission               # retransmissions\n' +
      'frame.time_delta > 1                       # délai > 1 seconde</pre>' +
      '<h4>Analyse du TCP Three-Way Handshake</h4>' +
      '<p>L\'analyse de l\'établissement de connexion TCP est l\'un des usages les plus courants de Wireshark. Le three-way handshake (SYN → SYN-ACK → ACK) doit se compléter en quelques millisecondes sur un réseau local. Un délai excessif peut indiquer un problème de réseau, de pare-feu ou de serveur. Wireshark colorie automatiquement les paquets problématiques : les retransmissions en noir sur rouge, les fenêtres de taille zéro en noir sur jaune.</p>' +
      '<h4>Follow TCP Stream</h4>' +
      '<p>La fonction \"Follow TCP Stream\" (clic droit → Follow → TCP Stream) reconstruit la conversation complète entre deux hôtes en affichant les données échangées de manière lisible. C\'est extrêmement utile pour analyser le contenu des échanges HTTP, SMTP, FTP ou tout autre protocole en texte clair. Les données envoyées par le client apparaissent en rouge et celles du serveur en bleu.</p>' +
      '<h4>Statistiques et graphiques</h4>' +
      '<p>Wireshark offre des outils statistiques puissants dans le menu Statistics : \"Conversations\" liste toutes les paires de communication, \"Protocol Hierarchy\" montre la répartition du trafic par protocole, \"IO Graph\" affiche le débit au fil du temps, et \"Flow Graph\" (aussi appelé \"Ladder Diagram\") visualise la séquence des échanges entre les hôtes. L\'outil \"Expert Information\" identifie automatiquement les anomalies comme les retransmissions, les paquets dupliqués, les fenêtres saturées et les erreurs de checksum.</p>' +
      '<h4>Bonnes pratiques</h4>' +
      '<p>Pour une analyse efficace, limitez la durée et la portée des captures, utilisez les filtres de capture pour réduire le volume de données, sauvegardez les captures pertinentes au format pcapng, et annotez les paquets importants avec la fonction Comment. Pour les captures longues en production, utilisez <code>tcpdump</code> ou <code>tshark</code> (version CLI de Wireshark) avec rotation des fichiers pour éviter de saturer le disque.</p>'
  },
  {
    id: 84,
    title: 'Analyse des logs réseau',
    category: 'Dépannage',
    level: 'Intermédiaire',
    duration: '1h',
    description: 'Apprendre à lire, interpréter et exploiter les journaux d\'événements réseau pour le diagnostic et la sécurité.',
    content: '<h4>Importance des logs réseau</h4>' +
      '<p>Les logs (journaux d\'événements) constituent la mémoire du réseau. Chaque équipement réseau — routeurs, commutateurs, pare-feu, serveurs — génère des enregistrements chronologiques de ses activités, erreurs et événements de sécurité. L\'analyse des logs est essentielle pour le dépannage post-incident, la détection d\'intrusions, la conformité réglementaire et l\'optimisation des performances. Un administrateur doit savoir où trouver les logs, comment les lire et comment en extraire les informations pertinentes.</p>' +
      '<h4>Syslog - Le standard de journalisation</h4>' +
      '<p>Syslog (RFC 5424) est le protocole standard de journalisation réseau. Il utilise UDP port 514 (ou TCP pour les versions fiables) et définit huit niveaux de sévérité :</p>' +
      '<ul>' +
      '<li><strong>0 - Emergency</strong> : système inutilisable</li>' +
      '<li><strong>1 - Alert</strong> : action immédiate requise</li>' +
      '<li><strong>2 - Critical</strong> : condition critique</li>' +
      '<li><strong>3 - Error</strong> : condition d\'erreur</li>' +
      '<li><strong>4 - Warning</strong> : condition d\'avertissement</li>' +
      '<li><strong>5 - Notice</strong> : condition normale mais significative</li>' +
      '<li><strong>6 - Informational</strong> : message informatif</li>' +
      '<li><strong>7 - Debug</strong> : message de débogage</li>' +
      '</ul>' +
      '<pre># Configuration syslog sur Cisco\n' +
      'logging host 10.0.0.50\n' +
      'logging trap informational\n' +
      'logging facility local7\n' +
      'logging source-interface Loopback0\n' +
      'service timestamps log datetime msec localtime</pre>' +
      '<h4>Centralisation avec un serveur Syslog</h4>' +
      '<p>La centralisation des logs sur un serveur dédié est une bonne pratique fondamentale. Les solutions courantes incluent : rsyslog ou syslog-ng sur Linux pour la collecte, et des plateformes SIEM comme Graylog, ELK Stack (Elasticsearch, Logstash, Kibana) ou Splunk pour l\'analyse avancée. La centralisation facilite la corrélation d\'événements entre équipements, la recherche dans l\'historique et la conservation à long terme conformément aux exigences réglementaires.</p>' +
      '<h4>Lire les logs Cisco</h4>' +
      '<p>Les messages syslog Cisco suivent un format standardisé :</p>' +
      '<pre>*Mar 15 14:30:22.456: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to down\n' +
      '\n' +
      '# Décomposition :\n' +
      '# *Mar 15 14:30:22.456 = horodatage\n' +
      '# %LINEPROTO = facility (module générateur)\n' +
      '# 5 = sévérité (Notice)\n' +
      '# UPDOWN = mnémonique du message\n' +
      '# Le reste = description détaillée</pre>' +
      '<h4>Analyse des logs pare-feu</h4>' +
      '<p>Les logs de pare-feu sont particulièrement riches en informations de sécurité. Ils enregistrent chaque connexion autorisée ou refusée avec les adresses source/destination, les ports, le protocole, l\'action appliquée et la règle déclenchée. L\'analyse de ces logs permet de détecter les tentatives d\'intrusion, les scans de ports, les communications avec des serveurs malveillants (C&C), et les violations de politique de sécurité. Les pics de connexions refusées depuis une même source indiquent souvent une attaque.</p>' +
      '<h4>Outils d\'analyse en ligne de commande</h4>' +
      '<p>Sur Linux, les outils de traitement de texte sont puissants pour analyser les logs :</p>' +
      '<pre># Rechercher les erreurs dans les logs\n' +
      'grep -i "error\\|critical\\|fail" /var/log/syslog\n' +
      '\n' +
      '# Compter les occurrences par type\n' +
      'grep -c "authentication failure" /var/log/auth.log\n' +
      '\n' +
      '# Top 10 des adresses IP dans les logs Apache\n' +
      'awk \'{print $1}\' /var/log/apache2/access.log | sort | uniq -c | sort -rn | head -10\n' +
      '\n' +
      '# Suivre les logs en temps réel\n' +
      'tail -f /var/log/syslog | grep --line-buffered "interface"</pre>' +
      '<h4>Rotation et rétention</h4>' +
      '<p>Les logs doivent être gérés pour éviter de saturer l\'espace disque. L\'outil <code>logrotate</code> sur Linux automatise la rotation, la compression et la suppression des anciens fichiers de log. La politique de rétention dépend des exigences réglementaires : le RGPD recommande de ne pas conserver les logs plus longtemps que nécessaire, tandis que la norme PCI-DSS exige une rétention d\'un an minimum. Une solution de stockage hiérarchique (hot/warm/cold) optimise les coûts tout en maintenant l\'accessibilité.</p>'
  },
  {
    id: 85,
    title: 'Dépannage DHCP',
    category: 'Dépannage',
    level: 'Intermédiaire',
    duration: '45 min',
    description: 'Identifier et résoudre les problèmes courants liés au protocole DHCP dans un réseau d\'entreprise.',
    content: '<h4>Symptômes de problèmes DHCP</h4>' +
      '<p>Les problèmes DHCP se manifestent généralement par l\'un de ces symptômes : les machines obtiennent une adresse APIPA (169.254.x.x) indiquant qu\'aucun serveur DHCP n\'a répondu, les machines reçoivent une mauvaise configuration (mauvaise passerelle, mauvais DNS), les baux ne se renouvellent pas, ou certains postes fonctionnent tandis que d\'autres non. Un diagnostic méthodique permet d\'identifier rapidement la cause parmi les nombreuses possibilités.</p>' +
      '<h4>Vérifications côté client</h4>' +
      '<p>La première étape consiste à examiner la configuration réseau du client :</p>' +
      '<pre># Windows - Vérifier la configuration actuelle\n' +
      'ipconfig /all\n' +
      '# Vérifier : adresse IP, masque, passerelle, serveur DHCP, bail\n' +
      '\n' +
      '# Libérer et renouveler le bail\n' +
      'ipconfig /release\n' +
      'ipconfig /renew\n' +
      '\n' +
      '# Linux - Vérifier et renouveler\n' +
      'ip addr show\n' +
      'sudo dhclient -r eth0    # libérer\n' +
      'sudo dhclient eth0       # renouveler\n' +
      'sudo dhclient -v eth0    # mode verbeux pour le diagnostic</pre>' +
      '<p>Si la commande <code>ipconfig /renew</code> échoue avec un timeout, le problème se situe entre le client et le serveur DHCP. Si elle retourne une mauvaise configuration, le problème est sur le serveur DHCP lui-même.</p>' +
      '<h4>Problèmes courants et solutions</h4>' +
      '<ul>' +
      '<li><strong>Pool d\'adresses épuisé</strong> : toutes les adresses du pool sont attribuées. Vérifiez avec <code>show ip dhcp pool</code> sur Cisco. Solutions : élargir le pool, réduire la durée des baux, identifier les baux fantômes (machines déconnectées mais bail non libéré).</li>' +
      '<li><strong>Serveur DHCP pirate (Rogue DHCP)</strong> : un équipement non autorisé distribue de mauvaises configurations. Activez le DHCP Snooping sur les commutateurs pour bloquer les réponses DHCP sur les ports non fiables.</li>' +
      '<li><strong>DHCP Relay manquant</strong> : si le serveur DHCP est sur un autre sous-réseau et que le routeur intermédiaire n\'a pas la commande <code>ip helper-address</code>, les Discover ne seront jamais relayés.</li>' +
      '<li><strong>Conflit d\'adresses IP</strong> : une adresse attribuée par DHCP est déjà utilisée par un appareil configuré en statique. Le serveur DHCP devrait effectuer un ping avant l\'attribution (configurable avec <code>ip dhcp ping packets</code>).</li>' +
      '</ul>' +
      '<h4>Diagnostic avec Wireshark</h4>' +
      '<p>Wireshark est l\'outil ultime pour diagnostiquer les problèmes DHCP. Utilisez le filtre d\'affichage <code>dhcp</code> (ou <code>bootp</code> dans les anciennes versions) pour isoler le trafic DHCP. Vérifiez la séquence DORA complète : un Discover sans Offer indique que le serveur est injoignable ou surchargé, un Offer suivi d\'un Request mais pas d\'Acknowledge peut indiquer un conflit d\'adresse, et la présence de DHCP NAK (refus) indique que le serveur rejette la demande du client.</p>' +
      '<h4>Vérifications côté serveur</h4>' +
      '<pre># Cisco - Commandes de vérification\n' +
      'show ip dhcp binding          # baux actifs\n' +
      'show ip dhcp pool             # statistiques des pools\n' +
      'show ip dhcp server statistics # compteurs du serveur\n' +
      'show ip dhcp conflict         # conflits détectés\n' +
      'clear ip dhcp binding *       # purger tous les baux (attention !)\n' +
      '\n' +
      '# Linux (ISC DHCP)\n' +
      'cat /var/lib/dhcp/dhcpd.leases   # fichier des baux\n' +
      'systemctl status isc-dhcp-server  # état du service\n' +
      'journalctl -u isc-dhcp-server     # logs du service</pre>' +
      '<h4>Prévention</h4>' +
      '<p>Pour prévenir les problèmes DHCP, déployez le DHCP Snooping sur tous les commutateurs, configurez des alertes de monitoring sur le taux d\'utilisation des pools (alerte à 80%), utilisez des réservations DHCP pour les équipements critiques (imprimantes, téléphones IP), et dimensionnez correctement les pools en tenant compte de la croissance future. Un serveur DHCP redondant (DHCP failover) garantit la continuité de service en cas de panne du serveur principal.</p>'
  },
  {
    id: 86,
    title: 'Dépannage DNS',
    category: 'Dépannage',
    level: 'Intermédiaire',
    duration: '1h',
    description: 'Diagnostiquer et résoudre les problèmes de résolution de noms DNS qui affectent l\'accès aux services réseau.',
    content: '<h4>Symptômes de problèmes DNS</h4>' +
      '<p>Les problèmes DNS sont parmi les plus fréquents en réseau et se manifestent de diverses manières : impossibilité d\'accéder aux sites web par leur nom alors que l\'accès par adresse IP fonctionne, résolution lente qui provoque des délais d\'affichage des pages, résolution intermittente, ou résolution vers de mauvaises adresses IP. Le DNS étant la base de presque toute communication sur Internet, un dysfonctionnement DNS peut paralyser l\'ensemble des services.</p>' +
      '<h4>Tests de diagnostic de base</h4>' +
      '<pre># 1. Tester la résolution DNS\n' +
      'nslookup www.example.com\n' +
      'nslookup www.example.com 8.8.8.8   # tester avec un DNS public\n' +
      '\n' +
      '# 2. Si la résolution fonctionne avec 8.8.8.8 mais pas avec le DNS local,\n' +
      '#    le problème est sur le serveur DNS interne\n' +
      '\n' +
      '# 3. Tester la connectivité vers le serveur DNS\n' +
      'ping 10.0.0.53   # IP du serveur DNS interne\n' +
      '\n' +
      '# 4. Vérifier quel serveur DNS est configuré\n' +
      'ipconfig /all     # Windows\n' +
      'cat /etc/resolv.conf  # Linux\n' +
      '\n' +
      '# 5. Vider le cache DNS local\n' +
      'ipconfig /flushdns    # Windows\n' +
      'sudo systemd-resolve --flush-caches  # Linux systemd\n' +
      '\n' +
      '# 6. Vérifier le cache DNS local\n' +
      'ipconfig /displaydns  # Windows</pre>' +
      '<h4>Problèmes courants et solutions</h4>' +
      '<ul>' +
      '<li><strong>Serveur DNS injoignable</strong> : vérifiez que le service DNS est en cours d\'exécution, que le port 53 (TCP et UDP) n\'est pas bloqué par un pare-feu, et que la configuration réseau du client pointe vers le bon serveur DNS.</li>' +
      '<li><strong>Cache DNS corrompu ou périmé</strong> : un enregistrement en cache peut pointer vers une ancienne adresse IP. Videz le cache du client (<code>ipconfig /flushdns</code>) et éventuellement celui du serveur DNS (<code>rndc flush</code> pour BIND).</li>' +
      '<li><strong>Mauvais forwarders</strong> : si le serveur DNS interne ne peut pas résoudre les noms externes, vérifiez la configuration des forwarders (serveurs DNS vers lesquels les requêtes non résolues localement sont transmises).</li>' +
      '<li><strong>Zone DNS non chargée</strong> : un fichier de zone avec une erreur de syntaxe peut empêcher le chargement de la zone entière. Vérifiez les logs du serveur DNS et utilisez <code>named-checkzone</code> pour valider la syntaxe.</li>' +
      '<li><strong>TTL trop long</strong> : après un changement d\'enregistrement DNS, les anciens enregistrements restent en cache chez les résolveurs pendant la durée du TTL. Réduisez le TTL avant les changements planifiés.</li>' +
      '</ul>' +
      '<h4>Diagnostic avancé avec dig</h4>' +
      '<pre># Résolution complète depuis la racine\n' +
      'dig +trace example.com\n' +
      '\n' +
      '# Vérifier les enregistrements SOA (Start of Authority)\n' +
      'dig SOA example.com\n' +
      '\n' +
      '# Vérifier le transfert de zone\n' +
      'dig AXFR example.com @ns1.example.com\n' +
      '\n' +
      '# Résolution inverse (PTR)\n' +
      'dig -x 93.184.216.34\n' +
      '\n' +
      '# Vérifier les enregistrements MX (mail)\n' +
      'dig MX example.com +short\n' +
      '\n' +
      '# Mesurer le temps de résolution\n' +
      'dig example.com | grep "Query time"</pre>' +
      '<h4>DNS et sécurité</h4>' +
      '<p>Le DNS est souvent ciblé par des attaques : le DNS spoofing injecte de fausses réponses pour rediriger le trafic, le DNS tunneling utilise les requêtes DNS pour exfiltrer des données, et les attaques DDoS par amplification DNS exploitent les serveurs récursifs ouverts. DNSSEC (DNS Security Extensions) protège contre le spoofing en signant cryptographiquement les enregistrements. DoH (DNS over HTTPS) et DoT (DNS over TLS) chiffrent les requêtes DNS pour protéger la confidentialité.</p>' +
      '<h4>Monitoring DNS</h4>' +
      '<p>Un monitoring proactif du DNS est essentiel : surveillez le temps de réponse des requêtes (alerte si > 100 ms), le taux de requêtes NXDOMAIN (pic pouvant indiquer une attaque ou une mauvaise configuration), le taux d\'utilisation du cache, et la cohérence entre les serveurs DNS primaire et secondaire. Des outils comme dnstop, dnsperf et les tableaux de bord des solutions SIEM permettent de visualiser ces métriques en temps réel.</p>'
  },
  {
    id: 87,
    title: 'Dépannage de connectivité',
    category: 'Dépannage',
    level: 'Débutant',
    duration: '1h',
    description: 'Suivre une procédure systématique pour diagnostiquer et résoudre les problèmes de connectivité réseau couche par couche.',
    content: '<h4>Approche méthodique par couches</h4>' +
      '<p>Le dépannage de connectivité consiste à remonter systématiquement les couches du modèle OSI pour identifier où la communication échoue. Cette approche \"bottom-up\" garantit qu\'aucune cause n\'est négligée et permet d\'identifier la couche problématique. Chaque couche dépendant des couches inférieures, il est inutile de vérifier le DNS si le câble réseau est débranché.</p>' +
      '<h4>Couche 1 - Physique</h4>' +
      '<p>Vérifiez d\'abord la couche physique, source de plus de 50% des problèmes réseau :</p>' +
      '<ul>' +
      '<li>Le câble réseau est-il branché aux deux extrémités ?</li>' +
      '<li>Les LED de la carte réseau et du port du commutateur sont-elles allumées (link/activity) ?</li>' +
      '<li>Le câble est-il en bon état (pas de pliure, pas de connecteur endommagé) ?</li>' +
      '<li>Pour le WiFi : la carte WiFi est-elle activée ? Le signal est-il suffisant ?</li>' +
      '<li>Essayez un autre câble, un autre port du commutateur, ou une autre prise murale.</li>' +
      '</ul>' +
      '<pre># Vérifier l\'état de l\'interface (Linux)\n' +
      'ip link show eth0\n' +
      'ethtool eth0        # vitesse, duplex, état du lien\n' +
      '\n' +
      '# Vérifier l\'état du port (Cisco)\n' +
      'show interface GigabitEthernet0/1 status\n' +
      'show interface GigabitEthernet0/1 | include errors</pre>' +
      '<h4>Couche 2 - Liaison de données</h4>' +
      '<p>Si la couche physique est fonctionnelle, vérifiez la couche 2 :</p>' +
      '<ul>' +
      '<li>La machine apparaît-elle dans la table MAC du commutateur ? (<code>show mac address-table</code>)</li>' +
      '<li>Le port est-il dans le bon VLAN ? (<code>show vlan brief</code>)</li>' +
      '<li>Le port est-il en état err-disabled (sécurité 802.1X, BPDU guard, etc.) ?</li>' +
      '<li>La table ARP contient-elle l\'entrée correspondante ? (<code>arp -a</code>)</li>' +
      '<li>Y a-t-il un problème de duplex mismatch (auto/full-duplex) ?</li>' +
      '</ul>' +
      '<h4>Couche 3 - Réseau</h4>' +
      '<p>La couche réseau est généralement la plus rapide à tester :</p>' +
      '<pre># 1. Vérifier la configuration IP\n' +
      'ipconfig /all    # ou ip addr show\n' +
      '\n' +
      '# 2. Pinguer sa propre passerelle\n' +
      'ping 192.168.1.1\n' +
      '\n' +
      '# 3. Pinguer un hôte sur un autre réseau\n' +
      'ping 8.8.8.8\n' +
      '\n' +
      '# 4. Tracer la route\n' +
      'tracert 8.8.8.8\n' +
      '\n' +
      '# Interprétation :\n' +
      '# - Ping passerelle échoue : problème local (L1, L2 ou configuration IP)\n' +
      '# - Ping passerelle OK, ping distant échoue : problème de routage\n' +
      '# - Tracert montre où la route s\'arrête</pre>' +
      '<h4>Couches 4-7 - Transport et Application</h4>' +
      '<p>Si la connectivité IP fonctionne (ping réussi), les problèmes se situent au-dessus :</p>' +
      '<pre># Tester un port spécifique\n' +
      'telnet serveur.exemple.com 80\n' +
      'Test-NetConnection -ComputerName serveur -Port 443  # PowerShell\n' +
      '\n' +
      '# Vérifier les ports en écoute sur le serveur\n' +
      'netstat -tlnp   # Linux\n' +
      'netstat -ano     # Windows\n' +
      '\n' +
      '# Tester HTTP\n' +
      'curl -v http://serveur.exemple.com\n' +
      '\n' +
      '# Vérifier le DNS\n' +
      'nslookup serveur.exemple.com</pre>' +
      '<h4>Problèmes intermittents</h4>' +
      '<p>Les problèmes intermittents sont les plus difficiles à diagnostiquer. Ils peuvent être causés par : des câbles défectueux qui fonctionnent de manière aléatoire, des interférences WiFi (micro-ondes, Bluetooth), une saturation de bande passante à certaines heures, des boucles STP (Spanning Tree), des problèmes de MTU provoquant la fragmentation de certains paquets, ou des conflits d\'adresses IP intermittents. Un monitoring continu avec des outils comme PRTG, LibreNMS ou Smokeping aide à capturer ces événements transitoires.</p>' +
      '<h4>Checklist de dépannage rapide</h4>' +
      '<p>En résumé, suivez cette checklist : 1) Vérifier le câble et les LED, 2) Vérifier l\'adresse IP et le masque, 3) Pinguer la passerelle, 4) Pinguer une IP externe, 5) Tester la résolution DNS, 6) Tester le port de destination, 7) Vérifier les règles de pare-feu. Cette séquence de 7 tests permet de localiser rapidement la cause de la majorité des problèmes de connectivité.</p>'
  },
  {
    id: 88,
    title: 'Performance réseau et optimisation',
    category: 'Dépannage',
    level: 'Avancé',
    duration: '1h30',
    description: 'Mesurer, analyser et optimiser les performances réseau pour garantir une expérience utilisateur optimale.',
    content: '<h4>Métriques de performance réseau</h4>' +
      '<p>L\'évaluation des performances réseau repose sur plusieurs métriques clés qu\'il faut savoir mesurer et interpréter :</p>' +
      '<ul>' +
      '<li><strong>Bande passante (Bandwidth)</strong> : capacité maximale théorique du lien, exprimée en bits par seconde (bps). Un lien Gigabit Ethernet a une bande passante de 1 Gbps.</li>' +
      '<li><strong>Débit (Throughput)</strong> : quantité de données réellement transférées par unité de temps. Toujours inférieur à la bande passante en raison de l\'overhead protocolaire et des conditions réseau.</li>' +
      '<li><strong>Latence</strong> : temps de transit d\'un paquet de la source à la destination, mesuré en millisecondes (ms). La latence aller-retour (RTT) est mesurée par ping.</li>' +
      '<li><strong>Gigue (Jitter)</strong> : variation de la latence entre les paquets successifs. Critique pour la VoIP et la vidéo (objectif < 30 ms).</li>' +
      '<li><strong>Perte de paquets (Packet Loss)</strong> : pourcentage de paquets n\'atteignant pas leur destination. Même 1% de perte dégrade significativement TCP.</li>' +
      '</ul>' +
      '<h4>Outils de mesure</h4>' +
      '<pre># iPerf3 - Mesure de débit entre deux points\n' +
      '# Sur le serveur\n' +
      'iperf3 -s\n' +
      '\n' +
      '# Sur le client\n' +
      'iperf3 -c 192.168.1.100 -t 30 -P 4    # 30s, 4 flux parallèles\n' +
      'iperf3 -c 192.168.1.100 -u -b 100M     # test UDP à 100 Mbps\n' +
      '\n' +
      '# Smokeping - Mesure continue de latence et perte\n' +
      '# Génère des graphiques RRD montrant la latence au fil du temps\n' +
      '\n' +
      '# MTR - Traceroute continu avec statistiques\n' +
      'mtr -r -c 100 8.8.8.8    # rapport avec 100 paquets\n' +
      '\n' +
      '# Speedtest CLI\n' +
      'speedtest-cli --simple</pre>' +
      '<h4>Identification des goulets d\'étranglement</h4>' +
      '<p>Les goulets d\'étranglement les plus courants sont :</p>' +
      '<ul>' +
      '<li><strong>Saturation de lien</strong> : un lien à 90%+ d\'utilisation introduit des délais de mise en file d\'attente. Surveillez l\'utilisation avec SNMP et des graphiques MRTG/Cacti.</li>' +
      '<li><strong>Buffers saturés</strong> : les commutateurs et routeurs avec des buffers pleins commencent à dropper des paquets. Vérifiez les compteurs de drops (<code>show interface</code> → output drops).</li>' +
      '<li><strong>CPU des équipements</strong> : un routeur ou pare-feu avec un CPU à 100% ne peut plus traiter le trafic efficacement. Les causes incluent les ACL complexes, le NAT intensif, ou les protocoles de routage.</li>' +
      '<li><strong>Problèmes de window TCP</strong> : la fenêtre TCP détermine combien de données peuvent être envoyées avant d\'attendre un ACK. Sur les liens à haute latence, une fenêtre trop petite limite le débit.</li>' +
      '</ul>' +
      '<h4>Optimisation TCP</h4>' +
      '<p>L\'optimisation TCP est essentielle pour les liens WAN à haute latence :</p>' +
      '<pre># Linux - Augmenter les buffers TCP\n' +
      'sysctl -w net.core.rmem_max=16777216\n' +
      'sysctl -w net.core.wmem_max=16777216\n' +
      'sysctl -w net.ipv4.tcp_rmem="4096 87380 16777216"\n' +
      'sysctl -w net.ipv4.tcp_wmem="4096 65536 16777216"\n' +
      '\n' +
      '# Activer le TCP window scaling\n' +
      'sysctl -w net.ipv4.tcp_window_scaling=1\n' +
      '\n' +
      '# Algorithme de congestion (BBR recommandé)\n' +
      'sysctl -w net.ipv4.tcp_congestion_control=bbr</pre>' +
      '<h4>Optimisation WAN</h4>' +
      '<p>Les solutions d\'optimisation WAN (WAN Optimization Controllers, Riverbed SteelHead, Silver Peak) améliorent les performances sur les liens distants grâce à plusieurs techniques : la déduplication des données élimine les données redondantes dans le trafic, la compression réduit la taille des données transmises, le caching local stocke les données fréquemment accédées, et l\'accélération protocolaire optimise les échanges de protocoles bavards comme CIFS/SMB ou HTTP. Ces solutions peuvent multiplier par 10 le débit effectif sur un lien WAN.</p>' +
      '<h4>Baseline et capacité planning</h4>' +
      '<p>L\'établissement d\'une baseline (référence) des performances normales est indispensable. Mesurez le trafic pendant une période représentative (2-4 semaines minimum) pour établir les schémas d\'utilisation typiques. Utilisez ces données pour le capacity planning : anticipez la croissance du trafic (généralement 20-30% par an) et planifiez les mises à niveau d\'infrastructure avant que la saturation ne dégrade les performances. Les outils de NPM (Network Performance Monitoring) comme SolarWinds, PRTG ou LibreNMS automatisent ce suivi.</p>'
  },
  {
    id: 89,
    title: 'Monitoring SNMP',
    category: 'Dépannage',
    level: 'Intermédiaire',
    duration: '1h',
    description: 'Mettre en place un monitoring réseau efficace avec le protocole SNMP pour superviser l\'ensemble de l\'infrastructure.',
    content: '<h4>Présentation du SNMP</h4>' +
      '<p>SNMP (Simple Network Management Protocol) est le protocole standard pour la supervision des équipements réseau. Il permet de collecter des informations de performance (utilisation CPU, mémoire, bande passante), de détecter les pannes, et même de modifier la configuration des équipements à distance. Presque tous les équipements réseau — routeurs, commutateurs, pare-feu, serveurs, imprimantes, onduleurs — supportent SNMP, en faisant le socle de toute solution de monitoring.</p>' +
      '<h4>Architecture SNMP</h4>' +
      '<p>L\'architecture SNMP repose sur trois composants :</p>' +
      '<ul>' +
      '<li><strong>Agent SNMP</strong> : logiciel embarqué dans l\'équipement supervisé qui collecte les informations locales et répond aux requêtes du manager. Il peut aussi envoyer des alertes spontanées (traps).</li>' +
      '<li><strong>Manager SNMP (NMS)</strong> : serveur de supervision qui interroge les agents, stocke les données collectées, génère des graphiques et déclenche des alertes. Exemples : Zabbix, Nagios, PRTG, LibreNMS.</li>' +
      '<li><strong>MIB (Management Information Base)</strong> : base de données hiérarchique qui définit les objets gérables sur chaque équipement. Chaque objet est identifié par un OID (Object Identifier) unique.</li>' +
      '</ul>' +
      '<h4>Versions SNMP</h4>' +
      '<p>Trois versions de SNMP coexistent :</p>' +
      '<ul>' +
      '<li><strong>SNMPv1</strong> : version originale avec authentification par community string en clair. Obsolète et non sécurisé.</li>' +
      '<li><strong>SNMPv2c</strong> : améliorations de performance (GetBulk, InformRequest) mais toujours pas de chiffrement. Encore très utilisé en interne.</li>' +
      '<li><strong>SNMPv3</strong> : ajoute l\'authentification (MD5/SHA) et le chiffrement (DES/AES). Recommandé pour tout nouveau déploiement, obligatoire si le trafic SNMP traverse un réseau non fiable.</li>' +
      '</ul>' +
      '<h4>Configuration SNMP</h4>' +
      '<pre># Configuration SNMPv2c sur Cisco\n' +
      'snmp-server community MonCommunity RO   # lecture seule\n' +
      'snmp-server community MonSecret RW       # lecture-écriture\n' +
      'snmp-server location "Salle serveur, Rack A3"\n' +
      'snmp-server contact admin@entreprise.com\n' +
      'snmp-server host 10.0.0.50 traps MonCommunity\n' +
      'snmp-server enable traps\n' +
      '\n' +
      '# Configuration SNMPv3 (recommandé)\n' +
      'snmp-server group MON-GROUPE v3 priv\n' +
      'snmp-server user MON-USER MON-GROUPE v3 auth sha MonMotDePasse priv aes 128 MaCleChiffrement\n' +
      'snmp-server host 10.0.0.50 version 3 priv MON-USER\n' +
      '\n' +
      '# Restreindre l\'accès SNMP avec une ACL\n' +
      'access-list 10 permit 10.0.0.50\n' +
      'snmp-server community MonCommunity RO 10</pre>' +
      '<h4>OIDs courants</h4>' +
      '<p>Les OIDs les plus fréquemment surveillés :</p>' +
      '<pre># Utilisation CPU (Cisco)\n' +
      '.1.3.6.1.4.1.9.9.109.1.1.1.1.6   (cpmCPUTotal5minRev)\n' +
      '\n' +
      '# Mémoire utilisée (Cisco)\n' +
      '.1.3.6.1.4.1.9.9.48.1.1.1.5      (ciscoMemoryPoolUsed)\n' +
      '\n' +
      '# Trafic entrant sur une interface\n' +
      '.1.3.6.1.2.1.2.2.1.10            (ifInOctets)\n' +
      '\n' +
      '# Trafic sortant sur une interface\n' +
      '.1.3.6.1.2.1.2.2.1.16            (ifOutOctets)\n' +
      '\n' +
      '# État de l\'interface (up/down)\n' +
      '.1.3.6.1.2.1.2.2.1.8             (ifOperStatus)\n' +
      '\n' +
      '# Outils en ligne de commande\n' +
      'snmpwalk -v2c -c MonCommunity 192.168.1.1 system\n' +
      'snmpget -v2c -c MonCommunity 192.168.1.1 sysUpTime.0</pre>' +
      '<h4>Solutions de monitoring</h4>' +
      '<p>Les principales solutions NMS open source et commerciales :</p>' +
      '<ul>' +
      '<li><strong>Zabbix</strong> : solution complète avec auto-découverte, templates, tableaux de bord, alertes et rapports. Très populaire en entreprise.</li>' +
      '<li><strong>LibreNMS</strong> : fork de Observium, excellent pour le monitoring réseau pur avec auto-découverte et graphiques automatiques.</li>' +
      '<li><strong>Nagios / Icinga</strong> : monitoring orienté état (up/down) avec un vaste écosystème de plugins.</li>' +
      '<li><strong>Grafana + InfluxDB</strong> : stack moderne pour la visualisation de métriques réseau avec des dashboards personnalisables.</li>' +
      '<li><strong>PRTG</strong> : solution commerciale Windows avec une interface intuitive et une configuration rapide.</li>' +
      '</ul>' +
      '<h4>Traps et alertes</h4>' +
      '<p>Les traps SNMP sont des notifications asynchrones envoyées par les agents vers le NMS lorsqu\'un événement significatif se produit (interface down, dépassement de seuil, redémarrage de l\'équipement). Contrairement au polling régulier, les traps permettent une détection immédiate des problèmes. Un système d\'alertes bien configuré doit définir des seuils pertinents (warning à 70%, critical à 90%), éviter les faux positifs par l\'utilisation de dépendances (ne pas alerter sur les équipements derrière un lien déjà en panne), et notifier les bonnes personnes via email, SMS ou intégration avec un outil d\'astreinte comme PagerDuty.</p>'
  },
  {
    id: 90,
    title: 'Troubleshooting WiFi',
    category: 'Dépannage',
    level: 'Intermédiaire',
    duration: '1h30',
    description: 'Diagnostiquer et résoudre les problèmes de connectivité et de performance des réseaux WiFi.',
    content: '<h4>Catégories de problèmes WiFi</h4>' +
      '<p>Les problèmes WiFi se classent en trois grandes catégories : les problèmes de connectivité (impossibilité de se connecter au réseau), les problèmes de performance (connexion établie mais débit insuffisant ou instable), et les problèmes d\'itinérance (déconnexions lors du déplacement entre points d\'accès). Chaque catégorie nécessite une approche de diagnostic spécifique et des outils adaptés.</p>' +
      '<h4>Problèmes de connectivité</h4>' +
      '<p>Si un client ne peut pas se connecter au réseau WiFi, vérifiez dans l\'ordre :</p>' +
      '<ul>' +
      '<li><strong>Le SSID est-il visible ?</strong> Si non, vérifiez que le SSID n\'est pas masqué (hidden) et que l\'AP est opérationnel. Testez avec un autre appareil.</li>' +
      '<li><strong>Erreur d\'authentification ?</strong> Vérifiez le mot de passe WPA, le certificat 802.1X, ou la configuration RADIUS. Les logs du contrôleur WiFi ou du serveur RADIUS indiquent la raison exacte du rejet.</li>' +
      '<li><strong>Association réussie mais pas d\'IP ?</strong> Le client est authentifié mais ne reçoit pas d\'adresse DHCP. Vérifiez le serveur DHCP et le relais DHCP sur le contrôleur.</li>' +
      '<li><strong>IP obtenue mais pas d\'accès ?</strong> Vérifiez les ACL, le VLAN d\'affectation, les règles de pare-feu et le portail captif éventuel.</li>' +
      '</ul>' +
      '<h4>Problèmes de performance</h4>' +
      '<p>Les causes de mauvaises performances WiFi sont multiples :</p>' +
      '<ul>' +
      '<li><strong>Signal faible</strong> : RSSI inférieur à -70 dBm. Solution : rapprocher l\'AP ou ajouter un AP supplémentaire.</li>' +
      '<li><strong>Interférences co-canal (CCI)</strong> : plusieurs AP sur le même canal dans la même zone. Solution : réplanifier les canaux.</li>' +
      '<li><strong>Interférences non-WiFi</strong> : micro-ondes, Bluetooth, caméras sans fil. Solution : identifier la source avec un analyseur spectral et l\'éliminer ou changer de canal.</li>' +
      '<li><strong>Client legacy</strong> : un seul client 802.11b sur un AP 802.11n ralentit tous les clients. Solution : désactiver les débits legacy bas (protection mode) ou créer un SSID dédié.</li>' +
      '<li><strong>Surcharge d\'AP</strong> : trop de clients connectés à un même AP (> 25-30 pour un usage intensif). Solution : ajouter des AP et activer le load balancing.</li>' +
      '</ul>' +
      '<h4>Outils de diagnostic WiFi</h4>' +
      '<pre># Windows - Rapport WiFi détaillé\n' +
      'netsh wlan show interfaces\n' +
      'netsh wlan show all\n' +
      'netsh wlan show wlanreport    # rapport HTML complet\n' +
      '\n' +
      '# Linux\n' +
      'iwconfig wlan0               # configuration WiFi actuelle\n' +
      'iw dev wlan0 link            # détails de la connexion\n' +
      'iw dev wlan0 scan            # scanner les réseaux disponibles\n' +
      'wavemon                      # moniteur WiFi en temps réel\n' +
      '\n' +
      '# Outils professionnels\n' +
      '# - WiFi Explorer (macOS) : analyse spectrale et liste des réseaux\n' +
      '# - inSSIDer : visualisation des canaux et de la puissance\n' +
      '# - Ekahau : site survey professionnel et troubleshooting</pre>' +
      '<h4>Analyse avec le contrôleur WiFi</h4>' +
      '<p>Les contrôleurs WiFi fournissent des données de diagnostic précieuses : historique des associations/désassociations des clients, raisons des déconnexions, RSSI du client vu par chaque AP, débit de données réel, nombre de retransmissions et taux d\'erreurs radio. Sur un WLC Cisco, les commandes <code>show client detail</code> et <code>show client summary</code> donnent un aperçu immédiat de l\'état des clients. Le dashboard du contrôleur affiche les clients avec un signal faible, les AP surchargés et les événements de sécurité.</p>' +
      '<h4>Roaming et handoff</h4>' +
      '<p>Les problèmes d\'itinérance (roaming) se manifestent par des micro-coupures lors du passage d\'un AP à un autre. Pour un roaming fluide : assurez un recouvrement de 15-20% entre les cellules adjacentes, activez les standards de roaming rapide (802.11r pour le Fast Transition, 802.11k pour la gestion des ressources radio, 802.11v pour la gestion de la transition BSS), et configurez le même SSID et les mêmes paramètres de sécurité sur tous les AP. Le \"sticky client\" (client qui reste accroché à un AP distant plutôt que de basculer vers un AP plus proche) est résolu par des fonctions de band steering et de client steering du contrôleur.</p>' +
      '<h4>Documentation et suivi</h4>' +
      '<p>Pour un dépannage WiFi efficace, maintenez une documentation à jour : plan de couverture avec l\'emplacement des AP, attribution des canaux et des puissances, inventaire des clients critiques, et journal des incidents. Les outils de monitoring WiFi cloud (Meraki Dashboard, Aruba Central, Mist AI) offrent des capacités d\'analyse proactive basées sur l\'intelligence artificielle qui prédisent les problèmes avant qu\'ils n\'impactent les utilisateurs.</p>'
  },

  // =====================================================
  // j) Avancé (id 91-100)
  // =====================================================
  {
    id: 91,
    title: 'Automatisation réseau (Ansible, Python)',
    category: 'Avancé',
    level: 'Avancé',
    duration: '2h',
    description: 'Découvrir l\'automatisation réseau avec Ansible et Python pour gérer efficacement les infrastructures à grande échelle.',
    content: '<h4>Pourquoi automatiser le réseau ?</h4>' +
      '<p>L\'automatisation réseau répond aux défis croissants de complexité et d\'échelle des infrastructures modernes. La configuration manuelle de dizaines, voire centaines d\'équipements est non seulement chronophage mais aussi source d\'erreurs humaines, première cause de pannes réseau. L\'automatisation garantit la cohérence des configurations, accélère les déploiements, facilite la conformité et libère les ingénieurs pour des tâches à plus forte valeur ajoutée. Le concept d\'Infrastructure as Code (IaC) appliqué au réseau est désormais une compétence incontournable.</p>' +
      '<h4>Python pour le réseau</h4>' +
      '<p>Python est le langage de référence pour l\'automatisation réseau grâce à ses bibliothèques spécialisées :</p>' +
      '<ul>' +
      '<li><strong>Netmiko</strong> : bibliothèque SSH qui supporte une vaste gamme d\'équipements (Cisco, Juniper, Arista, etc.) et simplifie l\'envoi de commandes et la récupération des résultats</li>' +
      '<li><strong>NAPALM</strong> : abstraction multi-constructeur pour la gestion de configuration (get, compare, merge, replace, rollback)</li>' +
      '<li><strong>Nornir</strong> : framework d\'automatisation parallèle inspiré d\'Ansible mais en pur Python, plus flexible et performant</li>' +
      '<li><strong>Paramiko</strong> : bibliothèque SSH de bas niveau sur laquelle Netmiko est construite</li>' +
      '<li><strong>Scrapli</strong> : alternative moderne à Netmiko avec support SSH, Telnet et NETCONF</li>' +
      '</ul>' +
      '<pre># Exemple Netmiko - Configurer un VLAN sur plusieurs switches\n' +
      'from netmiko import ConnectHandler\n' +
      '\n' +
      'switches = [\n' +
      '    {"device_type": "cisco_ios", "host": "192.168.1.10",\n' +
      '     "username": "admin", "password": "secret"},\n' +
      '    {"device_type": "cisco_ios", "host": "192.168.1.11",\n' +
      '     "username": "admin", "password": "secret"},\n' +
      ']\n' +
      '\n' +
      'config_commands = [\n' +
      '    "vlan 100",\n' +
      '    "name SERVEURS",\n' +
      '    "exit",\n' +
      ']\n' +
      '\n' +
      'for switch in switches:\n' +
      '    with ConnectHandler(**switch) as conn:\n' +
      '        output = conn.send_config_set(config_commands)\n' +
      '        conn.save_config()\n' +
      '        print(f"{switch[\'host\']}: Configuration appliquée")</pre>' +
      '<h4>Ansible pour le réseau</h4>' +
      '<p>Ansible est l\'outil d\'automatisation le plus populaire pour les réseaux d\'entreprise. Il est agentless (pas besoin d\'installer de logiciel sur les équipements), utilise SSH pour la connexion, et décrit les configurations souhaitées dans des fichiers YAML lisibles par les humains (playbooks). Les collections réseau Ansible fournissent des modules pour Cisco IOS/NX-OS/ASA, Juniper JunOS, Arista EOS, Fortinet, Palo Alto, et bien d\'autres.</p>' +
      '<pre># Playbook Ansible - Configuration NTP sur tous les routeurs\n' +
      '---\n' +
      '- name: Configurer NTP sur les routeurs\n' +
      '  hosts: routeurs\n' +
      '  gather_facts: false\n' +
      '  tasks:\n' +
      '    - name: Configurer les serveurs NTP\n' +
      '      cisco.ios.ios_ntp_global:\n' +
      '        config:\n' +
      '          servers:\n' +
      '            - server: 0.fr.pool.ntp.org\n' +
      '              prefer: true\n' +
      '            - server: 1.fr.pool.ntp.org\n' +
      '        state: merged\n' +
      '\n' +
      '    - name: Sauvegarder la configuration\n' +
      '      cisco.ios.ios_config:\n' +
      '        save_when: modified</pre>' +
      '<h4>APIs réseau et NETCONF/RESTCONF</h4>' +
      '<p>Les équipements modernes exposent des APIs programmables :</p>' +
      '<ul>' +
      '<li><strong>NETCONF</strong> (RFC 6241) : protocole basé sur XML/SSH pour la gestion de configuration avec support transactionnel (commit, rollback, validate)</li>' +
      '<li><strong>RESTCONF</strong> (RFC 8040) : interface REST/HTTP utilisant JSON ou XML, plus simple que NETCONF pour les cas d\'utilisation courants</li>' +
      '<li><strong>gNMI/gRPC</strong> : protocole de streaming telemetry haute performance, de plus en plus adopté pour le monitoring temps réel</li>' +
      '<li><strong>YANG</strong> : langage de modélisation des données réseau, utilisé par NETCONF et RESTCONF pour définir la structure des configurations</li>' +
      '</ul>' +
      '<h4>CI/CD pour le réseau</h4>' +
      '<p>L\'intégration et le déploiement continus (CI/CD) s\'appliquent désormais au réseau : les configurations sont versionnées dans Git, les changements sont validés par des tests automatisés (linting YAML, tests unitaires, simulation dans un lab virtuel avec GNS3 ou CML), revus par des pairs via des pull requests, puis déployés automatiquement via un pipeline CI/CD (GitLab CI, Jenkins, GitHub Actions). Cette approche NetDevOps réduit drastiquement les erreurs et améliore la traçabilité des changements.</p>'
  },
  {
    id: 92,
    title: 'SDN - Software Defined Networking',
    category: 'Avancé',
    level: 'Avancé',
    duration: '1h30',
    description: 'Comprendre l\'architecture SDN et comment elle révolutionne la conception et la gestion des réseaux.',
    content: '<h4>Le paradigme SDN</h4>' +
      '<p>Le Software-Defined Networking (SDN) est un paradigme architectural qui sépare le plan de contrôle (les décisions de routage) du plan de données (la transmission des paquets) dans les équipements réseau. Dans un réseau traditionnel, chaque routeur et commutateur prend ses propres décisions de manière distribuée. Avec le SDN, un contrôleur centralisé prend toutes les décisions et programme les équipements réseau qui deviennent de simples éléments de forwarding.</p>' +
      '<h4>Architecture en trois couches</h4>' +
      '<p>L\'architecture SDN se décompose en trois couches distinctes :</p>' +
      '<ul>' +
      '<li><strong>Couche d\'infrastructure (Data Plane)</strong> : les équipements réseau physiques ou virtuels qui transmettent les paquets selon les règles reçues du contrôleur. Ils communiquent avec le contrôleur via l\'interface southbound.</li>' +
      '<li><strong>Couche de contrôle (Control Plane)</strong> : le contrôleur SDN qui maintient une vue globale du réseau, calcule les chemins optimaux et programme les équipements. C\'est le \"cerveau\" du réseau.</li>' +
      '<li><strong>Couche d\'application (Application Plane)</strong> : les applications réseau (load balancing, sécurité, monitoring) qui utilisent les APIs northbound du contrôleur pour interagir avec le réseau de manière programmatique.</li>' +
      '</ul>' +
      '<h4>OpenFlow</h4>' +
      '<p>OpenFlow est le premier et le plus connu des protocoles southbound SDN. Développé à l\'université de Stanford, il permet au contrôleur de programmer directement les tables de flux (flow tables) des commutateurs. Chaque entrée de flux définit : un critère de correspondance (match sur les en-têtes des paquets), une action (forward, drop, modify, enqueue), des compteurs de statistiques, et une priorité. Les paquets ne correspondant à aucun flux sont envoyés au contrôleur pour décision.</p>' +
      '<pre># Exemple conceptuel d\'une règle OpenFlow\n' +
      '# Match: trafic HTTP depuis 10.0.0.0/24\n' +
      '# Action: transmettre sur le port 3\n' +
      'Match: in_port=1, eth_type=0x0800, ip_src=10.0.0.0/24, tcp_dst=80\n' +
      'Action: output:3\n' +
      'Priority: 100\n' +
      'Cookie: 0x1234</pre>' +
      '<h4>Contrôleurs SDN</h4>' +
      '<p>Les principaux contrôleurs SDN incluent :</p>' +
      '<ul>' +
      '<li><strong>OpenDaylight (ODL)</strong> : plateforme open source modulaire supportée par la Linux Foundation, largement adoptée en entreprise</li>' +
      '<li><strong>ONOS (Open Network Operating System)</strong> : contrôleur open source orienté opérateurs télécoms, conçu pour la haute disponibilité et la scalabilité</li>' +
      '<li><strong>Cisco ACI (Application Centric Infrastructure)</strong> : solution SDN propriétaire Cisco pour les datacenters, basée sur le contrôleur APIC</li>' +
      '<li><strong>VMware NSX</strong> : plateforme de virtualisation réseau leader pour les datacenters, intégrée à vSphere</li>' +
      '<li><strong>Ryu</strong> : framework SDN léger en Python, idéal pour l\'apprentissage et le prototypage</li>' +
      '</ul>' +
      '<h4>Avantages du SDN</h4>' +
      '<p>Le SDN apporte des bénéfices significatifs : la programmabilité permet d\'automatiser la gestion du réseau via des APIs, la vue centralisée facilite l\'optimisation globale du réseau (contrairement aux décisions locales des protocoles distribués), le provisioning est instantané (création d\'un nouveau réseau en quelques secondes au lieu de jours), et le multi-tenancy natif permet d\'isoler les environnements dans les datacenters cloud. L\'agilité gagnée est particulièrement précieuse pour le DevOps et le cloud computing.</p>' +
      '<h4>Défis et réalité</h4>' +
      '<p>Le SDN présente aussi des défis : le contrôleur est un point unique de défaillance (résolu par le clustering), la scalabilité du contrôleur centralisé peut être limitée pour les très grands réseaux, la migration depuis une infrastructure traditionnelle est complexe et coûteuse, et le marché est fragmenté entre approches propriétaires et standards ouverts. En pratique, la plupart des déploiements SDN actuels sont dans les datacenters (VMware NSX, Cisco ACI) plutôt que sur les réseaux campus, et adoptent une approche hybride combinant SDN et protocoles distribués traditionnels.</p>'
  },
  {
    id: 93,
    title: 'NFV - Network Functions Virtualization',
    category: 'Avancé',
    level: 'Avancé',
    duration: '1h30',
    description: 'Comprendre la virtualisation des fonctions réseau et son impact sur la transformation des infrastructures télécoms.',
    content: '<h4>Qu\'est-ce que le NFV ?</h4>' +
      '<p>Le NFV (Network Functions Virtualization) consiste à remplacer les équipements réseau physiques dédiés (appliances matérielles) par des logiciels s\'exécutant sur des serveurs standards x86. Au lieu d\'acheter un pare-feu physique, un routeur physique et un load balancer physique, chacun coûtant des dizaines de milliers d\'euros, ces fonctions sont virtualisées et déployées comme des machines virtuelles ou des conteneurs sur du matériel serveur générique. Le concept a été formalisé en 2012 par un groupe d\'opérateurs télécoms au sein de l\'ETSI.</p>' +
      '<h4>Architecture NFV (ETSI MANO)</h4>' +
      '<p>L\'architecture de référence ETSI NFV comprend trois couches principales :</p>' +
      '<ul>' +
      '<li><strong>NFVI (NFV Infrastructure)</strong> : les ressources physiques (compute, storage, network) et la couche de virtualisation (hyperviseur ou conteneurs) qui hébergent les VNF. Inclut les serveurs, le stockage et les commutateurs physiques.</li>' +
      '<li><strong>VNF (Virtual Network Functions)</strong> : les fonctions réseau virtualisées elles-mêmes — pare-feu virtuel, routeur virtuel, IDS/IPS virtuel, load balancer virtuel, etc. Chaque VNF est un logiciel qui remplace une appliance physique.</li>' +
      '<li><strong>MANO (Management and Network Orchestration)</strong> : la couche d\'orchestration qui gère le cycle de vie des VNF (déploiement, scaling, monitoring, terminaison) et l\'allocation des ressources d\'infrastructure.</li>' +
      '</ul>' +
      '<h4>Composants MANO</h4>' +
      '<p>Le framework MANO se décompose en trois éléments :</p>' +
      '<ul>' +
      '<li><strong>NFVO (NFV Orchestrator)</strong> : orchestre les services réseau de bout en bout en composant et gérant les chaînes de VNF (service chaining)</li>' +
      '<li><strong>VNFM (VNF Manager)</strong> : gère le cycle de vie individuel de chaque VNF (instanciation, configuration, scaling, guérison, terminaison)</li>' +
      '<li><strong>VIM (Virtualized Infrastructure Manager)</strong> : gère les ressources d\'infrastructure (ex : OpenStack, VMware vCenter, Kubernetes)</li>' +
      '</ul>' +
      '<h4>Exemples de VNF</h4>' +
      '<p>Les fonctions réseau les plus couramment virtualisées sont :</p>' +
      '<ul>' +
      '<li><strong>vFirewall</strong> : Palo Alto VM-Series, Fortinet FortiGate-VM, pfSense</li>' +
      '<li><strong>vRouter</strong> : Cisco CSR 1000v, VyOS, FRRouting</li>' +
      '<li><strong>vLoad Balancer</strong> : F5 BIG-IP Virtual Edition, HAProxy, Nginx</li>' +
      '<li><strong>vWAN Optimizer</strong> : Riverbed SteelHead-v, Silver Peak VX</li>' +
      '<li><strong>vIDS/IPS</strong> : Snort, Suricata en mode virtuel</li>' +
      '<li><strong>vDNS/vDHCP</strong> : BIND, ISC DHCP en conteneurs</li>' +
      '</ul>' +
      '<h4>Service Function Chaining (SFC)</h4>' +
      '<p>Le chaînage de fonctions de service (SFC) est un concept clé du NFV qui permet de définir un chemin ordonné que le trafic doit suivre à travers plusieurs VNF. Par exemple, un flux de trafic entrant peut être dirigé successivement à travers un pare-feu, un IPS, un proxy de cache, puis un load balancer avant d\'atteindre le serveur de destination. Le SFC est dynamique et peut être modifié à la volée en fonction des politiques de sécurité ou des conditions du réseau.</p>' +
      '<h4>Avantages et défis</h4>' +
      '<p>Le NFV offre des avantages majeurs : réduction des coûts d\'investissement (CAPEX) grâce au matériel générique, réduction des coûts opérationnels (OPEX) par l\'automatisation du déploiement, élasticité avec la possibilité de scaler les fonctions à la demande, time-to-market accéléré pour les nouveaux services, et multi-tenancy native. Les défis incluent les performances (une VNF est généralement moins performante que l\'appliance physique équivalente), la complexité de l\'orchestration, la maturité encore variable des solutions, et les problèmes de performance d\'I/O réseau dans les environnements virtualisés (résolus partiellement par DPDK et SR-IOV).</p>'
  },
  {
    id: 94,
    title: 'Containers et réseau (Docker, Kubernetes)',
    category: 'Avancé',
    level: 'Avancé',
    duration: '2h',
    description: 'Comprendre les modèles réseau des conteneurs Docker et Kubernetes et leur impact sur l\'architecture réseau.',
    content: '<h4>Réseau Docker fondamental</h4>' +
      '<p>Docker utilise plusieurs pilotes réseau (network drivers) pour connecter les conteneurs :</p>' +
      '<ul>' +
      '<li><strong>bridge</strong> (défaut) : crée un réseau privé interne sur l\'hôte. Les conteneurs du même réseau bridge communiquent directement. L\'accès extérieur se fait par le NAT et le port mapping (<code>-p 8080:80</code>). Docker crée un bridge Linux <code>docker0</code> (172.17.0.0/16 par défaut).</li>' +
      '<li><strong>host</strong> : le conteneur partage directement le namespace réseau de l\'hôte. Pas d\'isolation réseau, mais performances maximales (pas de NAT). Utilisé pour les applications sensibles à la latence.</li>' +
      '<li><strong>overlay</strong> : réseau virtuel qui s\'étend sur plusieurs hôtes Docker (Docker Swarm). Utilise VXLAN pour l\'encapsulation et permet la communication entre conteneurs sur des machines différentes.</li>' +
      '<li><strong>macvlan</strong> : attribue une adresse MAC unique à chaque conteneur, les faisant apparaître comme des machines physiques sur le réseau. Utile pour les applications legacy qui nécessitent d\'être directement sur le LAN.</li>' +
      '<li><strong>none</strong> : aucune connectivité réseau, isolation totale.</li>' +
      '</ul>' +
      '<pre># Créer un réseau Docker personnalisé\n' +
      'docker network create --driver bridge \\\n' +
      '  --subnet 10.10.0.0/24 \\\n' +
      '  --gateway 10.10.0.1 \\\n' +
      '  mon-reseau\n' +
      '\n' +
      '# Lancer un conteneur dans ce réseau\n' +
      'docker run -d --name web --network mon-reseau -p 80:80 nginx\n' +
      '\n' +
      '# Inspecter le réseau\n' +
      'docker network inspect mon-reseau\n' +
      '\n' +
      '# DNS intégré : les conteneurs se résolvent par nom\n' +
      'docker exec -it web ping db  # résolution automatique</pre>' +
      '<h4>Modèle réseau Kubernetes</h4>' +
      '<p>Kubernetes impose un modèle réseau plat avec trois règles fondamentales :</p>' +
      '<ul>' +
      '<li>Chaque Pod reçoit sa propre adresse IP unique dans le cluster</li>' +
      '<li>Tous les Pods peuvent communiquer entre eux sans NAT, quel que soit le nœud</li>' +
      '<li>Les agents du nœud (kubelet, kube-proxy) peuvent communiquer avec tous les Pods</li>' +
      '</ul>' +
      '<p>Kubernetes ne fournit pas d\'implémentation réseau : il délègue cette responsabilité à des plugins CNI (Container Network Interface). Les principaux plugins CNI sont Calico (routage BGP, policies réseau avancées), Cilium (basé sur eBPF, haute performance), Flannel (simple overlay VXLAN), et Weave Net (mesh réseau avec chiffrement).</p>' +
      '<h4>Services Kubernetes</h4>' +
      '<p>Les Services Kubernetes fournissent une abstraction réseau stable devant un ensemble de Pods dynamiques :</p>' +
      '<ul>' +
      '<li><strong>ClusterIP</strong> (défaut) : IP virtuelle interne au cluster, accessible uniquement depuis l\'intérieur</li>' +
      '<li><strong>NodePort</strong> : expose le service sur un port fixe (30000-32767) de chaque nœud du cluster</li>' +
      '<li><strong>LoadBalancer</strong> : provisionne un load balancer externe (cloud provider) qui route le trafic vers le service</li>' +
      '<li><strong>ExternalName</strong> : alias DNS vers un service externe (CNAME)</li>' +
      '</ul>' +
      '<pre># Exemple de Service Kubernetes\n' +
      'apiVersion: v1\n' +
      'kind: Service\n' +
      'metadata:\n' +
      '  name: mon-service\n' +
      'spec:\n' +
      '  type: ClusterIP\n' +
      '  selector:\n' +
      '    app: mon-app\n' +
      '  ports:\n' +
      '    - port: 80\n' +
      '      targetPort: 8080</pre>' +
      '<h4>Ingress et Service Mesh</h4>' +
      '<p>L\'<strong>Ingress</strong> gère l\'accès HTTP/HTTPS depuis l\'extérieur vers les services du cluster, avec routage par nom d\'hôte ou chemin URL, terminaison TLS et load balancing L7. Les contrôleurs Ingress populaires incluent Nginx Ingress, Traefik et HAProxy Ingress.</p>' +
      '<p>Le <strong>Service Mesh</strong> (Istio, Linkerd) ajoute une couche d\'infrastructure dédiée à la communication inter-services : mTLS automatique, observabilité (métriques, traces, logs), routage avancé (canary deployments, A/B testing), circuit breaking et rate limiting. Chaque Pod reçoit un proxy sidecar (Envoy) qui intercepte tout le trafic réseau.</p>' +
      '<h4>Network Policies</h4>' +
      '<p>Les Network Policies Kubernetes permettent de contrôler le trafic entre les Pods au niveau L3/L4, fonctionnant comme un pare-feu au sein du cluster. Par défaut, tous les Pods peuvent communiquer entre eux. Les Network Policies permettent de restreindre cette communication selon les labels, les namespaces, les blocs CIDR et les ports. Le plugin CNI doit supporter les Network Policies (Calico et Cilium le font, Flannel non par défaut).</p>'
  },
  {
    id: 95,
    title: 'Cloud networking (AWS VPC, Azure VNet)',
    category: 'Avancé',
    level: 'Avancé',
    duration: '2h',
    description: 'Maîtriser les concepts de réseau cloud avec les VPC AWS et VNet Azure pour architecturer des infrastructures cloud sécurisées.',
    content: '<h4>Le réseau dans le cloud</h4>' +
      '<p>Le cloud computing a fondamentalement transformé la manière dont les réseaux sont conçus et gérés. Au lieu de configurer des équipements physiques, les ingénieurs définissent l\'infrastructure réseau via des APIs et des consoles web. Le réseau cloud est entièrement virtualisé, programmatique et élastique. Les trois hyperscalers (AWS, Azure, GCP) proposent des services réseau similaires avec des terminologies différentes, mais les concepts fondamentaux restent les mêmes.</p>' +
      '<h4>AWS VPC (Virtual Private Cloud)</h4>' +
      '<p>Un VPC est un réseau virtuel isolé dans le cloud AWS. Il est défini par un bloc CIDR (par exemple 10.0.0.0/16) et peut être divisé en sous-réseaux :</p>' +
      '<ul>' +
      '<li><strong>Subnet public</strong> : sous-réseau avec une route vers une Internet Gateway, les instances reçoivent une IP publique et sont accessibles depuis Internet</li>' +
      '<li><strong>Subnet privé</strong> : sous-réseau sans accès direct à Internet. L\'accès sortant est possible via un NAT Gateway</li>' +
      '<li><strong>Internet Gateway (IGW)</strong> : passerelle qui connecte le VPC à Internet</li>' +
      '<li><strong>NAT Gateway</strong> : permet aux instances des subnets privés d\'accéder à Internet (sortant uniquement)</li>' +
      '<li><strong>Route Tables</strong> : tables de routage associées aux subnets qui définissent la destination du trafic</li>' +
      '</ul>' +
      '<pre># Exemple Terraform - Création d\'un VPC AWS\n' +
      'resource "aws_vpc" "main" {\n' +
      '  cidr_block           = "10.0.0.0/16"\n' +
      '  enable_dns_support   = true\n' +
      '  enable_dns_hostnames = true\n' +
      '  tags = { Name = "VPC-Production" }\n' +
      '}\n' +
      '\n' +
      'resource "aws_subnet" "public" {\n' +
      '  vpc_id                  = aws_vpc.main.id\n' +
      '  cidr_block              = "10.0.1.0/24"\n' +
      '  availability_zone       = "eu-west-1a"\n' +
      '  map_public_ip_on_launch = true\n' +
      '  tags = { Name = "Subnet-Public" }\n' +
      '}\n' +
      '\n' +
      'resource "aws_subnet" "private" {\n' +
      '  vpc_id            = aws_vpc.main.id\n' +
      '  cidr_block        = "10.0.2.0/24"\n' +
      '  availability_zone = "eu-west-1a"\n' +
      '  tags = { Name = "Subnet-Private" }\n' +
      '}</pre>' +
      '<h4>Sécurité réseau cloud</h4>' +
      '<p>La sécurité dans le cloud repose sur plusieurs niveaux :</p>' +
      '<ul>' +
      '<li><strong>Security Groups</strong> (AWS) / <strong>NSG</strong> (Azure) : pare-feu stateful au niveau de l\'instance/VM. Règles d\'autorisation entrantes et sortantes par port, protocole et source/destination. Les Security Groups AWS sont \"deny all\" par défaut en entrée.</li>' +
      '<li><strong>Network ACL</strong> (AWS) / <strong>NSG subnet</strong> (Azure) : pare-feu stateless au niveau du sous-réseau. Évaluation séquentielle des règles avec numéros de priorité. Complémentaire aux Security Groups.</li>' +
      '<li><strong>AWS WAF / Azure WAF</strong> : pare-feu applicatif (couche 7) pour protéger les applications web contre les attaques OWASP (SQL injection, XSS)</li>' +
      '</ul>' +
      '<h4>Azure VNet (Virtual Network)</h4>' +
      '<p>Azure VNet est l\'équivalent du VPC AWS. Les concepts principaux sont similaires avec des différences de terminologie : les NSG (Network Security Groups) combinent les fonctions des Security Groups et Network ACLs AWS, Azure utilise des UDR (User-Defined Routes) pour le routage personnalisé, et les Azure Load Balancers opèrent en interne ou en public. Azure propose aussi Azure Firewall (pare-feu managé) et Azure Bastion (accès SSH/RDP sécurisé sans IP publique).</p>' +
      '<h4>Interconnexion cloud</h4>' +
      '<p>Connecter le cloud au réseau on-premises ou entre régions :</p>' +
      '<ul>' +
      '<li><strong>VPC/VNet Peering</strong> : connexion directe entre deux réseaux virtuels dans le même cloud, sans transit par Internet. Le trafic reste sur le backbone du fournisseur.</li>' +
      '<li><strong>VPN Gateway</strong> : tunnel IPsec entre le réseau on-premises et le VPC/VNet. Économique mais limité en débit et sujet à la latence Internet.</li>' +
      '<li><strong>AWS Direct Connect / Azure ExpressRoute</strong> : connexion physique dédiée entre le datacenter et le cloud. Débit garanti (1-100 Gbps), latence prévisible, mais coûteux.</li>' +
      '<li><strong>Transit Gateway</strong> (AWS) / <strong>Virtual WAN</strong> (Azure) : hub centralisé qui simplifie la connectivité entre de multiples VPC/VNet, VPN et connexions directes.</li>' +
      '</ul>' +
      '<h4>Bonnes pratiques</h4>' +
      '<p>Pour une architecture réseau cloud robuste : utilisez plusieurs zones de disponibilité (AZ) pour la haute disponibilité, dimensionnez les blocs CIDR avec une marge de croissance, séparez les environnements (dev/staging/prod) dans des VPC/VNet distincts, appliquez le principe du moindre privilège dans les Security Groups, activez les flow logs pour l\'audit et le dépannage, et utilisez l\'Infrastructure as Code (Terraform, CloudFormation, Bicep) pour versionner et reproduire les configurations réseau.</p>'
  },
  {
    id: 96,
    title: 'Load balancing avancé',
    category: 'Avancé',
    level: 'Avancé',
    duration: '1h30',
    description: 'Maîtriser les techniques avancées de répartition de charge pour concevoir des architectures hautement disponibles et performantes.',
    content: '<h4>Principes du load balancing</h4>' +
      '<p>Le load balancing (répartition de charge) distribue le trafic réseau entre plusieurs serveurs pour améliorer les performances, la disponibilité et la scalabilité des applications. Un load balancer agit comme un point d\'entrée unique (Virtual IP - VIP) qui reçoit toutes les requêtes clients et les distribue vers un pool de serveurs backend. Si un serveur tombe en panne, le load balancer arrête de lui envoyer du trafic, assurant la haute disponibilité.</p>' +
      '<h4>Load balancing L4 vs L7</h4>' +
      '<p>Le load balancing opère principalement à deux niveaux du modèle OSI :</p>' +
      '<ul>' +
      '<li><strong>L4 (Transport)</strong> : décisions basées sur les adresses IP et les ports TCP/UDP. Très performant car il ne décrypte pas le contenu des paquets. Le load balancer peut fonctionner en DSR (Direct Server Return) où seul le trafic entrant passe par le LB, les réponses retournent directement au client.</li>' +
      '<li><strong>L7 (Application)</strong> : décisions basées sur le contenu des requêtes HTTP (URL, en-têtes, cookies, méthode). Permet le routage intelligent : envoyer les requêtes <code>/api/*</code> vers le cluster API et <code>/static/*</code> vers le CDN. Nécessite la terminaison TLS (SSL offloading) pour inspecter le trafic HTTPS.</li>' +
      '</ul>' +
      '<h4>Algorithmes de répartition</h4>' +
      '<p>Les principaux algorithmes de load balancing :</p>' +
      '<ul>' +
      '<li><strong>Round Robin</strong> : distribution séquentielle cyclique. Simple mais ne tient pas compte de la charge réelle des serveurs.</li>' +
      '<li><strong>Weighted Round Robin</strong> : round robin pondéré, les serveurs plus puissants reçoivent plus de requêtes selon leur poids configuré.</li>' +
      '<li><strong>Least Connections</strong> : envoie au serveur ayant le moins de connexions actives. Efficace quand les requêtes ont des durées variables.</li>' +
      '<li><strong>IP Hash</strong> : hachage de l\'adresse IP source pour garantir qu\'un client est toujours dirigé vers le même serveur (persistance de session).</li>' +
      '<li><strong>Least Response Time</strong> : combine le nombre de connexions et le temps de réponse du serveur. Le plus intelligent mais nécessite un monitoring actif.</li>' +
      '</ul>' +
      '<h4>Configuration HAProxy</h4>' +
      '<p>HAProxy est le load balancer open source le plus performant et le plus déployé :</p>' +
      '<pre># /etc/haproxy/haproxy.cfg\n' +
      'global\n' +
      '    maxconn 50000\n' +
      '    log /dev/log local0\n' +
      '\n' +
      'defaults\n' +
      '    mode http\n' +
      '    timeout connect 5s\n' +
      '    timeout client  30s\n' +
      '    timeout server  30s\n' +
      '    option httplog\n' +
      '    option forwardfor\n' +
      '\n' +
      'frontend web_front\n' +
      '    bind *:443 ssl crt /etc/ssl/cert.pem\n' +
      '    default_backend web_servers\n' +
      '    # Routage L7 basé sur l\'URL\n' +
      '    acl is_api path_beg /api\n' +
      '    use_backend api_servers if is_api\n' +
      '\n' +
      'backend web_servers\n' +
      '    balance leastconn\n' +
      '    option httpchk GET /health\n' +
      '    server web1 10.0.0.11:8080 check weight 3\n' +
      '    server web2 10.0.0.12:8080 check weight 2\n' +
      '    server web3 10.0.0.13:8080 check weight 1 backup\n' +
      '\n' +
      'backend api_servers\n' +
      '    balance roundrobin\n' +
      '    option httpchk GET /api/health\n' +
      '    server api1 10.0.0.21:3000 check\n' +
      '    server api2 10.0.0.22:3000 check</pre>' +
      '<h4>Health checks</h4>' +
      '<p>Les health checks (contrôles de santé) sont essentiels pour détecter les serveurs défaillants et les retirer automatiquement du pool. Les types de health checks incluent : TCP connect (vérifie que le port est ouvert), HTTP check (vérifie qu\'une URL retourne un code 200), vérification du contenu (vérifie qu\'une chaîne spécifique est présente dans la réponse), et les health checks applicatifs personnalisés qui vérifient la connectivité à la base de données et la disponibilité des services en amont.</p>' +
      '<h4>Persistance de session</h4>' +
      '<p>Certaines applications nécessitent que les requêtes successives d\'un même client soient dirigées vers le même serveur (session affinity). Les méthodes de persistance incluent : le cookie d\'insertion (le LB insère un cookie identifiant le serveur backend), le cookie applicatif (le LB lit le cookie de session de l\'application), et le source IP hash. La meilleure pratique est de concevoir des applications stateless qui stockent les sessions dans un cache distribué (Redis, Memcached), éliminant ainsi le besoin de persistance.</p>' +
      '<h4>GSLB - Global Server Load Balancing</h4>' +
      '<p>Le GSLB étend le load balancing à l\'échelle géographique en utilisant le DNS pour diriger les utilisateurs vers le datacenter le plus proche ou le plus disponible. Le serveur DNS autoritaire du service retourne l\'adresse IP du site optimal en fonction de la géolocalisation du client, de la santé des datacenters et de la charge actuelle. Les solutions de GSLB incluent F5 BIG-IP DNS, Citrix ADC, et les services DNS managés comme Route 53 (AWS), Azure Traffic Manager ou Cloudflare Load Balancing.</p>'
  },
  {
    id: 97,
    title: 'Proxy et reverse proxy',
    category: 'Avancé',
    level: 'Intermédiaire',
    duration: '1h',
    description: 'Comprendre le rôle des proxys et reverse proxys dans l\'architecture réseau moderne et savoir les configurer.',
    content: '<h4>Proxy forward (proxy direct)</h4>' +
      '<p>Un proxy forward est un serveur intermédiaire qui se place entre les clients d\'un réseau interne et Internet. Les clients configurent leur navigateur pour envoyer toutes les requêtes HTTP/HTTPS au proxy, qui les transmet aux serveurs web de destination. Le serveur de destination voit l\'adresse IP du proxy et non celle du client. Les proxys forward sont utilisés en entreprise pour le filtrage de contenu, le contrôle d\'accès, la mise en cache et la journalisation de la navigation web.</p>' +
      '<h4>Fonctionnalités du proxy forward</h4>' +
      '<ul>' +
      '<li><strong>Filtrage URL</strong> : bloquer l\'accès aux sites non autorisés (réseaux sociaux, streaming) selon des catégories ou des listes noires</li>' +
      '<li><strong>Cache web</strong> : stocker localement les contenus fréquemment accédés pour réduire la bande passante et accélérer la navigation</li>' +
      '<li><strong>Authentification</strong> : forcer l\'authentification des utilisateurs avant d\'autoriser l\'accès à Internet (intégration LDAP/AD)</li>' +
      '<li><strong>Inspection SSL/TLS</strong> : déchiffrer le trafic HTTPS pour l\'analyser (man-in-the-middle légitime avec certificat d\'entreprise)</li>' +
      '<li><strong>Journalisation</strong> : enregistrer toutes les requêtes web pour l\'audit et la conformité</li>' +
      '</ul>' +
      '<h4>Reverse proxy</h4>' +
      '<p>Le reverse proxy se place devant les serveurs web et agit en leur nom. Contrairement au proxy forward, il est configuré côté serveur et les clients n\'ont pas conscience de son existence. Ils envoient leurs requêtes à l\'adresse du reverse proxy qui les transmet aux serveurs backend appropriés. Le reverse proxy est un composant central des architectures web modernes.</p>' +
      '<p>Les rôles principaux du reverse proxy :</p>' +
      '<ul>' +
      '<li><strong>Terminaison TLS</strong> : déchiffre le HTTPS et transfère le trafic en HTTP vers les backends, centralisant la gestion des certificats</li>' +
      '<li><strong>Load balancing</strong> : distribue les requêtes entre plusieurs serveurs backend</li>' +
      '<li><strong>Protection</strong> : masque l\'architecture interne et absorbe certaines attaques (DDoS basiques, slowloris)</li>' +
      '<li><strong>Compression</strong> : compresse les réponses (gzip, brotli) pour réduire la bande passante</li>' +
      '<li><strong>Cache</strong> : met en cache les réponses statiques pour soulager les backends</li>' +
      '</ul>' +
      '<h4>Configuration Nginx comme reverse proxy</h4>' +
      '<pre># /etc/nginx/sites-available/mon-app\n' +
      'upstream backend_servers {\n' +
      '    server 10.0.0.11:8080 weight=3;\n' +
      '    server 10.0.0.12:8080 weight=2;\n' +
      '    server 10.0.0.13:8080 backup;\n' +
      '}\n' +
      '\n' +
      'server {\n' +
      '    listen 443 ssl http2;\n' +
      '    server_name www.example.com;\n' +
      '\n' +
      '    ssl_certificate     /etc/ssl/certs/example.crt;\n' +
      '    ssl_certificate_key /etc/ssl/private/example.key;\n' +
      '    ssl_protocols       TLSv1.2 TLSv1.3;\n' +
      '\n' +
      '    # Cache des fichiers statiques\n' +
      '    location /static/ {\n' +
      '        alias /var/www/static/;\n' +
      '        expires 30d;\n' +
      '        add_header Cache-Control "public, immutable";\n' +
      '    }\n' +
      '\n' +
      '    # Reverse proxy vers les backends\n' +
      '    location / {\n' +
      '        proxy_pass http://backend_servers;\n' +
      '        proxy_set_header Host $host;\n' +
      '        proxy_set_header X-Real-IP $remote_addr;\n' +
      '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n' +
      '        proxy_set_header X-Forwarded-Proto $scheme;\n' +
      '\n' +
      '        # Timeouts\n' +
      '        proxy_connect_timeout 5s;\n' +
      '        proxy_read_timeout 60s;\n' +
      '    }\n' +
      '}</pre>' +
      '<h4>Squid - Proxy forward</h4>' +
      '<p>Squid est le proxy forward open source le plus déployé en entreprise. Il excelle dans la mise en cache HTTP et supporte le filtrage d\'URL, l\'authentification LDAP/Kerberos, et l\'inspection SSL. Sa configuration se fait dans le fichier <code>/etc/squid/squid.conf</code> avec des ACL (Access Control Lists) qui définissent les règles d\'accès. Les solutions commerciales comme Zscaler, Blue Coat (Symantec) et Forcepoint proposent des proxys cloud avec des capacités de sécurité avancées.</p>' +
      '<h4>Proxy transparent et WPAD</h4>' +
      '<p>Un proxy transparent intercepte le trafic HTTP sans configuration côté client, en redirigeant les requêtes au niveau du routeur ou du pare-feu. Le protocole WPAD (Web Proxy Auto-Discovery) permet aux clients de découvrir automatiquement le proxy via DNS ou DHCP. Le fichier PAC (Proxy Auto-Configuration) contient la logique JavaScript qui détermine quand utiliser le proxy et quand se connecter directement. Ces mécanismes simplifient le déploiement mais nécessitent une attention particulière à la sécurité.</p>'
  },
  {
    id: 98,
    title: 'CDN (Content Delivery Network)',
    category: 'Avancé',
    level: 'Intermédiaire',
    duration: '1h',
    description: 'Comprendre l\'architecture et le fonctionnement des CDN pour accélérer la distribution de contenu à l\'échelle mondiale.',
    content: '<h4>Qu\'est-ce qu\'un CDN ?</h4>' +
      '<p>Un CDN (Content Delivery Network) est un réseau distribué de serveurs déployés géographiquement pour rapprocher le contenu des utilisateurs finaux. Au lieu de servir toutes les requêtes depuis un serveur d\'origine unique, le CDN réplique le contenu sur des serveurs de bordure (edge servers) situés dans des PoPs (Points of Presence) à travers le monde. Lorsqu\'un utilisateur à Paris accède à un site hébergé aux États-Unis, le CDN sert le contenu depuis un serveur en France, réduisant drastiquement la latence.</p>' +
      '<h4>Fonctionnement technique</h4>' +
      '<p>Le CDN intercepte les requêtes des utilisateurs grâce à plusieurs mécanismes :</p>' +
      '<ul>' +
      '<li><strong>DNS-based routing</strong> : le domaine du CDN (par exemple cdn.example.com) est un CNAME vers le domaine du CDN provider. Le DNS du CDN retourne l\'adresse IP du serveur de bordure le plus proche de l\'utilisateur basé sur la géolocalisation du résolveur DNS.</li>' +
      '<li><strong>Anycast</strong> : plusieurs serveurs partagent la même adresse IP. Le routage BGP dirige automatiquement les requêtes vers le serveur le plus proche en termes de routage réseau. Cette technique est utilisée par Cloudflare et d\'autres CDN modernes.</li>' +
      '<li><strong>Cache hiérarchique</strong> : le contenu est mis en cache sur trois niveaux - les edge servers (L1, proches de l\'utilisateur), les mid-tier caches (L2, régionaux) et le serveur d\'origine. Un cache miss à L1 interroge L2 avant l\'origine.</li>' +
      '</ul>' +
      '<h4>Types de contenu CDN</h4>' +
      '<p>Les CDN gèrent différents types de contenu avec des stratégies adaptées :</p>' +
      '<ul>' +
      '<li><strong>Contenu statique</strong> : images, CSS, JavaScript, polices, vidéos. Mis en cache longtemps (TTL élevé) avec des en-têtes Cache-Control. Représente l\'usage historique des CDN.</li>' +
      '<li><strong>Contenu dynamique</strong> : pages HTML personnalisées, réponses API. Les CDN modernes utilisent des techniques comme l\'Edge Computing, l\'ESI (Edge Side Includes) et le cache conditionnel pour accélérer même le contenu dynamique.</li>' +
      '<li><strong>Streaming vidéo</strong> : HLS (HTTP Live Streaming) et DASH (Dynamic Adaptive Streaming over HTTP). Le CDN adapte la qualité vidéo en temps réel selon la bande passante du client.</li>' +
      '</ul>' +
      '<h4>Configuration d\'un CDN</h4>' +
      '<pre># Configuration DNS typique pour un CDN\n' +
      '# Avant CDN :\n' +
      'www.example.com.    A    93.184.216.34\n' +
      '\n' +
      '# Avec CDN (CNAME vers le CDN) :\n' +
      'www.example.com.    CNAME    www.example.com.cdn.cloudflare.net.\n' +
      '\n' +
      '# Headers HTTP pour le contrôle du cache\n' +
      'Cache-Control: public, max-age=31536000, immutable  # 1 an, fichier statique\n' +
      'Cache-Control: public, max-age=3600, s-maxage=86400  # 1h client, 24h CDN\n' +
      'Cache-Control: no-cache  # valider avec le serveur à chaque requête\n' +
      'Cache-Control: private, no-store  # ne pas mettre en cache (données sensibles)\n' +
      '\n' +
      '# Invalidation du cache (purge)\n' +
      '# Via l\'API du CDN ou en changeant l\'URL du fichier (cache busting)\n' +
      '# style.css?v=2  ou  style.abc123.css</pre>' +
      '<h4>Principaux fournisseurs CDN</h4>' +
      '<ul>' +
      '<li><strong>Cloudflare</strong> : CDN + sécurité (DDoS, WAF, DNS), offre gratuite généreuse, réseau anycast mondial de plus de 300 PoPs</li>' +
      '<li><strong>AWS CloudFront</strong> : intégré à l\'écosystème AWS, Lambda@Edge pour le computing en bordure</li>' +
      '<li><strong>Akamai</strong> : le plus ancien et le plus étendu (>4000 PoPs), leader historique du marché</li>' +
      '<li><strong>Fastly</strong> : CDN programmable avec VCL et Compute@Edge (WASM), populaire auprès des développeurs</li>' +
      '<li><strong>Azure CDN / Google Cloud CDN</strong> : intégrés à leurs plateformes cloud respectives</li>' +
      '</ul>' +
      '<h4>CDN et sécurité</h4>' +
      '<p>Les CDN modernes intègrent des fonctions de sécurité avancées : protection DDoS par absorption du trafic malveillant sur les edge servers, WAF (Web Application Firewall) pour bloquer les attaques OWASP, bot management pour distinguer les bots légitimes des malveillants, et rate limiting pour protéger contre les abus d\'API. Le TLS est terminé en bordure avec des certificats gérés automatiquement (Let\'s Encrypt) et les dernières versions de TLS 1.3 pour des performances optimales. L\'utilisation d\'un CDN est devenue une couche de sécurité indispensable pour toute application web exposée à Internet.</p>'
  },
  {
    id: 99,
    title: 'IPv6 avancé et transition',
    category: 'Avancé',
    level: 'Avancé',
    duration: '2h',
    description: 'Approfondir les mécanismes avancés d\'IPv6 et maîtriser les stratégies de transition depuis IPv4.',
    content: '<h4>Rappels IPv6</h4>' +
      '<p>IPv6 utilise des adresses de 128 bits (contre 32 bits pour IPv4), offrant un espace d\'adressage de 2^128 adresses, soit environ 340 sextillions. L\'adresse est notée en 8 groupes de 4 chiffres hexadécimaux séparés par des deux-points : <code>2001:0db8:85a3:0000:0000:8a2e:0370:7334</code>. Les zéros consécutifs peuvent être abrégés : <code>2001:db8:85a3::8a2e:370:7334</code>. L\'absence de NAT, l\'auto-configuration SLAAC et les en-têtes simplifiés sont les avantages fondamentaux d\'IPv6.</p>' +
      '<h4>Types d\'adresses IPv6 avancés</h4>' +
      '<ul>' +
      '<li><strong>Link-Local (fe80::/10)</strong> : générée automatiquement sur chaque interface, utilisée pour la communication locale et le Neighbor Discovery. Non routable.</li>' +
      '<li><strong>Global Unicast (2000::/3)</strong> : l\'équivalent des adresses IPv4 publiques, globalement routables sur Internet.</li>' +
      '<li><strong>Unique Local (fc00::/7, en pratique fd00::/8)</strong> : l\'équivalent des adresses privées RFC 1918 en IPv4, routables en interne mais pas sur Internet.</li>' +
      '<li><strong>Multicast (ff00::/8)</strong> : remplace le broadcast d\'IPv4. ff02::1 = tous les nœuds, ff02::2 = tous les routeurs, ff02::1:ff = solicited-node multicast.</li>' +
      '<li><strong>Anycast</strong> : même adresse attribuée à plusieurs interfaces, le routage dirige vers la plus proche. Pas de préfixe dédié.</li>' +
      '</ul>' +
      '<h4>Neighbor Discovery Protocol (NDP)</h4>' +
      '<p>NDP (RFC 4861) remplace ARP, ICMP Router Discovery et ICMP Redirect d\'IPv4 par un protocole unifié basé sur ICMPv6 :</p>' +
      '<ul>' +
      '<li><strong>Router Solicitation (RS) / Router Advertisement (RA)</strong> : découverte des routeurs et des préfixes réseau. Les RA annoncent le préfixe, la passerelle par défaut, et les options de configuration (SLAAC, DHCPv6).</li>' +
      '<li><strong>Neighbor Solicitation (NS) / Neighbor Advertisement (NA)</strong> : résolution d\'adresse IP → MAC (équivalent ARP). Utilise le multicast solicited-node pour une efficacité accrue.</li>' +
      '<li><strong>DAD (Duplicate Address Detection)</strong> : avant d\'utiliser une adresse, le nœud envoie un NS pour vérifier qu\'elle n\'est pas déjà utilisée.</li>' +
      '</ul>' +
      '<h4>SLAAC vs DHCPv6</h4>' +
      '<p>IPv6 offre deux méthodes d\'attribution d\'adresses :</p>' +
      '<p><strong>SLAAC (Stateless Address Autoconfiguration)</strong> : le nœud génère automatiquement son adresse à partir du préfixe annoncé par le routeur (RA) et d\'un identifiant d\'interface (basé sur le MAC via EUI-64 ou aléatoire pour des raisons de confidentialité). Simple mais ne fournit pas les informations DNS ni d\'autres options.</p>' +
      '<p><strong>DHCPv6</strong> : peut fonctionner en mode stateful (attribution d\'adresse + options) ou stateless (SLAAC pour l\'adresse, DHCPv6 pour les options comme le DNS). Le choix est contrôlé par les flags M (Managed) et O (Other) dans les RA du routeur.</p>' +
      '<h4>Stratégies de transition IPv4 → IPv6</h4>' +
      '<p>La coexistence IPv4/IPv6 est gérée par trois familles de mécanismes :</p>' +
      '<ul>' +
      '<li><strong>Dual-Stack</strong> : chaque équipement possède à la fois une adresse IPv4 et une adresse IPv6. C\'est l\'approche recommandée et la plus simple. Le système d\'exploitation choisit IPv6 par défaut (RFC 6724 - Happy Eyeballs).</li>' +
      '<li><strong>Tunneling</strong> : encapsuler le trafic IPv6 dans des paquets IPv4 pour traverser des réseaux IPv4. Les technologies incluent 6to4, ISATAP, Teredo et les tunnels GRE. Ces solutions sont des palliatifs temporaires.</li>' +
      '<li><strong>Translation (NAT64/DNS64)</strong> : traduire le trafic entre IPv6 et IPv4 au niveau du réseau. NAT64 permet aux clients IPv6-only d\'accéder aux serveurs IPv4, tandis que DNS64 synthétise des enregistrements AAAA pour les domaines qui n\'ont que des A.</li>' +
      '</ul>' +
      '<pre># Configuration dual-stack sur Cisco\n' +
      'interface GigabitEthernet0/0\n' +
      '  ip address 192.168.1.1 255.255.255.0\n' +
      '  ipv6 address 2001:db8:1::1/64\n' +
      '  ipv6 enable\n' +
      '\n' +
      '! Routage IPv6\n' +
      'ipv6 unicast-routing\n' +
      'ipv6 route ::/0 2001:db8:ff::1</pre>' +
      '<h4>Sécurité IPv6</h4>' +
      '<p>IPv6 introduit de nouvelles considérations de sécurité : les adresses link-local et le NDP sont vulnérables aux attaques d\'usurpation (RA spoofing, NA spoofing). Les mécanismes de protection incluent RA Guard sur les commutateurs (filtrage des RA non autorisés), DHCPv6 Guard, IPv6 First Hop Security (FHS), et SEND (Secure Neighbor Discovery) qui signe cryptographiquement les messages NDP. De plus, le vaste espace d\'adressage rend le scan de réseau impraticable, mais la prédictabilité de SLAAC/EUI-64 peut être exploitée, d\'où l\'utilisation d\'adresses temporaires (privacy extensions, RFC 4941).</p>'
  },
  {
    id: 100,
    title: 'Réseau 5G et au-delà',
    category: 'Avancé',
    level: 'Avancé',
    duration: '1h30',
    description: 'Explorer l\'architecture réseau 5G, ses innovations technologiques et l\'impact sur les réseaux de demain.',
    content: '<h4>Évolution vers la 5G</h4>' +
      '<p>La 5G (cinquième génération de réseaux mobiles) représente une rupture technologique majeure par rapport aux générations précédentes. Tandis que la 4G/LTE a été conçue principalement pour le haut débit mobile, la 5G vise trois cas d\'utilisation fondamentaux : l\'eMBB (enhanced Mobile Broadband) pour les débits ultra-élevés, l\'URLLC (Ultra-Reliable Low-Latency Communications) pour les applications critiques, et le mMTC (massive Machine-Type Communications) pour l\'Internet des Objets massif. Cette polyvalence nécessite une architecture réseau entièrement repensée.</p>' +
      '<h4>Architecture réseau 5G</h4>' +
      '<p>L\'architecture 5G se compose de deux grandes parties :</p>' +
      '<ul>' +
      '<li><strong>RAN (Radio Access Network)</strong> : la partie radio utilisant la technologie NR (New Radio). Elle introduit les bandes de fréquences mmWave (24-100 GHz) pour des débits extrêmes à courte portée, le massive MIMO (jusqu\'à 256 antennes) pour la focalisation dynamique des faisceaux (beamforming), et le carrier aggregation sur plusieurs bandes simultanément.</li>' +
      '<li><strong>5G Core (5GC)</strong> : le cœur de réseau entièrement cloud-native, basé sur une architecture SBA (Service-Based Architecture). Les fonctions réseau sont des microservices communiquant via des APIs REST. Les composants clés incluent l\'AMF (gestion de la mobilité), le SMF (gestion des sessions), l\'UPF (plan utilisateur), le PCF (politiques), et l\'UDM (gestion des données utilisateur).</li>' +
      '</ul>' +
      '<h4>Network Slicing</h4>' +
      '<p>Le network slicing (découpage réseau) est l\'une des innovations les plus significatives de la 5G. Il permet de créer plusieurs réseaux virtuels indépendants sur une même infrastructure physique, chacun optimisé pour un cas d\'utilisation spécifique :</p>' +
      '<ul>' +
      '<li><strong>Slice eMBB</strong> : optimisé pour le débit (streaming 4K/8K, réalité virtuelle). Haute bande passante, latence modérée.</li>' +
      '<li><strong>Slice URLLC</strong> : optimisé pour la latence et la fiabilité (chirurgie à distance, véhicules autonomes). Latence < 1 ms, fiabilité de 99,999%.</li>' +
      '<li><strong>Slice mMTC</strong> : optimisé pour la densité de connexions (capteurs IoT, smart city). Faible bande passante, longue autonomie batterie, des millions de dispositifs par km².</li>' +
      '</ul>' +
      '<p>Chaque slice est un réseau de bout en bout isolé, du terminal radio au cœur de réseau, avec ses propres paramètres de QoS, sécurité et facturation.</p>' +
      '<h4>MEC - Multi-access Edge Computing</h4>' +
      '<p>Le MEC (anciennement Mobile Edge Computing) rapproche le calcul et le stockage au plus près des utilisateurs, en bordure du réseau mobile. Au lieu de transiter vers un datacenter central distant, les données sont traitées dans des micro-datacenters situés aux stations de base ou aux points d\'agrégation. Le MEC est essentiel pour les applications nécessitant une latence ultra-faible : réalité augmentée, jeux cloud, traitement vidéo en temps réel, et IoT industriel. Il permet de réduire la latence de 50 ms (cloud central) à moins de 5 ms.</p>' +
      '<h4>Technologies radio avancées</h4>' +
      '<p>La 5G NR introduit plusieurs innovations radio :</p>' +
      '<ul>' +
      '<li><strong>Bandes de fréquences</strong> : sub-6 GHz (couverture étendue, 100 MHz de bande passante) et mmWave (24-100 GHz, jusqu\'à 400 MHz de bande passante, portée courte)</li>' +
      '<li><strong>Massive MIMO</strong> : utilisation de matrices d\'antennes (64T64R, 128T128R) permettant le beamforming 3D et le multiplexage spatial de nombreux utilisateurs simultanément</li>' +
      '<li><strong>OFDM avec numérologie flexible</strong> : espacement des sous-porteuses adaptatif (15, 30, 60, 120, 240 kHz) selon le cas d\'utilisation et la bande de fréquence</li>' +
      '<li><strong>DSS (Dynamic Spectrum Sharing)</strong> : partage dynamique du spectre entre la 4G et la 5G sur les mêmes bandes de fréquences pour une transition progressive</li>' +
      '</ul>' +
      '<h4>Au-delà de la 5G : vers la 6G</h4>' +
      '<p>La recherche sur la 6G est déjà en cours, avec une commercialisation visée vers 2030. Les axes d\'innovation incluent : les fréquences térahertz (100 GHz - 10 THz) pour des débits de l\'ordre du térabit par seconde, l\'intégration de l\'intelligence artificielle native dans le réseau pour l\'auto-optimisation et l\'auto-guérison, les réseaux de communication par satellite en orbite basse (LEO) intégrés au réseau terrestre (NTN - Non-Terrestrial Networks), la communication holographique et les jumeaux numériques réseau. La 6G promet une latence sub-milliseconde, une couverture véritablement mondiale et une convergence complète entre monde physique et numérique.</p>' +
      '<h4>Impact sur les réseaux d\'entreprise</h4>' +
      '<p>La 5G transforme les réseaux d\'entreprise avec le concept de réseaux privés 5G : les entreprises peuvent déployer leur propre infrastructure 5G sur site pour l\'industrie 4.0, la logistique automatisée, ou les campus connectés. Le Fixed Wireless Access (FWA) 5G offre une alternative au câble et à la fibre pour le dernier kilomètre. La combinaison 5G + SD-WAN + SASE redéfinit l\'architecture WAN d\'entreprise en offrant plus de flexibilité et de résilience que les réseaux MPLS traditionnels.</p>'
  }
];
