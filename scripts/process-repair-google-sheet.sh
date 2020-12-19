#!/bin/bash

google_sheet_file="${1:-../downloads/Louis Rossmann Repair Videos.xlsx}"

echo "Input google sheet repair file: ${google_sheet_file}"

cd go
go run main.go -i "${google_sheet_file}" > ../docs/json/repair-videos-data.json
go run main.go -i "${google_sheet_file}" get-status > ../docs/json/statuses.json
go run main.go -i "${google_sheet_file}" get-background-color-hex-codes > ../docs/json/hex-codes.json
go run main.go -i "${google_sheet_file}" get-model-ids > ../docs/json/model-ids.json
go run main.go -i "${google_sheet_file}" get-model-numbers > ../docs/json/model-numbers.json
go run main.go -i "${google_sheet_file}" get-logic-board-numbers > ../docs/json/logic-board-numbers.json

