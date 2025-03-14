FROM node:19-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json for better layer caching
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
# Add custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]