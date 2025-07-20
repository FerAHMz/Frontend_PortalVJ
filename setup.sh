#!/bin/bash

echo "📦 Installing dependencies..."
npm install

echo "🔍 Running linter..."
npm run lint || echo "Linting failed"

echo "🧪 Running tests..."
npm test || echo "Tests failed"

echo "✅ Setup complete."
