import sys
import os
import json

if len(sys.argv) != 3:
    print(f"Correct usage: {sys.argv[0]} <resourceDirPathV4> <resourceDirPathV5>")
    exit(1)

resourceDirV4 = sys.argv[1]
resourceDirV5 = sys.argv[2]

if not os.path.exists(resourceDirV4) or not os.path.isdir(resourceDirV4):
    print(f"'{resourceDirV4}' is not a directory")
    exit(1)

if not os.path.exists(resourceDirV5) or not os.path.isdir(resourceDirV5):
    print(f"'{resourceDirV5}' is not a directory")
    exit(1)

def processDir(resourceDir, dirName):
    finalJson = {}
    dirPath = os.path.join(resourceDir, dirName)
    for filename in os.listdir(dirPath):
        if filename.endswith(".json"):
            # print(dirName + " > " + filename)
            filePath = os.path.join(dirPath, filename)
            with open(filePath, encoding="utf-8") as fh:
                ret = json.load(fh)
                if ret != None:
                    if "translations" in ret:
                        del ret["translations"]
                    if "frenchMasculine" in ret:
                        del ret["frenchMasculine"]
                    if "frenchPlural" in ret:
                        del ret["frenchPlural"]
                    finalJson[filename[:-5]] = ret
    return finalJson

def verifyDifferences(v4Items, v5Items, catName):
    end = False
    i = 0
    while end == False:
        currId = str(i)
        if currId in v4Items and currId not in v5Items:
            print("Item with ID '" + currId + "' in category '" + catName + "' is present in V4 but not in V5")
        elif currId in v5Items and currId not in v4Items:
            print("Item with ID '" + currId + "' in category '" + catName + "' is present in V5 but not in V4")
        elif currId not in v4Items and currId not in v5Items:
            end = True
        else:
            for key in v4Items[currId]:
                if key not in v5Items[currId]:
                    print("Key '" + key + "' of item '" + currId + "' of category '" + catName + "'is present in V4 but not in V5")
                elif v4Items[currId][key] != v5Items[currId][key]:
                    print("Key '" + key + "' of item '" + currId + "' of category '" + catName + "'is different in V4 and in V5")
            for key in v5Items[currId]:
                if key not in v4Items[currId]:
                    print("Key '" + key + "' of item '" + currId + "' of category '" + catName + "'is present in V5 but not in V4")
        i += 1

verifyDifferences(processDir(resourceDirV4, "armors"), processDir(resourceDirV5, "armors"), "armors")
verifyDifferences(processDir(resourceDirV4, "weapons"), processDir(resourceDirV5, "weapons"), "weapons")
verifyDifferences(processDir(resourceDirV4, "potions"), processDir(resourceDirV5, "potions"), "potions")
verifyDifferences(processDir(resourceDirV4, "objects"), processDir(resourceDirV5, "objects"), "objects")
