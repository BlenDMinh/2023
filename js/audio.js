function PlayAudio(audioPath) {
    var audio = new Audio(audioPath);
    audio.play();
    return audio;
}

function PlayLofi() {
    var audio = PlayAudio('/audio/Pillars-Of-Creation.mp3');
    audio.loop = true;
}

function PlayFirework() {
    var i = Math.floor(Math.random() * 3 + 1);
    var audioPath = "/audio/firework" + i + ".mp3";
    PlayAudio(audioPath);
}