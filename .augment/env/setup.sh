#!/bin/bash

# TutEasy Platform Setup Script
# Sets up Node.js environment and installs dependencies for all components

set -e

echo "🚀 Setting up TutEasy Platform Development Environment"
echo "=================================================="

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update -y

# Install Node.js 18.x (LTS)
echo "📦 Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js and npm installation
echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Add Node.js to PATH in user profile
echo "🔧 Adding Node.js to PATH..."
echo 'export PATH="/usr/bin:$PATH"' >> $HOME/.profile

# Install global dependencies
echo "📦 Installing global npm packages..."
npm install -g typescript tsx

# Install root dependencies (MCP server)
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Build TypeScript projects
echo "🔨 Building TypeScript projects..."

# Build root MCP server
echo "🔨 Building MCP server..."
npm run build

# Build backend
echo "🔨 Building backend..."
cd backend
npm run build
cd ..

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm run build
cd ..

echo "✅ Setup completed successfully!"
echo "🧪 Ready to run tests..."