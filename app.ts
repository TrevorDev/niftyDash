require("babel/polyfill")

import appFactory from "./libs/appFactory";

let app = appFactory.createApp();

app.get('/',async function(req, res) {
	res.render('index')
});

app.listen(3000, function(){
    console.log("Server running");
});
