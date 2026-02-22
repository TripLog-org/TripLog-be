#!/usr/bin/env bash
set -euo pipefail

# Usage:
#  ./create_mongo_user.sh [username] [password] [host] [port]
# Example:
#  ./create_mongo_user.sh triplog_user 'tR!pL0g#2026Aq9' localhost 27017

USER=${1:-triplog_user}
PASS=${2:-tR!pL0g#2026Aq9}
HOST=${3:-localhost}
PORT=${4:-27017}

echo "Creating MongoDB user '$USER' for database 'triplog' on ${HOST}:${PORT}"

# Try to run mongosh locally. If not available or you're using Docker,
# see the notes below for running inside the Mongo container.

if command -v mongosh >/dev/null 2>&1; then
  mongosh --host "$HOST" --port "$PORT" --eval \
    "db = db.getSiblingDB('triplog'); db.createUser({user: '$USER', pwd: '$PASS', roles: [{role: 'readWrite', db: 'triplog'}]});"

  echo "User created (or already exists)."
  exit 0
fi

echo "mongosh not found on PATH. If Mongo is running inside Docker, run one of the commands below (replace <container>):"
echo
echo "  # Execute inside a running mongo container (example):"
echo "  docker exec -it <mongo-container> mongosh --eval \"db.getSiblingDB('triplog').createUser({user: '$USER', pwd: '$PASS', roles:[{role:'readWrite',db:'triplog'}]})\""
echo
echo "  # Or copy this script into the container and run it there."
echo
echo "Note: This script only creates a user for the 'triplog' database and does not modify other databases or users."

exit 1
