package videos

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

var NeedsToBeProcessedStatuses = []string{
	"Nothing yet",
}
var ColumnIdx = struct {
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

