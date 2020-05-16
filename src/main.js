import Service from "./service.js"
var service = new Service();
var globals = service.globals();

import Terminator from "./terminator.js"
var terminator = new Terminator(globals);

import Judge from "./Judge.js"
var judge = new Judge(globals);

//import vogon from "./vogon.js"
//var jeltz = new vogon(lang);