const LOCAL_STORAGE_APP_KEY = 'app-state';
const LOCAL_STORAGE_REPORTS_KEY = 'app-reports';

function mergeFormDataWithVideo(video, forms) {
  const { watchVideoForm, addToWikiForm } = forms;

  return Object.assign({}, video, {
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
      OtherInfo: watchVideoForm['notes'],
    },
    Wiki: {
      Url: addToWikiForm['wiki-url'],
      Notes: addToWikiForm['wiki-entry-notes'],
      Status: 'Done',
    },
  });
}

class UserCopyableTable {
  static renderTableRowJSON(video) {
    return [
      {
        columnName: 'Row Number',
        columnData: video.RowID.HumanReadable,
        options: {
          copy: false,
        }
      },
      {
        columnName: 'VideoUrl',
        columnData: video.Video.Url,
        options: {
          copy: false,
        },
      },
      {
        columnName: 'Upload date',
        columnData: 'ignore',
        options: {
          copy: false,
        },
      },
      {
        columnName: 'Name',
        columnData: video.Video.Title,
        options: {
          copy: false,
        },
      },
      {
        columnName: 'Cause',
        columnData: video.Repair.Cause,
        options: {
          copy: true,
        },
      },
      {
        columnName: 'Issue',
        columnData: video.Repair.Issues[0],
        options: {
          copy: true,
        },
      },
      {
        columnName: 'Issue 2',
        columnData: video.Repair.Issues[1],
        options: {
          copy: false,
        },
      },
      {
        columnName: 'Model Identifier',
        columnData: video.Mac.ModelIdentifier,
        options: {
          copy: true,
        },
      },
      {
        columnName: 'Model Number',
        columnData: video.Mac.ModelNumber,
        options: {
          copy: true,
        },
      },
      {
        columnName: 'Logic Board Part Number',
        columnData: video.Mac.LogicBoardPartNumber,
        options: {
          copy: true,
        },
      },
      {
        columnName: 'Other info',
        columnData: video.Repair.OtherInfo,
        options: {
          copy: true,
        },
      },
      {
        columnName: 'Status',
        columnData: video.Wiki.Status,
        options: {
          copy: true,
        },
      },
      {
        columnName: 'User working on it',
        columnData: 'ignored',
        options: {
          copy: false,
          input: true,
        },
      },
      {
        columnName: 'Link to wiki page',
        columnData: video.Wiki.Url,
        options: {
          copy: true,
        },
      },
      {
        columnName: 'Notes',
        columnData: video.Wiki.Notes,
        options: {
          copy: true,
        },
      },
    ];
  }

  static generateSlimTableRowDOM(tableRowJSON) {
    // TODO: Ensure this meets expected JSON scheme
    const columnNameTd = document.createElement('td');
    columnNameTd.classList.add('text-right');
    columnNameTd.textContent = tableRowJSON.columnName;

    const columnDataTd = document.createElement('td');
    columnDataTd.textContent = tableRowJSON.columnData;

    const tr = document.createElement('tr');
    tr.append(columnNameTd, columnDataTd);

    [
      columnNameTd,
      columnDataTd,
    ].forEach(_ => {
      _.classList.add(tableRowJSON.options.copy ? 'font-weight-bold' : 'font-weight-light');
    });

    return tr;
  }

  static generateFatTableRowDOM(tableRowJSON) {
    // TODO: Ensure this meets expected JSON scheme
    let timeouts = [];
    const columnNameTd = document.createElement('td');
    columnNameTd.classList.add('text-right');
    columnNameTd.textContent = tableRowJSON.columnName;

    const userCopyBtnTd = document.createElement('td');
    userCopyBtnTd.classList.add('text-center');

    const columnDataTd = document.createElement('td');
    columnDataTd.textContent = tableRowJSON.columnData;

    const tr = document.createElement('tr');
    tr.append(columnNameTd, userCopyBtnTd, columnDataTd);

    if (tableRowJSON.options.copy) {
      columnNameTd.classList.add('font-weight-bold');
      columnDataTd.classList.add('font-weight-bold');

      const favIcon = document.createElement('i');
      favIcon.classList.add('fa', 'fa-clipboard', 'fa-lg');

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.classList.add('btn', 'btn-link', 'btn-lg');
      btn.setAttribute('data-copy-value', tableRowJSON.columnData);
      btn.appendChild(favIcon);

      const copiedAlert = document.getElementById('copied-alert');
      btn.onclick = ((e) => {
        timeouts.forEach(clearTimeout);
        copiedAlert.classList.remove('d-none');
        timeouts = [
          ...timeouts,
          setTimeout(() => {
            copiedAlert.classList.add('d-none');
          }, 750),
        ]
        const data = e.currentTarget.getAttribute('data-copy-value');
        const el = document.createElement('textarea');
        el.value = data;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      });

      userCopyBtnTd.appendChild(btn);

    } else {
      tr.classList.add('table-secondary');
      columnNameTd.classList.add('font-weight-light');
      columnDataTd.classList.add('font-weight-light');
    }

    return tr;
  }
}

class ReportsWidget {
  constructor(parentRef) {
    this.parentRef = parentRef;
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
    let updatedReports;
    // TODO: Validate report data
    const reports = this.state.reports;
    const maybePreviousReport = reports.filter(report => report.video.RowID.Index == reportFormData.video.RowID.Index);

    if (maybePreviousReport.length > 0) {
      updatedReports = reports.map(report => {
        if (report.video.RowID.Index == reportFormData.video.RowID.Index) {
          return reportFormData;
        } else {
          return report;
        }
      });
    } else {
      updatedReports = [ ...reports, reportFormData ];
    }
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
        .map(this.reportCardDOM.bind(this))
        .forEach(DOM => this.dom.reportsContainer.appendChild(DOM));
      this.dom.deleteReportsBtn.classList.remove('disabled');
    } else {
      this.dom.reportsContainer.innerText = 'No saved reports (yet)...';
      this.dom.deleteReportsBtn.classList.add('disabled');
    }
  }

  displayUserReportValuesTable(video) {
    const tableRows = UserCopyableTable.renderTableRowJSON(video);

    return tableRows.map(UserCopyableTable.generateSlimTableRowDOM);
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

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <th scope="col" class="text-right" style="width: 150px;">Google Sheet column name</td>
      <th scope="col">Value</td>
    `;

    const thead = document.createElement('thead');
    thead.appendChild(tr);

    const tbody = document.createElement('tbody');
    const { watchVideoForm, addToWikiForm } = report;
    const videoWithFormData = mergeFormDataWithVideo(report.video, { watchVideoForm, addToWikiForm });
    tbody.append(...this.displayUserReportValuesTable(videoWithFormData));

    const table = document.createElement('table');
    table.classList.add('table', 'table-bordered');
    table.append(thead, tbody);

    const parentRef = this.parentRef;
    // <button id="delete-reports" type="button" class="btn btn-danger disabled my-3" data-toggle="tooltip" data-placement="top" title="Delete your saved reports from browser storage. This operation cannot be undone.">
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.classList.add('btn', 'btn-outline-primary', 'px-5', 'mx-2');
    editBtn.setAttribute('data-toogle', 'tooltip');
    editBtn.setAttribute('data-placement', 'top');
    editBtn.setAttribute('title', 'Edit this report in the processing area above');
    editBtn.innerHTML = `
      Edit <i class="fa fa-question-circle"></i>
    `;
    editBtn.onclick = (e) => {
      parentRef.resetProcessForm();
      parentRef.renderProcessVideoHtml(videoWithFormData);
      parentRef.setProcessFormByVideoData(videoWithFormData);
      parentRef.showProcessForm();
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };

    const buttonToolbar = document.createElement('div');
    buttonToolbar.classList.add('btn-group', 'float-right', 'mb-3');
    buttonToolbar.setAttribute('role', 'group');
    buttonToolbar.setAttribute('aria-label', 'Report button group');
    buttonToolbar.append(editBtn);

    const cardBody = document.createElement('div');
    cardBody.id = `collapse-report-${report.video.RowID.Index}`;
    cardBody.classList.add('collapse');
    cardBody.setAttribute('aria-labelledby', `heading-report-${report.video.RowID.Index}`);
    cardBody.setAttribute('data-parent', '#reports-container');
    cardBody.append(videoIFrame, table, buttonToolbar);

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
    this.reportsWidget = new ReportsWidget(this);

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
      const addToWikiForm = Object.fromEntries(new FormData(this.dom.addToWikiForm).entries());
      const report = {
        video: this.state.video,
        videoWithUserInput: mergeFormDataWithVideo(this.state.video, { watchVideoForm, addToWikiForm }),
        watchVideoForm,
        addToWikiForm,
      };

      this.reportsWidget.addNewReport(report);
      this.resetProcessForm();
    }
    this.dom.resetVideoBtn.onclick = this.resetProcessForm.bind(this);
    this.activateReportToolbelt();

    // Report section forms
    this.dom.watchVideoForm.oninput = () => {
      const formData = Object.fromEntries(new FormData(this.dom.watchVideoForm).entries());
      this.setState({ watchVideoForm: formData });
    };
    this.dom.addToWikiForm.oninput = () => {
      const formData = Object.fromEntries(new FormData(this.dom.addToWikiForm).entries());
      this.setState({ addToWikiForm: formData });
    }

    // Take the latest user input from "Watch Video Form" when opening
    this.dom.writeToGoogleSheetHeading.onclick = () => {
      const classList = this.dom.writeToGoogleSheetCollapsable.classList;
      // If the card is going to open...
      if (!classList.contains('show')) {
        this.renderUserCopyTable();
        this.renderSheetPreviewTable();
      }
    };
    document.getElementById('heading-write-to-wiki').onclick = () => {
      const classList = document.getElementById('collapse-write-to-wiki').classList
      // If the card is going to open...
      if (!classList.contains('show')) {
        this.renderAddToWikiUserCopyTable();
      }
    }

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
      Object.keys(state.addToWikiForm).forEach(inputName => {
        document.getElementsByName(inputName).forEach(elem => {
          if (elem.type === 'checkbox') {
            elem.checked = state.addToWikiForm[inputName] === 'on';
          } else {
            elem.value = state.addToWikiForm[inputName];
          }
        });
      });

      this.activateReportToolbelt();
    }
  }

  renderAddToWikiUserCopyTable() {
    const table = document.getElementById('add-to-wiki-user-copy-table-body');
    table.innerHTML = '';

    const video = this.state.video;
    const watchVideoForm = this.state.watchVideoForm || {};
    const addToWikiForm = this.state.addToWikiForm || {};
    const videoWithFormInput = mergeFormDataWithVideo(video, { watchVideoForm, addToWikiForm });
    const addToWikiColumns = ['VideoUrl', 'Model Identifier', 'Model Number', 'Logic Board Part Number', 'Other info'];
    const tableRows = UserCopyableTable.renderTableRowJSON(videoWithFormInput)
      .filter((tblRow) => addToWikiColumns.indexOf(tblRow.columnName) > -1)
      .map((tblRow) => Object.assign({}, tblRow, { options: { copy: true } }));

    table.append(...tableRows.map(UserCopyableTable.generateFatTableRowDOM));
  }

  renderUserCopyTable() {
    const table = document.getElementById('user-copy-table-body');
    table.innerHTML = '';

    const video = this.state.video;
    const watchVideoForm = this.state.watchVideoForm || {};
    const addToWikiForm = this.state.addToWikiForm || {};
    const videoWithFormInput = mergeFormDataWithVideo(video, { watchVideoForm, addToWikiForm });
    const tableRows = UserCopyableTable.renderTableRowJSON(videoWithFormInput);

    table.append(...tableRows.map(UserCopyableTable.generateFatTableRowDOM))
  }

  renderSheetPreviewTable() {
    // Hacks: just take formData, append `-output` to each input name, and update HTML
    // Object.keys(formData).forEach(inputKey => { document.getElementById(`${inputKey}-output`).textContent = formData[inputKey]; })
    const table = this.dom.writeToGoogleSheetTableBody;
    table.innerHTML = '';

    const video = this.state.video;
    const watchVideoForm = this.state.watchVideoForm || {};
    const addToWikiForm = this.state.addToWikiForm || {};
    // TODO: Maybe this data conversion happens on user input? May enable a decrease in what data needs to be
    // tracked (e.g. forms; rehydrating forms could happen from the video JSON object)
    const videoWithFormInput = mergeFormDataWithVideo(video, { watchVideoForm, addToWikiForm });


    // TODO: What if this is the topmost or bottommost table row?
    const surroundingVideos = this.state.videos
      .filter(_ => _.RowID.Index != video.RowID.Index && _.RowID.Index >= video.RowID.Index - 2 && _.RowID.Index <= video.RowID.Index + 2)

    const [ one, two, three, four, ...rest ] = surroundingVideos;
    // get 2 rows above, and two rows below the data
    const renderTheseVideos = [
      one,
      two,
      videoWithFormInput,
      three,
      four,
    ];

    renderTheseVideos
      .map(videoData => this._videoTableDataToGoogleSheetTableRow(videoData, videoData.RowID.Index == video.RowID.Index))
      .forEach(tr => {
        table.appendChild(tr);
      });
  }

  renderProcessVideoHtml(videoDataRow) {
    // Disallow browser URL caching so that iframe does not
    // TODO: Is this a bad idea? What about offline experince?
    this.dom.videoIframe.src = `${videoDataRow.Video.EmbeddedUrl}?timestamp=${new Date().getTime()}`;

    this.dom.videoYoutubeLink.href = videoDataRow.Video.Url;
    this.dom.videoTitle.innerText = videoDataRow.Video.Title;
    this.dom.videoRow.innerText = videoDataRow.RowID.HumanReadable;
  }

  setProcessFormByVideoData(videoData) {
    if (videoData.Mac.ModelIdentifier) {
      document.getElementsByName('model-identifier').forEach(_ => _.value = videoData.Mac.ModelIdentifier);
    }
    if (videoData.Mac.ModelNumber) {
      document.getElementsByName('model-number').forEach(_ => _.value = videoData.Mac.ModelNumber);
    }
    if (videoData.Mac.LogicBoardPartNumber) {
      document.getElementsByName('logic-board-number').forEach(_ => _.value = videoData.Mac.LogicBoardPartNumber);
    }
    if (videoData.Repair.Cause) {
      document.getElementsByName('logic-board-number').forEach(_ => _.value = videoData.Repair.Cause);
    }
    if (videoData.Repair.Symptom) {
      document.getElementsByName('symptom').forEach(_ => _.value = videoData.Repair.Symptom);
    }
    if (videoData.Repair.Issues[0]) {
      document.getElementsByName('issue').forEach(_ => _.value = videoData.Repair.Issues[0]);
    }
    if (videoData.Wiki.Url) {
      document.getElementsByName('wiki-entry-url').forEach(_ => _.value = videoData.Wiki.Url);
    }
    if (videoData.Wiki.Notes) {
      document.getElementsByName('wiki-entry-notes').forEach(_ => _.value = videoData.Wiki.Notes);
    }
  }

  resetProcessForm() {
    this.hideProcessForm();

    [
      'collapse-analyze-video',
      'collapse-write-to-wiki',
      'collapse-update-google-sheet',
    ].forEach(_ => document.getElementById(_).classList.remove('show'));

    const firstStep = document.getElementById('collapse-one');
    firstStep.classList.add('show');
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

  hideProcessForm() {
    this.setState({ showProcessingForm: false });
    this.dom.waitingText.classList.remove('d-none');
    this.dom.processGuide.classList.add('d-none');
    this.dom.resetVideoBtn.classList.add('disabled');
  }

  setDoneRowAnswersTable(repairVideosJSON) {
    // TODO: Check repairVideosJSON meets an expected JSON schema
    const tableData = repairVideosJSON
      .filter(_ => _.Wiki.Status === 'Done')
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
    // TODO: Make sure repairVideosJson meets expected JSON schema
    this.setState({ videos: repairVideos });

    const processQueue = repairVideos.filter(_ => _.NeedsProcessing);

    this.dom.assignVideoBtn.onclick = () => {
      const randomVideo = processQueue[Math.ceil(Math.random() * processQueue.length)];
      this.setState({ video: randomVideo });

      this.resetProcessForm();
      this.renderProcessVideoHtml(randomVideo);
      this.setProcessFormByVideoData(randomVideo);
      this.showProcessForm();
    };

    this.dom.assignVideoBtn.classList.remove('disabled');
  }

  setModelIdsDropdown(modelIdsFromSheetJson) {
    this._setDropdownMenuItems(modelIdsFromSheetJson, this.dom.modelIdsDropdown, this.dom.modelIdInput);
  }

  setModelNumbersDropdown(modelNumbersFromSheetJson) {
    this._setDropdownMenuItems(modelNumbersFromSheetJson, this.dom.modelNumbersDropdown, this.dom.modelNumberInput);
  }

  setLogicBoardNumbersDropdown(logicBoardNumbersFromSheet) {
    this._setDropdownMenuItems(logicBoardNumbersFromSheet, this.dom.logicBoardNumbersDropdown, this.dom.logicBoardNumberInput);
  }

  _setDropdownMenuItems(json, dropdownElem, inputElem) {
    // TODO: Validate the JSON meets expected JSON schema

    Object.keys(json)
      // Ignore empty strings and any responses with commas or question marks
      .filter(_ => _ !== '' && !/^.*[,?].*/.test(_))
      .map(jsonKey => {
        const menuItem = document.createElement('a');
        menuItem.classList.add('dropdown-item');
        menuItem.textContent = jsonKey;
        menuItem.setAttribute('data-row-ids', json[jsonKey])
        menuItem.addEventListener('click', () => {
          inputElem.value = jsonKey;
        });

        return menuItem
      })
      .forEach((_) => dropdownElem.appendChild(_));
  }

  _videoTableDataToGoogleSheetTableRow(video, highlight = false) {
    const tr = document.createElement('tr');
    if (highlight) {
      tr.classList.add('font-weight-bold');
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
      video.Repair.OtherInfo,
      video.Wiki.Status,
      '',
      video.Wiki.Url,
      video.Wiki.Notes,

    ].map((tdText, indx) => {
      const td = document.createElement('td');
      // highlight which cells the user needs to update
      if ([4, 5, 7, 8, 9, 11, 13, 14].indexOf(indx) === -1) {
        td.classList.add('etable-secondary');
      }

      if (indx === 0) { // the row ID
        td.classList.add('text-right');
      }

      if (indx === 1) { // the video URL
        const a = document.createElement('a');
        a.href = tdText;
        a.textContent = tdText;
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
