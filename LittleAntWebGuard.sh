#! /bin/bash
while true; do
    {
        npm start
        echo "webrtc_to_rtmp_server stopped unexpected, restarting"
    }
    sleep 1
done