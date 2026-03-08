async function searchWiki(query) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId !== '-1' && pages[pageId].original) {
        return pages[pageId].original.source;
    }
    return null;
}
async function run() {
    console.log('Dhokra:', await searchWiki('Dhokra'));
    console.log('Tussar silk:', await searchWiki('Tussar silk'));
    console.log('Jadopatia:', await searchWiki('Jadopatia'));
    console.log('Bamboo craft:', await searchWiki('Bamboo'));
}
run();
