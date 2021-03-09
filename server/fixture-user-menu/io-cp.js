async function copy() {
    await IO.cp({
        from: dirPath,
        to: mp3Dir,
        names: mp3Names,
    });
}
