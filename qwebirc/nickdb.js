// nickdb.js
var bfNickList = function(nick) {
    var cleanNick = nick.replace(/^[@+%&~]/, '');
    var nickStyles = {
        "Ahseen": 132,
        "Sinsirella": 203,
        "perizkizii": 163,
        "Freja": 166,
        "Perla": 131,
        "W9": 13,
        "ByChat": 136,
        "h2o": 47,
        "PARLIEMENT": 38,
        "Ya-Patince": 10,
        "BlackForce": 70,
        "Duygusuz_hatun": 136,
        "Wolf": 48,
        "SaLdıRay": 54,
        "Ghost": 16,
        "Rüyaa": 38,
        "dfdf": 119
    };
    if (window.renkliNickler && window.renkliNickler[cleanNick]) {
        return null;
    }
    return nickStyles[cleanNick] || null;
};
window.bfNickList = bfNickList;
