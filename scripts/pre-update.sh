#!/bin/bash

# Environment variables
# - CONTAINER_NAME -> Name of the docker container
# - DRAFTBOT_SERVER_IP -> IP du webservice Crownicles
# - FRESHSTATUS_API_KEY -> API key freshtatus
# - FRESHSTATUS_DOMAIN -> Domain freshstatus (e.g. crownicles)
# - FRESHSTATUS_COMPONENT -> Component id to be put in maintenance

logit()
{
    echo "[${USER}][`date`] - ${*}"
}

# Try every 10s 60 times, so 10 min
count=0
while [[ $count < 60 ]]
do
    # Curl the number of blocked player in the bot
    if [ "$(curl -s http://$DRAFTBOT_SERVER_IP/blocked_players)" == "0" ]
    then
        logit "No player blocked, exiting the script"
        break
    fi

    if [ $count == 0 ]
    then
        logit "Entering pre update maintenance script"

        curl -s -X POST -H "Content-Type: text/plain" http://$DRAFTBOT_SERVER_IP/maintenance?enable=1

        logit "Called maintenance web service end point"

        if [ -n "$FRESHSTATUS_API_KEY" ]
        then
            logit "Creating freshstatus maintenance"

            # Call freshstatus api to put the bot under maintenance
            maintenanceReturn=$(curl -s -u ${FRESHSTATUS_API_KEY}:${FRESHSTATUS_DOMAIN} -H "Content-Type: application/json" -X POST --data "{\"title\":\"Mise à jour du bot\",\"start_time\":\"$(TZ=UTC date +"%Y-%m-%dT%H:%M:%SZ")\",\"end_time\":\"$(TZ=UTC date --date "10 min" +"%Y-%m-%dT%H:%M:%SZ")\",\"affected_components\":[{\"component\":\"${FRESHSTATUS_COMPONENT}\",\"new_status\":\"UM\"}]}" 'https://public-api.freshstatus.io/api/v1/maintenance/')
            logit "Maintenance return: $maintenanceReturn"

            maintenanceId=$(echo $maintenanceReturn | jq .id)
            if [ -z "${maintenanceId}" ]
            then
                logit "Error maintenance ID empty"
            else
                curl -s -u ${FRESHSTATUS_API_KEY}:${FRESHSTATUS_DOMAIN} -H "Content-Type: application/json" -X POST "https://public-api.freshstatus.io/api/v1/maintenance/$maintenanceId/start/"

                logit "Freshstatus maintenance created and started"

                # Save the maintenance id for post update
                echo $maintenanceId > /tmp/freshstatus_${CONTAINER_NAME}
            fi
        fi
    fi

    count=$((count+1))
    sleep 10
done
