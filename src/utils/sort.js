export function sortPopularity(a, b) {
    var aPopularity = (a.media.length !== 0) ? a.media[0].popularity : 0;
    var bPopularity = (b.media.length !== 0) ? b.media[0].popularity : 0;
    
    if (a.media.length > 1) {
        a.media.sort((x, y) => y.popularity - x.popularity);
        aPopularity = a.media[0].popularity;
    } else if (b.media.length > 1) {
        b.media.sort((x, y) => y.popularity - x.popularity);
        bPopularity = b.media[0].popularity;
    } 

    return  bPopularity - aPopularity;
}

export function sortRole(a, b) {
    // Add case for background
    var aRole = (a.role == "MAIN") ? 1 : 0;
    var bRole = (b.role == "MAIN") ? 1 : 0;
    return bRole - aRole;
}

export function sortMagic(a, b) {
    var aPopularity = (a.media.length !== 0) ? a.media[0].popularity : 0;
    var bPopularity = (b.media.length !== 0) ? b.media[0].popularity : 0;

    // Add case for background
    var aRole = (a.role == "MAIN") ? 3 : 1;
    var bRole = (b.role == "MAIN") ? 3 : 1;
    
    // Use the most popular media the character is in
    if (a.media.length > 1) {
        a.media.sort((x, y) => y.popularity - x.popularity);
        aPopularity = a.media[0].popularity;
    } else if (b.media.length > 1) {
        b.media.sort((x, y) => y.popularity - x.popularity);
        bPopularity = b.media[0].popularity;
    }
    
    // Add # of favorites * 10 to the score
    aPopularity += a.node.favourites * 10;
    bPopularity += b.node.favourites * 10;

    return  (bPopularity * bRole) - (aPopularity * aRole);
}