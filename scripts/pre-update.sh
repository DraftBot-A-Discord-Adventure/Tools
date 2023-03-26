#!/bin/bash

serverIP=http://127.0.0.1:8080

# Try every 10s 60 times, so 10 min
count=0
while [[ $count < 60 ]]
do
    # Curl the number of blocked player in the bot
    if [ "$(curl -s $serverIP/blocked_players)" == "0" ]
    then
        break
    fi
    if [ $count == 0 ]
    then
        curl -s -X POST -H "Content-Type: text/plain" $serverIP/maintenance?enable=1
    fi
    count=$((count+1))
    sleep 10
done
