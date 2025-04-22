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
                    finalJson[filename[:-5]] = ret
    return finalJson

def verifyDifferences(v4Pets, v5Pets):
    end = False
    i = 0
    while end == False:
        currId = str(i)
        if currId not in v4Pets and currId not in v5Pets:
            end = True
        elif v4Pets[currId]["rarity"] != v5Pets[currId]["rarity"]:
            print("Pet " + currId + " has a rarity of " + str(v4Pets[currId]["rarity"]) + " in v4 but a rarity of " + str(v5Pets[currId]["rarity"]) + " in v5")
        i += 1

verifyDifferences(processDir(resourceDirV4, "pets"), processDir(resourceDirV5, "pets"))
