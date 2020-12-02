#!/bin/bash

google_sheet_file="${1:-../downloads/Louis Rossmann Repair Videos.xlsx}"

echo "Input google sheet repair file: ${google_sheet_file}"

cd go
go run main.go -i "${google_sheet_file}" > ../static/json/repair-videos-data.json
go run main.go -i "${google_sheet_file}" get-status > ../static/json/statuses.json
go run main.go -i "${google_sheet_file}" get-background-color-hex-codes > ../static/json/hex-codes.json

