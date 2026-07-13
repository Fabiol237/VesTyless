// ============================================================
// NetDeep - Données Entreprise, Sécurité & Windows
// Toutes les données sont en français
// ============================================================

const enterpriseData = {
  analyses: [
    {
      name: 'BankSecure International',
      sector: 'Banque',
      description: 'Institution bancaire multinationale gérant plus de 2 millions de comptes clients à travers 15 pays, avec des transactions quotidiennes dépassant les 500 millions d\'euros. La banque opère un réseau de 350 agences et une plateforme de banque en ligne utilisée par 1,2 million de clients actifs.',
      network_needs: [
        'Réseau haute disponibilité avec 99,999% d\'uptime pour les transactions financières',
        'Connexions sécurisées entre les agences via MPLS et VPN IPsec',
        'Infrastructure de trading à faible latence (moins de 1ms)',
        'Réseau segmenté pour séparer les environnements de production, test et développement',
        'Connectivité redondante avec les systèmes interbancaires SWIFT et SEPA',
        'Réseau Wi-Fi sécurisé pour les employés avec authentification 802.1X'
      ],
      challenges: [
        'Conformité aux réglementations PCI-DSS, RGPD et Bâle III',
        'Protection contre les cyberattaques ciblées (APT) et la fraude en ligne',
        'Gestion de la latence pour les opérations de trading haute fréquence',
        'Migration progressive des systèmes legacy vers le cloud hybride',
        'Gestion des accès pour plus de 8 000 employés répartis mondialement'
      ],
      solutions: [
        'Déploiement d\'un SD-WAN pour optimiser la connectivité inter-agences',
        'Mise en place d\'un SOC 24/7 avec SIEM Splunk et outils de détection EDR',
        'Architecture Zero Trust avec micro-segmentation via VMware NSX',
        'Chiffrement de bout en bout avec TLS 1.3 pour toutes les communications',
        'Plan de reprise d\'activité avec RTO de 15 minutes et RPO de 0 seconde',
        'Authentification multi-facteurs obligatoire pour tous les accès critiques'
      ]
    },
    {
      name: 'Centre Hospitalier Régional Saint-Martin',
      sector: 'Hôpital',
      description: 'Hôpital universitaire de 1 200 lits avec 45 services spécialisés, un service d\'urgences traitant 300 patients par jour, et un plateau technique comprenant 8 blocs opératoires. L\'établissement emploie 4 500 professionnels de santé et gère plus de 500 000 dossiers patients numériques.',
      network_needs: [
        'Réseau critique pour les dispositifs médicaux connectés (moniteurs, pompes, imagerie)',
        'Infrastructure supportant la télémédecine et la visioconférence HD',
        'Connectivité fiable pour le Dossier Patient Informatisé (DPI)',
        'Réseau IoT dédié pour les capteurs de surveillance environnementale',
        'Wi-Fi haute densité couvrant l\'ensemble des 120 000 m² de l\'établissement',
        'Liaisons sécurisées avec les laboratoires externes et le réseau de santé régional'
      ],
      challenges: [
        'Conformité aux normes HDS (Hébergement de Données de Santé) et RGPD santé',
        'Gestion de la coexistence entre dispositifs médicaux anciens et infrastructure moderne',
        'Disponibilité réseau critique pour les blocs opératoires et la réanimation',
        'Protection des données de santé hautement sensibles contre les ransomwares',
        'Gestion de la bande passante pour l\'imagerie médicale volumineuse (DICOM)'
      ],
      solutions: [
        'Segmentation réseau stricte avec VLAN dédiés par service et type d\'équipement',
        'Déploiement de pare-feu nouvelle génération Palo Alto avec inspection SSL',
        'Infrastructure Wi-Fi Aruba avec gestion centralisée et roaming rapide',
        'Système de sauvegarde 3-2-1 avec réplication géographique vers un datacenter distant',
        'Réseau de secours 4G/5G pour assurer la continuité en cas de panne fibre',
        'Formation continue du personnel médical à la cybersécurité'
      ]
    },
    {
      name: 'MegaShop Online',
      sector: 'E-commerce',
      description: 'Plateforme e-commerce leader en France avec 8 millions de visiteurs uniques mensuels, un catalogue de 2 millions de produits et des pics de trafic atteignant 50 000 connexions simultanées lors des événements promotionnels comme le Black Friday. Le chiffre d\'affaires annuel dépasse les 200 millions d\'euros.',
      network_needs: [
        'Infrastructure cloud élastique capable de supporter des pics de charge x10',
        'CDN mondial pour garantir des temps de chargement inférieurs à 2 secondes',
        'Connexions API sécurisées avec plus de 200 partenaires logistiques',
        'Base de données distribuée avec réplication multi-région',
        'Réseau de paiement conforme PCI-DSS avec isolation stricte',
        'Monitoring réseau temps réel avec alerting automatisé'
      ],
      challenges: [
        'Protection contre les attaques DDoS massives lors des pics commerciaux',
        'Gestion de la scalabilité automatique sans interruption de service',
        'Sécurisation des données de paiement de millions de clients',
        'Optimisation de la latence pour les utilisateurs internationaux',
        'Prévention de la fraude en temps réel sur les transactions'
      ],
      solutions: [
        'Architecture multi-cloud AWS et GCP avec basculement automatique',
        'Protection DDoS via Cloudflare Enterprise avec WAF personnalisé',
        'Auto-scaling Kubernetes pour gérer les pics de trafic',
        'CDN Akamai avec points de présence dans 30 pays',
        'Pipeline CI/CD avec déploiement blue-green pour les mises à jour sans coupure',
        'Système de détection de fraude basé sur l\'intelligence artificielle'
      ]
    },
    {
      name: 'AcierTech Industries',
      sector: 'Industrie/Usine',
      description: 'Complexe industriel spécialisé dans la métallurgie et l\'usinage de précision, comprenant 3 usines interconnectées sur un site de 50 hectares. L\'entreprise opère 200 machines-outils à commande numérique, 15 robots industriels et un système SCADA supervisant l\'ensemble de la production. Effectif de 1 800 employés.',
      network_needs: [
        'Réseau OT (Operational Technology) isolé pour les systèmes SCADA et automates',
        'Connectivité industrielle Ethernet/IP et Profinet pour les machines-outils',
        'Réseau IoT pour la maintenance prédictive avec 2 000 capteurs',
        'Liaison WAN sécurisée entre les 3 sites de production',
        'Infrastructure supportant la vidéosurveillance HD avec 150 caméras',
        'Réseau IT classique pour la gestion administrative et l\'ERP SAP'
      ],
      challenges: [
        'Convergence IT/OT sans compromettre la sécurité des systèmes industriels',
        'Protection contre les attaques ciblant les systèmes SCADA (type Stuxnet)',
        'Gestion de la coexistence entre protocoles industriels et standards IT',
        'Environnement hostile (interférences électromagnétiques, poussière, chaleur)',
        'Mise à jour des firmwares des automates sans arrêt de production'
      ],
      solutions: [
        'Architecture Purdue Model avec DMZ industrielle entre IT et OT',
        'Déploiement de sondes de détection d\'intrusion spécialisées OT (Claroty)',
        'Switches industriels durcis Cisco IE avec redondance anneau REP',
        'Réseau sans fil industriel WirelessHART pour les capteurs IoT',
        'Pare-feu industriels Fortinet FortiGate Rugged pour la segmentation',
        'Jumeaux numériques pour tester les configurations avant déploiement'
      ]
    },
    {
      name: 'Université Paris-Numérique',
      sector: 'Éducation/Université',
      description: 'Université pluridisciplinaire accueillant 35 000 étudiants et 3 000 enseignants-chercheurs répartis sur 5 campus. L\'établissement dispose de 200 salles informatiques, 50 laboratoires de recherche, une bibliothèque numérique et un datacenter de recherche hébergeant un supercalculateur HPC pour les projets scientifiques.',
      network_needs: [
        'Wi-Fi haute densité eduroam pour 35 000 utilisateurs simultanés potentiels',
        'Réseau de recherche à 100 Gbps connecté au réseau RENATER',
        'Infrastructure de calcul haute performance avec réseau InfiniBand',
        'VLAN dédiés pour les TP de cybersécurité et les labs de recherche',
        'Plateforme de e-learning supportant 10 000 connexions simultanées',
        'Réseau de vidéosurveillance et contrôle d\'accès pour les 5 campus'
      ],
      challenges: [
        'Gestion de l\'identité pour une population fortement rotative (étudiants)',
        'Équilibre entre ouverture académique et sécurité du réseau',
        'Support de la diversité des usages (streaming, recherche, administration)',
        'Budget limité face aux besoins croissants en bande passante',
        'Protection de la propriété intellectuelle et des données de recherche'
      ],
      solutions: [
        'Fédération d\'identité via Shibboleth et eduroam pour l\'authentification',
        'QoS avancée avec priorisation du trafic académique et de recherche',
        'Software-Defined Networking (SDN) OpenDaylight pour la gestion centralisée',
        'Pare-feu applicatif avec filtrage de contenu et détection d\'anomalies',
        'Réseau de recherche dédié avec peering direct vers les partenaires internationaux',
        'Cloud privé OpenStack pour les projets étudiants et les labs virtuels'
      ]
    },
    {
      name: 'Ministère de la Défense Numérique',
      sector: 'Gouvernement',
      description: 'Administration gouvernementale responsable de la cyberdéfense nationale, gérant les systèmes d\'information classifiés de plusieurs ministères. L\'organisation supervise un réseau couvrant 500 sites sur le territoire national et les ambassades à l\'étranger, avec des exigences de sécurité au niveau Confidentiel Défense et Secret.',
      network_needs: [
        'Réseaux classifiés physiquement isolés (air-gapped) pour les données Secret',
        'Infrastructure de chiffrement souveraine certifiée ANSSI',
        'Réseau interministériel sécurisé RIE (Réseau Interministériel de l\'État)',
        'Système de communications sécurisées pour les ambassades via satellite',
        'SOC gouvernemental avec capacités de cyber-renseignement',
        'Infrastructure de messagerie sécurisée avec chiffrement de bout en bout'
      ],
      challenges: [
        'Menaces APT étatiques sophistiquées et espionnage cybernétique',
        'Conformité aux référentiels IGI 1300 et II 901 de l\'ANSSI',
        'Gestion de multiples niveaux de classification sur des infrastructures séparées',
        'Souveraineté technologique et indépendance vis-à-vis des fournisseurs étrangers',
        'Protection contre les attaques sur la chaîne d\'approvisionnement'
      ],
      solutions: [
        'Déploiement de chiffreurs réseau certifiés EAL4+ par l\'ANSSI',
        'Architecture de défense en profondeur avec multiples couches de sécurité',
        'Utilisation de systèmes d\'exploitation durcis et certifiés (Linux durci)',
        'Surveillance continue par le CERT gouvernemental avec analyse de menaces',
        'Programme de bug bounty privé pour les systèmes non classifiés',
        'Exercices de simulation de crise cyber trimestriels'
      ]
    },
    {
      name: 'TéléConnect Opérateur',
      sector: 'Télécommunications',
      description: 'Opérateur de télécommunications national desservant 12 millions d\'abonnés fixe et mobile, avec un réseau fibre FTTH couvrant 8 millions de foyers, un réseau mobile 4G/5G avec 15 000 antennes, et une infrastructure de cœur de réseau reliant 20 datacenters à travers le pays.',
      network_needs: [
        'Backbone national en fibre optique avec capacité de 400 Gbps par lien',
        'Infrastructure 5G standalone avec network slicing pour les entreprises',
        'Plateforme NFV/SDN pour la virtualisation des fonctions réseau',
        'Réseau de distribution FTTH avec gestion de 8 millions de prises',
        'Interconnexion avec les points d\'échange Internet (France-IX, Equinix)',
        'Système OSS/BSS pour la gestion des abonnés et la facturation'
      ],
      challenges: [
        'Investissements massifs pour le déploiement 5G et la fibre',
        'Gestion de la qualité de service pour des millions d\'abonnés simultanés',
        'Régulation de l\'ARCEP et obligations de couverture territoriale',
        'Concurrence intense sur les prix avec maintien de la qualité réseau',
        'Transition progressive des réseaux cuivre ADSL vers la fibre'
      ],
      solutions: [
        'Virtualisation massive des fonctions réseau (vEPC, vIMS, vCDN)',
        'Orchestration MANO pour le déploiement automatisé des services',
        'Intelligence artificielle pour l\'optimisation du réseau radio (SON)',
        'Peering stratégique avec les principaux fournisseurs de contenu (Google, Netflix)',
        'Programme d\'investissement planifié sur 5 ans pour la couverture fibre',
        'Monitoring proactif avec analyse prédictive des pannes réseau'
      ]
    },
    {
      name: 'HyperMarché Distribution',
      sector: 'Retail/Grande distribution',
      description: 'Chaîne de grande distribution opérant 250 hypermarchés et 800 supermarchés de proximité en France, avec un entrepôt logistique central et 15 plateformes régionales. L\'enseigne gère 80 000 employés, 2 000 caisses automatiques et un programme de fidélité comptant 15 millions de membres actifs.',
      network_needs: [
        'Connectivité WAN fiable pour 1 050 magasins avec basculement automatique',
        'Réseau Wi-Fi client haute capacité dans chaque magasin',
        'Infrastructure pour les caisses automatiques et les terminaux de paiement',
        'Connexions IoT pour la chaîne du froid (2 000 meubles réfrigérés connectés)',
        'Liaison temps réel avec le système central de gestion des stocks SAP',
        'Réseau de vidéosurveillance avec analytique vidéo intégrée'
      ],
      challenges: [
        'Standardisation de l\'infrastructure réseau sur 1 050 sites hétérogènes',
        'Gestion de la sécurité des paiements conformément à PCI-DSS',
        'Bande passante suffisante pour les magasins ruraux avec faible couverture',
        'Protection des données personnelles des 15 millions de membres fidélité',
        'Coût total de possession pour un réseau aussi distribué'
      ],
      solutions: [
        'SD-WAN Cisco Viptela pour la gestion centralisée de tous les sites',
        'Template de configuration réseau standardisé déployé automatiquement',
        'Connexion 4G/5G de backup pour les sites à connectivité limitée',
        'Segmentation PCI-DSS avec VLAN isolé pour les flux de paiement',
        'Plateforme de gestion centralisée Meraki pour le Wi-Fi et les switches',
        'Monitoring centralisé avec tableaux de bord par région et magasin'
      ]
    },
    {
      name: 'TransLogistique Express',
      sector: 'Transport/Logistique',
      description: 'Entreprise de transport et logistique gérant une flotte de 3 000 véhicules, 20 entrepôts automatisés et 50 agences en France et en Europe. La société traite 200 000 colis par jour avec un suivi en temps réel, et opère une plateforme de gestion de transport multimodale (route, rail, aérien).',
      network_needs: [
        'Connectivité mobile pour la flotte de 3 000 véhicules avec GPS temps réel',
        'Réseau Wi-Fi industriel dans les 20 entrepôts pour les scanners et AGV',
        'Infrastructure cloud pour le TMS (Transport Management System)',
        'API temps réel pour le suivi de colis et l\'intégration clients',
        'Réseau voix et données pour les 50 agences avec téléphonie IP',
        'Connectivité IoT pour les capteurs de température des camions frigorifiques'
      ],
      challenges: [
        'Couverture réseau mobile dans les zones blanches rurales et transfrontalières',
        'Gestion de la géolocalisation de 3 000 véhicules en temps réel',
        'Intégration des systèmes hétérogènes (clients, douanes, partenaires)',
        'Sécurité des données de livraison et des informations clients',
        'Haute disponibilité pour les entrepôts automatisés fonctionnant 24/7'
      ],
      solutions: [
        'Solution de connectivité multi-opérateur avec SIM multi-IMSI pour les véhicules',
        'Plateforme IoT centralisée Azure IoT Hub pour la télémétrie',
        'SD-WAN pour interconnecter les agences avec qualité de service garantie',
        'API Gateway Kong pour sécuriser et gérer les intégrations partenaires',
        'Réseau Wi-Fi 6 Extreme Networks dans les entrepôts pour la haute densité',
        'PRA/PCA avec basculement automatique vers un datacenter de secours'
      ]
    },
    {
      name: 'StreamVision Média',
      sector: 'Média/Streaming',
      description: 'Plateforme de streaming vidéo française diffusant du contenu en direct et à la demande, avec 5 millions d\'abonnés actifs, un catalogue de 20 000 titres en 4K HDR et des événements en direct atteignant 2 millions de spectateurs simultanés. L\'entreprise produit également du contenu original avec 3 studios de production numériques.',
      network_needs: [
        'CDN mondial capable de servir 50 Tbps de trafic en pic',
        'Infrastructure de transcodage distribuée pour le multi-format adaptatif',
        'Réseau de contribution pour les flux live depuis les studios et événements',
        'Base de données distribuée pour les recommandations personnalisées',
        'Réseau de production isolé pour les studios avec bande passante garantie',
        'Connectivité directe avec les FAI majeurs pour le peering privé'
      ],
      challenges: [
        'Gestion des pics de trafic lors des événements sportifs en direct',
        'Latence minimale pour le streaming live (moins de 5 secondes)',
        'Protection du contenu contre le piratage et le partage de comptes',
        'Coûts de bande passante CDN qui représentent 40% des charges',
        'Qualité de service constante sur tous les appareils et connexions'
      ],
      solutions: [
        'CDN hybride combinant CDN propre et multi-CDN (Akamai, Fastly, CloudFront)',
        'Protocole CMAF avec encodage faible latence pour le live streaming',
        'DRM multi-plateforme Widevine et FairPlay avec watermarking forensique',
        'Peering privé avec Orange, Free, SFR et Bouygues pour réduire les coûts',
        'Architecture de microservices sur Kubernetes pour la scalabilité du backend',
        'Machine learning pour l\'ABR (Adaptive Bitrate) optimisant la qualité perçue'
      ]
    }
  ],

  failles: [
    {
      name: 'Man-in-the-Middle (MitM)',
      severity: 'Critique',
      frequency: 'Très fréquente',
      description: 'Attaque où un pirate intercepte secrètement les communications entre deux parties qui croient communiquer directement entre elles. L\'attaquant peut lire, modifier ou injecter des données dans la communication sans que les victimes ne s\'en aperçoivent.',
      impact: 'Vol d\'identifiants de connexion, interception de données bancaires, modification de transactions financières, injection de malwares dans les téléchargements, usurpation d\'identité complète.',
      prevention: [
        'Utiliser systématiquement HTTPS avec HSTS activé sur tous les sites',
        'Déployer le certificate pinning dans les applications mobiles',
        'Activer le chiffrement WPA3 sur tous les réseaux Wi-Fi',
        'Utiliser un VPN sur les réseaux publics non sécurisés',
        'Vérifier les certificats SSL/TLS avant de saisir des informations sensibles',
        'Déployer DNSSEC pour protéger les requêtes DNS'
      ],
      real_examples: [
        'En 2015, le malware Superfish préinstallé sur les laptops Lenovo réalisait des attaques MitM en installant un certificat racine malveillant',
        'L\'attaque DigiNotar en 2011 a compromis une autorité de certification, permettant des interceptions MitM massives en Iran'
      ]
    },
    {
      name: 'Attaque DDoS (Déni de Service Distribué)',
      severity: 'Critique',
      frequency: 'Très fréquente',
      description: 'Attaque visant à rendre un service ou une infrastructure indisponible en le submergeant de requêtes provenant de milliers ou millions de machines compromises (botnet). Les attaques modernes atteignent régulièrement plusieurs térabits par seconde.',
      impact: 'Indisponibilité totale des services en ligne, pertes financières estimées à 300 000€/heure en moyenne, atteinte à la réputation, effet de diversion masquant d\'autres attaques simultanées.',
      prevention: [
        'Souscrire à un service de protection DDoS cloud (Cloudflare, AWS Shield)',
        'Configurer le rate limiting et le filtrage de trafic sur les pare-feu',
        'Déployer une architecture anycast pour distribuer le trafic',
        'Mettre en place un plan de réponse aux incidents DDoS',
        'Surveiller en temps réel les indicateurs de trafic anormaux',
        'Dimensionner l\'infrastructure pour absorber les pics de charge'
      ],
      real_examples: [
        'L\'attaque Mirai en 2016 a atteint 1,2 Tbps en exploitant des objets connectés, rendant inaccessibles Twitter, Netflix et Reddit',
        'En 2020, AWS a subi la plus grande attaque DDoS enregistrée à 2,3 Tbps'
      ]
    },
    {
      name: 'DNS Spoofing (Empoisonnement DNS)',
      severity: 'Haute',
      frequency: 'Très fréquente',
      description: 'Technique qui consiste à corrompre le cache DNS d\'un serveur ou d\'un client pour rediriger les utilisateurs vers des sites frauduleux. L\'attaquant modifie les enregistrements DNS pour faire pointer un nom de domaine légitime vers une adresse IP malveillante.',
      impact: 'Redirection vers des sites de phishing parfaitement imités, vol massif d\'identifiants, distribution de malwares via des faux sites de mise à jour, interception de courriels.',
      prevention: [
        'Implémenter DNSSEC sur tous les domaines gérés',
        'Utiliser des résolveurs DNS sécurisés (DNS over HTTPS/TLS)',
        'Configurer la randomisation des ports source DNS',
        'Surveiller les modifications non autorisées des enregistrements DNS',
        'Mettre en place un monitoring DNS continu',
        'Réduire le TTL des enregistrements DNS critiques'
      ],
      real_examples: [
        'L\'attaque Kaminsky en 2008 a révélé une faille fondamentale dans le protocole DNS affectant presque tous les serveurs DNS mondiaux',
        'En 2019, la campagne Sea Turtle a compromis les DNS de 40 organisations dans 13 pays'
      ]
    },
    {
      name: 'ARP Poisoning (Empoisonnement ARP)',
      severity: 'Haute',
      frequency: 'Fréquente',
      description: 'Attaque de couche 2 qui consiste à envoyer de faux messages ARP sur un réseau local pour associer l\'adresse MAC de l\'attaquant à l\'adresse IP d\'un autre hôte (souvent la passerelle par défaut), interceptant ainsi tout le trafic destiné à cette machine.',
      impact: 'Interception de tout le trafic du réseau local, possibilité de réaliser des attaques MitM, vol de sessions, déni de service en corrompant les tables ARP.',
      prevention: [
        'Activer le Dynamic ARP Inspection (DAI) sur les switches managés',
        'Configurer les entrées ARP statiques pour les équipements critiques',
        'Déployer le DHCP Snooping pour valider les attributions d\'adresses',
        'Utiliser la segmentation VLAN pour limiter les domaines de broadcast',
        'Surveiller les tables ARP pour détecter les anomalies',
        'Implémenter 802.1X pour l\'authentification au port'
      ],
      real_examples: [
        'Des attaques ARP Poisoning sont régulièrement utilisées dans les réseaux Wi-Fi publics des aéroports et hôtels pour intercepter les données des voyageurs',
        'En 2017, des attaquants ont utilisé l\'ARP poisoning dans un réseau d\'entreprise pour rediriger les paiements vers des comptes frauduleux'
      ]
    },
    {
      name: 'SQL Injection via réseau',
      severity: 'Critique',
      frequency: 'Fréquente',
      description: 'Exploitation des applications web accessibles via le réseau en injectant du code SQL malveillant dans les champs de saisie ou les paramètres URL. L\'attaque cible les applications qui ne valident pas correctement les entrées utilisateur avant de construire les requêtes SQL.',
      impact: 'Extraction complète des bases de données (données clients, mots de passe), modification ou suppression de données, exécution de commandes système via xp_cmdshell, escalade de privilèges.',
      prevention: [
        'Utiliser systématiquement les requêtes préparées (prepared statements)',
        'Déployer un WAF (Web Application Firewall) avec règles SQL injection',
        'Appliquer le principe du moindre privilège sur les comptes de base de données',
        'Valider et assainir toutes les entrées utilisateur côté serveur',
        'Effectuer des audits de code réguliers et des tests de pénétration',
        'Mettre à jour les frameworks et ORM pour bénéficier des derniers correctifs'
      ],
      real_examples: [
        'La fuite de données d\'Equifax en 2017 a exposé les informations de 147 millions de personnes via une injection SQL',
        'En 2020, la plateforme Freepik a subi une fuite de 8,3 millions de comptes par injection SQL'
      ]
    },
    {
      name: 'Buffer Overflow (Débordement de tampon)',
      severity: 'Critique',
      frequency: 'Fréquente',
      description: 'Vulnérabilité exploitant l\'écriture de données au-delà des limites d\'un buffer mémoire dans les services réseau (serveurs FTP, HTTP, DNS). Permet à un attaquant d\'exécuter du code arbitraire avec les privilèges du service vulnérable.',
      impact: 'Exécution de code à distance avec privilèges élevés, prise de contrôle complète du serveur, propagation de vers réseau, déni de service par crash du service.',
      prevention: [
        'Compiler les logiciels avec les protections ASLR et DEP activées',
        'Utiliser des langages memory-safe (Rust, Go) pour les services critiques',
        'Appliquer systématiquement les correctifs de sécurité',
        'Effectuer du fuzzing régulier sur les services exposés',
        'Déployer des systèmes de prévention d\'intrusion (IPS) réseau',
        'Utiliser les canaris de pile (stack canaries) lors de la compilation'
      ],
      real_examples: [
        'Le ver Code Red en 2001 a exploité un buffer overflow dans IIS de Microsoft, infectant 359 000 serveurs en 14 heures',
        'La vulnérabilité EternalBlue (MS17-010) exploitée par WannaCry était un buffer overflow dans le protocole SMBv1'
      ]
    },
    {
      name: 'VLAN Hopping',
      severity: 'Haute',
      frequency: 'Occasionnelle',
      description: 'Technique permettant à un attaquant d\'accéder au trafic d\'un VLAN auquel il ne devrait pas avoir accès. Deux méthodes principales : le switch spoofing (se faire passer pour un switch en négociant un trunk) et le double tagging (encapsuler les trames avec deux tags 802.1Q).',
      impact: 'Contournement de la segmentation réseau, accès non autorisé à des réseaux sensibles (serveurs, gestion), possibilité d\'intercepter le trafic inter-VLAN, compromission de la sécurité réseau.',
      prevention: [
        'Désactiver le DTP (Dynamic Trunking Protocol) sur tous les ports d\'accès',
        'Configurer explicitement les ports en mode accès (switchport mode access)',
        'Utiliser un VLAN natif dédié différent du VLAN 1 par défaut',
        'Appliquer le tagging explicite sur le VLAN natif des trunks',
        'Activer le port security pour limiter les adresses MAC par port',
        'Désactiver les ports non utilisés et les assigner à un VLAN isolé'
      ],
      real_examples: [
        'Des tests d\'intrusion internes révèlent régulièrement que 30% des réseaux d\'entreprise sont vulnérables au VLAN hopping',
        'En 2018, un pentest chez un opérateur télécom a permis d\'accéder au réseau de gestion via double tagging depuis le réseau invité'
      ]
    },
    {
      name: 'BGP Hijacking (Détournement BGP)',
      severity: 'Critique',
      frequency: 'Occasionnelle',
      description: 'Attaque consistant à annoncer de fausses routes BGP pour rediriger le trafic Internet à travers l\'infrastructure de l\'attaquant. Exploite l\'absence d\'authentification native dans le protocole BGP qui constitue le cœur du routage Internet mondial.',
      impact: 'Redirection massive du trafic Internet, interception de données à grande échelle, perturbation de services pour des régions entières, perte de connectivité pour les préfixes détournés.',
      prevention: [
        'Implémenter RPKI (Resource Public Key Infrastructure) pour valider les routes',
        'Configurer des filtres de préfixes stricts avec les pairs BGP',
        'Utiliser BGPsec pour l\'authentification du chemin AS',
        'Surveiller les annonces BGP avec des outils comme BGPStream',
        'Mettre en place des alertes sur les changements de routage anormaux',
        'Collaborer avec les IXP et les opérateurs pour filtrer les routes invalides'
      ],
      real_examples: [
        'En 2018, un détournement BGP a redirigé le trafic d\'Amazon Route 53 pour voler 150 000$ en cryptomonnaie',
        'En 2017, le trafic de Google, Apple et Facebook a été redirigé via la Russie pendant plusieurs heures'
      ]
    },
    {
      name: 'DNS Tunneling',
      severity: 'Moyenne',
      frequency: 'Fréquente',
      description: 'Technique d\'exfiltration qui encode des données dans les requêtes et réponses DNS pour contourner les pare-feu et les systèmes de sécurité réseau. Le trafic DNS étant rarement filtré, il constitue un canal de communication dissimulé idéal pour les malwares.',
      impact: 'Exfiltration de données sensibles indétectable par les pare-feu classiques, maintien d\'un canal de commande et contrôle (C2) pour les malwares, contournement des systèmes de filtrage réseau.',
      prevention: [
        'Analyser le trafic DNS pour détecter les requêtes anormalement longues',
        'Mettre en place un proxy DNS avec inspection de contenu',
        'Limiter les résolveurs DNS autorisés et bloquer le DNS direct',
        'Surveiller le volume et la fréquence des requêtes DNS par client',
        'Déployer des solutions de détection de tunneling DNS (Infoblox, Farsight)',
        'Configurer des alertes sur les domaines avec beaucoup de sous-domaines uniques'
      ],
      real_examples: [
        'Le malware FrameworkPOS utilisait le DNS tunneling pour exfiltrer des données de cartes bancaires depuis les terminaux de point de vente',
        'Le groupe APT OilRig utilise régulièrement le DNS tunneling comme canal C2 dans ses opérations d\'espionnage'
      ]
    },
    {
      name: 'Rogue DHCP (Serveur DHCP malveillant)',
      severity: 'Haute',
      frequency: 'Fréquente',
      description: 'Installation d\'un faux serveur DHCP sur le réseau qui distribue des configurations réseau malveillantes aux clients. L\'attaquant peut définir sa propre machine comme passerelle par défaut ou serveur DNS, interceptant ainsi tout le trafic du réseau.',
      impact: 'Redirection de tout le trafic réseau via la machine de l\'attaquant, attaques MitM transparentes, distribution de faux serveurs DNS pour le phishing, déni de service par attribution d\'adresses incorrectes.',
      prevention: [
        'Activer le DHCP Snooping sur tous les switches managés',
        'Configurer les ports de confiance uniquement vers les serveurs DHCP légitimes',
        'Mettre en place la détection de serveurs DHCP non autorisés',
        'Utiliser le 802.1X pour contrôler l\'accès au réseau',
        'Surveiller les logs DHCP pour détecter les conflits d\'adresses',
        'Déployer des agents de surveillance réseau sur les segments critiques'
      ],
      real_examples: [
        'Des incidents de Rogue DHCP sont fréquemment signalés dans les universités où les étudiants connectent des routeurs Wi-Fi personnels',
        'En 2019, un employé malveillant a installé un Rogue DHCP dans une entreprise pour intercepter les communications internes'
      ]
    },
    {
      name: 'SYN Flood',
      severity: 'Haute',
      frequency: 'Très fréquente',
      description: 'Attaque de déni de service qui exploite le mécanisme de poignée de main TCP en trois étapes. L\'attaquant envoie un grand nombre de paquets SYN sans jamais compléter la connexion, épuisant les ressources du serveur qui maintient des connexions semi-ouvertes.',
      impact: 'Épuisement de la table de connexions du serveur, indisponibilité du service pour les utilisateurs légitimes, consommation excessive de mémoire et de CPU, possible crash du système.',
      prevention: [
        'Configurer les SYN cookies sur les serveurs (tcp_syncookies)',
        'Ajuster les paramètres de timeout TCP et la taille du backlog',
        'Déployer un pare-feu avec détection et limitation des SYN floods',
        'Utiliser des solutions de mitigation DDoS en amont',
        'Configurer le rate limiting par IP source sur le périmètre',
        'Mettre en place des systèmes de détection d\'anomalies de trafic'
      ],
      real_examples: [
        'Le SYN flood reste l\'une des techniques les plus utilisées dans les attaques DDoS modernes, représentant environ 57% des attaques volumétriques',
        'En 2016, les botnets IoT comme Mirai utilisaient massivement le SYN flood dans leurs attaques'
      ]
    },
    {
      name: 'MAC Flooding',
      severity: 'Moyenne',
      frequency: 'Occasionnelle',
      description: 'Attaque ciblant les switches réseau en inondant la table d\'adresses MAC (CAM table) avec des milliers d\'adresses MAC aléatoires. Lorsque la table est pleine, le switch se comporte comme un hub et diffuse tout le trafic sur tous les ports.',
      impact: 'Le switch diffuse le trafic unicast sur tous les ports, permettant l\'interception de données, dégradation des performances réseau, possibilité d\'écoute passive de tout le trafic du segment.',
      prevention: [
        'Configurer le Port Security pour limiter le nombre d\'adresses MAC par port',
        'Activer la fonctionnalité sticky MAC pour mémoriser les adresses autorisées',
        'Surveiller les alertes de violation de port security',
        'Utiliser des switches avec des tables CAM de grande capacité',
        'Segmenter le réseau en VLAN pour limiter la portée de l\'attaque',
        'Mettre en place des outils de détection d\'anomalies de couche 2'
      ],
      real_examples: [
        'L\'outil macof, inclus dans la suite dsniff, est capable de générer 155 000 entrées MAC par minute pour saturer un switch',
        'Des tests d\'intrusion internes montrent que de nombreux switches non configurés sont vulnérables à cette attaque en moins de 30 secondes'
      ]
    },
    {
      name: 'IP Spoofing (Usurpation d\'adresse IP)',
      severity: 'Haute',
      frequency: 'Fréquente',
      description: 'Technique consistant à forger des paquets IP avec une adresse source falsifiée pour masquer l\'identité de l\'attaquant ou usurper l\'identité d\'un hôte de confiance. Utilisée dans les attaques DDoS par réflexion/amplification et le contournement de filtres basés sur l\'IP.',
      impact: 'Contournement des listes de contrôle d\'accès basées sur l\'IP, amplification d\'attaques DDoS par réflexion, usurpation d\'identité pour accéder à des services restreints, empoisonnement de cache.',
      prevention: [
        'Implémenter le filtrage ingress/egress (BCP38/RFC 2827) sur les routeurs',
        'Configurer le Reverse Path Forwarding (uRPF) sur les interfaces',
        'Utiliser l\'authentification cryptographique plutôt que l\'authentification par IP',
        'Déployer des systèmes de détection capable d\'identifier les paquets spoofés',
        'Collaborer avec les FAI pour filtrer le trafic avec des adresses source invalides',
        'Utiliser IPsec pour l\'authentification des communications critiques'
      ],
      real_examples: [
        'L\'attaque DDoS par amplification DNS de 2013 contre Spamhaus a atteint 300 Gbps en utilisant l\'IP spoofing',
        'Les attaques Memcached de 2018 ont exploité l\'IP spoofing pour amplifier le trafic par un facteur de 50 000'
      ]
    },
    {
      name: 'Evil Twin WiFi (Point d\'accès jumeau maléfique)',
      severity: 'Haute',
      frequency: 'Fréquente',
      description: 'Création d\'un faux point d\'accès Wi-Fi imitant un réseau légitime (même SSID, même apparence de portail captif). Les victimes se connectent au faux réseau, permettant à l\'attaquant d\'intercepter tout leur trafic, y compris les identifiants et les données personnelles.',
      impact: 'Interception de tous les identifiants saisis par les victimes, vol de cookies de session, injection de contenu malveillant dans les pages web, redirection vers des sites de phishing.',
      prevention: [
        'Utiliser WPA3-Enterprise avec authentification par certificat (802.1X)',
        'Configurer les appareils pour ne pas se connecter automatiquement aux réseaux connus',
        'Déployer un WIDS (Wireless Intrusion Detection System)',
        'Sensibiliser les utilisateurs aux risques des Wi-Fi publics',
        'Utiliser systématiquement un VPN sur les réseaux non maîtrisés',
        'Surveiller la présence de points d\'accès non autorisés avec des scans réguliers'
      ],
      real_examples: [
        'Des attaques Evil Twin sont régulièrement détectées dans les aéroports, gares et centres commerciaux à travers le monde',
        'En 2020, des chercheurs ont démontré qu\'un Evil Twin peut être opérationnel en moins de 5 minutes avec un Raspberry Pi à 35€'
      ]
    },
    {
      name: 'Deauthentication Attack (Attaque de désauthentification)',
      severity: 'Moyenne',
      frequency: 'Fréquente',
      description: 'Attaque qui exploite les trames de gestion 802.11 non chiffrées pour forcer la déconnexion des clients d\'un réseau Wi-Fi. L\'attaquant envoie de fausses trames de désauthentification au nom du point d\'accès, déconnectant les victimes à répétition.',
      impact: 'Déni de service Wi-Fi ciblé ou global, forçage de reconnexion vers un Evil Twin, capture du handshake WPA pour une attaque par dictionnaire hors ligne, perturbation des services Wi-Fi critiques.',
      prevention: [
        'Déployer des points d\'accès compatibles 802.11w (Management Frame Protection)',
        'Activer le PMF (Protected Management Frames) obligatoire',
        'Migrer vers WPA3 qui intègre la protection des trames de gestion',
        'Déployer un WIDS capable de détecter les attaques de désauthentification',
        'Configurer des alertes sur les événements de désassociation anormaux',
        'Réduire la puissance d\'émission pour limiter la portée du signal'
      ],
      real_examples: [
        'L\'outil aireplay-ng est largement utilisé dans les formations de sécurité pour démontrer cette vulnérabilité',
        'Des dispositifs IoT de sécurité domestique utilisent les deauth attacks pour brouiller les caméras de surveillance Wi-Fi'
      ]
    },
    {
      name: 'KRACK (Key Reinstallation Attack)',
      severity: 'Critique',
      frequency: 'Occasionnelle',
      description: 'Vulnérabilité découverte en 2017 dans le protocole WPA2 permettant de forcer la réinstallation de clés de chiffrement déjà utilisées. L\'attaque cible le processus de poignée de main à quatre étapes du WPA2, compromettant la confidentialité des communications Wi-Fi.',
      impact: 'Déchiffrement du trafic Wi-Fi WPA2, injection de paquets dans les connexions, vol de données sensibles transitant sur le Wi-Fi, possibilité de forger des paquets sur les réseaux Android et Linux.',
      prevention: [
        'Appliquer les correctifs de sécurité sur tous les appareils Wi-Fi (clients et AP)',
        'Migrer vers WPA3 qui corrige structurellement cette vulnérabilité',
        'Utiliser HTTPS et des VPN pour ajouter des couches de chiffrement supplémentaires',
        'Mettre à jour les firmwares des points d\'accès régulièrement',
        'Surveiller les avis de sécurité des fabricants d\'équipements Wi-Fi',
        'Déployer la détection d\'anomalies sur le réseau sans fil'
      ],
      real_examples: [
        'La découverte de KRACK par Mathy Vanhoef en 2017 a affecté quasiment tous les appareils Wi-Fi du monde utilisant WPA2',
        'Android 6.0 et Linux étaient particulièrement vulnérables car ils réinstallaient une clé de chiffrement entièrement à zéro'
      ]
    },
    {
      name: 'Heartbleed',
      severity: 'Critique',
      frequency: 'Rare',
      description: 'Vulnérabilité critique (CVE-2014-0160) dans la bibliothèque OpenSSL, affectant l\'extension Heartbeat du protocole TLS. Permet de lire jusqu\'à 64 Ko de mémoire du serveur à chaque requête, exposant potentiellement des clés privées, des identifiants et des données sensibles.',
      impact: 'Fuite de clés privées SSL/TLS du serveur, exposition des identifiants utilisateurs en mémoire, vol de cookies de session, compromission totale de la confidentialité des communications chiffrées.',
      prevention: [
        'Mettre à jour OpenSSL vers une version corrigée (1.0.1g ou supérieure)',
        'Régénérer et révoquer tous les certificats SSL après la mise à jour',
        'Changer tous les mots de passe potentiellement exposés',
        'Activer le Perfect Forward Secrecy (PFS) pour limiter l\'impact',
        'Scanner régulièrement les services pour détecter les versions vulnérables',
        'Compiler OpenSSL sans l\'extension Heartbeat si elle n\'est pas nécessaire'
      ],
      real_examples: [
        'Au moment de sa découverte en 2014, Heartbleed affectait environ 17% des serveurs web sécurisés par SSL dans le monde',
        'L\'Agence du Revenu du Canada a été piratée via Heartbleed, exposant les numéros d\'assurance sociale de 900 contribuables'
      ]
    },
    {
      name: 'Spectre/Meltdown côté réseau',
      severity: 'Haute',
      frequency: 'Rare',
      description: 'Exploitation des vulnérabilités matérielles Spectre et Meltdown dans les processeurs pour extraire des données sensibles via le réseau. Les attaques ciblent les serveurs partagés (cloud, virtualisation) et les équipements réseau embarquant des processeurs vulnérables.',
      impact: 'Extraction de données sensibles depuis la mémoire d\'autres processus ou machines virtuelles, compromission de l\'isolation entre locataires dans le cloud, fuite de clés de chiffrement réseau.',
      prevention: [
        'Appliquer les correctifs microcode des processeurs (Intel, AMD, ARM)',
        'Mettre à jour les hyperviseurs et les systèmes d\'exploitation',
        'Activer les mitigations KPTI et les barrières de spéculation',
        'Isoler les charges de travail sensibles sur du matériel dédié',
        'Surveiller les performances pour détecter les attaques par canal auxiliaire',
        'Évaluer le passage à des processeurs de nouvelle génération corrigés'
      ],
      real_examples: [
        'Des chercheurs de Graz University ont démontré NetSpectre, une variante exploitable à distance via le réseau avec un débit de 60 bits par heure',
        'Les fournisseurs cloud comme AWS, Azure et GCP ont dû appliquer des correctifs en urgence, entraînant des redémarrages massifs de serveurs en 2018'
      ]
    },
    {
      name: 'Zero-Day Exploits réseau',
      severity: 'Critique',
      frequency: 'Rare',
      description: 'Exploitation de vulnérabilités réseau inconnues du fabricant et pour lesquelles aucun correctif n\'existe. Ces failles sont particulièrement dangereuses car les systèmes de détection basés sur les signatures ne peuvent pas les identifier. Elles sont souvent utilisées par des groupes APT étatiques.',
      impact: 'Compromission totale et indétectable des systèmes, persistance prolongée dans les réseaux victimes, vol de données massif avant toute détection possible, potentiel de propagation rapide.',
      prevention: [
        'Déployer des solutions de détection comportementale et d\'anomalies',
        'Appliquer le principe de moindre privilège et la segmentation réseau',
        'Maintenir une veille active sur les menaces émergentes (Threat Intelligence)',
        'Participer à des programmes de bug bounty pour découvrir les failles en amont',
        'Mettre en place une défense en profondeur ne reposant pas sur un seul contrôle',
        'Utiliser le sandboxing pour analyser les fichiers et exécutables suspects'
      ],
      real_examples: [
        'Stuxnet en 2010 utilisait quatre vulnérabilités zero-day pour cibler les centrifugeuses nucléaires iraniennes via le réseau',
        'En 2021, les vulnérabilités zero-day ProxyLogon dans Microsoft Exchange ont été exploitées par le groupe Hafnium pour compromettre des milliers de serveurs'
      ]
    },
    {
      name: 'Supply Chain Attack réseau (Attaque de la chaîne d\'approvisionnement)',
      severity: 'Critique',
      frequency: 'Rare',
      description: 'Attaque visant à compromettre les équipements ou logiciels réseau directement chez le fabricant ou le fournisseur, avant leur livraison au client final. L\'attaquant insère des backdoors dans les mises à jour logicielles, les firmwares ou le matériel réseau.',
      impact: 'Compromission silencieuse de milliers d\'organisations utilisant le même fournisseur, accès persistant et difficile à détecter, perte de confiance dans la chaîne d\'approvisionnement technologique, impact potentiel à l\'échelle nationale.',
      prevention: [
        'Vérifier l\'intégrité des mises à jour avec les signatures cryptographiques',
        'Auditer régulièrement les fournisseurs et leurs pratiques de sécurité',
        'Déployer la détection d\'anomalies pour identifier les comportements suspects',
        'Maintenir un inventaire précis de tous les composants logiciels (SBOM)',
        'Tester les mises à jour dans un environnement isolé avant déploiement',
        'Diversifier les fournisseurs pour réduire l\'impact d\'une compromission unique'
      ],
      real_examples: [
        'L\'attaque SolarWinds en 2020 a compromis la mise à jour Orion, infectant 18 000 organisations dont des agences gouvernementales américaines',
        'En 2017, le logiciel de comptabilité ukrainien M.E.Doc a été compromis pour distribuer le malware NotPetya, causant 10 milliards de dollars de dégâts mondiaux'
      ]
    }
  ]
};

const securityData = {
  devices: [
    {
      name: 'WiFi Pineapple',
      description: 'Dispositif de test d\'intrusion Wi-Fi développé par Hak5, conçu pour auditer la sécurité des réseaux sans fil. Il peut créer de faux points d\'accès, intercepter le trafic Wi-Fi et effectuer des attaques Man-in-the-Middle sur les réseaux sans fil environnants.',
      usage: 'Création automatique de points d\'accès Evil Twin, capture du trafic Wi-Fi, attaques de désauthentification, test des politiques de connexion automatique des clients, audit de la sécurité des réseaux sans fil d\'entreprise.',
      protection: 'Déployer WPA3-Enterprise avec authentification par certificat, désactiver la connexion automatique aux réseaux Wi-Fi connus, utiliser un WIDS pour détecter les points d\'accès non autorisés, former les utilisateurs à vérifier les réseaux avant connexion.',
      legality: 'Légal uniquement pour les tests d\'intrusion autorisés avec consentement écrit. L\'utilisation non autorisée constitue une infraction au Code pénal (article 323-1) et peut être punie de 2 à 5 ans d\'emprisonnement et de 60 000 à 150 000€ d\'amende en France.'
    },
    {
      name: 'USB Rubber Ducky',
      description: 'Clé USB d\'apparence ordinaire qui se fait passer pour un clavier lorsqu\'elle est connectée à un ordinateur. Elle exécute automatiquement des séquences de frappes préprogrammées à une vitesse surhumaine, permettant l\'exécution de commandes en quelques secondes.',
      usage: 'Injection de commandes clavier à haute vitesse, installation de backdoors, extraction de données, création de comptes administrateurs, exfiltration de mots de passe Wi-Fi stockés, désactivation d\'antivirus.',
      protection: 'Désactiver les ports USB non utilisés via les GPO, déployer des solutions de contrôle des périphériques USB (endpoint DLP), configurer les politiques de sécurité pour bloquer les nouveaux claviers, utiliser des solutions de liste blanche d\'appareils.',
      legality: 'L\'appareil en lui-même est légal à l\'achat et à la détention. Son utilisation sur des systèmes sans autorisation est illégale et constitue un accès frauduleux à un système de traitement automatisé de données (article 323-1 du Code pénal).'
    },
    {
      name: 'LAN Turtle',
      description: 'Dispositif d\'administration système et de test d\'intrusion en forme d\'adaptateur USB-Ethernet. Il s\'insère discrètement entre un ordinateur et le réseau, permettant un accès distant, la capture de trafic et la reconnaissance réseau de manière persistante.',
      usage: 'Accès distant persistant via reverse shell, capture de trafic réseau (man-in-the-middle), reconnaissance DNS, scan de réseau automatisé, exfiltration de données via tunnel SSH, pivoting dans le réseau interne.',
      protection: 'Inspecter physiquement les connexions réseau, utiliser le 802.1X pour l\'authentification réseau, surveiller les nouveaux appareils sur le réseau avec un NAC, chiffrer tout le trafic sensible de bout en bout.',
      legality: 'Outil professionnel de pentest légal dans le cadre de missions autorisées. L\'installation non autorisée sur un réseau constitue une intrusion dans un système informatique.'
    },
    {
      name: 'Bash Bunny',
      description: 'Plateforme d\'attaque USB multifonction de Hak5 qui peut émuler simultanément un clavier, un stockage USB, un port série et une interface réseau Ethernet. Son système Linux embarqué permet des charges utiles complexes et modulaires.',
      usage: 'Combinaison d\'attaques multi-vecteurs (clavier + stockage + réseau), exfiltration de données vers stockage intégré, déploiement de malwares, attaques réseau via émulation Ethernet, bypass de contrôles de sécurité USB.',
      protection: 'Implémenter un contrôle strict des périphériques USB avec politique de liste blanche, configurer l\'UAC au niveau maximum, désactiver l\'exécution automatique, utiliser des solutions EDR avancées capables de détecter les injections de frappes.',
      legality: 'Outil de sécurité professionnel légal à posséder. Son utilisation nécessite une autorisation écrite formelle dans le cadre d\'un test d\'intrusion. L\'utilisation malveillante expose à des poursuites pénales.'
    },
    {
      name: 'Packet Squirrel',
      description: 'Dispositif d\'interception réseau inline de Hak5 qui s\'insère entre un appareil et le réseau via Ethernet. Il permet la capture de paquets, le logging réseau et la création de tunnels VPN de manière complètement transparente pour les systèmes de détection.',
      usage: 'Capture passive de tout le trafic réseau traversant le lien, enregistrement PCAP sur clé USB, création de tunnels VPN pour l\'exfiltration, interception et modification de paquets en temps réel, surveillance réseau discrète.',
      protection: 'Inspecter régulièrement les connexions physiques réseau, utiliser le chiffrement de bout en bout (TLS/IPsec), déployer la détection d\'anomalies réseau, mettre en place le monitoring des changements de topologie.',
      legality: 'Légal pour l\'administration réseau et les tests d\'intrusion autorisés. L\'interception non autorisée de communications constitue une violation de la confidentialité des correspondances (article 226-15 du Code pénal).'
    },
    {
      name: 'HackRF One',
      description: 'Périphérique SDR (Software Defined Radio) open source capable d\'émettre et recevoir des signaux radio de 1 MHz à 6 GHz. Il permet d\'analyser, intercepter et transmettre sur pratiquement toutes les fréquences radio utilisées par les technologies modernes.',
      usage: 'Analyse des protocoles radio (Wi-Fi, Bluetooth, Zigbee, LoRa), capture et rejeu de signaux de télécommandes et badges, analyse des communications cellulaires, interception de signaux GPS, recherche de vulnérabilités dans les protocoles radio.',
      protection: 'Utiliser des protocoles radio avec chiffrement et codes tournants, implémenter l\'authentification mutuelle dans les communications sans fil, surveiller les interférences radio anormales, utiliser le frequency hopping pour les communications critiques.',
      legality: 'La réception est généralement légale, mais l\'émission est strictement réglementée par l\'ANFR et l\'ARCEP en France. L\'interception de communications privées et l\'émission sans licence sont des infractions pénales.'
    },
    {
      name: 'Proxmark3',
      description: 'Outil de recherche et de test pour les technologies RFID et NFC. Il peut lire, émuler et cloner des cartes RFID basse fréquence (125 kHz) et haute fréquence (13,56 MHz), incluant les badges d\'accès, les cartes de transport et les cartes bancaires sans contact.',
      usage: 'Lecture et analyse des badges d\'accès RFID, clonage de cartes d\'accès pour les tests d\'intrusion physique, émulation de tags NFC, audit de la sécurité des systèmes de contrôle d\'accès, test des protections anti-clonage.',
      protection: 'Déployer des cartes RFID avec chiffrement fort (MIFARE DESFire EV3), implémenter l\'authentification mutuelle, utiliser des protections anti-clonage matérielles, combiner le badge avec un code PIN ou la biométrie pour l\'authentification multi-facteurs.',
      legality: 'Légal pour la recherche et les tests de sécurité autorisés. Le clonage non autorisé de badges d\'accès ou de cartes bancaires constitue une contrefaçon et une fraude, passibles de sanctions pénales sévères.'
    },
    {
      name: 'Flipper Zero',
      description: 'Outil portable multiprotocole de test de sécurité combinant les capacités RFID, NFC, infrarouge, radio sub-GHz, Bluetooth et GPIO dans un appareil compact avec écran. Surnommé le couteau suisse du hacker, il rend accessibles des tests autrefois réservés aux experts.',
      usage: 'Lecture et émulation de badges RFID, capture et rejeu de télécommandes radio, analyse des protocoles infrarouge, sniffing Bluetooth Low Energy, test des systèmes IoT, analyse des signaux sub-GHz (portails, voitures, capteurs).',
      protection: 'Utiliser des protocoles avec codes tournants (KeeLoq rolling codes), implémenter le chiffrement dans toutes les communications sans fil, mettre à jour les systèmes IoT vulnérables, combiner plusieurs facteurs d\'authentification.',
      legality: 'L\'appareil est légal à posséder dans la plupart des pays. Son utilisation pour accéder sans autorisation à des systèmes, cloner des badges ou interférer avec des communications est illégale. Le Brésil et le Canada ont temporairement restreint son importation.'
    },
    {
      name: 'Alfa WiFi Adapter (AWUS036ACH)',
      description: 'Adaptateur Wi-Fi USB haute puissance avec antennes externes, populaire dans la communauté de la sécurité pour sa compatibilité avec le mode moniteur et l\'injection de paquets. Supporte les bandes 2,4 GHz et 5 GHz avec une portée de réception largement supérieure aux adaptateurs standard.',
      usage: 'Capture de trafic Wi-Fi en mode moniteur, injection de paquets pour les tests de sécurité, audit de la couverture et de la puissance du signal, attaques de désauthentification, capture de handshakes WPA pour les tests de robustesse des mots de passe.',
      protection: 'Utiliser WPA3 avec des mots de passe robustes, activer le 802.11w (PMF), déployer un WIDS pour détecter l\'injection de paquets, réduire la puissance d\'émission des AP pour limiter la zone de couverture.',
      legality: 'L\'adaptateur est légal à l\'achat et à l\'utilisation. La capture de trafic Wi-Fi de tiers et l\'injection de paquets sur des réseaux non autorisés sont illégales en France.'
    },
    {
      name: 'Ubertooth One',
      description: 'Plateforme open source de développement et de test pour le protocole Bluetooth. Premier outil abordable permettant le sniffing Bluetooth complet, incluant la capture des paquets Bluetooth Classic et Bluetooth Low Energy sur les 79 canaux.',
      usage: 'Capture et analyse du trafic Bluetooth, suivi des appareils Bluetooth par leur adresse MAC, recherche de vulnérabilités dans les implémentations Bluetooth, test de la sécurité des objets connectés utilisant BLE, analyse des protocoles de couplage.',
      protection: 'Désactiver le Bluetooth quand il n\'est pas utilisé, utiliser le mode non-découvrable, implémenter Secure Simple Pairing, mettre à jour les firmwares Bluetooth, utiliser le filtrage par adresse MAC et le chiffrement BLE de niveau 4.',
      legality: 'Outil de recherche légal à posséder. L\'interception de communications Bluetooth de tiers sans autorisation est illégale et constitue une atteinte au secret des correspondances.'
    },
    {
      name: 'KeySweeper',
      description: 'Dispositif de surveillance déguisé en chargeur USB mural, conçu par Samy Kamkar, qui intercepte passivement et déchiffre les frappes clavier des claviers sans fil Microsoft utilisant le protocole propriétaire 2,4 GHz non sécurisé.',
      usage: 'Capture passive et en temps réel de toutes les frappes des claviers sans fil vulnérables dans un rayon de 30 mètres, enregistrement des données sur carte SD, transmission des captures par SMS ou via réseau, fonctionnement continu sur alimentation secteur.',
      protection: 'Remplacer les claviers sans fil vulnérables par des modèles Bluetooth chiffrés ou filaires, utiliser des claviers avec chiffrement AES 128 bits, inspecter les chargeurs USB suspects dans les espaces partagés, sensibiliser les employés.',
      legality: 'La fabrication et la possession à des fins de recherche sont dans une zone grise. L\'utilisation pour intercepter les frappes d\'autrui est clairement illégale et constitue une atteinte à la vie privée et un accès frauduleux.'
    },
    {
      name: 'O.MG Cable',
      description: 'Câble USB (Lightning, USB-C ou Micro-USB) d\'apparence parfaitement normale intégrant un implant Wi-Fi et un microcontrôleur. Il fonctionne comme un câble de charge normal tout en permettant l\'injection de frappes clavier et le contrôle à distance via Wi-Fi.',
      usage: 'Injection de charges utiles clavier à distance via Wi-Fi, keylogging bidirectionnel, création d\'un point d\'accès Wi-Fi pour le contrôle, exfiltration de données, persistance physique indétectable visuellement sur le poste de la victime.',
      protection: 'Utiliser uniquement des câbles USB de confiance et vérifiés, déployer des bloqueurs de données USB (USB condoms), implémenter des politiques de contrôle des périphériques, inspecter les câbles dans les environnements sensibles.',
      legality: 'Développé comme outil de recherche en sécurité. L\'utilisation pour compromettre des systèmes sans autorisation est illégale. La possession à des fins malveillantes peut être considérée comme détention d\'un outil de piratage.'
    },
    {
      name: 'Screen Crab',
      description: 'Dispositif d\'interception vidéo HDMI de Hak5 qui se place entre un ordinateur et un écran. Il capture silencieusement tout ce qui s\'affiche à l\'écran en enregistrant les images sur une carte SD ou en les diffusant via le réseau, sans aucune indication visible.',
      usage: 'Capture d\'écran continue et silencieuse de tout le contenu affiché, streaming vidéo en temps réel via le cloud, enregistrement sur carte micro SD, surveillance discrète des activités d\'un poste de travail, capture de données affichées.',
      protection: 'Inspecter physiquement les connexions HDMI/DisplayPort, utiliser des câbles vidéo sécurisés avec détection d\'interception, surveiller les ports HDMI pour les appareils non autorisés, sécuriser l\'accès physique aux postes de travail.',
      legality: 'L\'enregistrement non autorisé de l\'activité d\'autrui constitue une surveillance illégale, une atteinte à la vie privée et potentiellement un accès frauduleux aux données. Légal uniquement dans le cadre de tests d\'intrusion autorisés.'
    },
    {
      name: 'Shark Jack',
      description: 'Outil portable d\'audit réseau de Hak5 en forme de dongle Ethernet. Il effectue automatiquement une reconnaissance réseau dès qu\'il est branché sur un port RJ45, collectant les informations sur le réseau, les hôtes et les services en quelques secondes.',
      usage: 'Reconnaissance réseau automatisée en moins de 15 secondes, scan Nmap des hôtes et services, collecte d\'informations sur les VLAN et la topologie, exfiltration des résultats sur stockage interne, attaques scriptées via payloads Bash.',
      protection: 'Mettre en œuvre le 802.1X sur tous les ports réseau physiques, désactiver les ports Ethernet non utilisés, déployer un NAC (Network Access Control), surveiller les connexions de nouveaux appareils en temps réel.',
      legality: 'Outil de pentest professionnel légal dans le cadre de missions autorisées. La connexion non autorisée au réseau d\'autrui et la reconnaissance sans permission constituent des infractions pénales.'
    },
    {
      name: 'Signal Owl',
      description: 'Plateforme de test de sécurité Wi-Fi et Bluetooth de Hak5, conçue pour l\'exécution automatisée d\'audits sans fil. L\'appareil compact exécute des charges utiles prédéfinies pour la surveillance des signaux, la capture de paquets et les tests de pénétration sans fil.',
      usage: 'Surveillance automatisée des réseaux Wi-Fi environnants, détection de points d\'accès non autorisés, capture de handshakes WPA, audit de conformité de la sécurité sans fil, scanning Bluetooth et BLE, journalisation des signaux.',
      protection: 'Utiliser WPA3-Enterprise, déployer un WIPS (Wireless Intrusion Prevention System), surveiller le spectre radio pour détecter les appareils non autorisés, réaliser des audits sans fil réguliers, segmenter le réseau Wi-Fi.',
      legality: 'Outil d\'audit professionnel légal pour les tests autorisés. La surveillance non autorisée des réseaux sans fil d\'autrui est illégale, même en mode passif, selon la législation française sur les interceptions.'
    }
  ],

  protection_methods: [
    {
      name: 'Firewall Next-Gen (NGFW)',
      description: 'Pare-feu de nouvelle génération intégrant l\'inspection approfondie des paquets (DPI), la prévention d\'intrusion (IPS), le filtrage applicatif, l\'antimalware et la détection des menaces avancées dans une seule plateforme unifiée. Contrairement aux pare-feu traditionnels, il analyse le contenu des flux et identifie les applications indépendamment du port utilisé.',
      implementation: [
        'Réaliser un audit complet des flux réseau existants et des règles actuelles',
        'Sélectionner un NGFW adapté au débit réseau (Palo Alto, Fortinet, Check Point)',
        'Déployer en mode transparent (TAP) pendant 2 semaines pour analyser le trafic',
        'Configurer les politiques de sécurité basées sur les applications et les utilisateurs',
        'Activer l\'inspection SSL/TLS avec exclusions pour les flux bancaires et médicaux',
        'Mettre en place les profils de protection (antivirus, anti-spyware, filtrage URL)',
        'Configurer les alertes et les tableaux de bord de supervision',
        'Basculer en mode blocage progressivement par zone réseau'
      ],
      tools: ['Palo Alto Networks PA-Series', 'Fortinet FortiGate', 'Check Point Quantum', 'Cisco Firepower', 'Sophos XGS']
    },
    {
      name: 'Segmentation réseau',
      description: 'Stratégie de sécurité consistant à diviser le réseau en segments isolés pour limiter la propagation des menaces et contrôler finement les flux entre les zones. La micro-segmentation pousse ce concept jusqu\'au niveau des charges de travail individuelles, appliquant le principe du moindre privilège à chaque communication.',
      implementation: [
        'Cartographier l\'ensemble des flux réseau et identifier les zones de confiance',
        'Définir l\'architecture de segmentation (VLAN, VRF, micro-segmentation)',
        'Créer les VLAN et sous-réseaux selon les zones fonctionnelles',
        'Configurer les ACL et les règles de pare-feu inter-zones',
        'Déployer la micro-segmentation via VMware NSX ou Cisco ACI',
        'Implémenter le NAC pour contrôler l\'attribution des VLAN',
        'Tester la communication entre zones et valider les flux autorisés',
        'Documenter la matrice de flux et mettre en place la revue périodique'
      ],
      tools: ['VMware NSX-T', 'Cisco ACI', 'Illumio Core', 'Guardicore Centra', 'Cisco ISE pour NAC']
    },
    {
      name: 'Chiffrement end-to-end',
      description: 'Protection des données en transit par un chiffrement de bout en bout garantissant que seuls l\'expéditeur et le destinataire peuvent lire le contenu des communications. Même si le trafic est intercepté, les données restent illisibles sans les clés de déchiffrement appropriées.',
      implementation: [
        'Inventorier tous les flux de données sensibles à chiffrer',
        'Déployer TLS 1.3 sur tous les serveurs web et services API',
        'Configurer IPsec ou WireGuard pour les tunnels VPN site à site',
        'Implémenter le chiffrement des bases de données au repos (AES-256)',
        'Déployer une infrastructure à clés publiques (PKI) pour la gestion des certificats',
        'Configurer le Perfect Forward Secrecy sur toutes les connexions TLS',
        'Mettre en place la rotation automatique des clés de chiffrement',
        'Auditer régulièrement la configuration cryptographique avec testssl.sh'
      ],
      tools: ['Let\'s Encrypt', 'HashiCorp Vault', 'OpenSSL', 'WireGuard', 'StrongSwan IPsec']
    },
    {
      name: 'Authentification multi-facteurs (MFA)',
      description: 'Méthode d\'authentification exigeant la vérification de l\'identité via au moins deux facteurs distincts : quelque chose que l\'on sait (mot de passe), quelque chose que l\'on possède (token, smartphone) et/ou quelque chose que l\'on est (biométrie). Réduit drastiquement le risque de compromission de compte.',
      implementation: [
        'Recenser tous les accès critiques nécessitant une authentification renforcée',
        'Sélectionner les méthodes MFA adaptées (TOTP, FIDO2, push notification)',
        'Déployer une solution MFA centralisée (Azure AD, Duo, Okta)',
        'Configurer le MFA sur tous les accès VPN, messagerie et applications cloud',
        'Distribuer les tokens matériels (YubiKey) aux utilisateurs privilégiés',
        'Configurer les politiques d\'accès conditionnel basées sur le risque',
        'Former les utilisateurs et mettre en place un support dédié à l\'enrôlement',
        'Désactiver les méthodes d\'authentification faibles (SMS si possible)'
      ],
      tools: ['Microsoft Authenticator', 'YubiKey (FIDO2)', 'Duo Security', 'Google Authenticator', 'Okta Verify']
    },
    {
      name: 'SIEM (Security Information and Event Management)',
      description: 'Plateforme centralisée de collecte, corrélation et analyse des journaux de sécurité provenant de l\'ensemble de l\'infrastructure IT. Le SIEM détecte les menaces en temps réel en corrélant les événements de multiples sources, permet la conformité réglementaire et facilite l\'investigation des incidents.',
      implementation: [
        'Définir les cas d\'usage de détection prioritaires et les sources de données',
        'Dimensionner l\'infrastructure SIEM selon le volume de logs (EPS)',
        'Déployer les agents de collecte sur les serveurs, pare-feu et endpoints',
        'Configurer l\'ingestion des logs réseau (NetFlow, syslog, SNMP)',
        'Créer les règles de corrélation et les alertes pour les menaces prioritaires',
        'Développer les tableaux de bord opérationnels et de conformité',
        'Intégrer les flux de Threat Intelligence pour enrichir les alertes',
        'Mettre en place les procédures de réponse aux alertes et les playbooks SOAR'
      ],
      tools: ['Splunk Enterprise Security', 'IBM QRadar', 'Elastic SIEM', 'Microsoft Sentinel', 'Wazuh (open source)']
    },
    {
      name: 'Patch Management (Gestion des correctifs)',
      description: 'Processus structuré d\'identification, de test et de déploiement des correctifs de sécurité sur l\'ensemble de l\'infrastructure IT. Une gestion rigoureuse des correctifs réduit la surface d\'attaque en éliminant les vulnérabilités connues avant qu\'elles ne soient exploitées.',
      implementation: [
        'Créer un inventaire exhaustif de tous les actifs et logiciels déployés',
        'Mettre en place une veille de vulnérabilités (CVE, CERT-FR, éditeurs)',
        'Définir les SLA de déploiement par niveau de criticité (critique < 48h)',
        'Configurer un serveur de distribution centralisé (WSUS, SCCM, Ansible)',
        'Créer un environnement de test représentatif pour la validation',
        'Déployer les correctifs par vagues progressives (pilote puis production)',
        'Surveiller le taux de conformité avec des scans de vulnérabilités réguliers',
        'Documenter les exceptions et les risques acceptés par la direction'
      ],
      tools: ['Microsoft SCCM/Intune', 'ManageEngine Patch Manager Plus', 'Ansible', 'WSUS', 'Qualys VMDR']
    },
    {
      name: 'Formation et sensibilisation à la sécurité',
      description: 'Programme continu de formation des collaborateurs aux bonnes pratiques de cybersécurité et aux menaces actuelles. Le facteur humain étant impliqué dans 82% des incidents de sécurité, la sensibilisation est l\'un des contrôles de sécurité les plus efficaces et les plus rentables.',
      implementation: [
        'Évaluer le niveau de maturité cyber actuel des collaborateurs par un test initial',
        'Concevoir un programme de formation adapté par profil (direction, IT, métiers)',
        'Déployer des campagnes de phishing simulé mensuelles',
        'Organiser des ateliers pratiques trimestriels sur les menaces actuelles',
        'Créer une charte informatique et s\'assurer de sa signature par tous les employés',
        'Mettre en place des ambassadeurs sécurité dans chaque département',
        'Mesurer l\'évolution des indicateurs (taux de clic phishing, signalements)',
        'Récompenser les comportements sécuritaires et les signalements d\'incidents'
      ],
      tools: ['KnowBe4', 'Cofense PhishMe', 'Proofpoint Security Awareness', 'SANS Security Awareness', 'Terranova Security']
    },
    {
      name: 'Sauvegarde 3-2-1',
      description: 'Stratégie de sauvegarde éprouvée consistant à maintenir au minimum 3 copies des données, sur 2 types de supports différents, dont 1 copie hors site. Cette approche garantit la résilience face aux ransomwares, pannes matérielles, catastrophes naturelles et erreurs humaines.',
      implementation: [
        'Classifier les données par criticité et définir les RPO/RTO par catégorie',
        'Configurer les sauvegardes locales sur NAS avec snapshots toutes les heures',
        'Mettre en place la réplication vers un second support (bandes LTO, disques externes)',
        'Déployer la sauvegarde cloud chiffrée vers un provider géographiquement distant',
        'Activer l\'immuabilité des sauvegardes (WORM) pour protéger contre les ransomwares',
        'Configurer les alertes en cas d\'échec de sauvegarde',
        'Tester la restauration complète trimestriellement avec chronomètre',
        'Documenter les procédures de restauration et les maintenir à jour'
      ],
      tools: ['Veeam Backup & Replication', 'Acronis Cyber Protect', 'Commvault', 'AWS S3 Glacier', 'Synology Active Backup']
    },
    {
      name: 'Tests d\'intrusion (Pen Testing)',
      description: 'Simulation contrôlée d\'attaques informatiques réalisée par des experts en sécurité pour identifier les vulnérabilités exploitables dans l\'infrastructure, les applications et les processus. Les tests d\'intrusion fournissent une évaluation réaliste de la posture de sécurité et des recommandations concrètes de remédiation.',
      implementation: [
        'Définir le périmètre, les objectifs et les règles d\'engagement du test',
        'Sélectionner le type de test adapté (boîte noire, grise ou blanche)',
        'Mandater un prestataire certifié (PASSI en France) ou constituer une Red Team interne',
        'Réaliser la phase de reconnaissance et d\'énumération des cibles',
        'Exploiter les vulnérabilités identifiées de manière contrôlée',
        'Documenter chaque vulnérabilité avec sa preuve d\'exploitation et sa criticité CVSS',
        'Présenter les résultats à la direction et aux équipes techniques',
        'Planifier et suivre la remédiation, puis réaliser un retest de validation'
      ],
      tools: ['Kali Linux', 'Burp Suite Professional', 'Metasploit Framework', 'Nessus Professional', 'Cobalt Strike']
    },
    {
      name: 'Architecture Zero Trust',
      description: 'Modèle de sécurité basé sur le principe « ne jamais faire confiance, toujours vérifier ». Contrairement au modèle périmétrique traditionnel, le Zero Trust considère que chaque requête d\'accès doit être authentifiée, autorisée et chiffrée, indépendamment de sa provenance (interne ou externe).',
      implementation: [
        'Cartographier tous les flux de données et les ressources à protéger',
        'Déployer l\'authentification forte (MFA) sur tous les points d\'accès',
        'Implémenter la micro-segmentation pour isoler les charges de travail',
        'Configurer des politiques d\'accès conditionnel basées sur le contexte',
        'Déployer un SDP (Software-Defined Perimeter) ou ZTNA',
        'Mettre en place la vérification continue de la posture des appareils',
        'Chiffrer toutes les communications, même sur le réseau interne',
        'Implémenter le principe du moindre privilège avec révision périodique'
      ],
      tools: ['Zscaler Private Access', 'Cloudflare Access', 'Google BeyondCorp', 'Microsoft Entra ID', 'Palo Alto Prisma Access']
    },
    {
      name: 'Network Access Control (NAC)',
      description: 'Solution de contrôle d\'accès qui vérifie l\'identité et la conformité de chaque appareil avant de l\'autoriser à se connecter au réseau. Le NAC peut vérifier l\'état de l\'antivirus, les correctifs installés, la configuration de sécurité et l\'identité de l\'utilisateur pour décider du niveau d\'accès accordé.',
      implementation: [
        'Inventorier tous les types d\'appareils se connectant au réseau',
        'Définir les politiques de conformité par catégorie d\'appareil',
        'Déployer l\'infrastructure 802.1X sur les switches et les points d\'accès',
        'Configurer le serveur RADIUS (ISE, FreeRADIUS, NPS)',
        'Créer les profils d\'accès (employé, invité, IoT, BYOD)',
        'Configurer le portail captif pour les invités et les appareils non conformes',
        'Mettre en place les VLAN de quarantaine pour la remédiation',
        'Tester avec un groupe pilote avant le déploiement global'
      ],
      tools: ['Cisco ISE', 'Aruba ClearPass', 'FortiNAC', 'PacketFence (open source)', 'Portnox CLEAR']
    },
    {
      name: 'Data Loss Prevention (DLP)',
      description: 'Ensemble de technologies et de processus visant à empêcher la fuite de données sensibles en dehors de l\'organisation. Le DLP surveille, détecte et bloque les transferts non autorisés de données confidentielles via email, web, USB, cloud et impression.',
      implementation: [
        'Classifier les données sensibles de l\'organisation (RGPD, propriété intellectuelle)',
        'Définir les politiques DLP par type de données et canal de communication',
        'Déployer le DLP endpoint sur les postes de travail',
        'Configurer le DLP réseau pour l\'inspection du trafic sortant',
        'Intégrer le DLP cloud pour les services SaaS (Microsoft 365, Google Workspace)',
        'Créer les règles de détection basées sur les expressions régulières et le fingerprinting',
        'Configurer les actions (alerter, bloquer, chiffrer) par niveau de sensibilité',
        'Former les équipes sur les procédures de gestion des incidents DLP'
      ],
      tools: ['Microsoft Purview DLP', 'Symantec DLP', 'Digital Guardian', 'Forcepoint DLP', 'Trellix DLP']
    },
    {
      name: 'Threat Intelligence (Renseignement sur les menaces)',
      description: 'Collecte, analyse et exploitation d\'informations sur les menaces cybernétiques pour anticiper et prévenir les attaques. La Threat Intelligence fournit le contexte nécessaire pour comprendre qui attaque, comment, pourquoi et quels indicateurs de compromission (IoC) surveiller.',
      implementation: [
        'Définir les besoins en renseignement selon le profil de risque de l\'organisation',
        'S\'abonner aux flux de Threat Intelligence pertinents (CERT-FR, MISP, STIX/TAXII)',
        'Intégrer les IoC dans les outils de sécurité (SIEM, pare-feu, EDR)',
        'Mettre en place une plateforme de Threat Intelligence (TIP) centralisée',
        'Automatiser l\'enrichissement des alertes avec le contexte de menace',
        'Produire des bulletins de renseignement périodiques pour les décideurs',
        'Participer aux communautés de partage (ISAC, FIRST, InterCERT)',
        'Évaluer régulièrement la pertinence et la qualité des sources d\'intelligence'
      ],
      tools: ['MISP (open source)', 'Recorded Future', 'Mandiant Advantage', 'ThreatConnect', 'AlienVault OTX']
    },
    {
      name: 'Plan de réponse aux incidents (Incident Response Plan)',
      description: 'Document formalisé décrivant les procédures à suivre en cas d\'incident de sécurité, de la détection initiale à la clôture et aux leçons apprises. Un plan de réponse efficace réduit le temps de détection et de confinement, limitant ainsi l\'impact financier et opérationnel des incidents.',
      implementation: [
        'Constituer une équipe de réponse aux incidents (CSIRT) avec des rôles définis',
        'Définir la classification des incidents par niveau de gravité (P1 à P4)',
        'Rédiger les procédures de réponse pour chaque type d\'incident (ransomware, fuite)',
        'Créer les fiches réflexes et les arbres de décision pour les premiers intervenants',
        'Mettre en place les outils de communication de crise (canal dédié, contacts)',
        'Établir les procédures de préservation des preuves numériques (forensic)',
        'Organiser des exercices de simulation de crise au moins deux fois par an',
        'Réaliser un retour d\'expérience (post-mortem) après chaque incident significatif'
      ],
      tools: ['TheHive (gestion d\'incidents)', 'Cortex (analyse automatisée)', 'Velociraptor (forensic)', 'DFIR-IRIS', 'PagerDuty (alerting)']
    },
    {
      name: 'Audit de sécurité (Security Audit)',
      description: 'Évaluation systématique et méthodique de la sécurité de l\'infrastructure IT, des processus et des pratiques par rapport à un référentiel reconnu. L\'audit identifie les écarts de conformité, les vulnérabilités organisationnelles et les axes d\'amélioration pour renforcer la posture de sécurité globale.',
      implementation: [
        'Sélectionner le référentiel d\'audit approprié (ISO 27001, NIST, ANSSI)',
        'Constituer l\'équipe d\'audit (interne ou externe certifiée)',
        'Réaliser l\'inventaire des actifs et la cartographie du système d\'information',
        'Conduire les entretiens avec les parties prenantes et examiner la documentation',
        'Réaliser les tests techniques (scans de vulnérabilités, revue de configuration)',
        'Analyser les écarts par rapport au référentiel et évaluer les risques',
        'Rédiger le rapport d\'audit avec les recommandations priorisées',
        'Établir le plan d\'action correctif avec échéances et responsables'
      ],
      tools: ['Nessus (scan de vulnérabilités)', 'OpenVAS (open source)', 'CIS-CAT (conformité CIS)', 'Lynis (audit Linux)', 'Microsoft Compliance Manager']
    }
  ]
};

const windowsData = {
  commands: [
    {
      command: 'ipconfig',
      description: 'Affiche la configuration réseau complète de toutes les interfaces réseau de la machine Windows, incluant les adresses IP, les masques de sous-réseau, les passerelles par défaut et les serveurs DNS configurés.',
      syntax: 'ipconfig [/all] [/release] [/renew] [/flushdns] [/displaydns] [/registerdns]',
      examples: [
        { cmd: 'ipconfig /all', explanation: 'Affiche la configuration détaillée de toutes les interfaces réseau, y compris les adresses MAC, les serveurs DHCP, les baux et les suffixes DNS.' },
        { cmd: 'ipconfig /release', explanation: 'Libère l\'adresse IP obtenue par DHCP sur toutes les interfaces, utile pour résoudre les conflits d\'adresses ou forcer un renouvellement.' },
        { cmd: 'ipconfig /renew', explanation: 'Demande une nouvelle adresse IP au serveur DHCP, permettant de récupérer une configuration réseau fraîche.' },
        { cmd: 'ipconfig /flushdns', explanation: 'Vide le cache DNS local du système, forçant la résolution de noms à interroger les serveurs DNS pour les prochaines requêtes.' },
        { cmd: 'ipconfig /displaydns', explanation: 'Affiche le contenu du cache DNS local, montrant tous les noms de domaine résolus récemment avec leurs adresses IP et leur TTL.' }
      ],
      use_cases: [
        'Diagnostic rapide de la connectivité réseau d\'une machine',
        'Résolution de problèmes DNS en vidant le cache',
        'Vérification de la configuration DHCP et des baux d\'adresses',
        'Identification de l\'adresse MAC pour le filtrage réseau',
        'Comparaison de la configuration réelle avec la configuration attendue'
      ]
    },
    {
      command: 'ping',
      description: 'Envoie des paquets ICMP Echo Request vers un hôte distant pour tester la connectivité réseau et mesurer la latence (temps de réponse aller-retour). Outil fondamental pour le diagnostic réseau de base.',
      syntax: 'ping [-t] [-n count] [-l size] [-i TTL] [-w timeout] [-4|-6] destination',
      examples: [
        { cmd: 'ping 8.8.8.8', explanation: 'Envoie 4 paquets ICMP vers le serveur DNS de Google pour vérifier la connectivité Internet de base.' },
        { cmd: 'ping -t google.com', explanation: 'Ping en continu vers google.com jusqu\'à interruption manuelle (Ctrl+C), utile pour surveiller la stabilité d\'une connexion.' },
        { cmd: 'ping -n 100 -l 1000 192.168.1.1', explanation: 'Envoie 100 paquets de 1000 octets vers la passerelle, permettant de tester la bande passante et la stabilité sous charge.' },
        { cmd: 'ping -i 5 10.0.0.1', explanation: 'Ping avec un TTL de 5, utile pour tester la joignabilité d\'un hôte situé à un certain nombre de sauts.' }
      ],
      use_cases: [
        'Vérification rapide de la connectivité vers un hôte ou un serveur',
        'Mesure de la latence réseau et détection de la perte de paquets',
        'Test de la résolution DNS en pingant un nom de domaine',
        'Surveillance continue de la disponibilité d\'un service critique',
        'Diagnostic de problèmes de routage en combinaison avec tracert'
      ]
    },
    {
      command: 'tracert',
      description: 'Trace le chemin réseau emprunté par les paquets pour atteindre une destination, en affichant chaque routeur intermédiaire (saut) et le temps de transit. Utilise des paquets ICMP avec un TTL incrémenté pour découvrir chaque saut.',
      syntax: 'tracert [-d] [-h maximum_hops] [-w timeout] [-4|-6] destination',
      examples: [
        { cmd: 'tracert google.com', explanation: 'Trace le chemin complet vers google.com, affichant chaque routeur traversé avec les temps de réponse en millisecondes.' },
        { cmd: 'tracert -d 8.8.8.8', explanation: 'Trace le chemin sans résolution DNS inverse des adresses intermédiaires, accélérant significativement l\'exécution.' },
        { cmd: 'tracert -h 15 192.168.10.1', explanation: 'Limite le traceroute à 15 sauts maximum, utile quand la destination est dans le réseau local ou proche.' }
      ],
      use_cases: [
        'Identification du point exact de coupure dans un chemin réseau',
        'Diagnostic de latence anormale sur un segment spécifique',
        'Vérification du chemin de routage emprunté par le trafic',
        'Détection de boucles de routage ou de chemins sous-optimaux',
        'Analyse de la topologie réseau et des interconnexions opérateur'
      ]
    },
    {
      command: 'nslookup',
      description: 'Outil de diagnostic DNS permettant d\'interroger les serveurs de noms pour résoudre des noms de domaine en adresses IP et inversement. Supporte les requêtes sur différents types d\'enregistrements DNS (A, AAAA, MX, NS, CNAME, TXT, SOA).',
      syntax: 'nslookup [-type=record_type] [domain] [dns_server]',
      examples: [
        { cmd: 'nslookup google.com', explanation: 'Résout le nom google.com en utilisant le serveur DNS configuré par défaut et affiche les adresses IP associées.' },
        { cmd: 'nslookup -type=MX gmail.com', explanation: 'Recherche les enregistrements MX (Mail Exchanger) du domaine gmail.com pour identifier les serveurs de messagerie.' },
        { cmd: 'nslookup -type=NS example.com 8.8.8.8', explanation: 'Interroge le DNS Google (8.8.8.8) pour obtenir les serveurs de noms autoritaires du domaine example.com.' },
        { cmd: 'nslookup -type=TXT _dmarc.example.com', explanation: 'Vérifie l\'enregistrement DMARC du domaine, utile pour auditer la configuration de sécurité email.' }
      ],
      use_cases: [
        'Diagnostic de problèmes de résolution DNS',
        'Vérification de la propagation DNS après un changement d\'enregistrement',
        'Audit de la configuration email (MX, SPF, DKIM, DMARC)',
        'Identification des serveurs de noms autoritaires d\'un domaine',
        'Comparaison des réponses entre différents serveurs DNS'
      ]
    },
    {
      command: 'netstat',
      description: 'Affiche les connexions réseau actives, les ports en écoute, les tables de routage et les statistiques d\'interface réseau. Essentiel pour identifier les services en écoute, les connexions suspectes et les problèmes de performance réseau.',
      syntax: 'netstat [-a] [-b] [-n] [-o] [-r] [-s] [-p protocol] [interval]',
      examples: [
        { cmd: 'netstat -ano', explanation: 'Affiche toutes les connexions et ports en écoute avec les adresses numériques et les PID des processus associés.' },
        { cmd: 'netstat -b', explanation: 'Affiche le nom du programme associé à chaque connexion, nécessite des privilèges administrateur.' },
        { cmd: 'netstat -s -p tcp', explanation: 'Affiche les statistiques détaillées du protocole TCP, incluant les segments envoyés, reçus et les erreurs.' },
        { cmd: 'netstat -r', explanation: 'Affiche la table de routage IPv4 et IPv6, équivalent à la commande route print.' }
      ],
      use_cases: [
        'Détection de connexions réseau suspectes ou non autorisées',
        'Identification des ports ouverts et des services en écoute',
        'Diagnostic des problèmes de performance réseau (connexions TIME_WAIT)',
        'Investigation de sécurité pour identifier les communications malveillantes',
        'Vérification que les services critiques écoutent sur les bons ports'
      ]
    },
    {
      command: 'arp',
      description: 'Affiche et modifie la table de correspondance ARP (Address Resolution Protocol) qui associe les adresses IP aux adresses MAC sur le réseau local. Utile pour le diagnostic de connectivité de couche 2 et la détection d\'attaques ARP spoofing.',
      syntax: 'arp [-a] [-d ip_address] [-s ip_address mac_address]',
      examples: [
        { cmd: 'arp -a', explanation: 'Affiche l\'intégralité de la table ARP, montrant toutes les associations IP-MAC connues et leur type (dynamique ou statique).' },
        { cmd: 'arp -d 192.168.1.1', explanation: 'Supprime l\'entrée ARP pour l\'adresse IP spécifiée, forçant une nouvelle résolution ARP lors de la prochaine communication.' },
        { cmd: 'arp -s 192.168.1.1 00-aa-bb-cc-dd-ee', explanation: 'Crée une entrée ARP statique pour empêcher l\'empoisonnement ARP de la passerelle par un attaquant.' }
      ],
      use_cases: [
        'Détection d\'attaques ARP spoofing (adresses MAC dupliquées)',
        'Vérification de la résolution d\'adresses sur le réseau local',
        'Diagnostic de conflits d\'adresses IP sur le même segment',
        'Sécurisation des équipements critiques avec des entrées ARP statiques',
        'Identification des appareils connectés au réseau local par leur MAC'
      ]
    },
    {
      command: 'route',
      description: 'Affiche et manipule la table de routage IP locale du système Windows. Permet d\'ajouter, supprimer ou modifier des routes statiques pour diriger le trafic réseau vers des destinations spécifiques via des passerelles définies.',
      syntax: 'route [print|add|delete|change] [destination] [mask netmask] [gateway] [metric metric] [if interface]',
      examples: [
        { cmd: 'route print', explanation: 'Affiche la table de routage complète incluant les routes persistantes, les routes actives et la liste des interfaces réseau.' },
        { cmd: 'route add 10.0.0.0 mask 255.0.0.0 192.168.1.254', explanation: 'Ajoute une route statique pour diriger tout le trafic vers le réseau 10.0.0.0/8 via la passerelle 192.168.1.254.' },
        { cmd: 'route delete 10.0.0.0', explanation: 'Supprime la route vers le réseau 10.0.0.0, le trafic utilisera alors la route par défaut.' },
        { cmd: 'route add 0.0.0.0 mask 0.0.0.0 192.168.1.1 -p', explanation: 'Ajoute une route par défaut persistante (-p) qui survit aux redémarrages du système.' }
      ],
      use_cases: [
        'Configuration de routes statiques pour les VPN et les sous-réseaux distants',
        'Diagnostic de problèmes de routage en inspectant la table de routes',
        'Redirection du trafic vers des passerelles spécifiques par destination',
        'Résolution de conflits de routage entre interfaces multiples',
        'Configuration de routes persistantes pour les postes multi-réseau'
      ]
    },
    {
      command: 'netsh',
      description: 'Outil en ligne de commande puissant pour la configuration et l\'administration réseau avancée sous Windows. Permet de configurer les interfaces réseau, le pare-feu Windows, les profils Wi-Fi, le routage, IPsec et de nombreux autres composants réseau.',
      syntax: 'netsh [context] [command] [parameters]',
      examples: [
        { cmd: 'netsh interface ip show config', explanation: 'Affiche la configuration IP détaillée de toutes les interfaces réseau, similaire à ipconfig /all mais avec plus de détails.' },
        { cmd: 'netsh wlan show profiles', explanation: 'Liste tous les profils Wi-Fi enregistrés sur la machine, permettant d\'identifier les réseaux auxquels la machine s\'est connectée.' },
        { cmd: 'netsh wlan show profile name="MonWiFi" key=clear', explanation: 'Affiche le profil Wi-Fi complet incluant le mot de passe en clair, nécessite des droits administrateur.' },
        { cmd: 'netsh advfirewall set allprofiles state off', explanation: 'Désactive le pare-feu Windows sur tous les profils (domaine, privé, public) - À utiliser avec précaution.' },
        { cmd: 'netsh interface ip set address "Ethernet" static 192.168.1.100 255.255.255.0 192.168.1.1', explanation: 'Configure une adresse IP statique sur l\'interface Ethernet avec le masque et la passerelle spécifiés.' }
      ],
      use_cases: [
        'Configuration avancée des interfaces réseau et du pare-feu Windows',
        'Récupération des mots de passe Wi-Fi enregistrés pour audit',
        'Export et import de la configuration réseau entre machines',
        'Diagnostic avancé des problèmes de réseau sans fil',
        'Automatisation de la configuration réseau via scripts batch'
      ]
    },
    {
      command: 'pathping',
      description: 'Combine les fonctionnalités de ping et tracert pour fournir une analyse détaillée de la qualité de chaque segment du chemin réseau. Effectue d\'abord un traceroute puis envoie des pings sur une période prolongée pour calculer les statistiques de perte et de latence par saut.',
      syntax: 'pathping [-n] [-h maximum_hops] [-g host_list] [-p period] [-q num_queries] [-w timeout] destination',
      examples: [
        { cmd: 'pathping google.com', explanation: 'Analyse complète du chemin vers google.com avec statistiques de perte de paquets par saut sur 25 secondes par nœud.' },
        { cmd: 'pathping -n -q 50 192.168.1.1', explanation: 'Pathping sans résolution DNS avec 50 requêtes par saut pour des statistiques plus précises.' },
        { cmd: 'pathping -h 10 -p 100 10.0.0.1', explanation: 'Limite à 10 sauts avec un intervalle de 100ms entre les pings, accélérant l\'analyse.' }
      ],
      use_cases: [
        'Identification précise du segment réseau responsable de la perte de paquets',
        'Analyse de la qualité de la liaison avec un fournisseur d\'accès Internet',
        'Diagnostic des problèmes de performance sur les liaisons WAN',
        'Comparaison de la qualité entre différents chemins réseau',
        'Documentation de la performance réseau pour les SLA'
      ]
    },
    {
      command: 'nbtstat',
      description: 'Affiche les statistiques du protocole NetBIOS over TCP/IP (NBT), les tables de noms NetBIOS des machines locales et distantes, et le cache de noms NetBIOS. Utile pour le diagnostic des problèmes de résolution de noms dans les environnements Windows.',
      syntax: 'nbtstat [-a remote_name] [-A ip_address] [-c] [-n] [-r] [-R] [-S] [-s]',
      examples: [
        { cmd: 'nbtstat -n', explanation: 'Affiche les noms NetBIOS enregistrés localement, montrant les services réseau Windows actifs et leur statut.' },
        { cmd: 'nbtstat -A 192.168.1.50', explanation: 'Interroge la machine distante à cette IP pour obtenir sa table de noms NetBIOS, révélant son nom d\'ordinateur et son domaine.' },
        { cmd: 'nbtstat -c', explanation: 'Affiche le cache de noms NetBIOS local, montrant les résolutions récentes et leur durée de vie.' },
        { cmd: 'nbtstat -r', explanation: 'Affiche les statistiques de résolution de noms NetBIOS, distinguant les résolutions par broadcast et via serveur WINS.' }
      ],
      use_cases: [
        'Diagnostic des problèmes de résolution de noms NetBIOS',
        'Identification des machines Windows sur le réseau local',
        'Détection des conflits de noms NetBIOS',
        'Vérification de l\'enregistrement WINS des machines',
        'Découverte des domaines et groupes de travail Windows'
      ]
    },
    {
      command: 'getmac',
      description: 'Affiche les adresses MAC (Media Access Control) de toutes les interfaces réseau de la machine locale ou d\'une machine distante. Chaque adresse MAC est unique et identifie physiquement la carte réseau.',
      syntax: 'getmac [/s computer] [/u user] [/p password] [/fo format] [/v]',
      examples: [
        { cmd: 'getmac /v', explanation: 'Affiche les adresses MAC de toutes les interfaces avec des informations détaillées incluant le nom de connexion et le protocole de transport.' },
        { cmd: 'getmac /s SERVEUR01 /u admin /p motdepasse', explanation: 'Récupère les adresses MAC d\'un serveur distant en s\'authentifiant avec les identifiants fournis.' },
        { cmd: 'getmac /fo csv /v', explanation: 'Exporte les informations MAC au format CSV pour un traitement ultérieur dans un tableur ou un script.' }
      ],
      use_cases: [
        'Inventaire des adresses MAC pour le filtrage réseau et le NAC',
        'Configuration des réservations DHCP basées sur les adresses MAC',
        'Identification des interfaces réseau physiques et virtuelles',
        'Vérification de l\'adresse MAC pour le dépannage de connectivité couche 2',
        'Collecte d\'informations pour la gestion des actifs IT'
      ]
    },
    {
      command: 'systeminfo',
      description: 'Affiche des informations détaillées sur la configuration matérielle et logicielle du système, incluant le système d\'exploitation, les correctifs installés, la configuration réseau, la mémoire et les informations de domaine. Commande essentielle pour l\'inventaire et le diagnostic.',
      syntax: 'systeminfo [/s computer] [/u user] [/p password] [/fo format]',
      examples: [
        { cmd: 'systeminfo', explanation: 'Affiche toutes les informations système locales incluant le nom d\'hôte, la version Windows, les hotfix installés et les cartes réseau.' },
        { cmd: 'systeminfo | findstr /i "hotfix"', explanation: 'Filtre la sortie pour afficher uniquement les correctifs de sécurité installés, utile pour vérifier le patch management.' },
        { cmd: 'systeminfo /s SERVEUR01 /fo csv', explanation: 'Récupère les informations système d\'un serveur distant au format CSV pour l\'inventaire.' }
      ],
      use_cases: [
        'Inventaire matériel et logiciel des postes de travail et serveurs',
        'Vérification des correctifs de sécurité installés',
        'Collecte d\'informations pour le diagnostic de problèmes',
        'Audit de conformité de la configuration système',
        'Documentation de l\'infrastructure avant une migration'
      ]
    },
    {
      command: 'hostname',
      description: 'Affiche le nom d\'hôte NetBIOS de la machine Windows actuelle. Bien que simple, cette commande est fréquemment utilisée dans les scripts et pour la vérification rapide de l\'identité de la machine sur laquelle on travaille.',
      syntax: 'hostname',
      examples: [
        { cmd: 'hostname', explanation: 'Affiche le nom d\'ordinateur défini dans les paramètres système, utilisé pour l\'identification réseau et Active Directory.' }
      ],
      use_cases: [
        'Vérification rapide du nom de la machine (utile en session distante)',
        'Utilisation dans les scripts pour identifier dynamiquement la machine',
        'Validation de la conformité du nommage des postes',
        'Différenciation entre les environnements (production, test, développement)',
        'Inclusion dans les rapports de diagnostic réseau'
      ]
    },
    {
      command: 'whoami',
      description: 'Affiche le nom de l\'utilisateur actuellement connecté, incluant le domaine et le nom d\'utilisateur. Avec les options avancées, il peut afficher les groupes d\'appartenance, les privilèges et le SID de l\'utilisateur.',
      syntax: 'whoami [/user] [/groups] [/priv] [/all] [/fo format]',
      examples: [
        { cmd: 'whoami', explanation: 'Affiche le domaine et le nom d\'utilisateur au format DOMAINE\\utilisateur.' },
        { cmd: 'whoami /priv', explanation: 'Liste tous les privilèges de sécurité de l\'utilisateur actuel avec leur état (activé/désactivé), crucial pour l\'audit de sécurité.' },
        { cmd: 'whoami /groups', explanation: 'Affiche tous les groupes de sécurité auxquels l\'utilisateur appartient, utile pour diagnostiquer les problèmes d\'accès.' },
        { cmd: 'whoami /all', explanation: 'Affiche toutes les informations de sécurité : nom d\'utilisateur, SID, groupes, privilèges et étiquettes.' }
      ],
      use_cases: [
        'Vérification du contexte de sécurité de la session active',
        'Audit des privilèges élevés pour la conformité sécurité',
        'Diagnostic des problèmes d\'accès aux ressources réseau',
        'Vérification des groupes d\'appartenance Active Directory',
        'Investigation de sécurité pour identifier le compte compromis'
      ]
    },
    {
      command: 'curl',
      description: 'Outil de transfert de données en ligne de commande supportant HTTP, HTTPS, FTP et de nombreux protocoles. Disponible nativement depuis Windows 10, il permet de tester les API REST, vérifier les en-têtes HTTP et diagnostiquer les problèmes de connectivité web.',
      syntax: 'curl [options] [URL]',
      examples: [
        { cmd: 'curl -I https://www.google.com', explanation: 'Récupère uniquement les en-têtes HTTP de la réponse, utile pour vérifier le code de statut, les redirections et les en-têtes de sécurité.' },
        { cmd: 'curl -v https://api.example.com/status', explanation: 'Affiche les détails complets de la connexion incluant la négociation TLS, les en-têtes envoyés et reçus.' },
        { cmd: 'curl -X POST -H "Content-Type: application/json" -d "{\\\"user\\\":\\\"test\\\"}" https://api.example.com/login', explanation: 'Envoie une requête POST avec un corps JSON, utile pour tester les API REST et les endpoints d\'authentification.' },
        { cmd: 'curl -o fichier.zip https://example.com/fichier.zip', explanation: 'Télécharge un fichier et l\'enregistre localement, alternatif léger aux navigateurs pour les téléchargements en ligne de commande.' }
      ],
      use_cases: [
        'Test de disponibilité et de réponse des serveurs web et API',
        'Vérification des en-têtes de sécurité HTTP (HSTS, CSP, X-Frame-Options)',
        'Diagnostic des problèmes de certificat SSL/TLS',
        'Automatisation des tests d\'API dans les scripts de monitoring',
        'Téléchargement de fichiers en ligne de commande'
      ]
    },
    {
      command: 'Test-NetConnection',
      description: 'Cmdlet PowerShell de diagnostic réseau avancé qui combine les fonctionnalités de ping, traceroute et test de port TCP. Plus puissant et flexible que les commandes traditionnelles, il fournit des résultats structurés en objets PowerShell.',
      syntax: 'Test-NetConnection [-ComputerName] <string> [-Port <int>] [-TraceRoute] [-InformationLevel Detailed]',
      examples: [
        { cmd: 'Test-NetConnection google.com -Port 443', explanation: 'Teste la connectivité TCP vers le port 443 (HTTPS) de google.com, vérifiant à la fois la résolution DNS et l\'accessibilité du port.' },
        { cmd: 'Test-NetConnection 192.168.1.1 -TraceRoute', explanation: 'Effectue un traceroute vers la destination avec les résultats sous forme d\'objet PowerShell exploitable.' },
        { cmd: 'Test-NetConnection -ComputerName smtp.gmail.com -Port 587 -InformationLevel Detailed', explanation: 'Test détaillé de la connectivité SMTP avec toutes les informations de diagnostic incluant la résolution DNS et le RTT.' },
        { cmd: '1..1024 | ForEach-Object { Test-NetConnection -ComputerName 192.168.1.1 -Port $_ -WarningAction SilentlyContinue } | Where-Object { $_.TcpTestSucceeded }', explanation: 'Scan des ports 1 à 1024 sur un hôte, listant uniquement les ports ouverts - mini scanner de ports en PowerShell.' }
      ],
      use_cases: [
        'Test de connectivité TCP vers des ports spécifiques (alternative à telnet)',
        'Vérification de l\'accessibilité des services réseau avant déploiement',
        'Diagnostic combiné réseau dans un seul cmdlet PowerShell',
        'Automatisation des tests de connectivité dans les scripts de monitoring',
        'Scan rapide des ports ouverts sur un serveur'
      ]
    },
    {
      command: 'Get-NetAdapter',
      description: 'Cmdlet PowerShell qui affiche les propriétés détaillées de toutes les cartes réseau (physiques et virtuelles) installées sur le système. Fournit des informations sur le statut, la vitesse, le type de média et l\'adresse MAC.',
      syntax: 'Get-NetAdapter [-Name <string>] [-InterfaceDescription <string>] [-Physical]',
      examples: [
        { cmd: 'Get-NetAdapter', explanation: 'Liste toutes les cartes réseau avec leur nom, statut (Up/Down), vitesse de liaison et type de connexion.' },
        { cmd: 'Get-NetAdapter -Physical', explanation: 'Affiche uniquement les adaptateurs réseau physiques, excluant les interfaces virtuelles (VPN, Hyper-V, etc.).' },
        { cmd: 'Get-NetAdapter | Select-Object Name, Status, LinkSpeed, MacAddress', explanation: 'Affiche un tableau personnalisé avec les informations essentielles de chaque adaptateur réseau.' },
        { cmd: 'Get-NetAdapter | Where-Object { $_.Status -eq "Up" }', explanation: 'Filtre pour afficher uniquement les interfaces réseau actives et connectées.' }
      ],
      use_cases: [
        'Inventaire des interfaces réseau physiques et virtuelles',
        'Vérification de l\'état et de la vitesse de liaison des adaptateurs',
        'Diagnostic des problèmes de carte réseau (déconnectée, vitesse réduite)',
        'Identification des adaptateurs pour la configuration réseau avancée',
        'Audit des interfaces actives pour la sécurité réseau'
      ]
    },
    {
      command: 'Test-Connection',
      description: 'Cmdlet PowerShell équivalent amélioré de la commande ping, envoyant des paquets ICMP Echo Request avec des résultats sous forme d\'objets PowerShell. Supporte le ping de multiples hôtes simultanément et l\'intégration dans des pipelines.',
      syntax: 'Test-Connection [-TargetName] <string[]> [-Count <int>] [-MaxHops <int>] [-TimeoutSeconds <int>] [-Traceroute] [-Quiet]',
      examples: [
        { cmd: 'Test-Connection google.com -Count 10', explanation: 'Envoie 10 paquets ICMP vers google.com et affiche les résultats détaillés avec le temps de réponse pour chaque paquet.' },
        { cmd: 'Test-Connection google.com, cloudflare.com, amazon.com', explanation: 'Ping simultané de plusieurs hôtes, très utile pour comparer la latence vers différents services.' },
        { cmd: 'Test-Connection -TargetName 192.168.1.1 -Quiet', explanation: 'Renvoie uniquement True ou False, idéal pour les conditions dans les scripts d\'automatisation.' },
        { cmd: 'Test-Connection 8.8.8.8 -Traceroute', explanation: 'Effectue un traceroute avec les résultats en objets PowerShell, exploitables dans un pipeline.' }
      ],
      use_cases: [
        'Test de connectivité avec résultats exploitables en PowerShell',
        'Monitoring de disponibilité multi-hôtes en une seule commande',
        'Scripts de vérification automatisée de la santé réseau',
        'Mesure de latence avec des statistiques détaillées',
        'Tests conditionnels dans les scripts d\'automatisation IT'
      ]
    },
    {
      command: 'Resolve-DnsName',
      description: 'Cmdlet PowerShell de résolution DNS avancée remplaçant nslookup dans les environnements PowerShell modernes. Supporte tous les types d\'enregistrements DNS et fournit des résultats structurés en objets, facilitant l\'automatisation et l\'analyse.',
      syntax: 'Resolve-DnsName [-Name] <string> [-Type <string>] [-Server <string>] [-DnsOnly] [-NoHostsFile]',
      examples: [
        { cmd: 'Resolve-DnsName google.com', explanation: 'Résout google.com en affichant les enregistrements A et AAAA avec les adresses IPv4 et IPv6.' },
        { cmd: 'Resolve-DnsName -Name gmail.com -Type MX', explanation: 'Récupère les enregistrements MX de gmail.com, identifiant les serveurs de messagerie avec leur priorité.' },
        { cmd: 'Resolve-DnsName -Name example.com -Type ANY -Server 1.1.1.1', explanation: 'Interroge le DNS Cloudflare pour obtenir tous les types d\'enregistrements du domaine.' },
        { cmd: 'Resolve-DnsName -Name 8.8.8.8 -Type PTR', explanation: 'Effectue une résolution DNS inverse (PTR) pour trouver le nom d\'hôte associé à l\'adresse IP.' }
      ],
      use_cases: [
        'Diagnostic DNS avancé avec résultats structurés en objets',
        'Automatisation des vérifications DNS dans les scripts PowerShell',
        'Audit de la configuration DNS des domaines (MX, SPF, DKIM)',
        'Comparaison des réponses DNS entre différents serveurs',
        'Résolution DNS inverse pour l\'investigation réseau'
      ]
    },
    {
      command: 'Get-NetIPConfiguration',
      description: 'Cmdlet PowerShell qui affiche la configuration IP complète de toutes les interfaces réseau actives, incluant les adresses IP, la passerelle par défaut et les serveurs DNS. Version PowerShell améliorée de ipconfig avec des résultats structurés.',
      syntax: 'Get-NetIPConfiguration [-InterfaceAlias <string>] [-InterfaceIndex <int>] [-Detailed]',
      examples: [
        { cmd: 'Get-NetIPConfiguration', explanation: 'Affiche la configuration IP de toutes les interfaces actives avec l\'adresse IP, la passerelle et les serveurs DNS de manière claire.' },
        { cmd: 'Get-NetIPConfiguration -Detailed', explanation: 'Affiche des informations détaillées incluant le profil de pare-feu, le suffixe DNS, la configuration DHCP et les métriques.' },
        { cmd: 'Get-NetIPConfiguration -InterfaceAlias "Wi-Fi"', explanation: 'Affiche la configuration IP uniquement pour l\'interface Wi-Fi spécifiée.' },
        { cmd: 'Get-NetIPConfiguration | Select-Object InterfaceAlias, IPv4Address, IPv4DefaultGateway, DNSServer', explanation: 'Crée un résumé personnalisé de la configuration réseau de toutes les interfaces.' }
      ],
      use_cases: [
        'Récapitulatif rapide et lisible de la configuration réseau',
        'Vérification de la configuration IP après des modifications',
        'Collecte d\'informations réseau pour les rapports d\'inventaire',
        'Diagnostic de connectivité en vérifiant la passerelle et les DNS',
        'Automatisation de la documentation réseau dans les scripts'
      ]
    }
  ],

  problems: [
    {
      problem: 'Connexion Internet lente ou intermittente',
      symptoms: [
        'Les pages web mettent plus de 10 secondes à charger',
        'Les transferts de fichiers sont anormalement lents',
        'Les appels VoIP présentent des coupures et de la latence',
        'Les applications cloud fonctionnent par intermittence',
        'Le streaming vidéo subit du buffering constant'
      ],
      causes: [
        'Bande passante insuffisante pour le nombre d\'utilisateurs',
        'Câblage réseau défectueux ou de catégorie insuffisante (Cat5 vs Cat6)',
        'Interférences Wi-Fi sur un canal surchargé',
        'Équipement réseau saturé (routeur, switch sous-dimensionné)',
        'Problème chez le fournisseur d\'accès Internet'
      ],
      solution_steps: [
        'Tester la vitesse réelle avec un outil de speedtest depuis un poste câblé',
        'Vérifier les statistiques d\'erreurs sur les ports des switches (CRC, collisions)',
        'Analyser l\'utilisation de la bande passante avec PRTG ou MRTG',
        'Scanner les canaux Wi-Fi avec Wi-Fi Analyzer pour identifier les interférences',
        'Contacter le FAI avec les résultats de test si le problème est externe'
      ],
      prevention: [
        'Surdimensionner la bande passante d\'au moins 30% par rapport aux besoins',
        'Mettre en place la QoS pour prioriser le trafic critique',
        'Planifier des tests de performance réseau mensuels',
        'Utiliser le câblage Cat6a minimum pour les nouvelles installations'
      ]
    },
    {
      problem: 'Impossibilité d\'accéder au réseau (pas de connexion)',
      symptoms: [
        'Icône réseau avec un triangle jaune ou une croix rouge',
        'Adresse IP en 169.254.x.x (APIPA) au lieu d\'une adresse valide',
        'Ping vers la passerelle échoue systématiquement',
        'Le câble réseau apparaît comme déconnecté dans les paramètres',
        'Le Wi-Fi ne détecte aucun réseau disponible'
      ],
      causes: [
        'Câble Ethernet défectueux ou mal connecté',
        'Port du switch désactivé ou en erreur',
        'Serveur DHCP hors service ou saturé',
        'Carte réseau désactivée ou pilote corrompu',
        'Conflit d\'adresse IP sur le réseau'
      ],
      solution_steps: [
        'Vérifier physiquement le câble réseau et les voyants LED du port switch',
        'Exécuter ipconfig /release puis ipconfig /renew pour renouveler le bail DHCP',
        'Désactiver et réactiver la carte réseau dans le Gestionnaire de périphériques',
        'Tester avec un autre câble et un autre port du switch',
        'Configurer temporairement une IP statique pour isoler le problème DHCP'
      ],
      prevention: [
        'Étiqueter et documenter le brassage réseau (câble, port, VLAN)',
        'Superviser le serveur DHCP et configurer un serveur de secours (failover)',
        'Maintenir un stock de câbles de rechange testés',
        'Mettre à jour régulièrement les pilotes réseau'
      ]
    },
    {
      problem: 'Résolution DNS qui échoue',
      symptoms: [
        'Les sites web ne s\'ouvrent pas par leur nom mais fonctionnent par IP',
        'Messages d\'erreur "Serveur DNS ne répond pas" dans le navigateur',
        'La commande nslookup retourne "Server: Unknown" ou des timeouts',
        'Certains sites sont accessibles mais d\'autres non',
        'Les applications métier ne trouvent pas les serveurs internes'
      ],
      causes: [
        'Serveur DNS interne en panne ou surchargé',
        'Configuration DNS incorrecte sur le poste client',
        'Cache DNS local corrompu avec des entrées obsolètes',
        'Pare-feu bloquant les requêtes DNS (port 53 UDP/TCP)',
        'Zone DNS mal configurée sur le serveur interne'
      ],
      solution_steps: [
        'Exécuter ipconfig /flushdns pour vider le cache DNS local',
        'Tester la résolution avec un DNS externe : nslookup google.com 8.8.8.8',
        'Vérifier la configuration DNS du poste avec ipconfig /all',
        'Vérifier le service DNS sur le serveur (état du service, logs d\'événements)',
        'Tester la résolution des noms internes et externes séparément'
      ],
      prevention: [
        'Déployer au minimum deux serveurs DNS internes avec redondance',
        'Surveiller le temps de réponse DNS avec Nagios ou Zabbix',
        'Documenter et auditer les zones DNS trimestriellement',
        'Configurer les forwarders DNS avec des serveurs DNS publics fiables'
      ]
    },
    {
      problem: 'Imprimante réseau inaccessible',
      symptoms: [
        'Les travaux d\'impression restent en file d\'attente sans s\'imprimer',
        'Message d\'erreur "Imprimante hors ligne" dans Windows',
        'L\'imprimante est injoignable par ping depuis les postes',
        'La page web d\'administration de l\'imprimante ne s\'affiche pas',
        'Certains postes peuvent imprimer mais d\'autres non'
      ],
      causes: [
        'L\'imprimante a changé d\'adresse IP (DHCP au lieu de statique)',
        'Problème de câblage ou de port switch (VLAN incorrect)',
        'File d\'attente d\'impression bloquée sur le serveur d\'impression',
        'Pilote d\'imprimante corrompu ou incompatible',
        'Pare-feu bloquant les ports d\'impression (9100, 515, 631)'
      ],
      solution_steps: [
        'Vérifier l\'adresse IP actuelle de l\'imprimante sur son panneau de contrôle',
        'Pinger l\'adresse IP de l\'imprimante depuis le poste client',
        'Redémarrer le service Spouleur d\'impression (net stop spooler && net start spooler)',
        'Supprimer et réinstaller l\'imprimante avec le bon port et le bon pilote',
        'Vérifier le VLAN et le port switch auquel l\'imprimante est connectée'
      ],
      prevention: [
        'Configurer des adresses IP statiques ou des réservations DHCP pour les imprimantes',
        'Utiliser un serveur d\'impression centralisé pour faciliter la gestion',
        'Documenter les adresses IP et les emplacements de toutes les imprimantes',
        'Surveiller l\'état des imprimantes avec SNMP et un outil de supervision'
      ]
    },
    {
      problem: 'VPN qui ne se connecte pas',
      symptoms: [
        'Le client VPN affiche "Connexion échouée" ou "Timeout"',
        'La connexion VPN s\'établit mais aucun trafic ne passe',
        'Déconnexions VPN fréquentes après quelques minutes',
        'Impossible d\'accéder aux ressources internes via le VPN',
        'Conflit d\'adresse IP après la connexion VPN'
      ],
      causes: [
        'Ports VPN bloqués par le pare-feu (UDP 500, 4500 pour IPsec ; TCP 443 pour SSL)',
        'Certificat VPN expiré ou révoqué',
        'Conflit de sous-réseau entre le réseau local et le réseau distant',
        'Client VPN obsolète ou incompatible avec la version du serveur',
        'MTU trop élevé causant la fragmentation et la perte de paquets'
      ],
      solution_steps: [
        'Vérifier que les ports VPN ne sont pas bloqués avec Test-NetConnection',
        'Mettre à jour le client VPN vers la dernière version disponible',
        'Vérifier la validité du certificat et les logs du serveur VPN',
        'Tester depuis un autre réseau (partage de connexion mobile) pour isoler le problème',
        'Ajuster le MTU si nécessaire (netsh interface ipv4 set subinterface "VPN" mtu=1400)'
      ],
      prevention: [
        'Surveiller l\'expiration des certificats VPN avec des alertes automatiques',
        'Tester le VPN régulièrement depuis différents emplacements',
        'Documenter la procédure de dépannage VPN pour le helpdesk',
        'Prévoir un VPN SSL de secours si le VPN IPsec est bloqué'
      ]
    },
    {
      problem: 'Performances Wi-Fi dégradées',
      symptoms: [
        'Débit Wi-Fi très inférieur au débit théorique de la norme',
        'Déconnexions Wi-Fi fréquentes et reconnexions automatiques',
        'Signal Wi-Fi faible dans certaines zones du bâtiment',
        'Latence élevée et perte de paquets en Wi-Fi',
        'Les appareils basculent entre les points d\'accès de manière erratique'
      ],
      causes: [
        'Interférences sur le canal Wi-Fi utilisé (voisins, micro-ondes, Bluetooth)',
        'Points d\'accès insuffisants ou mal positionnés pour la couverture',
        'Trop d\'appareils connectés au même point d\'accès',
        'Configuration radio sous-optimale (puissance, largeur de canal)',
        'Appareils anciens en 802.11b/g ralentissant tout le réseau'
      ],
      solution_steps: [
        'Réaliser un site survey Wi-Fi pour cartographier la couverture et les interférences',
        'Changer de canal Wi-Fi pour éviter les interférences (canaux 1, 6, 11 en 2,4 GHz)',
        'Réduire la puissance d\'émission pour limiter les chevauchements entre AP',
        'Activer le band steering pour forcer les appareils compatibles vers le 5 GHz',
        'Séparer les appareils IoT et les clients critiques sur des SSID/VLAN différents'
      ],
      prevention: [
        'Réaliser un site survey professionnel avant tout déploiement Wi-Fi',
        'Utiliser des contrôleurs Wi-Fi pour la gestion centralisée',
        'Planifier des audits Wi-Fi semestriels pour adapter la couverture',
        'Migrer vers Wi-Fi 6/6E pour de meilleures performances en haute densité'
      ]
    },
    {
      problem: 'Conflit d\'adresses IP sur le réseau',
      symptoms: [
        'Message Windows "Un conflit d\'adresse IP a été détecté sur le réseau"',
        'Connectivité intermittente avec perte de paquets aléatoire',
        'Deux machines ou plus avec la même adresse IP dans les logs DHCP',
        'Un appareil perd soudainement sa connectivité puis la retrouve',
        'Les pings vers une IP répondent avec des latences très variables'
      ],
      causes: [
        'Attribution manuelle d\'une adresse IP déjà utilisée par le DHCP',
        'Plage DHCP chevauchant des adresses statiques non exclues',
        'Appareil avec une IP statique dans la plage DHCP',
        'Serveur DHCP malveillant (Rogue DHCP) sur le réseau',
        'Restauration d\'une machine avec une ancienne IP déjà réattribuée'
      ],
      solution_steps: [
        'Identifier les deux machines en conflit avec arp -a et les adresses MAC',
        'Vérifier la configuration du scope DHCP et ses exclusions',
        'Scanner le réseau avec un outil comme Advanced IP Scanner pour l\'inventaire',
        'Libérer et renouveler les baux DHCP sur les machines en conflit',
        'Configurer des réservations DHCP pour les appareils nécessitant des IP fixes'
      ],
      prevention: [
        'Utiliser exclusivement le DHCP avec des réservations pour les IP fixes',
        'Documenter toutes les attributions d\'adresses IP dans un IPAM',
        'Activer le conflit de détection IP sur le serveur DHCP',
        'Configurer le DHCP Snooping pour bloquer les serveurs DHCP non autorisés'
      ]
    },
    {
      problem: 'Partage de fichiers inaccessible sur le réseau',
      symptoms: [
        'Erreur "Le chemin réseau n\'a pas été trouvé" lors de l\'accès au partage',
        'Le partage est visible dans l\'explorateur mais inaccessible',
        'Demande d\'identifiants en boucle pour accéder au partage',
        'Accès en lecture seule alors que l\'écriture devrait être autorisée',
        'Le mappage de lecteur réseau se perd après chaque redémarrage'
      ],
      causes: [
        'Permissions NTFS et permissions de partage contradictoires',
        'Protocole SMBv1 désactivé alors que les appareils anciens en dépendent',
        'Pare-feu Windows bloquant le partage de fichiers (ports 445, 139)',
        'Découverte réseau désactivée sur le poste client ou le serveur',
        'Authentification Kerberos en échec due à un décalage horaire'
      ],
      solution_steps: [
        'Vérifier l\'accessibilité du serveur avec ping et Test-NetConnection sur le port 445',
        'Vérifier les permissions de partage ET les permissions NTFS sur le dossier',
        'S\'assurer que la découverte réseau est activée dans le Centre Réseau et partage',
        'Vérifier que le pare-feu autorise le partage de fichiers et d\'imprimantes',
        'Tester l\'accès avec net use \\\\serveur\\partage /user:domaine\\utilisateur'
      ],
      prevention: [
        'Utiliser un serveur de fichiers centralisé avec Active Directory',
        'Documenter les permissions de chaque partage dans une matrice d\'accès',
        'Déployer les mappages réseau via GPO pour la persistance',
        'Auditer régulièrement les permissions des partages avec AccessEnum'
      ]
    },
    {
      problem: 'Pare-feu bloquant des applications légitimes',
      symptoms: [
        'Une application métier ne parvient pas à se connecter à son serveur',
        'Messages d\'erreur de connexion refusée ou timeout dans les applications',
        'Le même service fonctionne sur une machine mais pas sur une autre',
        'Les applications fonctionnent quand le pare-feu est désactivé',
        'Certains ports spécifiques ne répondent pas malgré le service actif'
      ],
      causes: [
        'Règles de pare-feu Windows trop restrictives ou mal configurées',
        'Profil de pare-feu incorrect (Public au lieu de Domaine/Privé)',
        'Mise à jour de l\'application ayant changé les ports utilisés',
        'Antivirus avec module pare-feu bloquant le trafic légitime',
        'GPO de pare-feu écrasant les règles locales'
      ],
      solution_steps: [
        'Identifier les ports nécessaires avec netstat -ano pendant que l\'application fonctionne',
        'Vérifier le profil réseau actif (Get-NetConnectionProfile)',
        'Examiner les logs du pare-feu Windows dans l\'Observateur d\'événements',
        'Créer des règles de pare-feu spécifiques pour l\'application ou les ports concernés',
        'Tester avec le pare-feu temporairement désactivé pour confirmer la cause'
      ],
      prevention: [
        'Documenter les flux réseau de chaque application dans une matrice de flux',
        'Tester les règles de pare-feu dans un environnement de test avant déploiement',
        'Utiliser les GPO pour gérer les règles de pare-feu de manière centralisée',
        'Configurer les logs du pare-feu pour faciliter le diagnostic futur'
      ]
    },
    {
      problem: 'Attaque ransomware sur le réseau',
      symptoms: [
        'Fichiers chiffrés avec des extensions inhabituelles (.encrypted, .locked, .crypt)',
        'Notes de rançon apparaissant sur les postes et les partages réseau',
        'Activité CPU et disque anormalement élevée sur plusieurs machines',
        'Alertes antivirus massives et simultanées sur plusieurs postes',
        'Partages réseau rendus inaccessibles avec des fichiers renommés'
      ],
      causes: [
        'Pièce jointe malveillante ouverte par un utilisateur (phishing)',
        'Exploitation d\'une vulnérabilité non corrigée (RDP, SMB, VPN)',
        'Identifiants d\'accès compromis via une attaque de phishing',
        'Propagation latérale depuis un poste compromis via les partages réseau',
        'Absence de segmentation réseau permettant la propagation rapide'
      ],
      solution_steps: [
        'Isoler immédiatement les machines infectées du réseau (débrancher le câble)',
        'Identifier l\'étendue de l\'infection et le vecteur d\'entrée initial',
        'Ne PAS payer la rançon et contacter l\'ANSSI/CERT-FR',
        'Restaurer les données depuis les sauvegardes non affectées (vérifier l\'intégrité)',
        'Réinstaller les systèmes compromis et changer tous les mots de passe'
      ],
      prevention: [
        'Mettre en place des sauvegardes immuables (WORM) hors ligne',
        'Déployer un EDR sur tous les postes avec détection comportementale',
        'Segmenter le réseau pour limiter la propagation latérale',
        'Former régulièrement les utilisateurs au phishing et maintenir les patchs à jour'
      ]
    },
    {
      problem: 'Switch ou routeur surchargé',
      symptoms: [
        'Latence réseau croissante et variable pour tous les utilisateurs',
        'Le CPU de l\'équipement réseau est constamment au-dessus de 80%',
        'Pertes de paquets aléatoires affectant tous les services',
        'Les interfaces de gestion du switch/routeur ne répondent plus',
        'Les logs montrent des erreurs de dépassement de buffer'
      ],
      causes: [
        'Boucle de commutation (spanning tree non configuré ou défaillant)',
        'Broadcast storm causé par une boucle ou un équipement défectueux',
        'Nombre de routes BGP/OSPF dépassant la capacité de la mémoire TCAM',
        'Attaque DDoS ou scan réseau massif saturant l\'équipement',
        'Équipement sous-dimensionné pour le volume de trafic actuel'
      ],
      solution_steps: [
        'Vérifier l\'utilisation CPU et mémoire via l\'interface de gestion ou le CLI',
        'Rechercher les boucles réseau avec les logs STP et les statistiques d\'interface',
        'Identifier les sources de trafic anormales avec les compteurs d\'interface',
        'Redémarrer l\'équipement si nécessaire et vérifier la stabilité',
        'Analyser les captures de trafic pour identifier les flux problématiques'
      ],
      prevention: [
        'Configurer correctement le Spanning Tree Protocol (RSTP/MSTP) avec BPDU Guard',
        'Surveiller les équipements réseau avec SNMP et un NMS (Nagios, Zabbix)',
        'Dimensionner les équipements avec une marge de 40% minimum',
        'Mettre en place des alertes sur les seuils CPU, mémoire et trafic'
      ]
    },
    {
      problem: 'Messagerie email non fonctionnelle',
      symptoms: [
        'Les emails envoyés ne sont pas reçus par les destinataires',
        'Erreurs de type "Serveur non disponible" dans le client de messagerie',
        'Les emails entrants n\'arrivent plus depuis plusieurs heures',
        'Les pièces jointes sont systématiquement bloquées',
        'Les emails sont classés en spam chez les destinataires externes'
      ],
      causes: [
        'Serveur de messagerie en panne ou surchargé',
        'Enregistrements MX, SPF ou DKIM mal configurés',
        'Adresse IP du serveur email blacklistée pour spam',
        'Espace disque insuffisant sur le serveur de messagerie',
        'Certificat TLS du serveur SMTP expiré'
      ],
      solution_steps: [
        'Vérifier l\'état du serveur de messagerie et les logs d\'erreurs',
        'Tester la connectivité SMTP avec Test-NetConnection serveur -Port 25',
        'Vérifier les enregistrements DNS (MX, SPF, DKIM, DMARC) avec nslookup ou dig',
        'Vérifier si l\'IP est blacklistée sur mxtoolbox.com/blacklists',
        'Contrôler l\'espace disque et les quotas de boîtes aux lettres'
      ],
      prevention: [
        'Surveiller le serveur email avec des alertes sur l\'espace disque et la file d\'attente',
        'Configurer correctement SPF, DKIM et DMARC pour éviter le blacklisting',
        'Mettre en place un relais email secondaire (MX de backup)',
        'Tester régulièrement la délivrabilité des emails avec des outils dédiés'
      ]
    },
    {
      problem: 'Active Directory et problèmes d\'authentification',
      symptoms: [
        'Les utilisateurs ne peuvent pas se connecter à leurs postes',
        'Erreur "La relation d\'approbation entre ce poste et le domaine a échoué"',
        'Les GPO ne s\'appliquent plus sur certains postes',
        'Délai anormalement long lors de l\'ouverture de session',
        'Compte utilisateur verrouillé automatiquement de manière répétée'
      ],
      causes: [
        'Contrôleur de domaine inaccessible ou en panne',
        'Horloge du poste client désynchronisée de plus de 5 minutes (Kerberos)',
        'Compte ordinateur expiré ou corrompu dans Active Directory',
        'Problème de réplication entre les contrôleurs de domaine',
        'Attaque par force brute causant le verrouillage automatique des comptes'
      ],
      solution_steps: [
        'Vérifier la connectivité vers les contrôleurs de domaine (ping, port 389/636)',
        'Synchroniser l\'horloge du poste avec le serveur de temps du domaine',
        'Disjoindre et rejoindre le domaine si la relation d\'approbation est cassée',
        'Vérifier la réplication AD avec la commande repadmin /replsummary',
        'Analyser les journaux de sécurité pour identifier la source des verrouillages'
      ],
      prevention: [
        'Déployer au minimum 2 contrôleurs de domaine avec réplication',
        'Configurer la synchronisation NTP sur tous les postes via GPO',
        'Surveiller la réplication AD et les journaux d\'événements quotidiennement',
        'Mettre en place une politique de verrouillage de compte avec seuils raisonnables'
      ]
    },
    {
      problem: 'Câblage réseau défectueux',
      symptoms: [
        'Connexion réseau intermittente avec des déconnexions fréquentes',
        'Vitesse de liaison négociée à 100 Mbps au lieu de 1 Gbps',
        'Erreurs CRC et alignement sur les statistiques du port switch',
        'Le voyant LED du port switch clignote de manière erratique',
        'Perte de paquets élevée vers un poste spécifique uniquement'
      ],
      causes: [
        'Câble Ethernet endommagé (écrasé, plié, rongé par des animaux)',
        'Connecteur RJ45 mal serti ou oxydé',
        'Câble trop long dépassant la limite de 100 mètres pour le cuivre',
        'Interférences électromagnétiques (câble réseau à proximité de câbles électriques)',
        'Mauvaise catégorie de câble (Cat5 au lieu de Cat6 pour le Gigabit)'
      ],
      solution_steps: [
        'Tester le câble avec un testeur de câblage (Fluke, de bonne qualité)',
        'Vérifier les statistiques d\'erreurs sur le port du switch',
        'Remplacer le câble suspect par un câble testé et fonctionnel',
        'Vérifier la qualité du sertissage des connecteurs RJ45',
        'Tester avec un autre port du switch pour isoler le problème'
      ],
      prevention: [
        'Utiliser du câble Cat6a minimum pour toutes les nouvelles installations',
        'Faire appel à un installateur certifié pour le câblage structuré',
        'Certifier le câblage après installation avec un testeur professionnel',
        'Séparer les chemins de câbles réseau et électriques'
      ]
    },
    {
      problem: 'Serveur DHCP hors service',
      symptoms: [
        'Les nouveaux appareils ne reçoivent pas d\'adresse IP',
        'Les postes obtiennent des adresses APIPA (169.254.x.x)',
        'Les baux DHCP expirent et ne sont pas renouvelés',
        'Seuls les appareils avec IP statique ont accès au réseau',
        'Messages d\'erreur DHCP dans l\'Observateur d\'événements'
      ],
      causes: [
        'Service DHCP arrêté sur le serveur',
        'Pool d\'adresses DHCP épuisé (toutes les IP sont attribuées)',
        'Serveur DHCP en panne matérielle ou logicielle',
        'Pare-feu bloquant les ports DHCP (67, 68 UDP)',
        'Agent relais DHCP non configuré pour le sous-réseau concerné'
      ],
      solution_steps: [
        'Vérifier l\'état du service DHCP sur le serveur (services.msc)',
        'Vérifier le pool d\'adresses disponibles et les baux actifs',
        'Redémarrer le service DHCP et vérifier les journaux d\'événements',
        'Vérifier la configuration du relais DHCP si le serveur est sur un autre sous-réseau',
        'Attribuer des IP statiques temporaires aux postes critiques en attendant la réparation'
      ],
      prevention: [
        'Configurer un serveur DHCP de secours en mode failover',
        'Dimensionner les pools DHCP avec suffisamment d\'adresses disponibles',
        'Surveiller le taux d\'utilisation du pool DHCP avec des alertes à 80%',
        'Réduire la durée des baux DHCP dans les environnements avec forte rotation'
      ]
    },
    {
      problem: 'QoS mal configurée affectant la VoIP',
      symptoms: [
        'Voix hachée et robotisée lors des appels téléphoniques VoIP',
        'Écho et délai perceptible pendant les conversations',
        'Appels coupés brusquement en cours de conversation',
        'Qualité des appels variable selon l\'heure de la journée',
        'Certains postes téléphoniques ont une meilleure qualité que d\'autres'
      ],
      causes: [
        'Absence de QoS ou mauvaise priorisation du trafic voix',
        'Bande passante insuffisante pour le nombre d\'appels simultanés',
        'Jitter et latence élevés sur le réseau LAN ou WAN',
        'VLAN voix non configuré ou mal configuré sur les switches',
        'Codec VoIP inapproprié pour la bande passante disponible'
      ],
      solution_steps: [
        'Mesurer la latence, la gigue et la perte de paquets avec un outil VoIP',
        'Configurer la QoS avec marquage DSCP EF (46) pour le trafic voix',
        'Créer un VLAN dédié à la voix avec priorité 802.1p',
        'Configurer les files d\'attente prioritaires sur les switches et le routeur',
        'Ajuster le codec VoIP (G.711 pour la qualité, G.729 pour économiser la bande passante)'
      ],
      prevention: [
        'Réaliser un audit réseau avant le déploiement de la VoIP',
        'Dimensionner la bande passante WAN en intégrant les besoins VoIP',
        'Surveiller en continu la qualité VoIP avec un outil de monitoring dédié',
        'Former les équipes réseau à la configuration QoS pour la voix'
      ]
    },
    {
      problem: 'Problème de licence réseau logicielle',
      symptoms: [
        'L\'application affiche "Licence non trouvée" ou "Serveur de licences inaccessible"',
        'Le nombre maximal d\'utilisateurs simultanés est atteint prématurément',
        'L\'application fonctionne hors réseau mais pas en réseau',
        'Les licences ne sont pas libérées après la fermeture de l\'application',
        'Le serveur de licences redémarre automatiquement de manière récurrente'
      ],
      causes: [
        'Serveur de licences hors service ou instable',
        'Port du serveur de licences bloqué par le pare-feu',
        'Fichier de licence expiré ou corrompu',
        'Dongle USB de licence non détecté ou défectueux',
        'Désynchronisation horaire entre le client et le serveur de licences'
      ],
      solution_steps: [
        'Vérifier que le serveur de licences est démarré et accessible (ping, port TCP)',
        'Contrôler les logs du serveur de licences pour identifier les erreurs',
        'Vérifier la validité du fichier de licence et la date d\'expiration',
        'Redémarrer le service du serveur de licences',
        'S\'assurer que le pare-feu autorise la communication sur le port requis'
      ],
      prevention: [
        'Surveiller le serveur de licences avec des alertes de disponibilité',
        'Planifier le renouvellement des licences 2 mois avant expiration',
        'Documenter les ports et les configurations du serveur de licences',
        'Mettre en place un serveur de licences de secours si disponible'
      ]
    },
    {
      problem: 'Boucle de commutation (Switching Loop)',
      symptoms: [
        'Réseau totalement saturé et inutilisable',
        'Broadcast storm avec trafic réseau atteignant 100% sur tous les ports',
        'Les voyants de tous les ports du switch clignotent frénétiquement',
        'CPU du switch à 100% et interface de gestion inaccessible',
        'Perte de connectivité totale et simultanée pour tous les utilisateurs'
      ],
      causes: [
        'Câble réseau connecté entre deux ports du même switch (boucle physique)',
        'Spanning Tree Protocol désactivé ou mal configuré',
        'Switch non managé ajouté au réseau sans protection',
        'Défaillance du STP lors d\'un changement de topologie',
        'Utilisateur ayant branché un câble entre deux prises murales'
      ],
      solution_steps: [
        'Identifier la boucle en déconnectant les ports un par un jusqu\'à rétablissement',
        'Vérifier les logs STP pour identifier le port et le switch impliqués',
        'Supprimer la connexion en boucle et rétablir la topologie correcte',
        'Activer BPDU Guard et Loop Guard sur les ports d\'accès',
        'Reconfigurer le STP avec un Root Bridge explicite et des priorités correctes'
      ],
      prevention: [
        'Activer BPDU Guard sur tous les ports d\'accès utilisateurs',
        'Configurer Storm Control pour limiter le trafic broadcast/multicast',
        'Interdire les switches non managés sur le réseau via une politique',
        'Former le personnel de bureau à ne pas brancher de câbles réseau arbitrairement'
      ]
    },
    {
      problem: 'Saturation de la bande passante',
      symptoms: [
        'Ralentissement généralisé de toutes les applications réseau',
        'Les graphiques de monitoring montrent une utilisation à 90-100%',
        'Augmentation du temps de réponse des applications web et cloud',
        'Le streaming et les téléchargements sont extrêmement lents',
        'Les applications critiques sont impactées aux heures de pointe'
      ],
      causes: [
        'Utilisation non contrôlée de la bande passante (streaming, téléchargements P2P)',
        'Sauvegardes réseau planifiées pendant les heures de bureau',
        'Réplication de données entre sites consommant toute la bande passante',
        'Mises à jour Windows déployées simultanément sur tous les postes',
        'Croissance du nombre d\'utilisateurs sans augmentation de la capacité'
      ],
      solution_steps: [
        'Identifier les consommateurs de bande passante avec NetFlow ou PRTG',
        'Configurer la QoS pour prioriser le trafic critique',
        'Limiter la bande passante allouée aux applications non essentielles',
        'Reprogrammer les sauvegardes et mises à jour en dehors des heures de bureau',
        'Évaluer l\'augmentation de la capacité de la liaison WAN'
      ],
      prevention: [
        'Mettre en place un monitoring continu de la bande passante',
        'Déployer la QoS avec des classes de trafic définies',
        'Planifier la capacité réseau en fonction de la croissance prévisionnelle',
        'Utiliser un proxy cache ou un CDN local pour réduire le trafic WAN'
      ]
    }
  ],

  tips: [
    {
      title: 'Sécuriser le réseau Wi-Fi de l\'entreprise',
      description: 'Un réseau Wi-Fi mal configuré est la porte d\'entrée la plus facile pour un attaquant. Voici comment sécuriser votre réseau sans fil professionnel avec des mesures concrètes et efficaces.',
      steps: [
        'Passer en WPA3-Personal au minimum, ou WPA3-Enterprise avec serveur RADIUS pour les entreprises de plus de 20 postes',
        'Changer le mot de passe Wi-Fi tous les 3 mois avec un minimum de 20 caractères aléatoires',
        'Créer un SSID invité séparé sur un VLAN isolé avec portail captif et limitation de bande passante',
        'Désactiver le WPS (Wi-Fi Protected Setup) qui est vulnérable aux attaques par force brute',
        'Masquer le SSID du réseau principal (sachant que ce n\'est pas une mesure de sécurité forte)',
        'Réduire la puissance d\'émission pour limiter la portée du signal au strict nécessaire',
        'Mettre à jour le firmware des points d\'accès dès que des correctifs sont disponibles',
        'Surveiller les connexions avec des alertes sur les nouveaux appareils détectés'
      ]
    },
    {
      title: 'Mettre en place une sauvegarde efficace',
      description: 'La sauvegarde est la dernière ligne de défense contre les ransomwares, les pannes matérielles et les erreurs humaines. Une stratégie de sauvegarde bien pensée peut sauver votre entreprise.',
      steps: [
        'Appliquer la règle 3-2-1 : 3 copies, 2 supports différents, 1 copie hors site',
        'Identifier les données critiques et définir le RPO (perte de données acceptable) pour chaque catégorie',
        'Configurer des sauvegardes automatiques quotidiennes avec rétention de 30 jours minimum',
        'Utiliser une sauvegarde cloud chiffrée (AES-256) vers un prestataire certifié HDS si nécessaire',
        'Activer l\'immuabilité des sauvegardes pour empêcher la modification par un ransomware',
        'Tester la restauration complète au moins une fois par trimestre en mesurant le temps de reprise',
        'Documenter la procédure de restauration étape par étape et la rendre accessible hors ligne',
        'Alerter automatiquement l\'équipe IT en cas d\'échec de sauvegarde'
      ]
    },
    {
      title: 'Segmenter le réseau pour limiter les risques',
      description: 'La segmentation réseau est l\'une des mesures les plus efficaces pour limiter l\'impact d\'une intrusion. Elle empêche un attaquant de se déplacer librement dans le réseau après avoir compromis un premier poste.',
      steps: [
        'Créer des VLAN séparés : production, invités, IoT, serveurs, téléphonie, gestion',
        'Configurer les ACL sur les switches et le routeur pour contrôler le trafic inter-VLAN',
        'Isoler complètement le réseau invité du réseau interne',
        'Placer les serveurs exposés (web, mail) dans une DMZ avec des règles strictes',
        'Dédier un VLAN de gestion pour l\'administration des équipements réseau',
        'Tester les règles de filtrage inter-VLAN pour vérifier l\'isolation effective',
        'Documenter la cartographie réseau et la matrice de flux autorisés',
        'Réviser les règles de filtrage trimestriellement pour supprimer les exceptions obsolètes'
      ]
    },
    {
      title: 'Choisir et configurer un pare-feu adapté',
      description: 'Le pare-feu est la première ligne de défense du réseau. Un pare-feu bien configuré protège contre la majorité des attaques courantes et permet de contrôler finement les communications.',
      steps: [
        'Évaluer les besoins : nombre d\'utilisateurs, débit, fonctionnalités (IPS, VPN, filtrage URL)',
        'Choisir un pare-feu UTM pour les PME (Fortinet FortiGate, Sophos, WatchGuard)',
        'Appliquer le principe du moindre privilège : tout bloquer par défaut, n\'autoriser que le nécessaire',
        'Configurer les règles par zone : LAN vers WAN, DMZ, VPN, invités',
        'Activer l\'inspection HTTPS pour détecter les menaces dans le trafic chiffré',
        'Configurer les alertes email pour les événements de sécurité importants',
        'Sauvegarder la configuration du pare-feu après chaque modification',
        'Auditer les règles de pare-feu tous les 6 mois pour supprimer les règles inutilisées'
      ]
    },
    {
      title: 'Superviser le réseau avec des outils adaptés',
      description: 'La supervision réseau permet de détecter proactivement les problèmes avant qu\'ils n\'impactent les utilisateurs. Un bon monitoring réduit le temps de résolution des incidents de 60% en moyenne.',
      steps: [
        'Déployer un outil de monitoring adapté : PRTG pour les PME, Zabbix ou Nagios pour les budgets limités',
        'Configurer le SNMP v3 (sécurisé) sur tous les équipements réseau',
        'Définir les seuils d\'alerte : CPU > 80%, bande passante > 70%, perte de paquets > 1%',
        'Créer des tableaux de bord visuels pour la santé du réseau en temps réel',
        'Configurer les notifications par email et SMS pour les alertes critiques',
        'Surveiller les services critiques : serveurs, Internet, VPN, messagerie, Active Directory',
        'Archiver les données de performance pour l\'analyse de tendance et la planification de capacité',
        'Réaliser une revue hebdomadaire des alertes pour ajuster les seuils'
      ]
    },
    {
      title: 'Gérer efficacement les mots de passe réseau',
      description: 'Les mots de passe faibles ou partagés sont la cause de plus de 80% des violations de données. Une politique de mots de passe robuste est indispensable pour protéger l\'accès aux ressources réseau.',
      steps: [
        'Imposer une longueur minimale de 14 caractères avec complexité (majuscules, chiffres, spéciaux)',
        'Déployer un gestionnaire de mots de passe d\'entreprise (Bitwarden, KeePass, 1Password Business)',
        'Activer l\'authentification multi-facteurs (MFA) sur tous les accès critiques (VPN, email, admin)',
        'Utiliser des mots de passe différents pour chaque service et compte',
        'Configurer la politique de mot de passe dans Active Directory via GPO',
        'Interdire les mots de passe les plus courants avec une liste noire personnalisée',
        'Ne jamais stocker les mots de passe en clair (fichiers Excel, post-it)',
        'Changer immédiatement les mots de passe par défaut sur tous les équipements réseau'
      ]
    },
    {
      title: 'Planifier une maintenance réseau régulière',
      description: 'La maintenance préventive du réseau évite les pannes coûteuses et prolonge la durée de vie des équipements. Un réseau bien entretenu est plus performant, plus fiable et plus sécurisé.',
      steps: [
        'Planifier une fenêtre de maintenance mensuelle communiquée aux utilisateurs',
        'Mettre à jour les firmwares des switches, routeurs et points d\'accès trimestriellement',
        'Vérifier les logs d\'erreurs des équipements réseau et les statistiques d\'interface',
        'Nettoyer les câbles et les baies de brassage (étiquetage, retrait des câbles inutilisés)',
        'Tester les alimentations de secours (onduleurs/UPS) mensuellement',
        'Vérifier l\'espace disque et les performances des serveurs réseau',
        'Renouveler les certificats SSL/TLS avant leur expiration',
        'Documenter toutes les modifications effectuées dans un registre de changements'
      ]
    },
    {
      title: 'Former les employés à la cybersécurité',
      description: 'Les employés sont à la fois le maillon le plus faible et la première ligne de défense en cybersécurité. Un programme de sensibilisation efficace réduit le risque d\'incident de 70%.',
      steps: [
        'Organiser une session de sensibilisation initiale pour tous les nouveaux employés',
        'Envoyer des campagnes de phishing simulé mensuelles et analyser les résultats',
        'Créer des fiches réflexes simples : que faire en cas d\'email suspect, de clé USB trouvée, etc.',
        'Aborder les sujets essentiels : phishing, mots de passe, Wi-Fi public, ingénierie sociale',
        'Diffuser une newsletter sécurité mensuelle avec les menaces actuelles et les bonnes pratiques',
        'Récompenser les employés qui signalent des incidents ou des tentatives de phishing',
        'Tester la réaction des équipes avec des exercices de crise cyber annuels',
        'Adapter la formation au rôle : direction (fraude au président), comptabilité (fraude au virement)'
      ]
    },
    {
      title: 'Préparer un plan de reprise d\'activité (PRA)',
      description: 'Un plan de reprise d\'activité définit les procédures pour restaurer les systèmes critiques après un sinistre majeur. Sans PRA, une PME met en moyenne 7 jours à reprendre son activité après une panne grave.',
      steps: [
        'Identifier les systèmes critiques et définir les objectifs RTO et RPO pour chacun',
        'Documenter les procédures de restauration étape par étape pour chaque service',
        'Mettre en place une infrastructure de secours (serveur de backup, connexion Internet secondaire)',
        'Configurer la réplication des données vers un site distant ou le cloud',
        'Préparer un annuaire de crise avec les contacts des prestataires et des fournisseurs',
        'Tester le PRA complet au moins une fois par an avec un exercice grandeur nature',
        'Mesurer le temps réel de reprise et comparer avec les objectifs fixés',
        'Mettre à jour le PRA à chaque changement d\'infrastructure ou d\'application'
      ]
    },
    {
      title: 'Optimiser les performances réseau au quotidien',
      description: 'Un réseau performant améliore la productivité des employés et réduit les frustrations. Des optimisations simples peuvent améliorer les performances de 30 à 50% sans investissement matériel.',
      steps: [
        'Identifier les goulets d\'étranglement avec des outils de monitoring (PRTG, ntopng)',
        'Configurer la QoS pour prioriser le trafic critique (VoIP, applications métier)',
        'Planifier les mises à jour et sauvegardes en dehors des heures de bureau',
        'Optimiser la configuration DNS avec des serveurs rapides et un cache local',
        'Vérifier et remplacer les câbles réseau anciens ou de catégorie insuffisante',
        'Configurer le LACP (agrégation de liens) sur les liaisons serveur-switch critiques',
        'Déployer un proxy cache ou un CDN local pour les mises à jour et le contenu récurrent',
        'Réaliser des tests de performance mensuels et comparer les résultats sur le temps'
      ]
    }
  ]
};
