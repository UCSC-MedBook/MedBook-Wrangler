export MONGO_URL="mongodb://localhost:27017/MedBook"

if [ -z "$1" ]; then
    meteor --port 3002
else
    meteor $1 --port 3002
fi
