

var mustache = require('mustache');
var fs = require('fs');
var path = require('path');


//------------------------------------------------------------------
//--------------------------INIT VARS--------------------------

var scriptRootDir = path.dirname(process.argv[1]);

var conf = {
	mdTemplateFN: 'pl-new-pattern-model-md.mustache',
	mustacheTemplateFN: '/pl-new-pattern-model-mustache.mustache'
};

var mdTemplateFN = scriptRootDir + '/' + conf.mdTemplateFN;

var mustacheTemplateFN = scriptRootDir + '/' + conf.mustacheTemplateFN;



//--------------------------INIT VARS--------------------------
//------------------------------------------------------------------


//--------------------------CLI ARGS--------------------------
const args = require("minimist")(process.argv.slice(2));
var debug = args.debug ? true : false;

//-------------------------------------------------------





//-----------------------------------------------------------
//@a Get the Data from Arguments

var dataObject = getArgsAsPatternObject(args);








//@a Reading and rendering pattern data

readingModelPatterns()

	.then((templatePatternModel) => {

		renderingPatternContent(templatePatternModel)

			.then((renderedContent) => {


				if (args.verbose && args.verbose > 0)
					console.log(renderedContent);

				// console.log(renderedContent.mustache);
				// console.log(renderedContent.md);
				// console.log(renderedContent.fnmustache);
				// console.log(renderedContent.fnmd);


				serializingPattern(renderedContent, templatePatternModel)
					.then((serializingPatternResult) => {

					})
					.catch((errSerializing) => {
						console.log(errSerializing);
					});




			})
			.catch((errRendering) => {
				console.log(errRendering);
			});


	})
	.catch((errReading) => {
		console.log(errReading);
	});

function serializingPattern(renderedContent, templatePatternModel) {


	return new Promise(function (resolving, rejecting) {
		if (debug) {
			console.log("Serializing:");
			console.log(renderedContent);
		}
		try {
			console.log(renderedContent);
			console.log("Serializing ");
			console.log(`Written:
				\t ${templatePatternModel.fnmustache}
				\t ${templatePatternModel.fnmd}
				
				`
			);
			fs.writeFile(templatePatternModel.fnmd, renderedContent.md, (err) => {
				if (err) rejecting(err);


				fs.writeFile(templatePatternModel.fnmustache, renderedContent.mustache, (err2) => {
					if (err2) rejecting(err2);

					if (args.quiet) {
						console.log("Serializing DONE");
						console.log(`Written:
				\t ${templatePatternModel.fnmustache}
				\t ${templatePatternModel.fnmd}
				
				`
						);
					}
				});
			});

		} catch (error) {
			var msgError = new Object();
			msgError.message = "Error rendering Mustache ";
			msgError.errordata = error;
			rejecting(msgError);
		}

	});
}

function renderingPatternContent(templatePatternModel) {

	return new Promise(function (resolving, rejecting) {
		if (debug) {
			console.log("templatePatternModel:");
			console.log(templatePatternModel);
		}
		var result = new Object();

		var mustacheRendered;
		try {
			// if (dataObject.id) {
			// 	dataObject.id = ` id\=\"${dataObject.id}\"`;
			// }
			mustacheRendered = renderMustache(templatePatternModel.model.mustache, dataObject);

			result.mustache = mustacheRendered;

		} catch (error) {
			var msgError = new Object();
			msgError.message = "Error rendering Mustache ";
			msgError.errordata = error;
			rejecting(msgError);
		}

		var mdRendered;
		try {


			mdRendered =
				renderMustache(templatePatternModel.model.md, dataObject);

			result.md = mdRendered;


		} catch (error) {
			var msgError = new Object();
			msgError.message = "Error rendering MD ";
			msgError.errordata = error;
			rejecting(msgError);
		}


		if (debug) {
			console.log("dataObject:");
			console.log(dataObject);

			console.log("templatePatternModel:");
			console.log(templatePatternModel);
		}
		resolving(result);
	});
}








function readingModelPatterns() {
	return new Promise(function (resolving, rejecting) {

		readFile(mustacheTemplateFN).then((data) => {

			readFile(mdTemplateFN).then((mdData) => {



				//-------------------
				var r = new Object();
				var model = new Object();

				model.md = mdData.result;

				model.mustache = data.result;

				if (debug) {
					console.log("-----model------");
					console.log(model);
				}

				r.model = model;


				prepFileNames(r);




				resolving(r);
				//-----------------

			}
			).catch((err) => {
				console.log(err);
				rejecting(err);
			});



		}
		).catch((err) => {
			console.log(err);
			rejecting(err);
		});

	});
}


function prepFileNames(r) {


	var prenum = "00";
	switch (dataObject.ptype) {
		case "atoms":
			prenum = "00";
			break;
		case "molecules":
			prenum = "01";
			break;
		case "organisms":
			prenum = "02";
			break;
		case "templates":
			prenum = "03";
			break;
		case "pages":
			prenum = "04";
			break;


		default:
			break;
	}

	var targetPath = "./source/_patterns/" + prenum + "-" + dataObject.ptype;

	if (debug) console.log(targetPath);

	var mdFNBase = dataObject.name + ".md";
	var mustacheFNBase = dataObject.name + ".mustache";

	var targetFileMD = targetPath + "/" + mdFNBase;
	var targetFileMustache = targetPath + "/" + mustacheFNBase;



	r.fnmd = targetFileMD;

	r.fnmustache = targetFileMustache;
	if (debug || args.debug_fn) {
		console.log("-----------OUTFILES------PATH-----");
		console.log(targetFileMD);
		console.log(targetFileMustache);
		console.log(r);
	}

	return r;
}


//var template = readFileTemplate
//`<h3 style="margin-bottom:5px;" class="c-stc-action__headline">	{{ GoalText }}</h3>`;


//var rendered = renderMustache(template, data);

//console.log(rendered);


function readFile(fn) {
	return new Promise(function (resolving, rejecting) {

		fs.readFile(fn, function (err, data) {
			if (err) {
				rejecting(err);
			}
			else {
				var r = new Object();
				r.result = data.toString();
				resolving(r);
			}
		});

	});
}




function getArgsAsPatternObject(args) {
	var r = new Object();

	r.title = args.t;
	r.description = args.d;
	r.state = args.s ? args.s : "inprogress";
	r.ptype = "atoms";

	if (args.id) r.id = args.id;

	try {

		var _name = args.n;
		r.name = _name;
		var tmp = _name.substring(0, _name.indexOf("-"));
		r.ptype = tmp;

		if (debug) console.log("PatternType: " + tmp);

	} catch (error) {

	}
	return r;

}



function getCliarg(possibleArgs) {
	possibleArgs.forEach(element => {
		//	console.log("getting: " + element);
		if (args[element]) return args[element];
	});
	return "";
}



function renderMustache(_template, _data) {
	return mustache.render(_template, _data);
}