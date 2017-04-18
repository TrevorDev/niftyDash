import Command from "nifty-cmd"
var config = {
	streamLinkPath: "C:\\Users\\trevo\\Downloads\\streamlink-portable-master\\streamlink-portable-master\\Streamlink for Windows (Compiled)\\Releases\\Streamlink.exe",
	vlcPath: "D:\\Programs\\VLC\\vlc.exe",
	browserPath: "C:\\Users\\trevo\\Downloads\\chromium_webvr_v1.1_win\\Chrome-bin\\chrome.exe --enable-webvr --enable-gamepad-extensions"
}

var streamVid = async (name)=>{
	var stream = "https://www.twitch.tv/curse"
	var quality = "best"
	var cmd = `"${config.streamLinkPath}" ${stream} ${quality} --player "${config.vlcPath} --sout=#transcode{vcodec=theo,vb=200,scale=1,width=600,acodec=vorb}:http{mux=ogg,dst=:8080/movie4.ogg} --no-sout-rtp-sap --no-sout-standard-sap --ttl=1 --sout-keep"`
	console.log(cmd)
	var command = new Command(cmd, {log: true});
	var result:any = command.run()
}

var startWebVR = async()=>{
	var site = "http://localhost:3000/niftySpace"
	var cmd = `${config.browserPath} ${site}`
	var command = new Command(cmd, {log: true});
	var result:any = command.run()
}

var startProxy = async()=>{
	// var cmd = `corsproxy`
	// var command = new Command(cmd, {log: true});
	// var result:any = command.run()
	var cors_proxy = require('cors-anywhere');
	cors_proxy.createServer({
    	originWhitelist: [], // Allow all origins 
	    requireHeader: [],
	    removeHeaders: []
	}).listen(8083, '127.0.0.1', function() {
	    console.log('Running CORS Anywhere on');
	});
}

var main = async ()=>{
	// await streamVid("test")
	await streamVid("movie")
	await startProxy();
	console.log("done")
	//await startWebVR()
}
main()