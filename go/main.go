package main

import (
	"encoding/json"
	"fmt"
	"github.com/tealeg/xlsx/v3"
	"net/url"
	"os"
	"strings"
)

type YoutubeVideo struct {
	Title string
	Url string
	EmbeddedUrl string
}

type Macbook struct {
	ModelIdentifier string
	ModelNumber string
	LogicBoardPartNumber string
}

type Repair struct {
	Cause string
	Symptom string
	Issues []string
	OtherInfo string
}

type RowID struct {
	Index int
	HumanReadable int
}
type RepairVideoDataRow struct {
	NeedsProcessing bool
	RowID RowID
	Video YoutubeVideo
	Repair Repair
	Mac Macbook
	Wiki WikiDataEntry
}

type WikiDataEntry struct {
	Url string
	Notes string
	Status string
}

// TODO: Remove commented out cruft
// var doNotProcessHex = []string{
// 	"FFB6D7A8",
// 	"FF34A853",
// 	"FFFFFF00",
// 	"FF93C47D",
// 	"FFA64D79",
// 	"FFCFE2F3",
// }
// var needsToBeProcessedHex = []string{
// 	"",
// 	"FF6AA84F",
// 	"FFFFFFFF",
// }
var needsToBeProcessedStatuses = []string{
	"Nothing yet",
}
var columnIdx = struct {
	VideoUrl int
	UploadDate int
	VideoTitle int
	Cause int
	Symptom int
	Issue int
	Issue2 int
	ModelID int
	ModelNumber int
	BoardPartId int
	OtherInfo int
	Status int
	UserWorkingRow int
	WikiUrl int
	Notes int
}{
	VideoUrl:       0,
	UploadDate:     1,
	VideoTitle:     2,
	Cause:          3,
	Symptom:        4,
	Issue:          5,
	Issue2:         6,
	ModelID:        7,
	ModelNumber:    8,
	BoardPartId:    9,
	OtherInfo:      10,
	Status:         11,
	UserWorkingRow: 12,
	WikiUrl:        13,
	Notes:          14,
}
var repairVideos []RepairVideoDataRow

func main() {
	args := os.Args[1:]
	spreadsheetFilepath := args[0]

	wb, err := xlsx.OpenFile(spreadsheetFilepath)
	if err != nil {
		fmt.Println("Error opening ods or xlsx file")
		fmt.Println(err)
		os.Exit(1)
	}
	datasheet, ok := wb.Sheet["Data"]
	if !ok {
		fmt.Println("Could not get expected data sheet")
		os.Exit(1)
	}

	statusToRowIds := make(map[string][]int)
	// Read the max row once, so it doesn't change in the loop
	maxRow := datasheet.MaxRow
	// Set i to 1 instead of 0 to skip the header row
	for i := 1; i <= maxRow; i++ {
		row, err := datasheet.Row(i)
		if err != nil {
			fmt.Println("Error accessing data sheet row ", i)
			fmt.Println(err)
			os.Exit(1)
		}
		videoUrlCell := row.GetCell(0)
		videoUrl := videoUrlCell.Value
		u, err := url.Parse(videoUrl)
		if err != nil {
			continue
		}
		query, err := url.ParseQuery(u.RawQuery)
		if err != nil {
			continue
		}
		videoId, ok := query["v"]
		if !ok {
			continue
		}
		embeddedUrl := fmt.Sprintf("https://youtube.com/embed/%s", strings.Join(videoId, ""))

		status := row.GetCell(columnIdx.Status).Value
		statusToRowIds[status] = append(statusToRowIds[status], i)
		needsProcessing := false
		for _, expectedStatus := range needsToBeProcessedStatuses {
			if status == expectedStatus {
				needsProcessing = true
			}
		}

		repairVideo := RepairVideoDataRow{
			NeedsProcessing: needsProcessing,
			RowID:  RowID{
				Index: i,
				HumanReadable: i + 1,
			},
			Video:  YoutubeVideo{
				Url: videoUrl,
				EmbeddedUrl: embeddedUrl,
				Title: row.GetCell(columnIdx.VideoTitle).Value,
			},
			Repair: Repair{
				Symptom: row.GetCell(columnIdx.Symptom).Value,
				Cause: row.GetCell(columnIdx.Cause).Value,
				Issues: []string{
					row.GetCell(columnIdx.Issue).Value,
					row.GetCell(columnIdx.Issue2).Value,
				},
				OtherInfo: row.GetCell(columnIdx.OtherInfo).Value,
			},
			Mac:    Macbook{
				ModelIdentifier: row.GetCell(columnIdx.ModelID).Value,
				ModelNumber: row.GetCell(columnIdx.ModelNumber).Value,
				LogicBoardPartNumber: row.GetCell(columnIdx.BoardPartId).Value,
			},
			Wiki:   WikiDataEntry{
				Url: row.GetCell(columnIdx.WikiUrl).Value,
				Status: row.GetCell(columnIdx.Status).Value,
				Notes: row.GetCell(columnIdx.Notes).Value,
			},
		}
		repairVideos = append(repairVideos, repairVideo)
	}

	// Uncomment to find out what HEX values and how many rows correspond to the values
	// TODO: This should be functionality exposed through running this program in a certain mode (subcommand, maybe?)
	// for k := range hexToRowIds {
	// 	rowIds := hexToRowIds[k]
	// 	fmt.Println("Hex Value: ", k, " has ", len(rowIds), " row IDs associated and whose first row ID is ",
	// 		rowIds[0] + 1)
	// }

	// Uncomment to find out what STATUS values and how many rows correspond to the values
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

	fmt.Print(string(prettyJson))
	os.Exit(0)
}
