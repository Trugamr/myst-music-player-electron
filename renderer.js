// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// files jama kar pehle fir unko compare kar build wali files se////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
const fs = require('fs');
var app = require('electron').remote; 
var dialog = app.dialog;
const path = require('path');
var mm = require('musicmetadata');
var recursive = require('recursive-readdir');
var jsonfile = require('jsonfile');

var settingsfile = './settings.json'
var musicDir;
jsonfile.readFile(settingsfile, function(err, obj) {
  	musicDir = obj.path;
	browsePath.value = musicDir;	
})
var jsonDataFile = './data.json'


var allMusic_tmp = new Array();
var allMusicMetadata = new Array();

var metadataMini;

var allMusic = new Array();


var browseButton = document.getElementById('browse-button');
var browsePath = document.getElementById('browse-path');
browseButton.addEventListener('click', function() {
	selectMusicDir();
});
function selectMusicDir() {
	dialog.showOpenDialog({
    	title:"Select a folder",
    	properties: ["openDirectory"]
	}, (folderPaths) => {
    // folderPaths is an array that contains all the selected paths
    	if(folderPaths === undefined){
        	browsePath.value = "None";
        	return;
		}else{
			browsePath.value = folderPaths;
			musicDir = browsePath.value;
			settingsObj = {path: musicDir};
				jsonfile.writeFile(settingsfile, settingsObj, function (err) {
  			console.error(err);
			})			
    	}
	});
}

var didBuild;

var saveButton = document.getElementById('save-button');
saveButton.addEventListener('click', function() {
	musicDir = browsePath.value;
	settingsObj = {path: musicDir};
	jsonfile.writeFile(settingsfile, settingsObj, function (err) {
  			console.error(err);
	})
	if(didBuild) {
		writeData();
		location.reload();
	}
	saveButton.innerHTML = "saved";
})

function dataFileCreation() {
	fs.stat(jsonDataFile, function(err, stat) {
		if(err == null) {
			console.log('File Exists');
			fs.unlink(jsonDataFile, (err) => {
				console.log(err);
			})
			fs.writeFile(jsonDataFile, '');
			console.log('File Deleted and Created.');
		} else if(err.code == 'ENOENT') {
			fs.writeFile(jsonDataFile, '');
			console.log('File Missing but Created.');
		} else {
			console.log(err.code);
		}		
	})
}


var reBuildDisplay = document.getElementById('rebuildlib-display');
function buildLibrary(callback) {
	saveButton.innerText = "save & reload";
	didBuild = true;	
	var x = 0;
	function ignoreFunc(file, stats) {
		if(file.substr(file.length -3) == "m4a" || file.substr(file.length -3) == "mp3") {
			var readableStream = fs.createReadStream(file);
			mm(readableStream , function (err, metadata) {
				try {
					allMusicMetadata.push(metadata);
					var metadataMini = {title: metadata.title, file: file, artist: metadata.artist[0], album: metadata.album, year: metadata.year, artist: metadata.artist[0], album: metadata.album, genre: metadata.genre[0]};
					allMusic_tmp.push(metadataMini); 
					readableStream.close();
					console.log(x++);
					reBuildDisplay.value = x + " files added";
					
				} catch(err) { console.log("Error in Building Library : " + err) }
			});
		}
	}
	
	recursive(musicDir, [ignoreFunc], function (err, files) {
		
	});	
	
	
}

var reBuildButton = document.getElementById('buildlib-button');
reBuildButton.addEventListener('click', function() {
	buildLibrary();
	reBuildButton.innerHTML = 'building';
})

function readLibrary(callback) {
	jsonfile.readFile(jsonDataFile, function(err, obj) {
		allMusic = obj.slice(0);
		console.dir(allMusic);
		callback();
	});
}

//reading, writing top 5, writing all tracks
readLibrary(function() {
	writeTopFive(function() {
		writeTracks(function() {
			console.log("Completed :D");
			var audio = document.getElementById("music-track");
			var playButton = document.getElementById("play-pause");
			playTrack(0);
			playButton.classList.remove('fa-pause');
			playButton.classList.add('fa-play');
			audio.pause();
		});
	});
});

function writeData() {
	fs.writeFile(jsonDataFile, JSON.stringify(allMusic_tmp));
}

function buildWriteLibrary() {
	buildLibrary(function() {
		writeData();
	})
}


var z;
var trackNo;
function playTrack(z) {
	if(z < 0) {
		playTrack(allMusic.length - 1);
	} else if(z > allMusic.length -1) {
		playTrack(0);
	} else {
		var barMusic = document.getElementById('bar-music'),
			barArtist = document.getElementById('bar-artist'),
			barMusicSrc = document.getElementById('music-source'),
			barArtwork = document.getElementById('bar-artwork');
		
		var playButton = document.getElementById("play-pause");
		var muteButton = document.getElementById("mute");
		var seekBar = document.getElementById("seek-bar");
		var volumeBar = document.getElementById("volume-bar");
		
		barMusic.innerText = allMusic[z].title;
		if(allMusic[z].artist == undefined) {
			barArtist.innerText = "N/A";
		} else {
			barArtist.innerText = allMusic[z].artist;
		}
		barMusicSrc.src = allMusic[z].file;
		
		var audio = document.getElementById("music-track");		
		
		var readableStream = fs.createReadStream(allMusic[z].file);
		mm(readableStream, function (err, metadata) {
			var b64encoded = btoa(new Uint8Array(metadata.picture[0].data).reduce((data, byte) => data + String.fromCharCode(byte), ''));;
			var datajpg = "data:image/jpg;base64," + b64encoded;
			barArtwork.src = datajpg;
  			if (err) throw err;
  			readableStream.close();
		});
		
		
		audio.load();
		audio.play();
		playButton.classList.remove('fa-play');
		playButton.classList.add('fa-pause');
		
		trackNo = z;
	}
}

//autoplaying next track 
var audio = document.getElementById("music-track");	
audio.addEventListener("timeupdate", function() {
	if(audio.duration == audio.currentTime) {
		playTrack(trackNo + 1);
	}								
});

//forward and backward button event listners
forward.addEventListener('click', function() {
	playTrack(trackNo + 1);
})

backward.addEventListener('click', function() {
	playTrack(trackNo - 1);
})


//plays random track 
function randTrack() {
	setTimeout('playTrack(Math.floor((Math.random() * allMusic.length) + 1))', 2000);
}

//writing tracks on page
function writeTracks(callback) {
	var musicList = document.getElementById('all-music-list');
	musicList.innerHTML = "";
	for(var j = 0; j < allMusic.length; j++) {
		
		var musName = allMusic[j].title;
		var artName = allMusic[j].artist;
		var musYear = allMusic[j].year;
		
		if(musYear.length > 4) {
			musYear = musYear.substr(0,4);
		} else if(musYear == "") {
			musYear = "N / A"
		}
				
		musicList.innerHTML += '<li class="list-item-bg" onclick="playTrack(' + j + ')"><p class="al-music-title">' + musName + '</p><p class="al-music-artist">' + artName + '</p><p class="al-music-year">' + musYear + '</p></li>';
		if(j == allMusic.length - 1) callback();
	}
	
	//initializing options for listjs
	var options = {
		valueNames: [ 'al-music-title', 'al-music-artist', 'al-music-year' ]
	};

	var musicList = new List('all-music', options);
} 

//show tracks button event listner
//document.getElementById('load-tracks').addEventListener('click', function() {
//	writeTracks();
//})

function writeTopFive(callback) {
	for(var x = 0; x < 5 ; x++) {
		topFive(x);
	}
	callback();
}

function topFive(x) {	
	var readableStream = fs.createReadStream(allMusic[x].file);
	mm(readableStream, function (err, metadata) {
		if (err) throw err;		
		var b64encoded = btoa(new Uint8Array(metadata.picture[0].data).reduce((data, byte) => data + String.fromCharCode(byte), ''));;
		var datajpg = "data:image/jpg;base64," + b64encoded;
		console.log(x);
		document.getElementById("art" + x).childNodes[1].src = datajpg;		
		document.getElementById("art" + x).childNodes[3].innerText = allMusic[x].title;
		readableStream.close();
	});
}	

//top 5 artwork event listners 
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

