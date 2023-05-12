async function move() {
    await IO.mv({
        from: dirPath,
        to: mp3Dir,
        names: mp3Names,
    });
}
