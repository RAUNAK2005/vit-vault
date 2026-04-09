# --------- STAGE 1: Build the React App ---------
# We use Node.js to install dependencies and build the app
FROM node:20-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json first (this caches dependencies so builds are faster)
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build the app for production (creates the 'dist' folder)
RUN npm run build

# --------- STAGE 2: Serve the App ---------
# We use Nginx (a super fast web server) to serve the built files
FROM nginx:alpine

# Copy the build files from Stage 1 into the Nginx server folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]
