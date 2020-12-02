// Load json/repair-videos-data.json file

const assignVideoBtn = document.getElementById('assign-video');
const resetVideobtn = document.getElementById('reset-video');
const videoTitle = document.getElementById('video-title');
const videoIframe = document.getElementById('video-iframe');
const processGuide = document.getElementById('process-guide');
// TODO: Get waiting text functional
// const waitingText = document.getElementById('waiting');

async function renderProcessVideoHtml(videoDataRow) {
  processGuide.classList.add('hidden');
  console.log(videoDataRow);
  videoTitle.innerText = videoDataRow.Video.Title;
  videoIframe.src = videoDataRow.Video.EmbeddedUrl;
  processGuide.classList.remove('d-none');
}

async function main() {
  const jsonRequest = await fetch('json/repair-videos-data.json');
  const json = await jsonRequest.json();
  const processQueue = json.filter(_ => _.NeedsProcessing);

  assignVideoBtn.onclick = async () => {
    const randomVideo = processQueue[Math.ceil(Math.random() * processQueue.length)];
    // waitingText.classList.remove('d-none');
    await renderProcessVideoHtml(randomVideo);
    resetVideobtn.classList.remove('btn-secondary', 'disabled');
    resetVideobtn.classList.add('btn-primary');
    // waitingText.classList.add('hidden');
  };
  assignVideoBtn.classList.remove('disabled');
}

try {
  const _ = main();
} catch (e) {
  alert(e);
}
