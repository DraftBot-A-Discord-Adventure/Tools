# Crownicles Item Explorer

Interface avancée pour explorer, filtrer et analyser les objets de Crownicles.

## 🚀 Démarrage rapide

### Option 1 : Serveur de développement (Recommandé)
```bash
cd generators/item-explorer
python3 serve.py
```
Le serveur se lancera automatiquement et ouvrira votre navigateur sur `http://localhost:8000`

### Option 2 : Serveur Python simple
```bash
cd generators/item-explorer
python3 -m http.server 8000
```
Puis ouvrez `http://localhost:8000` dans votre navigateur.

## 🛠️ Fonctionnalités

- **Chargement automatique** des objets depuis GitHub
- **Emojis officiels** Crownicles avec parsing amélioré
- **Filtrage avancé** par rareté, nature, type et recherche textuelle
- **Tri dynamique** sur toutes les colonnes
- **Coloration conditionnelle** pour identifier les meilleures stats
- **Sauvegarde/Importation** des données avec emojis préservés
- **Statistiques en temps réel** et distribution de rareté
- **Interface responsive** et intuitive

## 🏗️ Architecture

L'application utilise une architecture modulaire ES6 :

```
js/
├── app.js                 # Point d'entrée
├── components/           # Composants UI
├── config/              # Configuration et constantes
├── controllers/         # Logique métier
├── services/           # Services de données
└── utils/              # Utilitaires
```

## 🔧 Développement

Pour modifier l'application :
1. Lancez le serveur de développement
2. Modifiez les fichiers dans `js/`
3. Rechargez la page pour voir les changements

Les modules sont organisés par responsabilité pour faciliter la maintenance.