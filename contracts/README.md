# CampusChain — contrats intelligents

Projet Hardhat isolé pour la couche blockchain du prêt de matériel universitaire.

> **État actuel :** le contrat est compilé et testé sur le réseau Hardhat local.
> Le frontend React n’est **pas encore connecté** à ce contrat. Les transactions affichées
> dans l’interface restent des simulations locales (`isSimulated: true`). Aucun wallet,
> RPC public, backend ou base de données n’est utilisé par le frontend.

## Versions

- Node.js 22.19.0 (testé), npm 11.14.0
- Hardhat 2.29.1
- Solidity 0.8.28
- OpenZeppelin Contracts 5.6.1
- Ethers 6.17.0
- Hardhat Toolbox 6.1.2

Le projet Hardhat possède son propre `package.json` et ses propres dépendances.
Le `package.json` du frontend n’est pas modifié.

## Installation

```bash
cd contracts
npm install
```

## Compiler et tester

```bash
npm run compile
npm run typecheck
npm test
```

## Lancer le réseau local et déployer

Ouvrir **deux terminaux** depuis la racine du dépôt.

Terminal 1 — démarrer le réseau Hardhat local :

```bash
cd contracts
npm run node
```

Le RPC local écoute sur `http://127.0.0.1:8545` avec le chain ID `31337`.
Les comptes de développement Hardhat et leurs clés privées sont affichés dans ce terminal.
Ils sont réservés au développement local et ne doivent jamais être utilisés sur un réseau public.

Terminal 2 — compiler puis déployer :

```bash
cd contracts
npm run compile
npm run deploy:local
```

Le script affiche l’adresse du contrat et écrit les informations de déploiement dans
`deployments/localhost.json` (dossier ignoré par Git).

Pour arrêter le réseau local, revenir au terminal 1 et utiliser `Ctrl+C`.

## Modèle du contrat

### Rôles

| Rôle | Usage |
| --- | --- |
| `DEFAULT_ADMIN_ROLE` | Gère l’attribution des rôles. |
| `ADMIN_ROLE` | Enregistre le matériel, change sa disponibilité, approuve ou refuse les demandes et confirme les retours. |

Le compte qui déploie le contrat reçoit les deux rôles.

### États d’un prêt

```text
None → Pending → Approved → Returned
                ↘ Rejected
       ↘ Cancelled
```

- `Pending` : demande créée par un étudiant ; le stock n’est pas encore réservé.
- `Approved` : décision administrateur ; le stock demandé est réservé.
- `Rejected` : décision administrateur sans impact sur le stock.
- `Returned` : retour confirmé par l’administration ; le stock est restitué.
- `Cancelled` : annulation par l’emprunteur avant toute décision.

### Fonctions principales

| Fonction | Appelant | Effet |
| --- | --- | --- |
| `registerEquipment` | Admin | Enregistre une référence et son stock initial. |
| `setEquipmentActive` | Admin | Active ou désactive temporairement le matériel. |
| `requestLoan` | Étudiant | Crée une demande en attente. |
| `approveLoan` | Admin | Réserve le stock et approuve la demande. |
| `rejectLoan` | Admin | Refuse une demande en attente. |
| `cancelLoan` | Emprunteur | Annule sa propre demande en attente. |
| `recordReturn` | Admin | Confirme le retour physique et restitue le stock. |
| `getEquipment` | Tous | Lit les métadonnées et le stock. |
| `getLoan` | Tous | Lit l’état d’un prêt. |

### Événements

- `EquipmentRegistered`
- `EquipmentAvailabilityChanged`
- `LoanRequested`
- `LoanApproved`
- `LoanRejected`
- `LoanCancelled`
- `LoanReturned`

## Données et confidentialité

Le contrat stocke uniquement :

- l’adresse du wallet de l’emprunteur ;
- l’identifiant et les métadonnées non sensibles du matériel ;
- la quantité et l’état du prêt ;
- des horodatages ;
- un code opaque de refus.

Les noms, e-mails, numéros d’étudiant, motifs libres et autres données personnelles
doivent rester hors chaîne. Un code de refus peut être calculé hors chaîne avec
`ethers.id("INSUFFICIENT_STOCK")` par exemple.

## Réseaux

Seul le réseau local est configuré en plus du réseau Hardhat intégré :

```text
hardhat   : réseau EDR intégré, utilisé par les tests
localhost : http://127.0.0.1:8545, chainId 31337
```

Aucun réseau public n’est configuré et aucun déploiement public n’est effectué.

## Intégration frontend ultérieure

L’intégration Ethers.js devra être ajoutée séparément, sans remplacer les données mock
actuelles avant validation. Tant que cette intégration n’est pas terminée, l’interface
doit conserver les mentions « simulée » et ne doit pas présenter les transactions
locales comme des transactions blockchain réelles.
