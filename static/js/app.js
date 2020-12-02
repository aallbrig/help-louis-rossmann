// Load json/repair-videos-data.json file

const assignVideoBtn = document.getElementById('assign-video');
const resetVideobtn = document.getElementById('reset-video');
const videoTitle = document.getElementById('video-title');
const videoIframe = document.getElementById('video-iframe');
const processGuide = document.getElementById('process-guide');
// TODO: Get waiting text functional
// const waitingText = document.getElementById('waiting');

async function renderProcessVideoHtml(videoDataRow) {
  console.log(videoDataRow);
  videoTitle.innerText = videoDataRow.Video.Title;
  // Disallow browser URL caching
  // TODO: Is this a bad idea? What about offline experince?
  videoIframe.src = `${videoDataRow.Video.EmbeddedUrl}?timestamp=${new Date().getTime()}`;
}

async function main() {
  const jsonRequest = await fetch('json/repair-videos-data.json');
  const json = await jsonRequest.json();
  const processQueue = json.filter(_ => _.NeedsProcessing);

  assignVideoBtn.onclick = async () => {
    const randomVideo = processQueue[Math.ceil(Math.random() * processQueue.length)];
    // waitingText.classList.remove('d-none');
    processGuide.classList.add('hidden');
    await renderProcessVideoHtml(randomVideo);
    processGuide.classList.remove('d-none');

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
