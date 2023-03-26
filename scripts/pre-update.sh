#!/bin/bash

# Try every 10s 60 times, so 10 min
count=0
while [[ $count < 60 ]]
do
    # Curl the number of blocked player in the bot
    if [ "$(curl -s http://127.0.0.1:8080/blocked_players)" == "0" ]
    then
        break
    fi
    count=$((count+1))
    sleep 10
done
