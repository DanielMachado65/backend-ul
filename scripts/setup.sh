#!/bin/bash

# Function to check if a mongo is ready
function mongo_ready() {
    mongo --host $1 --eval "db.adminCommand('ping')"
}

# Wait for mongo1 to become ready
while ! mongo_ready mongo1:27017; do sleep 1; done

# Wait for mongo2 to become ready
while ! mongo_ready mongo2:27018; do sleep 1; done

# Wait for mongo3 to become ready
while ! mongo_ready mongo3:27019; do sleep 1; done

# All Mongo instances are ready, initiate the replica set
mongo --host mongo1:27017 --eval 'rs.initiate({
    _id: "rs0",
    version: 1,
    members: [
        { _id: 0, host: "mongo1:27017", priority: 2 },
        { _id: 1, host: "mongo2:27018", priority: 1 },
        { _id: 2, host: "mongo3:27019", priority: 1 }
    ]
})'
sleep 10
mongo --host mongo1:27017 --eval 'rs.status()'