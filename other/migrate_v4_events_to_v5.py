import sys
import os
import json

if len(sys.argv) != 3:
    print(f"Correct usage: {sys.argv[0]} <resourceDirPath> <outputDir>")
    exit(1)

resourceDir = sys.argv[1]
outputDir = sys.argv[2]

if not os.path.exists(resourceDir) or not os.path.isdir(resourceDir):
    print(f"'{resourceDir}' is not a directory")
    exit(1)

if not os.path.exists(outputDir) or not os.path.isdir(outputDir):
    print(f"'{outputDir}' is not a directory")
    exit(1)

eventsEmotes = json.load(open(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'v4-to-v5-events-emojis.json')))
dirPath = os.path.join(resourceDir, "events")

for filename in os.listdir(dirPath):
    if filename.endswith(".json"):
        filePath = os.path.join(dirPath, filename)
        with open(filePath, encoding="utf-8") as fh:
            eventId = filename[:-5]
            newEventJson = {}
            jsonObj = json.load(fh)

            if jsonObj["triggers"] != None:
                newEventJson["triggers"] = jsonObj["triggers"]

            newEventJson["possibilities"] = {}
            for possibilityKey in jsonObj["possibilities"]:
                if possibilityKey != "end":
                    newName = eventsEmotes[eventId][possibilityKey]
                else:
                    newName = "end"
                newEventJson["possibilities"][newName] = {}
                newEventJson["possibilities"][newName]["outcomes"] = {}
                if "condition" in jsonObj["possibilities"][possibilityKey]:
                    newEventJson["possibilities"][newName]["condition"] = jsonObj["possibilities"][possibilityKey]["condition"]
                for i in range(0, len(jsonObj["possibilities"][possibilityKey]["outcomes"])):
                    newEventJson["possibilities"][newName]["outcomes"][str(i)] = jsonObj["possibilities"][possibilityKey]["outcomes"][i]
                    del newEventJson["possibilities"][newName]["outcomes"][str(i)]["translations"]

            with open(os.path.join(outputDir, filename), "w") as outputFh:
                outputFh.write(json.dumps(newEventJson, ensure_ascii=False, indent=4, sort_keys=True))
