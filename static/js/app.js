// Load json/repair-videos-data.json file

const assignVideoBtn = document.getElementById('assign-video');
const resetVideoBtn = document.getElementById('reset-video');
const videoTitle = document.getElementById('video-title');
const videoIframe = document.getElementById('video-iframe');
const processGuide = document.getElementById('process-guide');
// TODO: Get waiting text functional
const waitingText = document.getElementById('waiting');

async function renderProcessVideoHtml(videoDataRow) {
  videoTitle.innerText = videoDataRow.Video.Title;
  // Disallow browser URL caching
  // TODO: Is this a bad idea? What about offline experince?
  videoIframe.src = `${videoDataRow.Video.EmbeddedUrl}?timestamp=${new Date().getTime()}`;
}

async function reset() {
  videoTitle.innerText = '';
  videoIframe.src = '';
}

async function main() {
  const jsonRequest = await fetch('json/repair-videos-data.json');
  const json = await jsonRequest.json();
  const processQueue = json.filter(_ => _.NeedsProcessing);

  assignVideoBtn.onclick = async () => {
    const randomVideo = processQueue[Math.ceil(Math.random() * processQueue.length)];
    waitingText.classList.remove('d-none');
    processGuide.classList.add('d-none');
    await renderProcessVideoHtml(randomVideo);
    processGuide.classList.remove('d-none');

    resetVideoBtn.classList.remove('btn-secondary', 'disabled');
    resetVideoBtn.classList.add('btn-primary');
    waitingText.classList.add('d-none');
  };

  resetVideoBtn.onclick = async () => {
    waitingText.classList.remove('d-none');
    processGuide.classList.add('d-none');
    resetVideoBtn.classList.remove('btn-primary');
    resetVideoBtn.classList.add('btn-secondary', 'disabled');
    await reset();
  };
  assignVideoBtn.classList.remove('disabled');
}

try {
  const _ = main();
} catch (e) {
  alert(e);
}
