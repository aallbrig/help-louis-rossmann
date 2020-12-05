package cmd

import (
	"encoding/json"
	"fmt"
	"github.com/aallbrig/rossman-sheet-processor/pkg/videos"
	"github.com/spf13/cobra"
	"github.com/tealeg/xlsx/v3"
	"os"
)

var getModelNumbers = &cobra.Command{
	Use: "get-model-numbers",
	Short: "Extracts model numbers as JSON from excel sheet",
	Run: func(cmd *cobra.Command, args []string) {
		spreadsheetFilepath := inputFilePath
		wb, err := xlsx.OpenFile(spreadsheetFilepath)
		if err != nil {
			fmt.Println("Error opening target xlsx file", spreadsheetFilepath)
			fmt.Println(err)
			os.Exit(1)
		}
		datasheet, ok := wb.Sheet["Data"]
		if !ok {
			fmt.Println("Could not get expected data sheet")
			os.Exit(1)
		}

		// Structs for debugging
		modelNumberToRowIds := make(map[string][]int)

		// Read the max row once, so it doesn't change in the loop
		maxRow := datasheet.MaxRow
		// Set index to 1 to skip the header row
		for i := 1; i <= maxRow; i++ {
			row, err := datasheet.Row(i)
			if err != nil {
				fmt.Println("Error accessing data sheet row ", i)
				fmt.Println(err)
				os.Exit(1)
			}

			dynamicKey := row.GetCell(videos.ColumnIdx.ModelNumber).Value
			modelNumberToRowIds[dynamicKey] = append(modelNumberToRowIds[dynamicKey], i)
		}


		prettyJson, err := json.MarshalIndent(modelNumberToRowIds, "", "  ")
		if err != nil {
			fmt.Println("Error endcoding go struct into JSON")
			fmt.Println(err)
			os.Exit(1)
		}

		// output valid JSON to std.out
		fmt.Print(string(prettyJson))
		os.Exit(0)
	},
}

