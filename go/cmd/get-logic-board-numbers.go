package cmd

import (
	"encoding/json"
	"fmt"
	"github.com/aallbrig/rossman-sheet-processor/pkg/videos"
	"github.com/spf13/cobra"
	"github.com/tealeg/xlsx/v3"
	"os"
)

var getLogicBoardNumbers = &cobra.Command{
	Use: "get-logic-board-numbers",
	Short: "Extracts logic board numbers as JSON from excel sheet",
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
		logicBoardNumberToRowIds := make(map[string][]int)

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

			dynamicKey := row.GetCell(videos.ColumnIdx.BoardPartId).Value
			logicBoardNumberToRowIds[dynamicKey] = append(logicBoardNumberToRowIds[dynamicKey], i)
		}


		prettyJson, err := json.MarshalIndent(logicBoardNumberToRowIds, "", "  ")
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

