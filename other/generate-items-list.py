import sys
import os
import json

if len(sys.argv) != 5:
    print(f"Correct usage: {sys.argv[0]} <resourceDirPath> <langDirPath> <lang> <armors/weapons/potions/objects>")
    exit(1)

resourceDir = sys.argv[1]
langDir = sys.argv[2]
lang = sys.argv[3]
itemType = sys.argv[4]

if not os.path.exists(resourceDir) or not os.path.isdir(resourceDir):
    print(f"'{resourceDir}' is not a directory")
    exit(1)

if not os.path.exists(langDir) or not os.path.isdir(langDir):
    print(f"'{langDir}' is not a directory")
    exit(1)

fullLangDir = os.path.join(langDir, lang)

if not os.path.exists(fullLangDir) or not os.path.isdir(fullLangDir):
    print(f"'{fullLangDir}' is not a directory")
    exit(1)

def processDir(resourceDir, dirName):
    finalJson = {}
    dirPath = os.path.join(resourceDir, dirName)
    if not os.path.exists(dirPath) or not os.path.isdir(dirPath):
        print(f"'{dirPath}' is not a directory")
        exit(1)
    for filename in os.listdir(dirPath):
        if filename.endswith(".json"):
            # print(dirName + " > " + filename)
            filePath = os.path.join(dirPath, filename)
            with open(filePath, encoding="utf-8") as fh:
                finalJson[filename[:-5]] = json.load(fh)
    return finalJson

langModelJsonPath = os.path.join(fullLangDir, "models.json")

if not os.path.exists(langModelJsonPath) or os.path.isdir(langModelJsonPath):
    print(f"'{langModelJsonPath}' is not a file")
    exit(1)

with open(langModelJsonPath, encoding="utf-8") as fh:
    langModelJson = json.load(fh)

items = processDir(resourceDir, itemType)

for item in items:
    print("- " + langModelJson[itemType][item] + " (rareté " + str(items[item]["rarity"]) + ") ")
