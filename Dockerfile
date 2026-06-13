# On utilise un environnement Node.js léger
FROM node:20-alpine

# On définit le dossier de travail dans le conteneur
WORKDIR /app

# On copie les fichiers de configuration (s'ils existent)
COPY package*.json ./

# Installation des dépendances (sera ignoré si package.json n'existe pas encore)
RUN npm install || true

# On expose le port de développement de Vite
EXPOSE 5173

# La commande par défaut pour lancer le serveur
CMD ["npm", "run", "dev", "--", "--host"]
