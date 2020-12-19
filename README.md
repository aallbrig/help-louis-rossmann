# Help Louis Rossmann
I hope this project helps [Louis Rossman](https://youtu.be/3kGqPjSDp14).

Link to [webapp hosted on github pages](https://aallbrig.github.io/help-louis-rossmann/).

### Technologies
1. Github Pages for serving static site content.
1. Script to process "excel" sheet and determine each row's state.
1. __(TODO)__ AWS API Gateway & Lambda for backend application server.

### Resources
1. [Rossmann Wiki](https://wiki2.rossmanngroup.com/index.php?title=Troubleshooting_Guides)
1. [Google Sheet with L.R. Repair Videos](https://docs.google.com/spreadsheets/d/1PulZnpPHxBFyJwKiJvTQqR0D3liKHdl48rz7zwh652U/edit?usp=sharing)

### Process Google Sheet
This program is crude and quickly thrown together. Manual steps are required to download the `.xlsx` file __(TODO: automate)__. Those steps are...

1. Navigate to google sheet (see Resources section).
1. Export Louis Rossmann's google sheet to an expected format (`.xlsx`).

    File -> Download -> choose the preferred format
1. (optional) Version control the newly downloaded `.xlsx` file into the `downloads` directory.
1. Run program to process the google sheet as input (see the processor script section).
1. (optional) Version control the newly generated JSON file(s).

### Louis Rossmann Repair Videos processor script
This script is meant to be rough & done quickly.
1. `scripts/process-repair-google-sheet.sh`
1. (optional) pass in the name of the excel file e.g. `scripts/process-repair-google-sheet.sh downloads/Louis\ Rossmann\ Repair\ Videos.xlsx`

### Host local static files
Requirement: `python3` binary. Uses python's simple http server __(TODO: seize opportunity to use nginx docker container?)__.

1. `scripts/serve-static-locally.sh`

