from PIL import Image

imageMapContinentFr = Image.open('./Ressources/map_fr.jpg')
imageMapContinentEn = Image.open('./Ressources/map_en.jpg')
imageMapIleVolcaniqueFr = Image.open('./Ressources/volcano_island_fr.jpg')
imageMapIleVolcaniqueEn = Image.open('./Ressources/volcano_island_en.jpg')
imageMapIleGlaceExterieurFr = Image.open('./Ressources/ice_island_exterior_fr.jpg')
imageMapIleGlaceInterieurFr = Image.open('./Ressources/ice_island_interior_fr.jpg')
imageCursor = Image.open('./Ressources/Marqueur.png')
imageCross = Image.open('./Ressources/cross.png')

imageCrossCenter = [75, 75]

ListPointeursContinent1 = [
    ["1_26", 929, 157],
    ["6_7", 2089, 2769],
    ["6_26", 1274, 1114],
    ["28_29", 744, 2904],
    ["28_30", 744, 2904],
    ["28_31", 744, 2904],
    ["28_32", 744, 2904],
    ["29_30", 744, 2904],
    ["29_31", 744, 2904],
    ["29_32", 744, 2904],
    ["30_31", 744, 2904],
    ["30_32", 744, 2904],
    ["31_32", 744, 2904],
    ["7_19", 3594, 4954],
    ["7_8", 2244, 3164],
    ["7_17", 2994, 4034],
    ["5_6", 1624, 1484],
    ["2_26", 1744, 584],
    ["2_3", 2384, 324],
    ["3_9", 3264, 414],
    ["4_9", 2757, 714],
    ["9_10", 3937, 784],
    ["4_5", 2197, 1174],
    ["8_10", 3057, 1274],
    ["9_11", 3727, 364],
    ["8_15", 3077, 1814],
    ["15_27", 3337, 2684],
    ["17_27", 3677, 3454],
    ["17_18", 4727, 3594],
    ["16_17", 4398, 3254],
    ["15_16", 4199, 2570],
    ["11_12", 4558, 284],
    ["12_15", 4248, 1324],
    ["14_16", 4678, 2584],
    ["12_13", 4828, 284],
    ["12_14", 5008, 1324],
    ["13_25", 5928, 254],
    ["24_25", 6748, 1054],
    ["14_22", 6198, 2324],
    ["23_24", 7678, 1224],
    ["22_24", 6748, 2064],
    ["22_23", 7148, 2274],
    ["21_23", 7878, 2424],
    ["18_22", 6008, 3314],
    ["18_19", 5555, 4053],
    ["19_21", 6688, 3764],
    ["14_25", 5354, 884],
    ["3_4", 2764, 717],
    ["1", 900, -51],
    ["2", 2244, 404],
    ["3", 2820, 152],
    ["4", 2448, 868],
    ["5", 1900, 1252],
    ["6", 1006, 1565],
    ["7", 1270, 4210],
    ["8", 2974, 1407],
    ["9", 3575, 477],
    ["10", 3544, 948],
    ["11", 4055, 105],
    ["12", 4736, 407],
    ["13", 5510, 74],
    ["14", 5254, 2042],
    ["15", 3644, 1926],
    ["16", 4628, 2854],
    ["17", 4317, 3768],
    ["18", 5201, 3339],
    ["19", 5861, 4175],
    ["21", 7332, 3006],
    ["22", 6805, 2683],
    ["23", 7465, 1572],
    ["24", 7479, 900],
    ["25", 6327, 368],
    ["26", 1272, 392],
    ["27", 3301, 2883],
    ["28", 739, 2962],
    ["29", 739, 2962],
    ["32", 739, 2962]
]

ListPointeursIleVolcanique = [
    ["1000_1001", 882, 1296],
    ["1001_1002", 1980, 1389],
    ["1001_1003", 1980, 1389],
    ["1002_1004", 3084, 1803],
    ["1003_1004", 2754, 1439],
    ["1004_1005", 2985, 759],
    ["1000", 726, 1437],
    ["1001", 1467, 1026],
    ["1002", 2436, 1864],
    ["1003", 2448, 1416],
    ["1004", 3159, 1485],
    ["1005", 2562, 700]
]

ListPointeursIleGlaceExterieur = [
    ["1100_1101", 1196, 2217],
    ["1101_1102", 1617, 1850],
    ["1102_1103", 2350, 858],
    ["1103_1104", 2488, 526],
    ["1100", 968, 2542],
    ["1101", 1335, 2060],
    ["1103", 2454, 697],
    ["1104", 2513, 392]
]

ListPointeursIleGlaceInterieur = [
    ["1102_1105", 1189, 1003],
    ["1105_1106", 1643, 1244],
    ["1106_1107", 1885, 1432],
    ["1102", 1030, 788],
    ["1105", 1490, 1160],
    ["1106", 1768, 1358],
    ["1107", 1980, 1481]
]

'''
for mapLink in ListPointeursContinent1:
    newMap = imageMapContinentFr.copy()
    newMap.paste(imageCursor, (mapLink[1], mapLink[2]), imageCursor)
    newMap.save('./Ressources/mapsCursed/fr_'+mapLink[0]+'_map.jpg',quality=100)
    newMap = imageMapContinentEn.copy()
    resizedCursor = imageCursor.resize((round(imageCursor.width/2), round(imageCursor.height/2)))
    newMap.paste(resizedCursor, (round(mapLink[1]/2), round(mapLink[2]/2)), resizedCursor)
    newMap.save('./Ressources/mapsCursed/en_'+mapLink[0]+'_map.jpg',quality=100)
'''

def generateIslandMaps(imageMap, ListPointeurs, lang):
    for mapLink in ListPointeurs:
        newMap = imageMap.copy()
        newMap.paste(imageCross, (mapLink[1] - imageCrossCenter[0], mapLink[2] - imageCrossCenter[1]), imageCross)
        newMap.save(f'./Ressources/mapsCursed/{lang}_{mapLink[0]}_map.jpg',quality=100)

generateIslandMaps(imageMapIleVolcaniqueFr, ListPointeursIleVolcanique, 'fr')
generateIslandMaps(imageMapIleVolcaniqueEn, ListPointeursIleVolcanique, 'en')
generateIslandMaps(imageMapIleGlaceExterieurFr, ListPointeursIleGlaceExterieur, 'fr')
generateIslandMaps(imageMapIleGlaceInterieurFr, ListPointeursIleGlaceInterieur, 'fr')
