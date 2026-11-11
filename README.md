# CampusChain — Gestion du prêt de matériel universitaire

Frontend et couche locale de contrats intelligents d’un projet universitaire de **gestion du prêt de matériel universitaire basée sur la blockchain**.

> **Important — frontend de démonstration**  
> Ce dépôt contient le frontend et un projet Hardhat isolé dans `contracts/`. Le contrat est compilé et testé sur le réseau Hardhat local. Le frontend peut **connecter un wallet MetaMask** et vérifier le réseau local, mais il **n’envoie encore aucune transaction au contrat** : les demandes de prêt, validations et retours restent **générés localement et clairement identifiés comme simulés**. Aucun backend, RPC public, réseau blockchain public, clé privée ou fonds réel n’est utilisé. Les transactions de l’historique ne doivent pas être présentées comme de vraies transactions on-chain.

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4 (plugin `@tailwindcss/vite`)
- React Router
- Lucide React
- ethers v6 (`BrowserProvider`, chargé à la demande pour la connexion wallet)

## Fonctionnalités

- **Tableau de bord** : statistiques du parc, demandes récentes, disponibilité par catégorie, prochains retours, activité simulée.
- **Catalogue du matériel** : recherche, filtres par catégorie, filtre de disponibilité, cartes de matériel et demande de prêt via formulaire.
- **Mes emprunts** : filtres par statut, dates de retrait et de retour, annulation d’une demande, enregistrement d’un retour, motifs de refus.
- **Administration** : file d’attente, approbation, refus avec motif, historique des décisions.
- **Historique blockchain** : journal de transactions locales simulées, recherche, filtres, copie de hash fictif et fiche détaillée explicitement marquée « simulée ».
- Interface responsive (sidebar mobile, tableaux transformés en cartes), notifications et profil de démonstration.
- **Connexion wallet** : bouton MetaMask dans la barre supérieure, adresse publique et réseau affichés, gestion des changements de compte/réseau, refus et réseau non pris en charge.
- Données et état typés conservés en mémoire pour la session.

## Couche blockchain locale

Un projet Hardhat indépendant se trouve dans `contracts/`. Il contient le contrat
`EquipmentLending.sol`, ses tests et un script de déploiement local. Le frontend actuel
reste basé sur ses données mock et n’est pas encore connecté à ce contrat.

```bash
cd contracts
npm install
npm run compile
npm run typecheck
npm test
```

Pour lancer le réseau local et déployer le contrat :

```bash
# Terminal 1
cd contracts
npm run node
```

```bash
# Terminal 2
cd contracts
npm run compile
npm run deploy:local
```

Le RPC local est disponible sur `http://127.0.0.1:8545` (chain ID `31337`).
Aucun réseau public n’est configuré. Voir `contracts/README.md` pour le modèle du contrat,
les rôles, les événements et les règles de confidentialité.

## Connexion wallet (MetaMask)

Le bouton wallet de la barre supérieure permet de connecter MetaMask et d’afficher
uniquement l’**adresse publique** et le **réseau actif**.

- Réseau requis : **CampusChain Local**, chain ID **31337**, RPC `http://127.0.0.1:8545`.
- Adresse de déploiement local attendue : `0x5FbDB2315678afecb367f032d93F642f64180aa3`
  (vérifiez qu’elle contient bien du bytecode : le nœud Hardhat doit tourner et le contrat
  doit être redéployé après chaque redémarrage du nœud).
- Si le réseau n’est pas configuré dans MetaMask, le bouton propose de le basculer et
  utilise `wallet_addEthereumChain` en repli.
- Les changements de compte et de réseau sont suivis via les événements EIP-1193.
- Un refus dans MetaMask, une demande déjà en cours ou un réseau non pris en charge
  affichent un message explicite ; les interactions avec le contrat restent bloquées
  hors du chain ID 31337.
- Aucune clé privée n’est demandée, lue ou stockée. Aucune donnée de wallet n’est
  persistée : l’état reste en mémoire pour la session.
- **Les prêts et transactions restent simulés** : aucune transaction n’est envoyée au
  contrat à ce stade.

Si MetaMask n’est pas installé, l’interface affiche un lien vers l’installation et
continue de fonctionner avec les données mock.

## Démarrage du frontend

```bash
npm install
npm run dev
```

## Vérification de production

```bash
npm run build
npm run preview
```

## Structure

```text
src/
├── components/
│   ├── dashboard/      # Cartes et modules du tableau de bord
│   ├── equipment/      # Cartes matériel et formulaire de demande
│   ├── layout/         # Sidebar, topbar, layout applicatif
│   ├── loans/          # Carte d’emprunt étudiant
│   ├── ui/             # Boutons, badges, cartes, modales, toasts…
│   └── wallet/         # Bouton et panneau de connexion MetaMask
├── config/             # Configuration du réseau local et du contrat
├── context/            # État applicatif, wallet, actions et notifications
├── data/               # Données mock typées (matériel, emprunts, transactions)
├── lib/                # Dates, statuts, helpers blockchain simulée, wallet ethers
├── pages/              # Dashboard, matériel, emprunts, admin, blockchain
└── types/              # Types TypeScript partagés (dont EIP-1193 et wallet)

contracts/              # Projet Hardhat isolé
├── contracts/          # EquipmentLending.sol
├── deployments/        # Adresse déployée sur le réseau local
├── scripts/            # Déploiement sur le réseau local
├── test/               # Tests automatisés du contrat
└── README.md           # Rôles, états, commandes et confidentialité
```

## Prochaines étapes prévues

1. Connecter les actions de prêt au contrat local avec ethers (lecture puis écriture), en conservant les garde-fous de réseau.
2. Remplacement progressif des enregistrements locaux par les événements on-chain.
3. Authentification réelle et persistance côté serveur.
4. Déploiement sur un réseau de test public, uniquement après validation et audit.

Tant que les actions de prêt ne sont pas connectées au contrat, toutes les actions de l’interface restent locales et conservent la mention « simulation ».
