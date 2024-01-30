import sys
import os
import json

if len(sys.argv) != 3:
    print(f"Correct usage: {sys.argv[0]} <resourceDirPath> <en/fr>")
    exit(1)

resourceDir = sys.argv[1]
lang = sys.argv[2]

if not os.path.exists(resourceDir) or not os.path.isdir(resourceDir):
    print(f"'{resourceDir}' is not a directory")
    exit(1)

if lang != "fr" and lang != "en":
    print(f"'Lang must be fr or en")
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

def processFightAction(data, filename, finalJson):
    ret = {}
    if "name" in data["translations"][lang]:
        ret["name_one"] = data["translations"][lang]["name"]
        ret["name_other"] = data["translations"][lang]["namePlural"]
    else:
        ret["name_one"] = ""
        ret["name_other"] = ""
    if "description" in data["translations"][lang]:
        ret["description"] = data["translations"][lang]["description"]
    else:
        ret["description"] = ""
    return ret

def processMapLocations(data, filename, finalJson):
    ret = {}
    ret["name"] = data[f"name{lang.title()}"]
    ret["particle"] = data[f"particle{lang.title()}"]
    ret["description"] = data[f"desc{lang.title()}"]
    return ret

def processMissions(data, filename, finalJson):
    tr = data["translations"][lang]["desc"]
    tr = tr.replace("{objective}", "{{objective}}")
    tr = tr.replace("{variantText}", "{{variantText}}")
    if "{objective>1" in tr:
        objectiveIndex = 0
        objectiveIndex = tr[objectiveIndex:].index("{objective>1")
        split = tr.split("{objective>1", 1)
        indexSeparator = split[1].index(":")
        indexEndVar = split[1].index("}")
        trOther = split[0] + split[1][1:indexSeparator] + split[1][indexEndVar + 1:]
        trOne = split[0] + split[1][indexSeparator + 1:indexEndVar] + split[1][indexEndVar + 1:]
        finalJson[filename + "_one"] = trOne
        finalJson[filename + "_other"] = trOther
    else:
        finalJson[filename] = tr

def processPets(data, filename, finalJson):
    ret = {}
    ret["male"] = data["translations"][lang]["maleName"]
    ret["female"] = data["translations"][lang]["femaleName"]
    return ret

jsonObj = {}
jsonObj["armors"] = processDir("armors", lambda data, filename, finalJson: data["translations"][lang])
jsonObj["classes"] = processDir("classes", lambda data, filename, finalJson: data["translations"][lang].split(" ", 1)[1])
jsonObj["fight_actions"] = processDir("fightactions", processFightAction)
jsonObj["leagues"] = processDir("leagues", lambda data, filename, finalJson: data["translations"][lang])
jsonObj["map_locations"] = processDir("maplocations", processMapLocations)
jsonObj["missions"] = processDir("missions", processMissions)
jsonObj["monsters"] = processDir("monsters", lambda data, filename, finalJson: data["translations"][lang])
jsonObj["objects"] = processDir("objects", lambda data, filename, finalJson: data["translations"][lang])
jsonObj["pets"] = processDir("pets", processPets)
jsonObj["potions"] = processDir("potions", lambda data, filename, finalJson: data["translations"][lang])
jsonObj["weapons"] = processDir("weapons", lambda data, filename, finalJson: data["translations"][lang])

# Map types
mapTypes = {}
filePath = os.path.join(resourceDir, "models", "maps.json")
with open(filePath, encoding="utf-8") as fh:
    loadedJson = json.load(fh)
    typesSection = loadedJson["translations"][lang]["types"]
    for mapType in typesSection.keys():
        mapTypes[mapType] = {}
        mapTypes[mapType]["name"] = typesSection[mapType]["name"]
        mapTypes[mapType]["prefix"] = typesSection[mapType]["prefix"]
jsonObj["map_types"] = mapTypes

print(json.dumps(jsonObj, ensure_ascii=False, indent=4, sort_keys=True))
