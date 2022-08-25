const search = require("youtube-search");
const Max = require("max-api");
const fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const path = require("path");
const ytdl = require("ytdl-core");
const http = require("https");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const ffmpegOnProgress = require("ffmpeg-on-progress");

const logProgress = (progress, event) => {
  // progress is a floating point number from 0 to 1
  Max.outlet(["videoProgress", progress * 100]);
};

let savedVideos = require("./videos.json");
Max.outlet(["savedVideos", savedVideos.videos.sort()]);

const opts = {
  maxResults: 10,
  key: "AIzaSyClhpdPEqqXRDXcBMVwTszj4eSX3G9TpAo",
};

async function updateYTDLCORE() {
  try {
    await exec("npm install --save ytdl-core@latest");
  } catch (err) {
    console.error(err);
  }
}

updateYTDLCORE();

let currentResults = [];
let currentSelected;

const updateVideosJSON = (videosJSON) => {
  let data = JSON.stringify(videosJSON, null, "\t");
  fs.writeFileSync(path.resolve("./videos.json"), data);
};

const getResults = async (term) => {
  search(term, opts, async function (err, results) {
    if (err) return console.log(err);

    currentResults = results;

    const thumbnailsDir = "./media/thumbnails";

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
      try {
        download(
          result.thumbnails.default.url,
          "./media/thumbnails/" +
            index +
            result.title.replace(/(\s+|\:|\/)/gi, "_").toLowerCase() +
            ".jpg",
          () => {}
        );
      } catch (error) {
        Max.outlet("error", error.toString());
      }
    });
  });
};

const download = (url, dest, cb) => {
  const file = fs.createWriteStream(dest);
  http.get(url, function (response) {
    response.pipe(file);
    file.on("finish", function () {
      file.end(cb);
      Max.outlet(["newResults", "bang"]);
    });
  });
};

const downloadResult = async (index) => {
  try {
    let info = await ytdl.getInfo(currentResults[index].link);
    const videoLength = Number(info.videoDetails.lengthSeconds);
    const format = ytdl.chooseFormat(info.formats, {
      quality: "highest",
    });

    let vidId =
      info.videoDetails.title.replace(/(\s+|\:)/g, "_").toLowerCase() +
      "_" +
      info.videoDetails.videoId;

    let mp3Path = `./media/${vidId}.mp3`;
    let movPath = `./media/${vidId}.mov`;

    let duration = videoLength;

    const videoStream = new ffmpeg({ source: format.url }).withVideoCodec(
      "hap"
    );

    if (duration > 60) {
      duration = 60;
      videoStream.duration(duration);
    }

    const audioStream = videoStream.clone();

    videoStream.on("progress", ffmpegOnProgress(logProgress, duration * 1000));

    videoStream.save(path.resolve(movPath));

    audioStream.on("progress", (progress) => {
      Max.outlet(["audioProgress", "bang"]);
    });

    audioStream.on("end", () => {
      savedVideos.videos.push(vidId);
      updateVideosJSON(savedVideos);

      Max.outlet(["audio", path.resolve(mp3Path)]);
      Max.outlet(["video", path.resolve(movPath)]);
      Max.outlet(["savedVideos", savedVideos.videos]);
    });
    audioStream.save(path.resolve(mp3Path));
  } catch (error) {
    Max.outlet("error", error.toString());
  }
};

Max.addHandler("downloadVid", (index) => {
  downloadResult(index);
});

Max.addHandler("search", (term) => {
  getResults(term);
});

Max.addHandler("select", (id) => {
  currentSelected = id;
  Max.outlet(["audio", path.resolve(`./media/${id}.mp3`)]);
  Max.outlet(["video", path.resolve(`./media/${id}.mov`)]);
});

Max.addHandler("deleteCurrent", () => {
  if (currentSelected) {
    const mp3 = `./media/${currentSelected}.mp3`;
    const mov = `./media/${currentSelected}.mov`;

    [mp3, mov].forEach((path) => {
      fs.unlink(path, (err) => {
        if (err) {
          Max.outlet("error", error.toString());
          return;
        }
        //file removed
      });
    });

    savedVideos.videos = savedVideos.videos.filter(
      (vid) => vid !== currentSelected
    );
    updateVideosJSON(savedVideos);
    Max.outlet(["savedVideos", savedVideos.videos]);
  }
});
