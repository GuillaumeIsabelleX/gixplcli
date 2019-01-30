//Mustache Rendering exp no 1

var data = { GoalText: "Mastery Node.JS" }

var template = `<h3 style="margin-bottom:5px;" class="c-stc-action__headline">	
{{ GoalText }}</h3>`;

var mustache = require('mustache');

var rendered = renderMustache(template, data);

console.log(rendered);



function renderMustache(_template, _data) {
	return mustache.render(_template, _data);
}


data = {
	"beatles": [
		{ "firstName": "John", "lastName": "Lennon" },
		{ "firstName": "Paul", "lastName": "McCartney" },
		{ "firstName": "George", "lastName": "Harrison" },
		{ "firstName": "Ringo", "lastName": "Starr" }
	],
	"name": function () {
		return this.firstName + " " + this.lastName;
	}
}

template = `<ul>{{#beatles}}
<li> {{name}} </li>
{{/beatles}}</ul>`;

rendered = renderMustache(template, data);

console.log(rendered);
