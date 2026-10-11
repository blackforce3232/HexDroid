/*
  OzelNickler
  true: Tum kullanicilarin aktif penceresinde giris uyarı cikartir.
  false: sadece nick rengi ve ozelde belirtilen yazi yazar.
*/

var appTitle = "Geveze.ORG Web IRC",
	nickServ = ["NickServ!services@geveze.org", "ChanServ!services@geveze.org"],
	davetOtogir = true,
	networkName = "Geveze.ORG",
	userJoinedGoster = false,
	userPartGoster = false,
	userKickedGoster = false,
	channelModeGoster = false,
	userQuitGoster = false,
	nickChangedGoster = false,
	zamanGoster = true,
	renkliNickler = true,
	IconGoster = true,
	userSayiGoster = true,
	userListAltaEkle = true,
	mircURL = "#",
	kayitliNickRegex = "^Bu kayitli ve sifre korumali bir nick.+",
	sifreKabulRegex = "^Sifre kabul edildi.$",
	playGoogle = false,
	googlePlay = null,
	RadyoDefaultSes = 100,
	RadyoURL = new Array(
	{"http:": "http://radyo.geveze.org:7009/;", "https:": "https://radyo.geveze.org:7009/;"},
	{"http:": "http://radyo.geveze.org:7076/;", "https:": "https://radyo.geveze.org:7076/;"},
	{"http:": "http://radyo.geveze.org:9306/;", "https:": "https://radyo.geveze.org:9306/;"},
	{"http:": "http://radyo.geveze.org:9300/;", "https:": "https://radyo.geveze.org:9300/;"},
	{"http:": "http://radyo.geveze.org:9300/;", "https:": "https://radyo.geveze.org:9300/;"}
),
	OzelNickler = {
"Queen": ["#f600fb", "Üst Yönetim Görevlisi", false],
"Menthe": ["#582c59", "Genel Sorumlu Yardimcisi", false],
"Cazibe": ["#6b3399", "Özel Kullanicisi", false],
"Perla": ["#ffa2f1", "Sales Sorumlusu", false],
"Sinsirella": ["#ce507c", "Sales Sorumlu Yardimcisi", false],
"Belinay": ["#ff6a00", "Özel Kullanicisi", false],
"Ahseen": ["#ff75b2", "Sales Sorumlu Yardimcisi", false],
"Esro": ["#aa95e4", "Özel Kullanicisi", false],
"Phantom": ["#ea0606", "Genel Sorumlusu", false],
"Freja": ["#b18cfe", "Genel Sorumlu Yardimcisi", false],
"Atlas": ["#151414", "Genel Sorumlu Yardimcisi", false],
"minnie": ["#ffb7ff", "Root Admini", false],
"aSi_deLikanLı": ["#000000", "Root Admini", false],
"ByFrekanS": ["#000000", "Root Admini", false],
"ByChat": ["#38571a", "Üst Yönetim Görevlisi", false],
"ReaL": ["#01c7fc", "Root Admini", false],
"Duygusuz_Hatun": ["#ff0ed6", "Özel Kullanicisi", false],
"Master": ["#000000", "Sunucu Sahibi", true],
"Eternity": ["#000000", "Sunucu Sahibi", true]
};


window.Cwxkomutnicks = [
["Menthe"],
["Sinsirella"],
["Perla"],
["Atlas"],
["Phantom"],
["bunusilmex"]
];
