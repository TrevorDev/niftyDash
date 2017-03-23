import $ = require("jquery")
import Vue = require("vue")

async function main(){
	var template = {
		posts: [],
		topMsg: "--------------------------------------------"
	}
	var contentview = new Vue({
	    el: '#app',
	    data: template
	})

	template.posts = await $.get("/api/blog/latest")
	console.log(template.posts)
	 $(".hidden").css("visibility", "inherit")
}
main()
