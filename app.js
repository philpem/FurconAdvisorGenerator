function imageGenerator() {

// https://stackoverflow.com/questions/18862256/how-to-detect-emoji-using-javascript
function isEmoji(str) {
    return /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/ug.test(str)
}


var canvas = document.querySelector('canvas')
var context = canvas.getContext('2d')
var baseImage = null
var fontImage = null
var fontInfo = null
var overlayNames = null
var selectedGenerator = 'furcon'
if(window.location.hash.length > 0){
	selectedGenerator = window.location.hash.substr(1)
}

var generators={
/*
	'keen4':{
		'title': 'Commander Keen 4',
		'source':'id Software',
		'sourceurl':'https://en.wikipedia.org/wiki/Id_Software',
		'defaulttext':'\nKeen enters the\n     Shadowlands',
	},
	'pq2':{
		'title': 'Police Quest 2 Death',
		'source':'Sierra Online',
		'sourceurl':'https://en.wikipedia.org/wiki/Sierra_Entertainment',
		'defaulttext':'Thank you for playing Police\nQuest 2. Next time, be a little more\ncareful.',
	},
	'pq3':{
		'title': 'Police Quest 3 Death',
		'source':'Sierra Online',
		'sourceurl':'https://en.wikipedia.org/wiki/Sierra_Entertainment',
		'defaulttext':"Those curbs just sneak right\n    up on you, don't they?",
	},
*/
	'sc2k':{
		'title': 'SimCity 2000 Advisor',
		'source':'Maxis Software',
		'sourceurl':'https://en.wikipedia.org/wiki/Maxis',
		'defaulttext':"YOU CAN'T CUT BACK ON\nFUNDING! YOU WILL\nREGRET THIS!",
	},
	'furcon':{
		'title': 'Furry Con Advisors',
		'source': 'Maxis Software and... the Furry Fandom.',
		'sourceurl':'https://en.wikipedia.org/wiki/Furry_fandom',
		'defaulttext':"YOU CAN'T SKIP\nANTHROCON!\nYOU WILL REGRET THIS!",
	}
}

for(key in generators) {
	if(generators.hasOwnProperty(key)) {
		$('#genlist').append($('<button class="generator-switcher"/>').text(generators[key].title).data('generator',key).click(function (){
			selectedGenerator=$(this).data('generator')
			selectGenerator()
		}))
	}
}

function isAnyDefaultText(text){
	for(key in generators) {
		if(generators.hasOwnProperty(key)) {
			if(generators[key].defaulttext == text){
				return true
			}
		}
	}
	return false
}

function selectGenerator(){
	var gen=generators[selectedGenerator]
	window.location.hash=selectedGenerator
	$('button.generator-switcher').each(function(){
		$(this).prop('disabled',$(this).data('generator')==selectedGenerator)
	})

	$('.change-title').text(gen.title + " Generator");
	$('.change-source').attr('href',gen.sourceurl).text(gen.source)
	var sourcetext = $('#sourcetext');
	if(sourcetext.text().length==0 || isAnyDefaultText(sourcetext.text())){
		$('#sourcetext').text(gen.defaulttext)
	}
	fontInfo=null // Prevent flash of gibberish when switching images
	loadJSONForGenerator()
	$('.source').remove();
	baseImage = $('<img id="template" class="source" />').attr('src',selectedGenerator + '-blank.png').appendTo('body')[0]
	fontImage = $('<img id="font" class="source" />').attr('src',selectedGenerator + '-font.png').appendTo('body')[0]
	$('.source').waitForImages(true).done(function(){
		baseImage=$('img#template')[0]
		//fontImage=$('img#font')[0]
		renderText()
	});

}



function renderText(){
	var buffer = 10
	var browserScale = $(window).width() / (baseImage.width + buffer)
	var scale = Math.min(browserScale, 2)

	context.canvas.width = baseImage.width * scale
	context.canvas.height = baseImage.height * scale
	context.imageSmoothingEnabled = false

	if(fontInfo == null){
		return
	}
	var origin=fontInfo.origin
	var bx=fontInfo.box.x,by=fontInfo.box.y
	var text = document.querySelector("textarea#sourcetext").value.split('\n')
	// Clear before drawing, as transparents might get overdrawn
	context.clearRect(0, 0, canvas.width, canvas.height)
	context.drawImage(baseImage, 0, 0, baseImage.width*scale, baseImage.height*scale)
    var y=origin.y
    text.forEach(line => {
        const characters = [...line]
        var x=origin.x
        characters.forEach(character => {
            const codePoint = character.codePointAt(0);
            var info
            if(isEmoji(character)) {
                info = fontInfo["emoji"];
            } else {
                info=fontInfo[codePoint];
            }
			if(info==null){
				info=fontInfo[fontInfo["null-character"]]
			}
			bx=info.w
            by=info.h
            if(isEmoji(character)) {
                context.font = info.font;
                context.fillText(character,(x-5)*scale,(y+10)*scale);
            } else {
                context.drawImage(fontImage,info.x,0,bx,by,x*scale,y*scale,bx*scale,by*scale)
            }
			
			x+=info.w
        })
		y+=fontInfo.height
    })
	
	if ('overlays' in fontInfo) {
		for(var i=0;i<overlayNames.length;i++){
			var oname=overlayNames[i]
			var currentOverlay=fontInfo.overlays[oname]
			var x=currentOverlay.x
			var y=currentOverlay.y
			var adv=currentOverlay.options
			adv=adv[$('#overlay-'+oname+' option:selected').text()]
			context.drawImage(fontImage,adv.x,adv.y,adv.w,adv.h,x*scale,y*scale,adv.w*scale,adv.h*scale)
		}
	}
}

function resetOverlays(){
	overlayNames = []
	$('.overlays p').remove()
	if('overlays' in fontInfo){
		var overlays = fontInfo.overlays
		for(key in overlays) {
			if(overlays.hasOwnProperty(key)) {
				overlayNames.push(key)
				var overlay = overlays[key]
				var pwrapper=$("<p>").text(overlay.title+': ')
				var select = $('<select class="overlay-selector">').attr('id','overlay-'+key)
				for(opt in overlay.options){
					if(overlay.options.hasOwnProperty(opt)){
						$('<option>').text(opt).prop('selected',opt==overlay['default']).appendTo(select)
					}
				}
				select.appendTo(pwrapper)
				pwrapper.appendTo($('.overlays'))
			}
		}
	}
	$('.overlays select').change(renderText)
}

function loadJSONForGenerator(){
	$.getJSON(selectedGenerator+".json",function(data){
		fontInfo = data
		resetOverlays()
		renderText()
	})
}
selectGenerator()

document.getElementById("sourcetext").addEventListener("input",renderText)
$(window).resize(function () { renderText() });

}

document.addEventListener("DOMContentLoaded",imageGenerator)
