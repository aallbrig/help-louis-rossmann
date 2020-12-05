const LOCAL_STORAGE_APP_KEY = 'app-state';
// TODO: storage any reports generated user in local storage
const LOCAL_STORAGE_REPORTS_KEY = 'app-reports';

class ReportReports {
  constructor() {
    this.dom = {};
    const storedState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY));
    const stateDefaults = {};
    this.state = Object.assign({}, stateDefaults, storedState);
  }
}

class ProcessRepairVideosApp {
  constructor() {
    this.dom = {
      topSection: document.getElementById('information-collapsable'),
      hideTopBtn: document.getElementById('hide-top'),
      assignVideoBtn: document.getElementById('assign-video'),
      resetAppBtn: document.getElementById('reset-app'),
      resetVideoBtn: document.getElementById('reset-video'),
      videoTitle: document.getElementById('video-title'),
      videoIframe: document.getElementById('video-iframe'),
      processGuide: document.getElementById('process-guide'),
      waitingText: document.getElementById('waiting'),
      reportForm: document.getElementById('repair-report-form'),
      modelIdInput: document.getElementById('model-identifier'),
      modelIdsDropdown: document.getElementById('model-identifier-dropdown'),
      modelNumberInput: document.getElementById('model-number'),
      modelNumbersDropdown: document.getElementById('model-number-dropdown'),
      logicBoardNumberInput: document.getElementById('logic-board-number'),
      logicBoardNumbersDropdown: document.getElementById('logic-board-number-dropdown'),
    }

    const storedState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_APP_KEY));
    const stateDefaults = {
      hideTopSection: false,
      showProcessingForm: false,
    };

    this.state = Object.assign({}, stateDefaults, storedState);

    // Bind event handlers
    this.dom.resetAppBtn.onclick = this.resetAppState.bind(this);
    this.dom.resetVideoBtn.onclick = this.resetProcessForm.bind(this);
    this.dom.hideTopBtn.onclick = () => this.setState({ hideTopSection: true });

    this.renderState(this.state);
  }

  setState(newState) {
    this.state = Object.assign({}, this.state, newState);

    window.localStorage.setItem(LOCAL_STORAGE_APP_KEY, JSON.stringify(this.state));
  }

  renderState(state) {
    if (state.video) {
      this.resetProcessForm();
      this.renderProcessVideoHtml(this.state.video);
      this.showProcessForm();
    }

    if (state.hideTopSection) {
      this.dom.topSection.classList.remove('show');
    }
  }

  renderProcessVideoHtml(videoDataRow) {
    this.dom.videoTitle.innerText = videoDataRow.Video.Title;
    // Disallow browser URL caching so that iframe does not
    // TODO: Is this a bad idea? What about offline experince?
    this.dom.videoIframe.src = `${videoDataRow.Video.EmbeddedUrl}?timestamp=${new Date().getTime()}`;
  }

  resetProcessForm() {
    // TODO: Reset form data
    const formData = Object.fromEntries(new FormData(this.dom.reportForm).entries());
    // this.setState({ showProcessingForm: false });
    // this.dom.waitingText.classList.remove('d-none');
    // this.dom.processGuide.classList.add('d-none');
    // this.dom.videoTitle.innerText = '';
    // this.dom.videoIframe.src = '';
    this.dom.resetVideoBtn.classList.add('disabled');
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

  setRepairVideoData(repairVideos) {
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
  const allDropdownsPopulated = await Promise.all([
    new Promise(async (res) => {
      const repairVideosReq = await getRepairDataReqF;
      const json = await repairVideosReq.json();
      app.setRepairVideoData(json);
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
    // start app anyways
    const app = new ProcessRepairVideosApp();
    app.setRepairVideoData([]);
  });
} catch (e) {
  alert(e);
}
