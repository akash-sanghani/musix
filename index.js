const { ipcRenderer } = require("electron");
const $ = require("jquery");
const mm = require("music-metadata");
let songData = { path: [], title: [], pic: [] };
let audioPlayer = $("audio").get(0);
let img = $("img");
let playing = false;
let currentIndex = 0;
let timer = null;
let previousVol = 0.75;
audioPlayer.volume = 0.75;

function chooseMusic() {
  $("input").click();
}

// function selectCover(pictures ?: IPicture[]): IPicture | null

function gonnaSelectMusic() {
  ipcRenderer.send("selecting music", "");
}

function changeMusicTime(input) {
  audioPlayer.currentTime = input.value * audioPlayer.duration;
}

function mute() {
  let volIcon = $("#volume-button span");
  // let volSlider= $("#volume-slider").value;
  if (audioPlayer.volume != 0) {
    previousVol = audioPlayer.volume;
    audioPlayer.volume = 0;
    volIcon.removeClass("icon-sound");
    volIcon.addClass("icon-mute");
    $("#volume-slider").val("0");
  } else {
    if (previousVol == 0) previousVol = 0.01;
    audioPlayer.volume = previousVol;
    volIcon.removeClass("icon-mute");
    volIcon.addClass("icon-sound");
    $("#volume-slider").val(audioPlayer.volume);
  }
  // console.log(audioPlayer.volume);
  // console.log(previousVol);
}

function musicSelect() {
  ipcRenderer.send("selecting music", "");
  let files = $("input").get(0).files;
  console.log(files);
  for (let i = 0; i < files.length; i++) {
    let { path } = files[i];
    mm.parseFile(path, { native: true }).then((metadata) => {
      songData.path[i] = path;
      songData.title[i] = metadata.common.title;
      songData.pic[i] = metadata.common.picture;
      console.log(songData);
      console.log(metadata.common.picture);
      let songRow = `
            <tr ondblclick= "playSong(${i})">
                <td style="max-width: 180px; word-wrap: break-word;">${
                  metadata.common.title
                }</td>
                <td style="max-width: 130px; word-wrap: break-word;">${
                  metadata.common.artist
                }</td>
                <td style="max-width: 40px; word-wrap: break-word;">${secondsToTime(
                  metadata.format.duration
                )}</td>
            </tr>
            `;

      $("#table-body").append(songRow);
    });
  }
}

function playSong(index) {
  console.log("here..........");
  $("#music-slider").css("display", "block");
  audioPlayer.src = songData.path[index];
  currentIndex = index;
  audioPlayer.load();
  audioPlayer.play();
  playing = true;
  $("h4").text(songData.title[index]);
  //   $(".window").removeAttr("style");
  //   $(".window").css(
  //     // {
  //     // "background-color",
  //     // "blue",
  //     "background-image",
  //     // "url(" +
  //     //   songData.pic[index] +
  //     //   ")"
  //     `data:${songData.pic[index].format};base64,${songData.pic[
  //       index
  //     ].data.toString("base64")}`
  //   );
  $("img").attr(
    "src",
    `data:${songData.pic[index][0].format};base64,${songData.pic[
      index
    ][0].data.toString("base64")}`,
    "width",
    "100%"
  );
  img.show();

  updatePlayButton();
  timer = setInterval(updateTime, 1000);
  ipcRenderer.send("playing", songData.title[index]);
  // console.log("here..........");
}

function play() {
  if (playing) {
    audioPlayer.pause();
    clearInterval(timer);
    playing = false;
  } else {
    audioPlayer.play();
    playing = true;
    timer = setInterval(updateTime, 1000);
  }
  updatePlayButton();
}

function playNext() {
  currentIndex++;
  if (currentIndex >= songData.path.length) currentIndex = 0;
  playSong(currentIndex);
}

function playPrevious() {
  currentIndex--;
  if (currentIndex < 0) currentIndex = song.path.length - 1;
  playSong(currentIndex);
}

function clearPlaylist() {
  clearInterval(timer);
  $("#music-slider").css("display", "none");
  $("#time-left").text("00:00");
  $("#total-time").text("00:00");
  $("#table-body").html("");
  audioPlayer.pause();
  audioPlayer.src = "";
  currentIndex = 0;
  playing = false;
  $("h4").text("");
  updatePlayButton();
  songData = { path: [], title: [] };
  img.hide();
  // $("img").removeAttr("src");
}

function updateTime() {
  $("#time-left").text(secondsToTime(audioPlayer.currentTime));
  $("#total-time").text(secondsToTime(audioPlayer.duration));
  $("#music-slider").val(audioPlayer.currentTime / audioPlayer.duration);
  // console.log($("#music-slider").val);
  if (audioPlayer.currentTime >= audioPlayer.duration) {
    playNext();
  }
}

function updatePlayButton() {
  let playIcon = $("#play-button span");
  if (playing) {
    playIcon.remove("icon-play");
    playIcon.addClass("icon-pause");
  } else {
    playIcon.removeClass("icon-pause");
    playIcon.addClass("icon-play");
  }
}

function changeVolume(input) {
  let volIcon = $("#volume-button span");
  audioPlayer.volume = input.value;
  previousVol = audioPlayer.volume;
  if (audioPlayer.volume == 0) {
    volIcon.removeClass("icon-sound");
    volIcon.addClass("icon-mute");
  } else {
    volIcon.removeClass("icon-mute");
    volIcon.addClass("icon-sound");
  }
  // console.log(audioPlayer.volume);
  // console.log(previousVol);
}

function secondsToTime(t) {
  return padZero(parseInt((t / 60) % 60)) + ":" + padZero(parseInt(t % 60));
}

function padZero(v) {
  return v < 10 ? "0" + v : v;
}
