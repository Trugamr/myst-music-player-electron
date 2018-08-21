// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const fs = require('fs');
const path = require('path');
var mm = require('musicmetadata');
var recursive = require('recursive-readdir');
var musicDir = "J:/Sample/";
var jsonfile = require('jsonfile');

var allMusic = new Array();
var allMusicMetadata = new Array();
var i = 0, x= 0;

async function mainStuff () {
	function ignoreFunc(file, stats) {
		if(file.substr(file.length -3) == "m4a" || file.substr(file.length -3) == "mp3") {
			mm(fs.createReadStream(file), function (err, metadata) {
				try {
					allMusicMetadata.push(metadata);
					allMusic.push(file); 
					var filejson = './data.json'
					var obj = {title: metadata.title, file: file, artist: metadata.artist[0], album: metadata.album, genre: metadata.genre[0], year: metadata.year, artist: metadata.artist[0], album: metadata.album};
				} catch(err) {  }
				if(x < 5) writeTopFive(x);
				//writeTrackX(x);
				x++;
			});
		}
	}		

	recursive(musicDir, [ignoreFunc], function (err, files) {
		//console.log(files);
		fs.writeFile(jsonDataFile, JSON.stringify(allMusic));
	});
	
}

mainStuff();

var d;
function writeTopFive(d) {
	try {
		var b64encoded = btoa(new Uint8Array(allMusicMetadata[d].picture[0].data).reduce((data, byte) => data + String.fromCharCode(byte), ''));;
		var datajpg = "data:image/jpg;base64," + b64encoded;
		document.getElementById("art" + d).childNodes[1].src = datajpg;
		document.getElementById("art" + d).childNodes[3].innerText = allMusicMetadata[d].title;
	} catch(err) {
		document.getElementById("art" + d).childNodes[1].src = './assets/images/artwork-temp.png';
	}
}

//fs.readdir(musicDir, (err, files) => {
//	files.forEach(file => {
//		var fileExt = file.substr(file.length - 3);
//		if( fileExt == "m4a" || fileExt == "mp3") {
//			
//			mm(fs.createReadStream(musicDir + file), function (err, metadata) {
//				try {
//					allMusicMetadata[x] = metadata;
//					allMusic[x] = file;
//					if(x < 5) {
//						//fs.writeFile('art-top-' + x + ".jpg", metadata.picture[0].data, 'binary')
//						document.getElementById("art" + x).childNodes[3].innerText = metadata.title;					
//						var b64encoded = btoa(new Uint8Array(allMusicMetadata[x].picture[0].data).reduce((data, byte) => data + String.fromCharCode(byte), ''));;
//						var datajpg = "data:image/jpg;base64," + b64encoded;
//						document.getElementById("art" + x).childNodes[1].src = datajpg;
//
//					}
//				} catch (err) {
//					
//				}
//				x++;
//			});
//			i++;
//		}
//	});
//});



console.log(allMusic);
console.log(allMusicMetadata);

var trackNo = 0;

var b;
function playTrack(b) {
	if(b < 0) {
		playTrack(allMusic.length - 1);
	} else if(b > allMusic.length -1) {
		playTrack(0);
	} else {
		var barMusic = document.getElementById('bar-music'),
			barArtist = document.getElementById('bar-artist'),
			barMusicSrc = document.getElementById('music-source'),
			barArtwork = document.getElementById('bar-artwork');

		// Buttons
		var playButton = document.getElementById("play-pause");
		var muteButton = document.getElementById("mute");

		// Sliders
		var seekBar = document.getElementById("seek-bar");

		var volumeBar = document.getElementById("volume-bar");
		barMusic.innerText = allMusicMetadata[b].title;
		if(allMusicMetadata[b].artist[0] == undefined) {
			barArtist.innerText = "N/A";
		} else {
			barArtist.innerText = allMusicMetadata[b].artist[0];
		}
		barMusicSrc.src = allMusic[b];
		var audio = document.getElementById("music-track");
		audio.load();
		audio.play();
		playButton.classList.remove('fa-play');
		playButton.classList.add('fa-pause');

		//var b64encoded = btoa(String.fromCharCode.apply(null, allMusicMetadata[b].picture[0].data));
		try {
			if(allMusicMetadata[b].picture[0].data == undefined) {
				barArtwork.src = './assets/images/artwork-temp';
			} else {
				var b64encoded = btoa(new Uint8Array(allMusicMetadata[b].picture[0].data).reduce((data, byte) => data + String.fromCharCode(byte), ''));;
			var datajpg = "data:image/jpg;base64," + b64encoded;
			barArtwork.src = datajpg;
			}			
		} catch(err) {}

		trackNo = b;
	}
}

var forward = document.getElementById('forward'),
	backward = document.getElementById('backward');

forward.addEventListener('click', function() {
	playTrack(trackNo + 1);
})

backward.addEventListener('click', function() {
	playTrack(trackNo - 1);
})

var artwork_top_0 = document.getElementById('art0').addEventListener('click', function() {
	playTrack(0);
	trackNo = 0;
})

var artwork_top_1 = document.getElementById('art1').addEventListener('click', function() {
	playTrack(1);
	trackNo = 1;
})

var artwork_top_2 = document.getElementById('art2').addEventListener('click', function() {
	playTrack(2);
	trackNo = 2;
})

var artwork_top_3 = document.getElementById('art3').addEventListener('click', function() {
	playTrack(3);
	trackNo = 3;
})

var artwork_top_4 = document.getElementById('art4').addEventListener('click', function() {
	playTrack(4);
	trackNo = 4;
})

var audio = document.getElementById("music-track");
audio.addEventListener("timeupdate", function() {
  	if(audio.currentTime == audio.duration) {
		playTrack(trackNo + 1);
	}
});

function writeTrackX(j) {
	var musicList = document.getElementById('all-music-list');
	try {
			var musName = allMusicMetadata[j].title;
		} catch(err) { 
			var musName = "N/A";
		}
		try {
			var artName = allMusicMetadata[j].artist[0];
		} catch(err) {
			var artName = "N/A";
		} 
		try {
			var musYear = allMusicMetadata[j].year;
		} catch(err) {
			var musYear = "N/A";
		}
		if(musYear.length > 4) {
			musYear = musYear.substr(0,4);
		} else if(musYear == "") {
			musYear = "N / A"
		}
		
		if(musName === "") {			
			musName == allMusic[j].substr(allMusic[j].length - 4, allMusic[j].length);
		}
		
		musicList.innerHTML += '<li class="list-item-bg" onclick="playTrack(' + j + ')"><p class="al-music-title">' + musName + '</p><p class="al-music-artist">' + artName + '</p><p class="al-music-year">' + musYear + '</p></li>';
}

function writeTracks() {
	var musicList = document.getElementById('all-music-list');
	musicList.innerHTML = "";
	for(var j = 0; j < allMusicMetadata.length; j++) {
		try {
			var musName = allMusicMetadata[j].title;
		} catch(err) { 
			var musName = "N/A";
		}
		try {
			var artName = allMusicMetadata[j].artist[0];
		} catch(err) {
			var artName = "N/A";
		} 
		try {
			var musYear = allMusicMetadata[j].year;
		} catch(err) {
			var musYear = "N/A";
		}
		if(musYear.length > 4) {
			musYear = musYear.substr(0,4);
		} else if(musYear == "") {
			musYear = "N / A"
		}
		
		if(musName === "") {			
			musName == allMusic[j].substr(allMusic[j].length - 4, allMusic[j].length);
		}
		
		musicList.innerHTML += '<li class="list-item-bg" onclick="playTrack(' + j + ')"><p class="al-music-title">' + musName + '</p><p class="al-music-artist">' + artName + '</p><p class="al-music-year">' + musYear + '</p></li>';
	}	
	var options = {
		valueNames: [ 'al-music-title', 'al-music-artist', 'al-music-year' ]
	};

	var musicList = new List('all-music', options);
} 

document.getElementById('load-tracks').addEventListener('click', function() {
	writeTracks();
})

function randTrack() {
	setTimeout('playTrack(Math.floor((Math.random() * allMusicMetadata.length) + 1))', 2000);
}
