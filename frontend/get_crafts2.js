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
    console.log('Sohrai:', await searchWiki('Sohrai painting'));
    console.log('Bamboo:', await searchWiki('Bamboo'));
    console.log('Basket:', await searchWiki('Basket'));
}
run();
