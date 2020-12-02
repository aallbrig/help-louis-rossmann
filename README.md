# Help Louis Rossmann
This project is meant to help [Louis Rossman](https://youtu.be/3kGqPjSDp14).

### Technologies
1. Github Pages for static website content.
1. AWS API Gateway & Lambda for backend application server.
1. Script to process "excel" sheet and determine each row's state.

### Resources
1. [Rossmann Wiki](https://wiki2.rossmanngroup.com/index.php?title=Troubleshooting_Guides)
1. [Google Sheet with L.R. Repair Videos](https://docs.google.com/spreadsheets/d/1PulZnpPHxBFyJwKiJvTQqR0D3liKHdl48rz7zwh652U/edit?usp=sharing)

### Process Google Sheet
This process is meant to be rough & done quickly.
1. Navigate to google sheet
1. Download the google sheet into expected format (either `.xlsx` or OpenDocument `.ods` format)

    File -> Download -> choose the preferred format
1. Run program to process the google sheet as input

### Louis Rossmann Repair Videos processor script
This script is meant to be rough & done quickly.
1. `scripts/process-repair-google-sheet.sh downloads/Louis\ Rossmann\ Repair\ Videos.ods`


