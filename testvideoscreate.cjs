const fs = require("fs");

// fs.exists("./videosTest.json", (exists) => {
//     if (exists) {
//         console.log("File exists");
//     } else {
//         console.log("File does not exist");
//     }
// });


// let videos;
try {

    savedVideos = require("./videosTest.json");
} catch (error) {
    fs.writeFileSync("./videosTest.json", JSON.stringify({ videos: [] }));
    savedVideos = require("./videosTest.json");
    // console.log(error);
}

console.log(savedVideos.videos);