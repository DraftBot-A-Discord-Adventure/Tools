import sys
import os
import json

if len(sys.argv) != 2:
    print(f"Correct usage: {sys.argv[0]} <resourceDirPath>")
    exit(1)

resourceDir = sys.argv[1]

if not os.path.exists(resourceDir) or not os.path.isdir(resourceDir):
    print(f"'{resourceDir}' is not a directory")
    exit(1)

retDict = {}

dirPath = os.path.join(resourceDir, "events")
for filename in os.listdir(dirPath):
    if filename.endswith(".json"):
        filePath = os.path.join(dirPath, filename)
        with open(filePath, encoding="utf-8") as fh:
            jsonObj = json.load(fh)
            eventId = filename[:-5]
            keysDict = {}
            for possibilityKey in jsonObj["possibilities"]:
                if possibilityKey != "end":
                    keysDict[possibilityKey] = ""
            retDict[eventId] = keysDict

print(json.dumps(retDict, ensure_ascii=False, indent=4, sort_keys=True))
