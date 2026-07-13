const devicesData = [
  {
    name: 'Routeur',
    category: 'Interconnexion',
    icon: '🔀',
    description: 'Le routeur est un équipement réseau fondamental qui assure l\'acheminement des paquets de données entre différents réseaux. Il opère principalement au niveau de la couche 3 (Réseau) du modèle OSI en utilisant les adresses IP pour déterminer le meilleur chemin. Les routeurs modernes intègrent souvent des fonctionnalités avancées comme le NAT, le DHCP et le filtrage de paquets. Ils constituent la pierre angulaire de l\'Internet en interconnectant des millions de réseaux à travers le monde.',
    functions: [
      'Acheminement des paquets entre réseaux distincts',
      'Sélection du meilleur chemin via les protocoles de routage (OSPF, BGP, RIP)',
      'Translation d\'adresses réseau (NAT/PAT)',
      'Filtrage de paquets et listes de contrôle d\'accès (ACL)',
      'Segmentation des domaines de diffusion',
      'Interconnexion de réseaux hétérogènes'
    ],
    brands: ['Cisco', 'Juniper', 'MikroTik', 'Huawei', 'TP-Link'],
    image_desc: 'Routeur réseau professionnel avec plusieurs ports Ethernet et antennes'
  },
  {
    name: 'Switch L2',
    category: 'Commutation',
    icon: '🔌',
    description: 'Le switch de couche 2 (commutateur) est un équipement qui interconnecte les appareils au sein d\'un même réseau local (LAN). Il utilise les adresses MAC pour transférer les trames uniquement vers le port de destination approprié, contrairement au hub. Les switches L2 permettent de segmenter le réseau en VLANs pour améliorer la sécurité et les performances. Ils constituent l\'épine dorsale de tout réseau local d\'entreprise moderne.',
    functions: [
      'Commutation de trames basée sur les adresses MAC',
      'Apprentissage automatique des adresses MAC (table CAM)',
      'Segmentation du réseau en VLANs',
      'Prise en charge du protocole Spanning Tree (STP)',
      'Agrégation de liens (LACP/EtherChannel)'
    ],
    brands: ['Cisco', 'HP/Aruba', 'Netgear', 'D-Link', 'Juniper'],
    image_desc: 'Switch réseau rackable avec 24 ou 48 ports RJ45 et voyants LED'
  },
  {
    name: 'Switch L3',
    category: 'Commutation',
    icon: '🔌',
    description: 'Le switch de couche 3 combine les fonctionnalités d\'un commutateur classique avec celles d\'un routeur. Il peut effectuer le routage inter-VLAN directement en matériel, offrant des performances supérieures à un routeur traditionnel pour le trafic interne. Ces équipements sont essentiels dans les réseaux d\'entreprise de taille moyenne à grande. Ils prennent en charge les protocoles de routage dynamique et les listes de contrôle d\'accès avancées.',
    functions: [
      'Commutation de trames au niveau 2 et routage au niveau 3',
      'Routage inter-VLAN à haute performance',
      'Support des protocoles de routage dynamique (OSPF, EIGRP)',
      'Application de politiques de qualité de service (QoS)',
      'Listes de contrôle d\'accès (ACL) matérielles',
      'Agrégation de liens et redondance'
    ],
    brands: ['Cisco', 'Juniper', 'Arista', 'HP/Aruba', 'Huawei'],
    image_desc: 'Switch multicouche haute performance avec ports SFP+ et console'
  },
  {
    name: 'Hub',
    category: 'Commutation',
    icon: '⭕',
    description: 'Le hub (concentrateur) est un équipement réseau de couche 1 qui répète les signaux reçus sur tous ses ports sans distinction. Il ne possède aucune intelligence pour filtrer ou diriger le trafic, ce qui engendre des collisions fréquentes et une bande passante partagée. Aujourd\'hui largement obsolète, il a été remplacé par les switches dans les réseaux modernes. Il reste cependant utile à des fins pédagogiques pour comprendre les fondamentaux du réseau.',
    functions: [
      'Répétition du signal électrique sur tous les ports',
      'Extension physique du réseau local',
      'Création d\'un domaine de collision unique',
      'Connexion simple de plusieurs appareils'
    ],
    brands: ['Netgear', 'D-Link', 'TP-Link'],
    image_desc: 'Petit boîtier concentrateur avec plusieurs ports Ethernet et voyants d\'activité'
  },
  {
    name: 'Modem',
    category: 'Accès',
    icon: '📡',
    description: 'Le modem (modulateur-démodulateur) est un équipement qui convertit les signaux numériques en signaux analogiques et inversement, permettant la communication via des lignes téléphoniques, câble coaxial ou fibre optique. Il constitue le point d\'entrée vers le réseau du fournisseur d\'accès Internet (FAI). Les modems modernes intègrent souvent un routeur, un switch et un point d\'accès WiFi dans un seul boîtier (box Internet). Ils supportent différentes technologies comme l\'ADSL, le VDSL, le câble DOCSIS ou la fibre GPON.',
    functions: [
      'Modulation et démodulation des signaux',
      'Établissement de la connexion avec le FAI',
      'Synchronisation de la ligne (ADSL/VDSL/Fibre)',
      'Gestion du protocole PPPoE ou IPoE',
      'Conversion entre médias de transmission différents'
    ],
    brands: ['Netgear', 'Motorola', 'ARRIS', 'Technicolor', 'Zyxel'],
    image_desc: 'Modem haut débit avec connexion fibre optique ou DSL et voyants d\'état'
  },
  {
    name: 'Point d\'accès WiFi',
    category: 'Sans Fil',
    icon: '📶',
    description: 'Le point d\'accès WiFi (AP - Access Point) permet aux appareils sans fil de se connecter au réseau câblé. Il émet et reçoit des ondes radio selon les normes IEEE 802.11 (WiFi 4/5/6/6E/7). Les points d\'accès professionnels offrent des fonctionnalités avancées comme le roaming transparent, le band steering et la gestion centralisée. Ils sont essentiels dans les environnements d\'entreprise pour fournir une connectivité sans fil fiable et sécurisée à grande échelle.',
    functions: [
      'Diffusion du signal WiFi sur plusieurs bandes de fréquences',
      'Authentification des clients sans fil (WPA2/WPA3-Enterprise)',
      'Gestion de multiples SSID et VLANs',
      'Band steering et équilibrage de charge entre clients',
      'Roaming transparent entre points d\'accès (802.11r/k/v)',
      'Détection des points d\'accès indésirables (rogue AP)'
    ],
    brands: ['Ubiquiti', 'Cisco Meraki', 'Aruba', 'Ruckus', 'TP-Link'],
    image_desc: 'Point d\'accès WiFi professionnel monté au plafond avec antennes internes'
  },
  {
    name: 'Pare-feu (Firewall)',
    category: 'Sécurité',
    icon: '🛡️',
    description: 'Le pare-feu est un dispositif de sécurité réseau qui surveille et contrôle le trafic entrant et sortant selon des règles de sécurité prédéfinies. Il constitue la première ligne de défense entre un réseau interne de confiance et les réseaux externes non fiables comme Internet. Les pare-feu nouvelle génération (NGFW) intègrent l\'inspection approfondie des paquets, la prévention d\'intrusions et le filtrage applicatif. Ils peuvent fonctionner en mode matériel dédié ou en tant que solution logicielle virtualisée.',
    functions: [
      'Filtrage du trafic réseau par règles (stateful/stateless)',
      'Inspection approfondie des paquets (DPI)',
      'Création de zones de sécurité (DMZ, LAN, WAN)',
      'Tunnels VPN site-à-site et accès distant',
      'Journalisation et alertes de sécurité',
      'Filtrage d\'URL et contrôle applicatif'
    ],
    brands: ['Palo Alto Networks', 'Fortinet', 'Check Point', 'Cisco ASA', 'Sophos'],
    image_desc: 'Appliance pare-feu rackable avec multiples interfaces réseau'
  },
  {
    name: 'Serveur',
    category: 'Infrastructure',
    icon: '🖥️',
    description: 'Le serveur est un ordinateur puissant conçu pour fournir des services, des ressources ou des données à d\'autres ordinateurs (clients) via le réseau. Il fonctionne généralement 24h/24 et 7j/7 avec des composants redondants pour garantir une haute disponibilité. Les serveurs peuvent héberger de nombreux services comme le DNS, le DHCP, le web, la messagerie ou les bases de données. Ils existent sous différentes formes : tour, rack (1U/2U) ou lame (blade), et peuvent être physiques ou virtualisés.',
    functions: [
      'Hébergement de services réseau (DNS, DHCP, Active Directory)',
      'Stockage et partage de fichiers centralisés',
      'Exécution d\'applications métier et bases de données',
      'Virtualisation de machines et conteneurs',
      'Traitement et calcul haute performance',
      'Sauvegarde et réplication des données'
    ],
    brands: ['Dell PowerEdge', 'HPE ProLiant', 'Lenovo ThinkSystem', 'Supermicro', 'Cisco UCS'],
    image_desc: 'Serveur rack 2U avec façade de disques durs et panneaux de ventilation'
  },
  {
    name: 'NAS',
    category: 'Stockage',
    icon: '💾',
    description: 'Le NAS (Network Attached Storage) est un serveur de stockage dédié connecté au réseau, permettant le partage et la centralisation des données. Il utilise des protocoles comme SMB/CIFS, NFS ou iSCSI pour offrir un accès transparent aux fichiers depuis n\'importe quel appareil du réseau. Les NAS modernes proposent des fonctionnalités avancées comme la déduplication, les instantanés (snapshots) et la réplication. Ils constituent une solution économique et flexible pour le stockage d\'entreprise ou domestique.',
    functions: [
      'Stockage centralisé et partage de fichiers en réseau',
      'Protection des données par RAID (0, 1, 5, 6, 10)',
      'Sauvegarde automatisée et synchronisation cloud',
      'Serveur multimédia (Plex, DLNA)',
      'Hébergement d\'applications conteneurisées (Docker)'
    ],
    brands: ['Synology', 'QNAP', 'Western Digital', 'Asustor', 'TerraMaster'],
    image_desc: 'Boîtier NAS de bureau avec baies de disques durs apparentes et voyants LED'
  },
  {
    name: 'Répéteur/Extender WiFi',
    category: 'Sans Fil',
    icon: '📡',
    description: 'Le répéteur WiFi (ou extender) est un appareil qui capte le signal WiFi existant et le retransmet pour étendre la portée du réseau sans fil. Il se place entre le routeur/point d\'accès et les zones de faible couverture. Bien que pratique, il divise par deux la bande passante disponible car il utilise le même canal pour recevoir et retransmettre. Les répéteurs mesh modernes résolvent cette limitation en utilisant des canaux dédiés pour la communication inter-nœuds.',
    functions: [
      'Extension de la portée du signal WiFi',
      'Amplification du signal dans les zones mortes',
      'Création d\'un réseau maillé (mesh) pour couverture optimale',
      'Support multi-bandes pour maintenir les performances'
    ],
    brands: ['TP-Link', 'Netgear', 'Linksys', 'Asus', 'D-Link'],
    image_desc: 'Répéteur WiFi compact branché sur prise murale avec indicateurs de signal'
  },
  {
    name: 'Pont (Bridge)',
    category: 'Interconnexion',
    icon: '🌉',
    description: 'Le pont réseau est un équipement de couche 2 qui connecte deux segments de réseau local distincts, les faisant apparaître comme un seul réseau. Il filtre le trafic en se basant sur les adresses MAC, ne transmettant les trames que lorsque nécessaire. Les ponts peuvent être matériels ou logiciels et sont souvent utilisés pour relier des réseaux de technologies différentes. Ils ont largement été remplacés par les switches mais restent pertinents dans certaines configurations sans fil point-à-point.',
    functions: [
      'Interconnexion de deux segments de réseau au niveau 2',
      'Filtrage des trames par adresse MAC',
      'Réduction des domaines de collision',
      'Liaison pont-à-pont sans fil entre bâtiments',
      'Conversion entre différents types de média réseau'
    ],
    brands: ['Cisco', 'Ubiquiti', 'MikroTik', 'TP-Link'],
    image_desc: 'Pont réseau sans fil directionnel reliant deux bâtiments'
  },
  {
    name: 'Passerelle (Gateway)',
    category: 'Interconnexion',
    icon: '🚪',
    description: 'La passerelle (gateway) est un dispositif qui assure l\'interconnexion entre deux réseaux utilisant des protocoles ou des architectures différents. Elle effectue la traduction de protocoles à tous les niveaux du modèle OSI si nécessaire. Dans le contexte le plus courant, la passerelle par défaut désigne le routeur permettant d\'accéder aux réseaux extérieurs. Les passerelles spécialisées peuvent convertir entre des protocoles industriels, VoIP, ou des systèmes hérités et modernes.',
    functions: [
      'Traduction entre protocoles réseau incompatibles',
      'Point de sortie par défaut vers les réseaux externes',
      'Conversion de protocoles industriels (Modbus, BACnet)',
      'Passerelle VoIP entre réseaux téléphoniques et IP',
      'Interface entre réseaux anciens et modernes'
    ],
    brands: ['Cisco', 'Juniper', 'Grandstream', 'AudioCodes', 'Advantech'],
    image_desc: 'Passerelle réseau multiprotocole avec interfaces série et Ethernet'
  },
  {
    name: 'Répartiteur de charge (Load Balancer)',
    category: 'Infrastructure',
    icon: '⚖️',
    description: 'Le répartiteur de charge distribue le trafic réseau entrant entre plusieurs serveurs backend pour optimiser l\'utilisation des ressources et garantir la haute disponibilité. Il surveille en permanence la santé des serveurs et redirige automatiquement le trafic en cas de panne. Les load balancers peuvent opérer au niveau 4 (transport) ou niveau 7 (application) selon les besoins. Ils sont indispensables pour les applications web à fort trafic et les architectures de microservices.',
    functions: [
      'Distribution du trafic entre serveurs (round-robin, least connections)',
      'Surveillance de la santé des serveurs (health checks)',
      'Terminaison SSL/TLS et déchargement cryptographique',
      'Persistance de session (sticky sessions)',
      'Protection contre les attaques DDoS par absorption du trafic',
      'Routage intelligent basé sur le contenu (niveau 7)'
    ],
    brands: ['F5 Networks', 'Citrix ADC', 'HAProxy', 'NGINX', 'Kemp'],
    image_desc: 'Appliance de répartition de charge haute performance en rack'
  },
  {
    name: 'IDS/IPS',
    category: 'Sécurité',
    icon: '🔍',
    description: 'Les systèmes de détection d\'intrusion (IDS) et de prévention d\'intrusion (IPS) analysent le trafic réseau pour identifier et bloquer les activités malveillantes. L\'IDS fonctionne en mode passif en alertant les administrateurs, tandis que l\'IPS peut bloquer activement les menaces en temps réel. Ils utilisent des signatures connues et l\'analyse comportementale pour détecter les attaques. Ces systèmes sont essentiels dans une architecture de sécurité en profondeur pour protéger les ressources critiques.',
    functions: [
      'Détection d\'intrusions par signatures et analyse comportementale',
      'Blocage automatique des attaques en temps réel (IPS)',
      'Analyse du trafic réseau à la recherche d\'anomalies',
      'Génération d\'alertes et rapports de sécurité',
      'Corrélation d\'événements de sécurité',
      'Protection contre les exploits et vulnérabilités connues'
    ],
    brands: ['Snort', 'Suricata', 'Cisco Firepower', 'Palo Alto', 'McAfee'],
    image_desc: 'Système de détection d\'intrusion montant en rack avec écran de monitoring'
  },
  {
    name: 'Contrôleur WiFi',
    category: 'Sans Fil',
    icon: '🎛️',
    description: 'Le contrôleur WiFi est un équipement centralisé qui gère, configure et supervise l\'ensemble des points d\'accès sans fil d\'un réseau. Il simplifie le déploiement à grande échelle en permettant la configuration automatique des AP et le roaming transparent des clients. Le contrôleur optimise dynamiquement les canaux radio et la puissance d\'émission pour éviter les interférences. Il offre une visibilité complète sur le réseau sans fil avec des outils de diagnostic et de rapports avancés.',
    functions: [
      'Gestion centralisée de tous les points d\'accès',
      'Configuration et mise à jour automatique des AP',
      'Optimisation dynamique des canaux et de la puissance radio',
      'Gestion du roaming transparent (802.11r/k/v)',
      'Détection et atténuation des interférences RF',
      'Portail captif et authentification centralisée'
    ],
    brands: ['Cisco WLC', 'Aruba Mobility Controller', 'Ruckus SmartZone', 'Ubiquiti UniFi', 'Extreme Networks'],
    image_desc: 'Contrôleur WiFi centralisé en rack avec tableau de bord de gestion'
  },
  {
    name: 'Convertisseur de média',
    category: 'Interconnexion',
    icon: '🔄',
    description: 'Le convertisseur de média est un dispositif qui permet de relier deux segments de réseau utilisant des types de câblage différents, comme le cuivre (RJ45) et la fibre optique. Il assure la conversion du signal entre les deux médias sans altérer les données transmises. Ces équipements sont indispensables pour étendre la portée du réseau au-delà des limitations du câble cuivre (100 mètres pour l\'Ethernet). Ils existent en versions autonomes ou modulaires pour une installation en châssis.',
    functions: [
      'Conversion de signal entre cuivre et fibre optique',
      'Extension de la portée du réseau au-delà des limites du cuivre',
      'Adaptation entre fibre monomode et multimode',
      'Support de différents débits (100 Mbps, 1 Gbps, 10 Gbps)',
      'Liaison longue distance entre bâtiments'
    ],
    brands: ['TP-Link', 'StarTech', 'Planet', 'Transition Networks', 'Perle'],
    image_desc: 'Convertisseur de média compact avec port RJ45 et port fibre optique SFP'
  },
  {
    name: 'Switch PoE',
    category: 'Commutation',
    icon: '⚡',
    description: 'Le switch PoE (Power over Ethernet) est un commutateur capable d\'alimenter en électricité les appareils connectés via le câble Ethernet, éliminant ainsi le besoin d\'une alimentation électrique séparée. Il est conforme aux normes IEEE 802.3af (PoE, 15.4W), 802.3at (PoE+, 30W) ou 802.3bt (PoE++, 60-100W). Ces switches sont essentiels pour déployer des téléphones IP, des caméras de surveillance et des points d\'accès WiFi. Ils simplifient l\'installation et réduisent les coûts de câblage.',
    functions: [
      'Alimentation électrique des appareils via câble Ethernet',
      'Commutation de trames au niveau 2 comme un switch classique',
      'Gestion intelligente du budget de puissance PoE',
      'Priorisation de l\'alimentation des appareils critiques',
      'Redémarrage à distance des appareils alimentés (power cycling)',
      'Planification horaire de l\'alimentation PoE'
    ],
    brands: ['Cisco', 'Ubiquiti', 'Netgear', 'HP/Aruba', 'TP-Link'],
    image_desc: 'Switch PoE manageable avec indication de puissance par port'
  },
  {
    name: 'Serveur de console',
    category: 'Infrastructure',
    icon: '🖧',
    description: 'Le serveur de console fournit un accès distant centralisé aux ports de console série des équipements réseau (routeurs, switches, pare-feu). Il permet aux administrateurs de gérer et dépanner les équipements à distance, même lorsque le réseau principal est en panne. C\'est un outil indispensable pour la gestion hors bande (out-of-band management) des centres de données. Il offre des fonctionnalités de journalisation des sessions et de contrôle d\'accès granulaire.',
    functions: [
      'Accès distant aux ports console série des équipements',
      'Gestion hors bande (out-of-band) en cas de panne réseau',
      'Journalisation complète des sessions de console',
      'Authentification centralisée (RADIUS, TACACS+)',
      'Support de connexions SSH, Telnet et web',
      'Automatisation des tâches de configuration'
    ],
    brands: ['Opengear', 'Digi International', 'Raritan', 'Lantronix', 'Perle'],
    image_desc: 'Serveur de console rackable avec multiples ports série RJ45/DB9'
  },
  {
    name: 'Network TAP',
    category: 'Sécurité',
    icon: '👁️',
    description: 'Le TAP réseau (Test Access Point) est un dispositif passif qui permet de copier intégralement le trafic d\'un lien réseau sans l\'interrompre ni l\'altérer. Contrairement au port miroir (SPAN) d\'un switch, le TAP n\'impacte pas les performances du réseau et garantit une copie fidèle à 100%. Il est utilisé pour l\'analyse de sécurité, le monitoring des performances et la conformité réglementaire. Les TAPs peuvent être passifs (sans alimentation) ou actifs (avec régénération du signal).',
    functions: [
      'Copie passive et intégrale du trafic réseau',
      'Alimentation d\'outils de monitoring et d\'analyse (IDS, SIEM)',
      'Capture de paquets sans perte pour l\'analyse forensique',
      'Agrégation de trafic pour les outils de surveillance',
      'Aucun impact sur les performances du réseau surveillé'
    ],
    brands: ['Garland Technology', 'Gigamon', 'IXIA/Keysight', 'Profitap', 'Cubro'],
    image_desc: 'TAP réseau en ligne avec ports d\'entrée, sortie et monitoring'
  },
  {
    name: 'UTM (Unified Threat Management)',
    category: 'Sécurité',
    icon: '🏰',
    description: 'L\'UTM (Gestion Unifiée des Menaces) est une appliance de sécurité tout-en-un qui combine plusieurs fonctions de protection réseau dans un seul boîtier. Elle intègre typiquement un pare-feu, un antivirus, un anti-spam, un filtrage web, un VPN et un système IDS/IPS. L\'UTM simplifie la gestion de la sécurité pour les petites et moyennes entreprises en offrant une console d\'administration unique. Elle représente un compromis entre simplicité de déploiement et couverture de sécurité complète.',
    functions: [
      'Pare-feu avec inspection des paquets en profondeur',
      'Antivirus et anti-malware au niveau de la passerelle',
      'Filtrage web et contrôle du contenu',
      'Serveur VPN (IPsec et SSL)',
      'Système de prévention d\'intrusion intégré',
      'Anti-spam et protection de la messagerie'
    ],
    brands: ['Fortinet FortiGate', 'Sophos', 'WatchGuard', 'SonicWall', 'Zyxel'],
    image_desc: 'Appliance UTM tout-en-un rackable avec écran LCD de statut'
  }
];

const osiData = [
  {
    layer_number: 7,
    name: 'Application',
    name_fr: 'Application',
    description: 'La couche Application est l\'interface directe entre l\'utilisateur et le réseau. Elle fournit les services réseau aux applications de l\'utilisateur final, tels que la navigation web, la messagerie électronique et le transfert de fichiers. Cette couche ne désigne pas les applications elles-mêmes, mais les protocoles et services qu\'elles utilisent pour communiquer via le réseau.',
    protocols: ['HTTP', 'HTTPS', 'FTP', 'SFTP', 'SMTP', 'POP3', 'IMAP', 'DNS', 'DHCP', 'SNMP', 'SSH', 'Telnet', 'NTP', 'LDAP', 'TFTP'],
    devices: ['Proxy', 'Pare-feu applicatif (WAF)', 'Serveur web', 'Serveur DNS', 'Serveur de messagerie'],
    pdu: 'Données (Data)',
    functions: [
      'Interface entre les applications et le réseau',
      'Services de courrier électronique (SMTP, POP3, IMAP)',
      'Transfert et partage de fichiers (FTP, SMB)',
      'Navigation et services web (HTTP/HTTPS)',
      'Résolution de noms de domaine (DNS)',
      'Gestion et supervision du réseau (SNMP)'
    ],
    examples: [
      'Navigateur web accédant à un site via HTTPS',
      'Client de messagerie envoyant un e-mail via SMTP',
      'Résolution DNS d\'un nom de domaine en adresse IP',
      'Connexion SSH à un serveur distant',
      'Requête DHCP pour obtenir une configuration IP automatique'
    ],
    color: '#FF6B6B'
  },
  {
    layer_number: 6,
    name: 'Presentation',
    name_fr: 'Présentation',
    description: 'La couche Présentation est responsable de la traduction, du chiffrement et de la compression des données. Elle assure que les données envoyées par la couche Application d\'un système peuvent être lues par la couche Application d\'un autre système, indépendamment des différences de format ou d\'encodage. Elle joue un rôle crucial dans la sécurité des communications grâce au chiffrement.',
    protocols: ['SSL/TLS', 'JPEG', 'GIF', 'PNG', 'MPEG', 'ASCII', 'Unicode', 'MIME', 'XDR', 'ASN.1'],
    devices: ['Passerelle de chiffrement', 'Serveur SSL/TLS'],
    pdu: 'Données (Data)',
    functions: [
      'Traduction et conversion des formats de données',
      'Chiffrement et déchiffrement des communications (SSL/TLS)',
      'Compression et décompression des données',
      'Sérialisation et désérialisation des structures de données',
      'Conversion des jeux de caractères (ASCII, Unicode, EBCDIC)'
    ],
    examples: [
      'Chiffrement TLS d\'une connexion HTTPS',
      'Compression JPEG d\'une image avant transmission',
      'Conversion de l\'encodage UTF-8 vers ASCII',
      'Encodage MIME des pièces jointes d\'un e-mail',
      'Sérialisation de données en format JSON ou XML'
    ],
    color: '#FFA94D'
  },
  {
    layer_number: 5,
    name: 'Session',
    name_fr: 'Session',
    description: 'La couche Session gère l\'établissement, le maintien et la terminaison des sessions de communication entre deux applications. Elle permet la synchronisation des échanges et la reprise en cas d\'interruption grâce aux points de contrôle. Cette couche gère également le mode de dialogue : simplex, semi-duplex ou full-duplex. Elle est essentielle pour les communications longues durées et les transactions complexes.',
    protocols: ['NetBIOS', 'RPC', 'PPTP', 'L2TP', 'SIP', 'H.323', 'SOCKS', 'SAP'],
    devices: ['Passerelle VPN', 'Serveur de sessions', 'Contrôleur de sessions SBC'],
    pdu: 'Données (Data)',
    functions: [
      'Établissement, gestion et terminaison des sessions',
      'Synchronisation des échanges avec points de contrôle',
      'Gestion du mode de dialogue (simplex, duplex)',
      'Reprise de session après une interruption',
      'Authentification et autorisation au niveau de la session',
      'Multiplexage de plusieurs sessions sur une connexion'
    ],
    examples: [
      'Ouverture d\'une session RPC pour un appel de procédure distant',
      'Établissement d\'un tunnel VPN avec L2TP',
      'Gestion d\'une session SIP pour un appel VoIP',
      'Session NetBIOS pour le partage de fichiers Windows',
      'Points de synchronisation dans un transfert de fichier volumineux'
    ],
    color: '#FFD43B'
  },
  {
    layer_number: 4,
    name: 'Transport',
    name_fr: 'Transport',
    description: 'La couche Transport assure la fiabilité du transfert de données de bout en bout entre les applications. Elle segmente les données en segments (TCP) ou datagrammes (UDP) et gère le contrôle de flux et la correction d\'erreurs. Le protocole TCP offre une transmission fiable avec accusé de réception, tandis que l\'UDP privilégie la rapidité sans garantie de livraison. Cette couche utilise les numéros de port pour identifier les applications communicantes.',
    protocols: ['TCP', 'UDP', 'SCTP', 'DCCP', 'QUIC', 'SPX'],
    devices: ['Pare-feu à inspection d\'état (stateful)', 'Répartiteur de charge L4'],
    pdu: 'Segment (TCP) / Datagramme (UDP)',
    functions: [
      'Segmentation et réassemblage des données',
      'Contrôle de flux de bout en bout (fenêtre glissante)',
      'Détection et correction d\'erreurs de transmission',
      'Multiplexage par numéros de port (0-65535)',
      'Établissement de connexion fiable (TCP three-way handshake)',
      'Contrôle de congestion (TCP Slow Start, AIMD)'
    ],
    examples: [
      'Connexion TCP fiable pour le chargement d\'une page web (port 443)',
      'Streaming vidéo en UDP pour minimiser la latence',
      'Multiplexage de plusieurs applications via les numéros de port',
      'Contrôle de congestion TCP pour éviter la saturation du réseau',
      'Protocole QUIC combinant les avantages de TCP et UDP'
    ],
    color: '#69DB7C'
  },
  {
    layer_number: 3,
    name: 'Network',
    name_fr: 'Réseau',
    description: 'La couche Réseau gère l\'adressage logique et le routage des paquets à travers les réseaux interconnectés. Elle détermine le meilleur chemin pour acheminer les données de la source à la destination en utilisant les adresses IP. Les routeurs opèrent principalement à ce niveau en consultant leurs tables de routage. Cette couche gère également la fragmentation des paquets et le protocole ICMP pour le diagnostic réseau.',
    protocols: ['IPv4', 'IPv6', 'ICMP', 'ICMPv6', 'OSPF', 'BGP', 'RIP', 'EIGRP', 'ARP', 'IPsec', 'IGMP', 'IS-IS'],
    devices: ['Routeur', 'Switch L3', 'Pare-feu L3'],
    pdu: 'Paquet',
    functions: [
      'Adressage logique avec les adresses IP (IPv4/IPv6)',
      'Routage des paquets entre réseaux distincts',
      'Fragmentation et réassemblage des paquets',
      'Diagnostic réseau avec ICMP (ping, traceroute)',
      'Sélection du meilleur chemin via les protocoles de routage',
      'Gestion de la qualité de service (DSCP, ToS)'
    ],
    examples: [
      'Routage d\'un paquet de Paris vers Tokyo à travers plusieurs routeurs',
      'Attribution d\'une adresse IP par le protocole DHCP',
      'Test de connectivité avec la commande ping (ICMP)',
      'Échange de routes entre FAI via le protocole BGP',
      'Fragmentation d\'un paquet trop grand pour le MTU du lien'
    ],
    color: '#4DABF7'
  },
  {
    layer_number: 2,
    name: 'Data Link',
    name_fr: 'Liaison de données',
    description: 'La couche Liaison de données assure la transmission fiable des trames entre deux nœuds directement connectés. Elle utilise les adresses MAC (adresses physiques) pour identifier les interfaces réseau sur le segment local. Cette couche est divisée en deux sous-couches : LLC (Logical Link Control) pour le contrôle de flux et MAC (Media Access Control) pour l\'accès au média. Elle détecte les erreurs de transmission grâce au contrôle CRC.',
    protocols: ['Ethernet (IEEE 802.3)', 'WiFi (IEEE 802.11)', 'PPP', 'HDLC', 'Frame Relay', 'ARP', 'STP', 'LLDP', 'VLAN (802.1Q)', 'LACP'],
    devices: ['Switch L2', 'Pont (Bridge)', 'Point d\'accès WiFi', 'Carte réseau (NIC)'],
    pdu: 'Trame (Frame)',
    functions: [
      'Adressage physique par adresses MAC (48 bits)',
      'Encapsulation des paquets en trames avec en-tête et bande-annonce',
      'Détection d\'erreurs par contrôle de redondance cyclique (CRC)',
      'Contrôle d\'accès au média (CSMA/CD, CSMA/CA)',
      'Segmentation en VLANs (IEEE 802.1Q)',
      'Prévention des boucles par Spanning Tree Protocol (STP)'
    ],
    examples: [
      'Commutation d\'une trame Ethernet vers le bon port via l\'adresse MAC',
      'Résolution ARP pour associer une adresse IP à une adresse MAC',
      'Création de VLANs pour segmenter un réseau d\'entreprise',
      'Négociation WiFi entre un client et un point d\'accès (802.11)',
      'Détection et blocage d\'une boucle réseau par STP'
    ],
    color: '#748FFC'
  },
  {
    layer_number: 1,
    name: 'Physical',
    name_fr: 'Physique',
    description: 'La couche Physique définit les spécifications électriques, mécaniques et fonctionnelles pour activer, maintenir et désactiver les connexions physiques entre les appareils réseau. Elle gère la transmission brute des bits (0 et 1) sur le support de communication, qu\'il s\'agisse de câbles en cuivre, de fibre optique ou d\'ondes radio. Cette couche détermine les connecteurs, les tensions, les débits et les types de modulation utilisés.',
    protocols: ['Ethernet physique (10BASE-T, 100BASE-TX, 1000BASE-T)', 'USB', 'Bluetooth', 'DSL', 'SONET/SDH', 'RS-232', 'IEEE 802.11 (couche physique)', 'ISDN'],
    devices: ['Hub', 'Répéteur', 'Câbles (UTP, STP, fibre optique)', 'Convertisseur de média', 'Prises et panneaux de brassage', 'Transceiver SFP'],
    pdu: 'Bit',
    functions: [
      'Transmission et réception des bits bruts sur le média',
      'Définition des caractéristiques électriques et optiques des signaux',
      'Spécification des connecteurs et du câblage (RJ45, LC, SC)',
      'Gestion de la topologie physique du réseau (étoile, bus, anneau)',
      'Synchronisation des horloges et encodage des signaux',
      'Détermination du mode de transmission (simplex, duplex)'
    ],
    examples: [
      'Transmission de signaux électriques sur un câble Ethernet Cat6',
      'Propagation de la lumière dans une fibre optique monomode',
      'Émission d\'ondes radio WiFi sur la bande 5 GHz',
      'Connexion d\'un câble RJ45 dans un panneau de brassage',
      'Négociation automatique du débit entre deux interfaces (auto-négociation)'
    ],
    color: '#DA77F2'
  }
];
