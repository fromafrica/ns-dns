# Use an official Ubuntu as a parent image
FROM ubuntu:latest

# Update the system and install Node.js and npm
RUN apt-get update && \
    apt-get install -y nodejs npm

# Create a directory to hold the application code inside the image
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Install any needed packages specified in package.json
RUN npm install

# Make port 3053 available to the world outside this container
EXPOSE 3053

# Define the command to run your app
# (Use "node" to run your file, e.g., "node index.js")
CMD ["node", "dns.js"]
