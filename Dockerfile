FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port on which your app will run (if your app runs on port 3000, adjust accordingly)
EXPOSE 8080

# Command to run the application
CMD ["npm", "start"]
