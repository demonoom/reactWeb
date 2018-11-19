#! /bin/bash
while true; do
    {
        node LittleAntWebServer.js
        echo "LittleAntWebServer stopped unexpected, restarting"
    }
    sleep 1
done