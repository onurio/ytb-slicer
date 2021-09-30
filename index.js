const search = require('youtube-search');
const Max = require('max-api');
const fs = require('fs');
const util = require('util');
const path = require('path');
const ytdl = require('ytdl-core');
const http = require('https');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

let savedVideos = require('./videos.json');
Max.outlet(['savedVideos', savedVideos.videos.sort()]);

const opts = {
  maxResults: 10,
  key: 'AIzaSyClhpdPEqqXRDXcBMVwTszj4eSX3G9TpAo',
};

let currentResults = [];
let currentSelected;

const updateVideosJSON = (videosJSON) => {
  let data = JSON.stringify(videosJSON, null, '\t');
  fs.writeFileSync(path.resolve('./videos.json'), data);
};

const getResults = async (term) => {
  search(term, opts, async function (err, results) {
    if (err) return console.log(err);

    currentResults = results;

    const thumbnailsDir = './media/thumbnails';

    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir);
    }

    fs.readdir(thumbnailsDir, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(path.join(thumbnailsDir, file), (err) => {
          if (err) throw err;
        });
      }
    });

    results.forEach((result, index) => {
      download(
        result.thumbnails.default.url,
        './media/thumbnails/' +
          index +
          result.title.replace(/(\s+|\:)/gi, '_').toLowerCase() +
          '.jpg',
        () => {}
      );
    });
  });
};

const download = (url, dest, cb) => {
  const file = fs.createWriteStream(dest);
  http.get(url, function (response) {
    response.pipe(file);
    file.on('finish', function () {
      file.end(cb);
      Max.outlet(['newResults', 'bang']);
    });
  });
};

const downloadResult = async (index) => {
  let info = await ytdl.getInfo(currentResults[index].link);

  let frames;

  let vidId =
    info.videoDetails.title.replace(/(\s+|\:)/g, '_').toLowerCase() +
    '_' +
    info.videoDetails.videoId;

  let mp3Path = `./media/${vidId}.mp3`;
  let mp4Path = `./media/${vidId}.mp4`;

  let videoWriteStream = fs.createWriteStream(path.resolve(mp4Path));

  videoWriteStream.on('finish', () => {});

  let videoReadStream = ytdl(currentResults[index].link);

  const convert = new ffmpeg({ source: videoReadStream });

  convert.on('progress', (progress) => {
    Max.outlet(['audioProgress', 'bang']);
  });

  convert.on('end', () => {
    savedVideos.videos.push(vidId);
    updateVideosJSON(savedVideos);

    Max.outlet(['audio', path.resolve(mp3Path)]);
    Max.outlet(['video', path.resolve(mp4Path)]);
    Max.outlet(['savedVideos', savedVideos.videos]);
  });
  convert.saveToFile(mp3Path);

  videoReadStream.on('progress', (chunkSize, downloaded, size) => {
    frames = size;
    Max.outlet(['videoProgress', (downloaded / size) * 100]);
  });

  videoReadStream.pipe(videoWriteStream);
};

Max.addHandler('downloadVid', (index) => {
  downloadResult(index);
});

Max.addHandler('search', (term) => {
  getResults(term);
});

Max.addHandler('select', (id) => {
  currentSelected = id;
  Max.outlet(['audio', path.resolve(`./media/${id}.mp3`)]);
  Max.outlet(['video', path.resolve(`./media/${id}.mp4`)]);
});

Max.addHandler('deleteCurrent', () => {
  if (currentSelected) {
    const mp3 = `./media/${currentSelected}.mp3`;
    const mp4 = `./media/${currentSelected}.mp4`;

    [mp3, mp4].forEach((path) => {
      fs.unlink(path, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        //file removed
      });
    });

    savedVideos.videos = savedVideos.videos.filter(
      (vid) => vid !== currentSelected
    );
    updateVideosJSON(savedVideos);
    Max.outlet(['savedVideos', savedVideos.videos]);
  }
});
