import os
from copy import copy
from datetime import datetime
from math import sqrt

logs_folder = "logs"
dates = {}
# this script searches for cheaters that execute report too often
for file in os.listdir(logs_folder):
    print(file)
    if file.endswith(".txt"):
        with open(logs_folder + "/" + file, "r", encoding='UTF8') as f:
            # First we make an array of lines
            lines = f.readlines()
            # then we search for similar lines in the array

            for line in lines:
                if line.find("report") == -1:
                    continue
                if line.find("r") == -1:
                    continue
                date = line[1:20]
                player_id = line[22:40]
                # then we save the dates by player id in a dictionary
                if player_id in dates:
                    # check if the date is already in the dictionary
                    if date in dates[player_id]:
                        # if it is, we increase the count of the date
                        dates[player_id][date] += 1
                    else:
                        # if it is not, we add the date to the dictionary
                        dates[player_id][date] = 1
                else:
                    dates[player_id] = {date: 1}
        continue

minAlert = 5
secondsBeforeAlert = 3
# save this dictionary to a file
with open("dates.txt", "w", encoding='UTF8') as f:
    f.write("############### DRAFTBOT ANTI CHEAT REPORT ###############\n")
    f.write("# This file was generated on " + str(datetime.now()) + "\n")
    f.write("# minAlert = " + str(minAlert) + "\n")
    f.write("# secondsBeforeAlert = " + str(secondsBeforeAlert) + "\n")
    playerCount = len(dates)
    f.write("# playerCount = " + str(playerCount) + "\n")
    currentCount = 0
    mentions = ""
    sortedKeys = {}
    for key in dates:
        currentCount += 1
        print(str(currentCount) + "/" + str(playerCount), end="")
        print(" checking player " + key + "...")
        # first we count the amount sum of all dates
        count = 0
        for date in dates[key]:
            count += dates[key][date]
        alert = 0
        dateTimes = {}
        report = "\r############\n\n player " + key + " has " + str(count) + " reports\n"
        # first, we convert all the dates to datetime objects
        for date in dates[key]:
            dateTimes[date] = datetime.strptime(date, "%Y/%m/%d %H:%M:%S")
            # in the same loop we create an alert for each date that is more than 1
            if dates[key][date] > 1:
                alert += dates[key][date]
                report += "Player " + key + " has been reported " + str(dates[key][date]) + " times on " + date + "\n"

        # loop on all dates and count the amount of dates that are less than 5 seconds apart
        for date in dateTimes:
            for date2 in dateTimes:
                if date2 > date and abs((dateTimes[date2] - dateTimes[date]).total_seconds()) < secondsBeforeAlert:
                    alert += 1
                    # display all the information
                    report += "Player " + key + " has been reported at " + date + " and at " + date2 + "\n"
        ratio = round((alert / count) * 100)
        report += "TOTAL ALERTS: " + str(alert) + "\nRATIO: " + str(ratio) + "%\n"
        if (alert > minAlert):
            f.write(report)
            mentions += "<@" + key + ">"
            sortedKeys[key] = [ratio, alert, count]
    # sort the sorted keys by ratio
    sortedKeys = sorted(sortedKeys.items(), key=lambda x: x[1][0], reverse=True)
    f.write(
        "\n\n#################\n\n# List of people that triggered the system with given parameters = " + str(mentions))
    for key in sortedKeys[:200]:
        f.write("\n# " + key[0] + " has a ratio of " + str(key[1][0]) + " and has been reported " + str(key[1][1]) + " times out of " + str(key[1][2]) + " reports")
    print(mentions)
