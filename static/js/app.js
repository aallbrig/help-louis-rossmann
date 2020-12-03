const LOCAL_STORAGE_APP_KEY = 'app';
class ProcessRepairVideosApp {
  constructor() {
    // TODO: rehydrate app with local storage data
    const storageState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_APP_KEY));
    const stateDefaults = {
      hideTopSection: false,
      showProcessingForm: false,
    };

    this.state = Object.assign({}, stateDefaults, storageState);

    this.dom = {
      topSection: document.getElementById('information-collapsable'),
      hideTopBtn: document.getElementById('hide-top'),
      assignVideoBtn: document.getElementById('assign-video'),
      resetVideoBtn: document.getElementById('reset-video'),
      videoTitle: document.getElementById('video-title'),
      videoIframe: document.getElementById('video-iframe'),
      processGuide: document.getElementById('process-guide'),
      waitingText: document.getElementById('waiting'),
    }

    this.dom.resetVideoBtn.onclick = this.resetProcessForm.bind(this);
    this.dom.hideTopBtn.onclick = () => {
      this.setState({ hideTopSection: true });
    };

    if (this.state.video) {
      this.resetProcessForm();
      this.renderProcessVideoHtml(this.state.video);
      this.showProcessForm();
    }

    if (this.state.hideTopSection) {
      this.dom.topSection.classList.remove('show');
    }
  }

  setState(newState) {
    this.state = Object.assign({}, this.state, newState);

    window.localStorage.setItem(LOCAL_STORAGE_APP_KEY, JSON.stringify(this.state));
  }

  renderProcessVideoHtml(videoDataRow) {
    this.dom.videoTitle.innerText = videoDataRow.Video.Title;
    // Disallow browser URL caching so that iframe does not
    // TODO: Is this a bad idea? What about offline experince?
    this.dom.videoIframe.src = `${videoDataRow.Video.EmbeddedUrl}?timestamp=${new Date().getTime()}`;
  }

  resetProcessForm() {
    // this.setState({ showProcessingForm: false });
    // this.dom.waitingText.classList.remove('d-none');
    // this.dom.processGuide.classList.add('d-none');
    // this.dom.videoTitle.innerText = '';
    // this.dom.videoIframe.src = '';
    this.dom.resetVideoBtn.classList.add('disabled');
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
