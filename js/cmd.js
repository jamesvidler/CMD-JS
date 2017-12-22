
var Command = function(cmdJS, isInput, path, commandVal, writtenCallback, onReadCallback) {
    var self = this;

    if(!commandVal) {
        commandVal = "";
    }

    self.isInput = ko.observable(isInput);
    self.isActiveCommand = ko.observable(true);
    self.inputHasFocus = ko.observable(true);
    self.value = ko.observable(commandVal);
    self.tempValue = ko.observable(self.value());
    
    self.charAryValue = ko.observableArray([]);
    self.cursorPosition = ko.observable(0);
    self.isLoading = ko.pureComputed({
        read: function() {
            
            var value = ko.unwrap(self.value);
            var arr = ko.unwrap(self.charAryValue);
            var isActive = ko.unwrap(self.isActiveCommand);
            var isInput = ko.unwrap(self.isInput);

            if(value.indexOf("...") > -1 && isActive && !isInput) {
                console.log('is loading...');
                return true;
            }

            return false;
        },
        owner: this
        
    })
    self.path = path;
    self.vis = {
        showCursorAtZeroLength: ko.pureComputed({
            read: function() {
                var cursorPosition = ko.unwrap(self.cursorPosition);
                var isActiveCommand = ko.unwrap(self.isActiveCommand);
                
                return cursorPosition == 0 && isActiveCommand;
            },
            owner: this
        })
    }
    self.htmlValue = ko.computed(function() {
            
            var value = ko.unwrap(self.value);
            var cleanValue = value.replace(/ /g, '\u00a0');

            if (cleanValue == "") {
                self.cursorPosition(0);
            } else if(self.tempValue().length > value.length) {
                //if we've deleted something...
                self.cursorPosition(self.cursorPosition() - 1);
            } else {
                //we've added
                if(self.tempValue().length < value.length) {
                    self.cursorPosition(self.cursorPosition() + 1);
                }
            }
            
            var charArray = [];

            //this is input, write out the array asap
            if(self.isInput()) {

                //write out the new chars
                for(var i in cleanValue) {
                    charArray.push({ char: cleanValue[i], type: 'char' });
                }

                 self.charAryValue(charArray);

            } else {
                
                responsiveVoice.speak(cleanValue);
                
                //this is output, type it out


                var loadChar = function(i, str, length) {
                    setTimeout(function() {
                        var type = 'char';
                        str = str.replace(/ /g, '\u00a0');

                        if(str.indexOf('|') > -1) {
                            type = 'break'; 
                        }
                        
                        
                        self.charAryValue.push({char: str, type: type});

                        if(self.charAryValue().length == length) {
                            if(writtenCallback && $.isFunction(writtenCallback)) {
                                writtenCallback();
                            }                            
                        }

                    }, (i * cmdJS.outputSpeed()))
                }

                for(var i in cleanValue) {
                    loadChar(i, cleanValue[i], cleanValue.length);
                }
            }

            self.tempValue(value);

            return cleanValue;
    });
    self.onReadCallback = onReadCallback;
}






var CommandJS = function(config) {

    var self = this;
    self.liveMode = ko.observable(config.liveMode);
    self.commands = ko.observableArray([]);
    self.outputSpeed = ko.observable(config.outputSpeed);
    self.inputPath = ko.observable("input");
    self.outputPath = ko.observable("output");
    self.programs = [
        {
            name: "ProgramNotFound",
            hide: true,
            onExecute: function(thisCommand, args) {
                self.newOutput("'" + args + "' Your command did not match a program. Try again.", function() {
                    self.newInput("");
                });
            }
        },
        {
            name: "Help",
            onExecute: function(thisCommand, args) {
                var programs = self.programs;
                var output = "Available commands are listed below:";
                for(var i in programs) {
                    if(!programs[i].hide) {
                        output += "|" + programs[i].name;
                    }
                }
                self.newOutput(output);
            }
        }
    ]
    self.executeProgramByName = function(programName, args) {
        var program = self.lookupProgram(programName);

        if(program && program.onExecute && $.isFunction(program.onExecute)) {
            program.onExecute(self, args);
        }
    }
    self.executeGuide = function() {
        var guide = config.programs[1].guide;

        var addOutput = function (i) {
            
            
            var t = i + 1;

            if(t < guide.length) {
                //we have a next step
                self.newOutput(guide[i].value, function() {
                    setTimeout(function() {
                        addOutput(i)
                    }, guide[i - 1].wait)
                    
                })
                
            } else {
                self.newOutput(guide[i].value, function() {
                    self.newInput("");
                });
            }

            i++;
        }


            

        if(guide[0].type == 'output') {
            addOutput(0);
        } 
                 
        
    }
    self.newOutput = function(commandStr, writtenCallback) {
        self.disableCommands(self.commands());

        if(!writtenCallback) {
            var writtenCallback = function() {
                self.newInput("");
            }
        }

        var command = new Command(self, false, self.outputPath(), commandStr, writtenCallback);
        self.commands.push(command);
    }
    self.newInput = function(inputStr, onReadCallback) {
        self.disableCommands(self.commands());

        var command = new Command(self, true, self.inputPath(), inputStr, null, onReadCallback);
        self.commands.push(command);
    }
    self.disableCommands = function(commands) {
        //turn off any pending input
        for (var i in commands) {
            if(commands[i].isActiveCommand() == true) {
                self.commands()[i].isActiveCommand(false);
            }
        }
    }
    self.processInput = function() {
        var commands = self.commands();

        var currentCommand = self.getActiveCmdInput(commands);
        
        //disable cursor on other fields
        self.disableCommands(commands);
        
        if(currentCommand.onReadCallback && $.isFunction(currentCommand.onReadCallback)) {
            //instead of treating value like a command, kick back the input string
            currentCommand.onReadCallback(currentCommand.value());

        } else {
            var program = self.lookupProgram(currentCommand.value());

            if(program) {
                self.executeProgram(program, currentCommand);
            } else {
                //program not found
                self.executeProgramByName("ProgramNotFound", currentCommand.value());
            }
        }

        

    }


    self.lookupProgram = function(inputStr) {
        
        for(var i in self.programs) {
            var p = self.programs[i];
            if(p.name.toLowerCase() == inputStr.toLowerCase()) {
                return p;
            }
        }
    }
    self.executeProgram = function(program, command) {

        if(program.onExecute && $.isFunction(program.onExecute)) {
            program.onExecute(self, command);
        }
    }
    self.getActiveCmdInput = function(commands) {
        for(var i in commands) {
            if(commands[i].isActiveCommand() == true && commands[i].isInput()) {
                return commands[i];
            }
        }
        return null;
    }
    self.currentInputCommand = ko.pureComputed({
        read: function() {
            var commands = ko.unwrap(self.commands);
            return self.getActiveCmdInput(commands);
        },
        owner: this
    })
    self._if = {
        showDebugger: ko.pureComputed({
            read: function() {
                var isLiveMode = ko.unwrap(self.liveMode);
                var hasCurrentInput = ko.unwrap(self.currentInputCommand);

                return (!isLiveMode && hasCurrentInput != null);
            },
            owner: this
        })
    }
    self.click = {
        keepCmdFocus: function() {
            var commands = self.commands();
            for(var i in commands) {
                if(commands[i].isActiveCommand() == true) {
                    self.commands()[i].inputHasFocus(true);
                    return;
                }
            }
        }
    }
    self.init = function() {

        self.programs = $.merge(self.programs, config.programs);

        if(config.onStart && $.isFunction(config.onStart)) {
            config.onStart(self);
        }

    }

    ko.applyBindings(self);
    
    self.init();
}