var helpContent = `

	-------------GIX PL CLI HELP -----------
	--n\t\tName of element
	--d\t\tDescription
	--t\t\tTitle of 
	[--id]\tid\t Identify the wrapper by an id
	[--state]\t\tInitial state (default inprogress)
	[--innerhtml]\t"htmlcode"\t
	FLAGS
	
	--scss
	


`;

var mustache = require('mustache');
var fs = require('fs');
var path = require('path');
var decode = require('unescape');


var scriptRootDir = path.dirname(process.argv[1]);
var packConf = require(scriptRootDir + "/package.json");

const plConfPath = path.join(process.cwd(), "patternlab-config.json");



if (debug) console.log(plConfPath);


if (!fs.existsSync(plConfPath)) {
	// Do something
	throw "patternlab-config.json NOT FOUND must exist from the root of your Pattern lab";
}
const plconf = require(plConfPath);

var pattern_root_dir = plconf.paths.source.patterns;


if (debug) console.log("pattern_root_dir:" + pattern_root_dir);
//--------------------------CLI ARGS--------------------------

const args = require("minimist")(process.argv.slice(2));



//------------------------------------------------------------------
//--------------------------INIT VARS--------------------------


var templateRootDir = path.join(scriptRootDir, "templatemodel");

//-----------------------------------------
var { modelname, title } = packConf.gixplcli.models.default;

var { placeholders } = packConf.gixplcli.models.default;


var mdTemplateFN
	= path.join(templateRootDir, modelname + "-md.mustache");


var mustacheTemplateFN
	= path.join(templateRootDir, modelname + "-mustache.mustache");



//--------------------------INIT VARS--------------------------
//------------------------------------------------------------------


if (process.argv.length < 3) {
	//help
	showHelp();
} else {
	var debug = args.debug ? true : false;

	//-------------------------------------------------------





	//-----------------------------------------------------------
	//@a Get the Data from Arguments

	var dataObject = parseCommandLineArguments(args);








	//@a Reading and rendering pattern data

	readingModelPatterns()

		.then((templatePatternModel) => {

			renderRequiredContent(dataObject);
			function renderRequiredContent(dataObject) {
				var innerhtmlRendered =

					renderMustache(dataObject.innerhtml, dataObject)
					;
				if (debug)
					console.log(`
				//@resolved The innerHTML default or specified by --html is rendered and put back to the innerhtml so it is rendered in the default template
				
				//@q Is this above rendered code of the default placeholder??
				${innerhtmlRendered}`);
			}

			renderingPatternContent(templatePatternModel)

				.then((renderedContent) => {


					if (args.verbose && args.verbose > 0) {
						console.log(renderedContent);
					}

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
}
function serializingPattern(renderedContent, templatePatternModel) {


	return new Promise(function (resolving, rejecting) {

		if (debug) {
			console.log("Serializing:");
			console.log(renderedContent);
		}

		try {



			if (!args.quiet) {
				console.log("Serializing ");
				console.log(`Written:
				\t ${templatePatternModel.fnmustache}
				\t ${templatePatternModel.fnmd}	`
				);
			}
			fs.writeFile(templatePatternModel.fnmd, renderedContent.md, (err) => {
				if (err)//@rejected ERRORWritting
					rejecting(err);


				fs.writeFile(templatePatternModel.fnmustache, renderedContent.mustache, (err2) => {
					if (err2)//@rejected ERRORWritting
						rejecting(err2);

					if (!args.quiet) {
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
			//@rejected Some Error...
			rejecting(msgError);
		}

	});
}

/** Pattern Content Rendering 
 * 
 * @param {*} templatePatternModel  result from previous step
 */
function renderingPatternContent(templatePatternModel) {

	return new Promise(function (resolving, rejecting) {
		if (debug) {
			console.log("templatePatternModel:");
			console.log(templatePatternModel);
		}


		//@result is an object we can save and contain the source and the rendered content
		var result = new Object();

		var mustacheRendered;
		try {
			// if (dataObject.id) {
			// 	dataObject.id = ` id\=\"${dataObject.id}\"`;
			// }
			mustacheRendered = renderMustache(templatePatternModel.model.mustache, dataObject);

			result.mustache =
				decoder(//@v Make sure we rendered HTML as code in the Mustache HTML
					mustacheRendered);


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


/**
 * @result You got an object with the names you want in the next steps
 * 
 * @param {*} r  Your object containing the model data
 */
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

	var targetPath = path.join(plconf.paths.source.patterns, prenum + "-" + dataObject.ptype);

	if (debug) console.log(targetPath);

	var mdFNBase = dataObject.name + ".md";
	var mustacheFNBase = dataObject.name + ".mustache";

	var targetFileMD = path.join(targetPath, mdFNBase);
	var targetFileMustache = path.join(targetPath, mustacheFNBase);



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
			if (err) { //@rejected File Reading
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



/**
 * Parses the command line arguments
 * 
 * @param {*} args 
 */
function parseCommandLineArguments(args) {
	var r = new Object();


	var nameParamInfo = "--name or --n parsing failed - Make use you use like : --name atoms-mytext and not just your pattern name ";
	try {

		var _name = args.n ? args.n : args.name ? args.name : "";

		var indexD = _name.indexOf("-");

		if (debug) console.log(_name + indexD);

		//@validating ... atoms-, molecules- in name...
		if (indexD == -1)
			throw nameParamInfo;

		r.name = _name;
		var tmp = _name.substring(0, indexD);


	} catch (err) {
		throw nameParamInfo;
	}







	r.title = args.t;
	r.description = args.d;
	r.innerhtml = args.innerhtml ? args.innerhtml : placeholders.innerhtml; //@s We will replace the inner html  Place holder or the default that is in the package.json

	//state
	r.state = args.s ? args.s : packConf.gixplcli.default.state;
	if (r.state == packConf.gixplcli.default.state)
		r.state = args.state ? args.state : packConf.gixplcli.default.state;
	if (r.state == true) r.state = packConf.gixplcli.default.state;

	r.ptype = "atoms";

	r.cr =
		packConf.gixplcli.stc.deko.cr.prefix +
		(args.cr ? args.cr : "_CR_");
	r.goal =
		packConf.gixplcli.stc.deko.goal.prefix + (
			args.goal ? args.goal : args.v ? args.v : packConf.gixplcli.stc.deko.goal.defaultvalue);

	r.model = args.model ? args.model : packConf.gixplcli.models.default.modelname;

	if (args.actions) {
		//@v parse actions to create one line per using delimiter ; or \n
		var actionsText = args.actions;
		var delimiter = ";";
		if (actionsText.indexOf("\n") > -1) //@resolving To use ENTER as delimiter as probably there were enter with quotes used in the CLI
			delimiter = "\n"; //@s We have our delimiter set
		//@a multi parse action if multiple
		if (actionsText.indexOf(delimiter) > -1)//@q Is there many action?
		{//@s Yes
			var actionResults = "";
			actionsText.split(delimiter).forEach(action => {
				actionResults += packConf.gixplcli.stc.deko.a.prefix + action + "\n";
			});

			r.actions = actionResults;//@resolving a group of item for displaying
		} else //@s no

			r.actions = packConf.gixplcli.default.mdlineitem + actionsText + "\n"; //@resolving to one line action
		if (args.action) {
			if (args.actions)
				console.log("INGORING --actions and using --action");
			else r.actions = packConf.gixplcli.default.mdlineitem + args.action + "\n";

		}

	}

	if (args.id) r.id = args.id;

	try {

		// var _name = args.n ? args.n : args.name;


		// r.name = _name;
		// var tmp = _name.substring(0, _name.indexOf("-"));



		r.ptype = tmp;

		if (debug) console.log("PatternType: " + tmp);

	} catch (error) {

	}



	if (args.nostc) r.goal = "";//@result No Goal passed
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




function showCommandLineExample() {
	var example = `
gixplcli	 -n organisms-chart -t "Chart" -d
"A Chart organism dislplay a section of the whole hierarchy" --s
  --actions "My first action
Another action
and more
and even more"  --goal "Test the CLI" --cr "Getting to the accep
table points"
	`;

	console.log(example);
}



function showHelp() {
	console.log(`
	${helpContent}
	-------EXAMPLE--------
	`);
	showCommandLineExample();
}






String.prototype.replaceAll = function (searchUnEspaced, replacement) {
	var target = this;
	var search = escapeRegExp(searchUnEspaced);
	return target.replace(new RegExp(search, "g"), replacement);
};


function decoder(str) {
	var r = str;
	r = decode(str);

	return r
		.replaceAll("&#x2F;", "/")
		.replaceAll("&#x3D;", "=")
		;//@resolving issue with / not being decoded
}



/**
 * 
 * @param {*} string 
 */
function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}