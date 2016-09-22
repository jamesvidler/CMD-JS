
var cmdConfig = {
    name: "Sample CMD",
    programs: [
        {
            name: "NameInput",
            onExecute: function(cmdJS, thisCommand) {
                cmdJS.newOutput("What is your name?", function() {
                    cmdJS.newInput("", function(readStr) {
                        cmdJS.inputPath(readStr);
                        cmdJS.newOutput("Nice to meet you " + readStr);
                    })
                })
            } 
        }
    ]
}

var cmdJS = new CommandJS(cmdConfig);




