# This script auto update a docker container
#
# Environment variables:
# - CONTAINER_NAME -> name of the running container
# - DOCKER_IMAGE_NAME -> name of the docker image
# - DOCKER_COMPOSE_FILE_PATH -> docker-compose.yml file path
# - WEBHOOK -> discord webhook to post the notification to
# - FORCE_UPDATE_ANYWAY -> force the update even if the digest match if set to 1
# - PRE_UPDATE_SCRIPT -> shell script to run before updating (optional)
# - POST_UPDATE_SCRIPT -> shell script to run after updating (optional)
#
# Possible imprevements:
# - Get the docker image and docker compose file automatically

# Check env variables
if [[ -z "${CONTAINER_NAME}" ]]; then
    echo "env var CONTAINER_NAME not set"
    exit 1
fi
if [[ -z "${DOCKER_IMAGE_NAME}" ]]; then
    echo "env var DOCKER_IMAGE_NAME not set"
    exit 1
fi
if [[ -z "${DOCKER_COMPOSE_FILE_PATH}" ]]; then
    echo "env var DOCKER_COMPOSE_FILE_PATH not set"
    exit 1
fi
if [[ -z "${WEBHOOK}" ]]; then
    echo "env var WEBHOOK not set"
    exit 1
fi

logit()
{
    echo "[${USER}][`date`] - ${*}"
}

# Check if tmp file already exsist to prevent this script to run multiple times at the same time
if [ -e /tmp/auto_update_docker_${CONTAINER_NAME} ]
then
    logit "Tmp file /tmp/auto_update_docker_${CONTAINER_NAME} exsist, exiting"
    exit 0
fi

# Check if docker is running
running=$(docker ps --format '{{json .Names}}' | grep "\"${CONTAINER_NAME}\"")

if [ -n "$running" ]
then
    logit "Container \"${CONTAINER_NAME}\" is running"

    # Get current docker hash
    currentDigest=$(docker inspect "${DOCKER_IMAGE_NAME}" | jq .[0].RepoDigests[0] | cut -d "@" -f 2 | cut -c 1-71)
    logit "Current local digest of image \"${DOCKER_IMAGE_NAME}\" is $currentDigest"

    # Get current hash
    latestDigest=$(curl https://hub.docker.com/v2/repositories/${DOCKER_IMAGE_NAME}/tags/latest | jq .digest | cut -c 2-72)
    logit "Latest remote digest of image \"${DOCKER_IMAGE_NAME}\" is $latestDigest"

    logit "Forced update: $FORCE_UPDATE_ANYWAY"

    if [ "$FORCE_UPDATE_ANYWAY" == "1" ] || [ $currentDigest != $latestDigest ]
    then
        logit "Different digests or forced update, updating..."

        # Create tmp file to prevent this script to run multiple times at the same time
        touch /tmp/auto_update_docker_${CONTAINER_NAME}

        {
            # Launch pre update script if exists
            if [[ -z "${PRE_UPDATE_SCRIPT}" ]]; then
                logit "No pre update script found, skipping"
            else
                logit "Launching pre update script $PRE_UPDATE_SCRIPT"
                sh $PRE_UPDATE_SCRIPT
            fi

            # Pull latest image
            docker pull $DOCKER_IMAGE_NAME
            logit "Pull done"

            # Restart container
            docker compose -f $DOCKER_COMPOSE_FILE_PATH up -d $CONTAINER_NAME
            logit "Restart done"

            # Remove old images
            removedImages=""
            for oldImage in `docker images --filter=reference="${DOCKER_IMAGE_NAME}" --filter=before="${DOCKER_IMAGE_NAME}:latest" --format '{{json .ID}}'`; do imageHash=$(echo -n $oldImage | cut -c 2-13); removedImages="$removedImages$imageHash\n"; docker image rm $imageHash; logit "Removed image $imageHash"; done
            if [ "$removedImages" == "" ]
            then
                removedImages="None"
            fi

            # Send discord message
            curl -H "Content-Type: application/json" -X POST -d "{\"content\": \"Container \`$CONTAINER_NAME\` updated\nOld digest: \`$currentDigest\`\nNew digest: \`$latestDigest\`\nRemoved images:\n\`\`\`$removedImages\`\`\`\"}" $WEBHOOK
            logit "Sent webhook notification"

            # Launch post update script if exists
            if [[ -z "${POST_UPDATE_SCRIPT}" ]]; then
                logit "No post update script found, skipping"
            else
                logit "Launching post update script $POST_UPDATE_SCRIPT"
                sh $POST_UPDATE_SCRIPT
            fi
        }

        # Remove tmp file
        rm /tmp/auto_update_docker_${CONTAINER_NAME}

        logit "Update script finished"
    else
        logit "Same digests, not updating"
    fi
else
    logit "Container \"${CONTAINER_NAME}\" not running"
fi
