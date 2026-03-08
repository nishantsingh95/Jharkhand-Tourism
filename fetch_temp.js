fetch('https://www.youtube.com/watch?v=DCNPd7VfE7E')
    .then(res => res.text())
    .then(text => {
        const match = text.match(/"shortDescription":"(.*?)"/);
        if (match) {
            console.log(match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'));
        } else {
            console.log("No description found");
        }
    });
