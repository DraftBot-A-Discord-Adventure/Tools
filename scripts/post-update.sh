#!/bin/bash

# Environment variables
# - CONTAINER_NAME -> Name of the docker container
# - FRESHSTATUS_API_KEY -> API key freshtatus
# - FRESHSTATUS_DOMAIN -> Domain freshstatus (e.g. crownicles)

logit()
{
    echo "[${USER}][`date`] - ${*}"
}

logit "Entering post update maintenance script"

curl -s -X POST -H "Content-Type: text/plain" http://$DRAFTBOT_SERVER_IP/maintenance?enable=0

logit "Called maintenance web service end point"

if [ -e /tmp/freshstatus_${CONTAINER_NAME} ]
then
    curl -s -u ${FRESHSTATUS_API_KEY}:${FRESHSTATUS_DOMAIN} -H "Content-Type: application/json" -X POST "https://public-api.freshstatus.io/api/v1/maintenance/$(cat /tmp/freshstatus_${CONTAINER_NAME})/complete/"

    rm /tmp/freshstatus_${CONTAINER_NAME}

    logit "Freshstatus maintenance completed"
else
    logit "Tmp file /tmp/freshstatus_${CONTAINER_NAME} doesn't exists"
fi
