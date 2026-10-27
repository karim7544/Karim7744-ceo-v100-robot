# Karim7744 CEO Robot V100

## Mission

Ce dépôt est un espace de travail dédié au projet `CEO ROBOT V100`.

Il est conçu selon le principe strict suivant :
- additive uniquement ;
- sans détruire ou réécrire les versions antérieures (`V12`, `V13`, etc.);
- sans secrets exposés;
- sans dépendance Cloudflare de production active;
- sans exécution automatique de code non vérifié.

## Contexte

Le dépôt sert de support pour :
- organiser la mission stratégique du projet ;
- stocker les fichiers validés ;
- capturer l’état des composants ;
- protéger les éléments sensibles dans la quarantaine ;
- conserver un protocole de validation étape par étape.

## Statuts

- PRÉVU
- DÉVELOPPÉ
- TESTÉ
- VALIDÉ
- VÉRIFIÉ
- BLOQUÉ
- INCONNU

## Règles de travail

1. Aucune modification destructrice des projets précédents.
2. Aucun secret dans le dépôt.
3. Aucune donnée sensible non nécessaire.
4. Aucune exécution de code sans vérification préalable.
5. Toute nouvelle fonction doit être documentée et justifiée.
6. Les éléments sensibles ou critiques restent en quarantaine.

## Structure

- `src/` : code source du projet
- `docs/` : documentation et inventaires
- `quarantine/` : éléments sensibles, non exécutables ou à vérifier
- `.gitignore` : protections locales
- `package.json` : configuration minimale du projet
- `wrangler.toml` : configuration placeholder sans secrets

## Remarque

Ce dépôt est volontairement conservateur et à visée de contrôle. Il ne doit pas être utilisée pour du code non vérifié ou du déploiement incontrôlé.
