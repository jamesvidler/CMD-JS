
var Command = function(isInput, path, commandVal, writtenCallback, onReadCallback) {
    var self = this;

    if(!commandVal) {
        commandVal = "";
    }

    self.isInput = ko.observable(isInput);
    self.isActiveInput = ko.observable(isInput);
    self.inputHasFocus = ko.observable(true);
    self.value = ko.observable(commandVal);
    self.tempValue = ko.observable(self.value());
    self.htmlValue = ko.pureComputed({
        read: function() {
            
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

            //this input, write out the array asap
            if(self.isInput()) {
                //write out the new chars
                for(var i in cleanValue) {
                    charArray.push({ char: cleanValue[i] });
                }

                 self.charAryValue(charArray);

            } else {
                //this is output, type it out
                var loadChar = function(i, str, length) {
                    setTimeout(function() {
                        str = str.replace(/ /g, '\u00a0');
                        self.charAryValue.push({char: str});

                        if(self.charAryValue().length == length) {
                            if(writtenCallback && $.isFunction(writtenCallback)) {
                                writtenCallback();
                            }                            
                        }

                    }, (i * 10))
                }

                for(var i in cleanValue) {
                    loadChar(i, cleanValue[i], cleanValue.length);
                }
            }

            self.tempValue(value);

            return cleanValue;
        },
        owner: this
    });
    self.charAryValue = ko.observableArray([]);
    self.cursorPosition = ko.observable(0);
    self.path = path;
    self.vis = {
        showCursorAtZeroLength: ko.pureComputed({
            read: function() {
                var cursorPosition = ko.unwrap(self.cursorPosition);
                var isActiveInput = ko.unwrap(self.isActiveInput);
                
                return cursorPosition == 0 && isActiveInput;
            },
            owner: this
        })
    }
    self.onReadCallback = onReadCallback;
}






var CommandJS = function(config) {

    var self = this;
    self.liveMode = ko.observable(false);
    self.commands = ko.observableArray([]);
    self.inputPath = ko.observable("input");
    self.outputPath = ko.observable("output");
    self.programs = [
        {
            name: "ProgramNotFound",
            onExecute: function(thisCommand) {
                self.newOutput("Your command did not match a program. Try again.", function() {
                    self.newInput("");
                });
            }
        }
    ]
    self.executeProgramByName = function(programName) {
        var program = self.lookupProgram(programName);

        if(program && program.onExecute && $.isFunction(program.onExecute)) {
            program.onExecute(self);
        }
    }
    self.newOutput = function(commandStr, writtenCallback) {

        if(!writtenCallback) {
            var writtenCallback = function() {
                self.newInput("");
            }
        }

        var command = new Command(false, self.outputPath(), commandStr, writtenCallback);
        self.commands.push(command);
    }
    self.newInput = function(inputStr, onReadCallback) {
        var command = new Command(true, self.inputPath(), inputStr, null, onReadCallback);
        self.commands.push(command);
    }
    self.processInput = function() {
        var commands = self.commands();

        var currentCommand = self.getActiveCmdInput(commands);
        

        //turn off any pending input
        for (var i in commands) {
            if(commands[i].isActiveInput() == true) {
                self.commands()[i].isActiveInput(false);
            }
        }
        
        if(currentCommand.onReadCallback && $.isFunction(currentCommand.onReadCallback)) {
            //instead of treating value like a command, kick back the input string
            currentCommand.onReadCallback(currentCommand.value());

        } else {
            var program = self.lookupProgram(currentCommand.value());

            if(program) {
                self.executeProgram(program, currentCommand);
            } else {
                //program not found
                self.executeProgramByName("ProgramNotFound");
            }
        }

        

    }

    self.lookupProgram = function(inputStr) {
        
        for(var i in self.programs) {
            var p = self.programs[i];
            if(p.name == inputStr) {
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
            if(commands[i].isActiveInput() == true) {
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

                return !isLiveMode && hasCurrentInput != null;
            },
            owner: this
        })
    }
    self.click = {
        keepCmdFocus: function() {
            var commands = self.commands();
            for(var i in commands) {
                if(commands[i].isActiveInput() == true) {
                    self.commands()[i].inputHasFocus(true);
                    return;
                }
            }
        }
    }
    self.welcome = function() {
        self.outputPath('website')
        self.inputPath('you');
        self.newInput("");
    }
    self.init = function() {

        self.programs = $.merge(self.programs, config.programs);
        self.welcome();

    }

    ko.applyBindings(self);
    
    self.init();
}