const LOCAL_STORAGE_APP_KEY = 'app-state';
const LOCAL_STORAGE_REPORTS_KEY = 'app-reports';

function VideoTableDataToGoogleSheetTableRow(video, highlight = false) {
  const tr = document.createElement('tr');
  if (highlight) {
    tr.classList.add('table-success', 'font-weight-bold');
  } else {
    tr.classList.add('table-dark')
  }

  [
    `${(highlight) ? 'YOU ' : ''}${video.RowID.HumanReadable}`,
    video.Video.Url,
    'ignore',
    video.Video.Title,
    video.Repair.Cause,
    ...video.Repair.Issues,
    video.Mac.ModelIdentifier,
    video.Mac.ModelNumber,
    video.Mac.LogicBoardPartNumber,
    'ignore',
    video.Wiki.Status,
    'ignore',
    video.Wiki.Url,
    video.Wiki.Notes,

  ].map((tdText, indx) => {
    const td = document.createElement('td');
    if (indx === 0) {
      td.classList.add('text-right');
      td.textContent = tdText;
    } else if (indx === 1) { // the video URL
      const a = document.createElement('a');
      a.href = tdText;
      a.textContent = '(link)';
      td.appendChild(a);
    } else {
      td.textContent = tdText;
    }
    return td;
  }).forEach(td => {
    tr.appendChild(td);
  });

  return tr;
}

class ReportsWidget {
  constructor() {
    this.dom = {
      reportsContainer: document.getElementById('reports-container'),
      deleteReportsBtn: document.getElementById('delete-reports'),
    };
    // TODO: validate stored data
    const widgetState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY));
    const stateDefaults = {
      reports: [],
    };

    this.dom.deleteReportsBtn.onclick = this.deleteAllReports.bind(this);

    this.setState(Object.assign({}, stateDefaults, widgetState));
  }

  addNewReport(reportFormData) {
    // TODO: Validate report data
    const reports = this.state.reports;
    const updatedReports = [ ...reports, reportFormData ];

    this.setState({ reports: updatedReports });
  }

  setState(newState) {
    this.state = Object.assign({}, this.state, newState);

    window.localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(this.state));
    this.renderState(this.state);
  }

  renderState(state) {
    const { reports } = state;

    if (reports.length > 0) {
      this.dom.reportsContainer.innerText = '';
      reports
        .map(this.reportCardDOM)
        .forEach(DOM => this.dom.reportsContainer.appendChild(DOM));
      this.dom.deleteReportsBtn.classList.remove('disabled');
    } else {
      this.dom.reportsContainer.innerText = 'No saved reports (yet)...';
      this.dom.deleteReportsBtn.classList.add('disabled');
    }
  }

  reportCardDOM(report) {
    // Card Header
    const rowIDBadge = document.createElement('span');
    rowIDBadge.classList.add('badge', 'badge-info');
    rowIDBadge.innerText = `Row ${report.video.RowID.HumanReadable}`;
    const videoTitleText = document.createElement('span');
    videoTitleText.textContent = ` ${report.video.Video.Title}`;

    const reportExpandBtn = document.createElement('button');
    reportExpandBtn.classList.add('btn', 'btn-link', 'collapsed');
    reportExpandBtn.setAttribute('data-toggle', 'collapse');
    reportExpandBtn.setAttribute('data-target', `#collapse-report-${report.video.RowID.Index}`);
    reportExpandBtn.setAttribute('aria-expanded', 'true');
    reportExpandBtn.setAttribute('aria-controls', `collapse-report-${report.video.RowID.Index}`);
    reportExpandBtn.appendChild(rowIDBadge);
    reportExpandBtn.appendChild(videoTitleText);

    const cardTitleHeader = document.createElement('h5')
    cardTitleHeader.classList.add('mb-0');
    cardTitleHeader.appendChild(reportExpandBtn);

    const cardTitle = document.createElement('div');
    cardTitle.classList.add('card-header');
    cardTitle.id = `heading-report-${report.video.RowID.Index}`;
    cardTitle.appendChild(cardTitleHeader);


    // Card Body
    // TODO: Fill out the rest of the card body
    const videoIFrame = document.createElement('iframe');
    videoIFrame.src = report.video.Video.EmbeddedUrl;
    videoIFrame.classList.add('mx-auto', 'mb-3');
    videoIFrame.style.display = 'block';
    videoIFrame.setAttribute('width', '560');
    videoIFrame.setAttribute('height', '315');
    videoIFrame.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    videoIFrame.setAttribute('allowFullscreen', 'true');

    const cardBody = document.createElement('div');
    cardBody.id = `collapse-report-${report.video.RowID.Index}`;
    cardBody.classList.add('collapse');
    cardBody.setAttribute('aria-labelledby', `heading-report-${report.video.RowID.Index}`);
    cardBody.setAttribute('data-parent', '#reports-container');
    cardBody.appendChild(videoIFrame);

    // Complete Card
    const card = document.createElement('div');
    card.classList.add('card', 'mt-3');
    card.appendChild(cardTitle);
    card.appendChild(cardBody);

    return card;
  }

  deleteAllReports() {
    this.setState({ reports: [] });
  }
}

class ProcessRepairVideosApp {
  constructor() {
    this.reportsWidget = new ReportsWidget();

    this.dom = {
      topSection: document.getElementById('information-collapsable'),
      hideTopBtn: document.getElementById('hide-top'),
      assignVideoBtn: document.getElementById('assign-video'),
      resetAppBtn: document.getElementById('reset-app'),
      resetVideoBtn: document.getElementById('reset-report'),
      videoTitle: document.getElementById('video-title'),
      videoRow: document.getElementById('video-row'),
      videoIframe: document.getElementById('video-iframe'),
      videoYoutubeLink: document.getElementById('video-youtube-link'),
      processGuide: document.getElementById('process-guide'),
      waitingText: document.getElementById('waiting'),
      watchVideoForm: document.getElementById('repair-report-form'),
      addToWikiForm: document.getElementById('add-to-wiki-form'),
      reportSaveBtn: document.getElementById('save-report'),
      modelIdInput: document.getElementById('model-identifier'),
      modelIdsDropdown: document.getElementById('model-identifier-dropdown'),
      modelNumberInput: document.getElementById('model-number'),
      modelNumbersDropdown: document.getElementById('model-number-dropdown'),
      logicBoardNumberInput: document.getElementById('logic-board-number'),
      logicBoardNumbersDropdown: document.getElementById('logic-board-number-dropdown'),
      doneRowAnswersTable: document.getElementById('done-row-answers-table'),
      writeToGoogleSheetHeading: document.getElementById('heading-update-google-sheet'),
      writeToGoogleSheetCollapsable: document.getElementById('collapse-update-google-sheet'),
      writeToGoogleSheetTableBody: document.getElementById('form-inputs-as-sheet-additions-tbody'),
    }

    const storedState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_APP_KEY));
    const stateDefaults = {
      hideTopSection: false,
      showProcessingForm: false,
    };

    this.state = Object.assign({}, stateDefaults, storedState);

    // Bind event handlers
    // Information section top toolbelt
    this.dom.resetAppBtn.onclick = this.resetAppState.bind(this);
    this.dom.hideTopBtn.onclick = () => this.setState({ hideTopSection: true });

    // Video Report section bottom toolbelt
    this.dom.reportSaveBtn.onclick = () => {
      const watchVideoForm = Object.fromEntries(new FormData(this.dom.watchVideoForm).entries());
      const addToWikiFormData = Object.fromEntries(new FormData(this.dom.addToWikiForm).entries());
      const report = {
        video: this.state.video,
        watchVideoForm: watchVideoForm,
        addToWikiForm: addToWikiFormData,
      };

      this.reportsWidget.addNewReport(report);
      this.resetProcessForm();
    }
    this.dom.resetVideoBtn.onclick = this.resetProcessForm.bind(this);

    // Report section forms
    this.dom.watchVideoForm.oninput = () => {
      this.activateReportToolbelt();

      const formData = Object.fromEntries(new FormData(this.dom.watchVideoForm).entries());
      this.setState({ watchVideoForm: formData });
    };
    this.dom.addToWikiForm.oninput = () => {
      this.activateReportToolbelt();

      const formData = Object.fromEntries(new FormData(this.dom.addToWikiForm).entries());
      this.setState({ addToWikiForm: formData });
    }

    // Take the latest user input from "Watch Video Form" when opening
    this.dom.writeToGoogleSheetHeading.onclick = () => {
      const classList = this.dom.writeToGoogleSheetCollapsable.classList;
      // If the card is going to open...
      if (!classList.contains('show')) {
        this.renderUserInputAsTable();
      }
    };

    this.renderState(this.state);
  }

  setState(newState) {
    this.state = Object.assign({}, this.state, newState);

    window.localStorage.setItem(LOCAL_STORAGE_APP_KEY, JSON.stringify(this.state));
  }

  activateReportToolbelt() {
    this.dom.reportSaveBtn.classList.remove('disabled');
    this.dom.resetVideoBtn.classList.remove('disabled');
  }

  deactivateReportToolbelt() {
    this.dom.reportSaveBtn.classList.add('disabled');
    this.dom.resetVideoBtn.classList.add('disabled');
  }

  renderState(state) {
    if (state.video) {
      this.renderProcessVideoHtml(this.state.video);
      this.showProcessForm();
    }

    if (state.hideTopSection) {
      this.dom.topSection.classList.remove('show');
    }

    if (state.watchVideoForm) {
      Object.keys(state.watchVideoForm).forEach(inputName => {
        document.getElementsByName(inputName).forEach(elem => {
          if (elem.type === 'checkbox') {
            elem.checked = state.watchVideoForm[inputName] === 'on';
          } else {
            elem.value = state.watchVideoForm[inputName];
          }
        });
      });

      this.activateReportToolbelt();
    }

    if (state.addToWikiForm) {
      Object.keys(state.watchVideoForm).forEach(inputName => {
        document.getElementsByName(inputName).forEach(elem => {
          if (elem.type === 'checkbox') {
            elem.checked = state.watchVideoForm[inputName] === 'on';
          } else {
            elem.value = state.watchVideoForm[inputName];
          }
        });
      });

      this.activateReportToolbelt();
    }
  }

  renderUserInputAsTable() {
    // Hacks: just take formData, append `-output` to each input name, and update HTML
    // Object.keys(formData).forEach(inputKey => { document.getElementById(`${inputKey}-output`).textContent = formData[inputKey]; })
    const table = this.dom.writeToGoogleSheetTableBody;
    table.innerHTML = '';

    const video = this.state.video;
    const watchVideoForm = this.state.watchVideoForm;
    const addToWikiForm = this.state.addToWikiForm;

    // TODO: Maybe this data conversion happens on user input? May enable a decrease in what data needs to be
    // tracked (e.g. forms; rehydrating forms could happen from the video JSON object)
    const videoWithFormInput = Object.assign({}, video, {
      Mac: {
        ModelIdentifier: watchVideoForm['model-identifier'],
        ModelNumber: watchVideoForm['model-number'],
        LogicBoardPartNumber: watchVideoForm['logic-board-number'],
      },
      Repair: {
        Cause: watchVideoForm['cause'],
        Symptom: watchVideoForm['symptom'],
        Issues: [
          watchVideoForm['issue'],
          '',
        ],
      },
      Wiki: {
        Url: addToWikiForm['wiki-url'],
        Notes: addToWikiForm['wiki-entry-notes'],
        Status: 'Done',
      },
    });

    const surroundingVideos = this.state.videos
      .filter(_ => _.RowID.Index != video.RowID.Index && _.RowID.Index >= video.RowID.Index - 2 && _.RowID.Index <= video.RowID.Index + 2)

    const [ one, two, three, four, ...rest ] = surroundingVideos;
    const renderTheseVideos = [
      one,
      two,
      videoWithFormInput,
      three,
      four,
    ];
    renderTheseVideos
      .map(videoData => VideoTableDataToGoogleSheetTableRow(videoData, videoData.RowID.Index == video.RowID.Index))
      .forEach(tr => {
        table.appendChild(tr);
      });
    // get 2 rows above, and two rows below the data
  }

  renderProcessVideoHtml(videoDataRow) {
    // Disallow browser URL caching so that iframe does not
    // TODO: Is this a bad idea? What about offline experince?
    this.dom.videoIframe.src = `${videoDataRow.Video.EmbeddedUrl}?timestamp=${new Date().getTime()}`;

    this.dom.videoYoutubeLink.href = videoDataRow.Video.Url;
    this.dom.videoTitle.innerText = videoDataRow.Video.Title;
    this.dom.videoRow.innerText = videoDataRow.RowID.HumanReadable;


  }

  resetProcessForm() {
    this.deactivateReportToolbelt();
    this.dom.watchVideoForm.reset();
    this.dom.addToWikiForm.reset();

    this.setState({
      watchVideoForm: null,
      addToWikiForm: null,
    })
  }

  resetAppState() {
    window.localStorage.removeItem(LOCAL_STORAGE_APP_KEY);
    window.location.reload();
  }

  showProcessForm() {
    this.setState({ showProcessingForm: true });
    this.dom.waitingText.classList.add('d-none');
    this.dom.processGuide.classList.remove('d-none');
    this.dom.resetVideoBtn.classList.remove('disabled');
  }

  setDoneRowAnswersTable(repairVideos) {
    const tableData = repairVideos
      .filter(_ => _.Wiki.Status == "Done")
      .map(_ => {
        const tr = document.createElement('tr');
        tr.classList.add('table-success');

        [
          _.RowID.HumanReadable,
          _.Mac.ModelIdentifier,
          _.Mac.ModelNumber,
          _.Mac.LogicBoardPartNumber,
          _.Repair.Symptom,
          _.Repair.Cause,
          _.Repair.Issues.join(', '),
        ].forEach(textContent => {
          let td = document.createElement('td');
          td.textContent = textContent;
          tr.appendChild(td);
        });

        return tr;
      })
      .reduce((tbody, tr) => {
        tbody.appendChild(tr);
        return tbody;
      }, document.createElement('tbody'));

    this.dom.doneRowAnswersTable.appendChild(tableData);
  }

  setRepairVideoData(repairVideos) {
    this.setState({ videos: repairVideos });

    const processQueue = repairVideos.filter(_ => _.NeedsProcessing);

    this.dom.assignVideoBtn.onclick = () => {
      const randomVideo = processQueue[Math.ceil(Math.random() * processQueue.length)];
      this.setState({ video: randomVideo });

      this.resetProcessForm();
      this.renderProcessVideoHtml(randomVideo);
      this.showProcessForm();
    };

    this.dom.assignVideoBtn.classList.remove('disabled');
  }

  setModelIdsDropdown(modelIdsFromSheetJson) {
    Object.keys(modelIdsFromSheetJson)
      .filter(_ => _ !== '')
      .map(modelId => {
        const menuItem = document.createElement('a');
        menuItem.classList.add('dropdown-item');
        menuItem.textContent = modelId;
        menuItem.setAttribute('data-row-ids', modelIdsFromSheetJson[modelId])
        menuItem.addEventListener('click', () => {
          this.dom.modelIdInput.value = modelId;
        });

        return menuItem
      })
      .forEach((_) => this.dom.modelIdsDropdown.appendChild(_));
  }

  setModelNumbersDropdown(modelNumbersFromSheetJson) {
    Object.keys(modelNumbersFromSheetJson)
      .filter(_ => _ !== '')
      .map(modelNumber => {
        const menuItem = document.createElement('a');
        menuItem.classList.add('dropdown-item');
        menuItem.textContent = modelNumber;
        menuItem.setAttribute('data-row-ids', modelNumbersFromSheetJson[modelNumber])
        menuItem.addEventListener('click', () => {
          this.dom.modelNumberInput.value = modelNumber;
        });

        return menuItem
      })
      .forEach((_) => this.dom.modelNumbersDropdown.appendChild(_));
  }

  setLogicBoardNumbersDropdown(logicBoardNumbersFromSheet) {
    Object.keys(logicBoardNumbersFromSheet)
      .filter(_ => _ !== '')
      .map(logicBoardNumber => {
        const menuItem = document.createElement('a');
        menuItem.classList.add('dropdown-item');
        menuItem.textContent = logicBoardNumber;
        menuItem.setAttribute('data-row-ids', logicBoardNumbersFromSheet[logicBoardNumber])
        menuItem.addEventListener('click', () => {
          this.dom.logicBoardNumberInput.value = logicBoardNumber;
        });

        return menuItem
      })
      .forEach((_) => this.dom.logicBoardNumbersDropdown.appendChild(_));
  }
}

async function main() {
  const app = new ProcessRepairVideosApp();
  const getRepairDataReqF = fetch('json/repair-videos-data.json');
  const getModelIdsFromSheetReqF = fetch('json/model-ids.json');
  const getModelNumbersFromSheetReqF = fetch('json/model-numbers.json');
  const getLogicBoardNumbersFromSheetReqF = fetch('json/logic-board-numbers.json');

  // Populate dropdowns with data from google sheet
  // TODO: Dry up this wet code
  await Promise.all([
    new Promise(async (res) => {
      const repairVideosReq = await getRepairDataReqF;
      const json = await repairVideosReq.json();
      app.setRepairVideoData(json);
      app.setDoneRowAnswersTable(json);
      res();
    }),
    new Promise(async (res) => {
      const req = await getModelIdsFromSheetReqF;
      const json = await req.json();
      app.setModelIdsDropdown(json);
      res();
    }),
    new Promise(async (res) => {
      const req = await getModelNumbersFromSheetReqF;
      const json = await req.json();
      app.setModelNumbersDropdown(json);
      res();
    }),
    new Promise(async (res) => {
      const req = await getLogicBoardNumbersFromSheetReqF;
      const json = await req.json();
      app.setLogicBoardNumbersDropdown(json);
      res();
    }),
  ]);
}

try {
  const program = main();
  program.catch((e) => {
    console.error("Error encountered");
    console.error(e);
    // start app anyways
    const app = new ProcessRepairVideosApp();
    app.setRepairVideoData([]);
  });
} catch (e) {
  alert(e);
}
