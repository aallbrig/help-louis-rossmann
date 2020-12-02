// Load json/repair-videos-data.json file

const assignVideoBtn = document.getElementById('assign-video');
const videoTitle = document.getElementById('video-title');
const videoIframe = document.getElementById('video-iframe');
const processGuide = document.getElementById('process-guide');
const waitingText = document.getElementById('waiting');

function renderProcessVideoHtml(videoDataRow) {
  waitingText.classList.remove('hidden');
  processGuide.classList.add('hidden');
  console.log(videoDataRow);
  videoTitle.innerText = videoDataRow.Video.Title;
  videoIframe.src = videoDataRow.Video.EmbeddedUrl;
  waitingText.classList.add('hidden');
  processGuide.classList.remove('hidden');
}

async function main() {
  const jsonRequest = await fetch('json/repair-videos-data.json');
  const json = await jsonRequest.json();
  const processQueue = json.filter(_ => _.NeedsProcessing);

  assignVideoBtn.onclick = () => {
    const randomVideo = processQueue[Math.ceil(Math.random() * processQueue.length)];
    renderProcessVideoHtml(randomVideo);
  };
  assignVideoBtn.classList.remove('disabled');
}

try {
  const _ = main();
} catch (e) {
  alert(e);
}
