# Use a Node.js image to build the application
FROM node:20-alpine as builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to install dependencies
# A wildcard is used to ensure both package.json and package-lock.json are copied
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React application
# Assuming the build command is `npm run build` and the output directory is `dist`
RUN npm run build

# Use a lightweight Nginx image to serve the built application
FROM nginx:alpine

# Copy the built files from the builder stage to the Nginx public directory
# Assuming the build output directory is `dist`
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration (optional, but good practice)
# If you have a custom nginx.conf, uncomment the line below and place your conf in codeverse-frontend/nginx.conf
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"] 