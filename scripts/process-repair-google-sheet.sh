#!/bin/bash

google_sheet_file="${1:-../downloads/Louis Rossmann Repair Videos.xlsx}"

echo "Input google sheet repair file: ${google_sheet_file}"

cd go
go run main.go "${google_sheet_file}" > ../static/json/repair-videos-data.json

