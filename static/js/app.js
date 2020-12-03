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
    }

    const storedState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_APP_KEY));
    const stateDefaults = {
      hideTopSection: false,
      showProcessingForm: false,
    };

    this.state = Object.assign({}, stateDefaults, storedState);


    this.dom.resetAppBtn.onclick = this.resetAppState.bind(this);
    this.dom.resetVideoBtn.onclick = this.resetProcessForm.bind(this);
    this.dom.hideTopBtn.onclick = () => {
      this.setState({ hideTopSection: true });
    };

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
}

async function main() {
  const app = new ProcessRepairVideosApp();
  const getRepairDataReq = await fetch('json/repair-videos-data.json');
  const repairDataJson = await getRepairDataReq.json();
  app.setRepairVideoData(repairDataJson);
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
