package cmd

import (
	"encoding/json"
	"fmt"
	"github.com/spf13/cobra"
	"github.com/tealeg/xlsx/v3"
	"github.com/aallbrig/rossman-sheet-processor/pkg/videos"
	"net/url"
	"os"
	"strings"
)

var repairVideos []videos.RepairVideoDataRow
var rootCmd = &cobra.Command{
	Use: "",
	Short: "Root command for converting Louis Rossmann's google sheet into JSON",
	Run: func(cmd *cobra.Command, args []string) {
		spreadsheetFilepath := args[0]
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
		statusToRowIds := make(map[string][]int)
		bgColorHexToRowIds := make(map[string][]int)

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
			videoUrlCell := row.GetCell(videos.ColumnIdx.VideoUrl)

			// For debugging
			bgColorHex := videoUrlCell.GetStyle().Fill.BgColor
			bgColorHexToRowIds[bgColorHex] = append(bgColorHexToRowIds[bgColorHex], i)

			videoUrl := videoUrlCell.Value
			u, err := url.Parse(videoUrl)
			if err != nil {
				// TODO: determine best behavior for invalid URL case
				continue
			}
			query, err := url.ParseQuery(u.RawQuery)
			if err != nil {
				// TODO: determine best behavior for invalid URL case
				continue
			}
			videoId, ok := query["v"]
			if !ok {
				// TODO: determine best behavior for invalid URL case
				continue
			}

			embeddedUrl := fmt.Sprintf("https://youtube.com/embed/%s", strings.Join(videoId, ""))
			status := row.GetCell(videos.ColumnIdx.Status).Value

			// For debugging
			statusToRowIds[status] = append(statusToRowIds[status], i)

			// Use list of expected statuses that determine the row still needs processing
			needsProcessing := false
			for _, expectedStatus := range videos.NeedsToBeProcessedStatuses {
				if status == expectedStatus {
					needsProcessing = true
				}
			}

			// Hydrate go struct with row data
			repairVideo := videos.RepairVideoDataRow{
				NeedsProcessing: needsProcessing,
				RowID:  videos.RowID{
					Index: i,
					HumanReadable: i + 1,
				},
				Video:  videos.YoutubeVideo{
					Url: videoUrl,
					EmbeddedUrl: embeddedUrl,
					Title: row.GetCell(videos.ColumnIdx.VideoTitle).Value,
				},
				Repair: videos.Repair{
					Symptom: row.GetCell(videos.ColumnIdx.Symptom).Value,
					Cause: row.GetCell(videos.ColumnIdx.Cause).Value,
					Issues: []string{
						row.GetCell(videos.ColumnIdx.Issue).Value,
						row.GetCell(videos.ColumnIdx.Issue2).Value,
					},
					OtherInfo: row.GetCell(videos.ColumnIdx.OtherInfo).Value,
				},
				Mac:    videos.Macbook{
					ModelIdentifier: row.GetCell(videos.ColumnIdx.ModelID).Value,
					ModelNumber: row.GetCell(videos.ColumnIdx.ModelNumber).Value,
					LogicBoardPartNumber: row.GetCell(videos.ColumnIdx.BoardPartId).Value,
				},
				Wiki:   videos.WikiDataEntry{
					Url: row.GetCell(videos.ColumnIdx.WikiUrl).Value,
					Status: row.GetCell(videos.ColumnIdx.Status).Value,
					Notes: row.GetCell(videos.ColumnIdx.Notes).Value,
				},
			}

			repairVideos = append(repairVideos, repairVideo)
		}

		// Uncomment to find out background color HEX values that appear in the sheet and how many rows correspond to that value
		// TODO: This should be functionality exposed through running this program in a certain mode (subcommand, maybe?)
		// for k := range hexToRowIds {
		// 	rowIds := hexToRowIds[k]
		// 	fmt.Println("Hex Value: ", k, " has ", len(rowIds), " row IDs associated and whose first row ID is ",
		// 		rowIds[0] + 1)
		// }

		// Uncomment to find out status values that appear in the sheet and how many rows correspond to that value
		// TODO: This should be functionality exposed through running this program in a certain mode (subcommand, maybe?)
		// for k := range statusToRowIds {
		//	rowIds := statusToRowIds[k]
		//	fmt.Println("Status ", k, " has ", len(rowIds), " row IDs associated and whose first row of this status is ",
		//		rowIds[0] + 1)
		//}

		prettyJson, err := json.MarshalIndent(repairVideos, "", "  ")
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

func init() {

}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}