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


def processDir(dirName, processJson):
    finalJson = {}
    dirPath = os.path.join(resourceDir, dirName)
    for filename in os.listdir(dirPath):
        if filename.endswith(".json"):
            # print(dirName + " > " + filename)
            filePath = os.path.join(dirPath, filename)
            with open(filePath, encoding="utf-8") as fh:
                ret = processJson(json.load(fh), filename[:-5], finalJson)
                if ret != None:
                    finalJson[filename[:-5]] = ret
    return finalJson


eventsEmotes = json.load(open(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'v4-to-v5-events-emojis.json')))


def processEvents(data, filename, finalJson):
    ret = {}
    for possibilityEmote in data["possibilities"]:
        if possibilityEmote == "end":
            ret["end"] = {}
            for i in range(len(data["possibilities"]["end"]["outcomes"])):
                ret["end"][str(i)] = data["possibilities"]["end"]["outcomes"][i]["translations"]["fr"].split(' ', 1)[0]
        else:
            ret[eventsEmotes[filename][possibilityEmote]] = possibilityEmote
    return ret


def processPets(data, filename, finalJson):
    ret = {}
    ret["emoteMale"] = data["emoteMale"]
    ret["emoteFemale"] = data["emoteFemale"]
    return ret

def processSimpleEmote(data, filename, finalJson):
    return data["emote"]

jsonObj = {}
jsonObj["events"] = processDir("events", processEvents)
jsonObj["pets"] = processDir("pets", processPets)
jsonObj["small_events"] = processDir("smallEvents", processSimpleEmote)
jsonObj["armors"] = processDir("armors", processSimpleEmote)
jsonObj["weapons"] = processDir("weapons", processSimpleEmote)
jsonObj["potions"] = processDir("potions", processSimpleEmote)
jsonObj["objects"] = processDir("objects", processSimpleEmote)

# Map types
mapTypes = {}
filePath = os.path.join(resourceDir, "models", "maps.json")
with open(filePath, encoding="utf-8") as fh:
    loadedJson = json.load(fh)
    typesSection = loadedJson["translations"]["fr"]["types"]
    for mapType in typesSection.keys():
        mapTypes[mapType] = typesSection[mapType]["emote"]
jsonObj["map_types"] = mapTypes

print(json.dumps(jsonObj, ensure_ascii=False, indent=4, sort_keys=True))
