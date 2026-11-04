# CampusChain — Gestion du prêt de matériel universitaire

Frontend et couche locale de contrats intelligents d’un projet universitaire de **gestion du prêt de matériel universitaire basée sur la blockchain**.

> **Important — frontend de démonstration**  
> Ce dépôt contient le frontend et un projet Hardhat isolé dans `contracts/`. Le contrat est compilé et testé sur le réseau Hardhat local, mais il **n’est pas encore connecté au frontend**. Aucun backend, wallet, RPC public ou réseau blockchain public n’est utilisé par l’interface. Les transactions affichées dans l’historique sont **générées localement et clairement identifiées comme simulées**. Elles ne doivent pas être présentées comme de vraies transactions on-chain.

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4 (plugin `@tailwindcss/vite`)
- React Router
- Lucide React

## Fonctionnalités

- **Tableau de bord** : statistiques du parc, demandes récentes, disponibilité par catégorie, prochains retours, activité simulée.
- **Catalogue du matériel** : recherche, filtres par catégorie, filtre de disponibilité, cartes de matériel et demande de prêt via formulaire.
- **Mes emprunts** : filtres par statut, dates de retrait et de retour, annulation d’une demande, enregistrement d’un retour, motifs de refus.
- **Administration** : file d’attente, approbation, refus avec motif, historique des décisions.
- **Historique blockchain** : journal de transactions locales simulées, recherche, filtres, copie de hash fictif et fiche détaillée explicitement marquée « simulée ».
- Interface responsive (sidebar mobile, tableaux transformés en cartes), notifications et profil de démonstration.
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
│   └── ui/             # Boutons, badges, cartes, modales, toasts…
├── context/            # État applicatif, actions et notifications
├── data/               # Données mock typées (matériel, emprunts, transactions)
├── lib/                # Dates, statuts, helpers blockchain simulée
├── pages/              # Dashboard, matériel, emprunts, admin, blockchain
└── types/              # Types TypeScript partagés

contracts/              # Projet Hardhat isolé, non connecté au frontend
├── contracts/          # EquipmentLending.sol
├── scripts/            # Déploiement sur le réseau local
├── test/               # Tests automatisés du contrat
└── README.md           # Rôles, états, commandes et confidentialité
```

## Prochaines étapes prévues

1. Intégration Ethers.js et connexion du wallet au contrat local.
2. Remplacement progressif des enregistrements locaux par les événements on-chain.
3. Authentification réelle et persistance côté serveur.
4. Déploiement sur un réseau de test public, uniquement après validation et audit.

Tant que l’intégration frontend n’est pas réalisée, toutes les actions de l’interface restent locales et conservent la mention « simulation ».
