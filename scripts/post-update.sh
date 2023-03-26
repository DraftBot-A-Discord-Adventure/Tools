#!/bin/bash

# Environment variables
# - CONTAINER_NAME -> Name of the docker container
# - FRESHSTATUS_API_KEY -> API key freshtatus
# - FRESHSTATUS_DOMAIN -> Domain freshstatus (e.g. draftbot)

logit()
{
    echo "[${USER}][`date`] - ${*}"
}

if [ -e /tmp/freshstatus_${CONTAINER_NAME} ]
then
    curl -s -u ${FRESHSTATUS_API_KEY}:${FRESHSTATUS_DOMAIN} -H "Content-Type: application/json" -X POST "https://public-api.freshstatus.io/api/v1/maintenance/$(cat /tmp/freshstatus_${CONTAINER_NAME})/complete/"

    logit "Freshstatus maintenance completed"
else
    logit "Tmp file /tmp/freshstatus_${CONTAINER_NAME} doesn't exists"
fi
