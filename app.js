
var Command = function(isInput, path, commandVal, writtenCallback, readkeyCallback) {
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
                            writtenCallback();
                        }

                    }, (i * 100))
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
    self.readKeyCallback = readkeyCallback;
}


var CommandExecutionArgs = function(command, vm) {
    var self = this;
    self.output = "";
    //todo: actually do something with this output
    //self.output = command.value() + " " + command.value();


    vm.inputPath(command.value());

    self.output = "Hi " + command.value();
}



ko.bindingHandlers.cmdInput = {
    init: function(element, valueAccessor) {
        var obj = valueAccessor();
        var value = obj.value;
        var text = obj.text;
        var pos = obj.pos;
        var onEnter = obj.onEnter;
        
        //when input changes, update the binding
        $(element).on('input propertychange paste onchange', function() {
            var str = $(this).val();
            console.warn(str);
            value(str);
        })

        //set the initial cursor to the length of the text
        pos(text().length);

            var moveCursor = function(isBack, text, pos, num) {
            //apply the update
            if(isBack) {

                //prevent index overflow backwards
                if((pos() - num) < 0) {
                    return;
                }

                pos(pos() - num);

            } else {
                //is forwards

                //prevent index overflow forwards
                if((pos() + num) > text().length) {
                    return;
                }
                pos(pos() + num);
            }

            console.log('postion updated:' + pos());
        }

        //when key is pressed in input field
        $(element).on('keydown', function(e) {
            console.log('key pressed:' + e.keyCode);
            switch(e.keyCode) {

                case 37: // left
                moveCursor(true, text, pos, 1);
                break;

                case 39: // right
                moveCursor(false, text, pos, 1);
                break;

                case 13: // enter
                onEnter();
                e.preventDefault();
                break;

                case 46: // delete key
                e.preventDefault();
                break;

                // case 38: // up
                // break;

                // case 40: // down
                // break;

                default: return; // exit this handler for other keys
            }
        })
    },
    update: function(element, valueAccessor) {
        
        var obj = valueAccessor();
        var value = obj.value;
        var text = obj.text;
        var pos = obj.pos;
        var elemValue = $(element).val();
        
        if(value() != elemValue) {
            $(element).val(value()); 
        }
    }
}

ko.bindingHandlers.cursor = {
    update: function(element, valueAccessor) {
        
        var obj = ko.unwrap(valueAccessor());
        var pos = ko.unwrap(obj.pos);
        var charIndex = ko.unwrap(obj.index);
        var isActiveInput = ko.unwrap(obj.isActiveInput);
        
        
        if(isActiveInput) {

            if(pos == charIndex + 1) {
                $(element).addClass('cmd-cursor');
            } else {
                $(element).removeClass('cmd-cursor');
            }

        } else {
            $(element).removeClass('cmd-cursor');
        }

    }
}



var viewModel = function() {

    var self = this;
    self.liveMode = ko.observable(true);
    self.commands = ko.observableArray([]);
    self.inputPath = ko.observable("input");
    self.outputPath = ko.observable("output");
    self.newOutput = function(commandStr, writtenCallback, readKeyCallback) {
        var command = new Command(false, self.outputPath(), commandStr, writtenCallback, readKeyCallback);
        self.commands.push(command);
    }
    self.newInput = function(inputStr, readkeyCallback) {
        var command = new Command(true, self.inputPath(), inputStr, null, readkeyCallback);
        self.commands.push(command);
    }
    self.processInput = function() {
        var commands = self.commands();

        var currentCommand = self.getActiveCmdInput(commands);
        
        var commandExecArgs = new CommandExecutionArgs(currentCommand, self);

        //turn off any pending input
        for (var i in commands) {
            if(commands[i].isActiveInput() == true) {
                self.commands()[i].isActiveInput(false);
            }
        }

        //run command
        self.runCommand(commandExecArgs, function(outputStr) {
            self.newOutput(outputStr, function() {
                self.newInput("");
            });
            
        })

    }
    self.runCommand = function(commandExecArgs, callback) {

        if(commandExecArgs)

        if(callback && $.isFunction(callback)) {
            callback(commandExecArgs.output);
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
                var isLiveMode = ko.unwrap(self.isLiveMode);
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
        self.newOutput("Hello, and welcome. What is your name?", function() {
            self.newInput("");
        })
    }
    self.init = function() {
        self.welcome();
        
    }

    

    
}


var vm = new viewModel();

vm.init();

ko.applyBindings(vm);


