
var cmdConfig = {
    name: "Sample CMD",
    liveMode: true,
    outputSpeed : 30,
    onStart: function(cmdJS) {

        // setTimeout(function() {
        //     cmdJS.newOutput("Initializing program 'X'...", function() {
        //     setTimeout(function() {
        //         cmdJS.newInput("")
        //     }, 2000)
        // });
        // }, 1000)
        //cmdJS.executeProgramByName("Initialize");
        cmdJS.executeProgramByName("NameInput");
        
    },
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
        },
        {
            name: "Initialize",
            guide: [
                {
                    value: 'Initializing program...',
                    type: 'output',
                    wait: 1300
                },
                {
                    value: 'Connecting to database...',
                    type: 'output',
                    wait: 2300
                },
                {
                    value: 'Buildling indexes...',
                    type: 'output',
                    wait: 3300
                },
                {
                    value: 'Architecting solutions...',
                    type: 'output',
                    wait: 300
                },
                {
                    value: 'Balancing life...',
                    type: 'output',
                    wait: 300
                },
                {
                    value: 'Going for a run...',
                    type: 'output',
                    wait: 300
                },
                {
                    value: 'Building mobile first UI...',
                    type: 'output',
                    wait: 300
                },
                {
                    value: 'Getting lost in VR...',
                    type: 'output',
                    wait: 300
                },
                {
                    value: 'Finding myself in VR...',
                    type: 'output',
                    wait: 300
                },
                {
                    value: 'Embracing open source community...',
                    type: 'output',
                    wait: 1300
                },
                {
                    value: 'Taking 5 days off...',
                    type: 'output',
                    wait: 300
                },
                {
                    value: 'hiking...',
                    type: 'output',
                    wait: 300
                },
                {
                    value: 'still hiking...',
                    type: 'output',
                    wait: 300
                },
                {
                    value: 'Refreshing perspective...',
                    type: 'output',
                    wait: 3300
                },
                {
                    value: 'Refreshed...',
                    type: 'output',
                    wait: 300
                },
                {
                    value: 'Asking why?...',
                    type: 'output',
                    wait: 3300
                },
                {
                    value: 'Realizing no one else has asked these questsions...',
                    type: 'output',
                    wait: 800
                },
                {
                    value: 'Face palming...',
                    type: 'output',
                    wait: 750
                },
                {
                    value: 'Collaborating with others...',
                    type: 'output',
                    wait: 300
                },
                {
                    value: 'Provisioning new virtual machine in Azure...',
                    type: 'output',
                    wait: 300
                },
                {
                    value: 'Deploying application to the cloud...',
                    type: 'output',
                    wait: 300
                },
                {
                    value: 'Improving the lives of customers...',
                    type: 'output',
                    wait: 3300
                },
                {
                    value: 'Improved!',
                    type: 'output',
                    wait: 300
                }
            ],
            onExecute: function(cmdJS, thisCommand) {
                // cmdJS.newOutput("Initializing program...", function() {                   
                //     setTimeout(function() {
                //         cmdJS.newOutput("Please wait while I complete a few tasks...", function() {
                //             cmdJS.newOutput("Connecting to database...", function() {
                //                 cmdJS.newOutput("Building indexes...", function() {
                //                     cmdJS.newOutput("Architecting solutions...", function() {
                //                         cmdJS.newOutput("Balancing life...", function() {
                //                             cmdJS.newOutput("Going for a run...", function() {
                //                                 cmdJS.newOutput("Buildling mobile first UI..", function() {
                //                                     cmdJS.newOutput("Getting lost in VR...", function() {
                //                                       cmdJS.newOutput("Finding myself in VR...", function() {
                                                    
                //                                         })  
                //                                     })    
                //                                 })     
                //                             }) 
                //                         }) 
                //                     }) 
                //                 })    
                //             })
                //         })
                //     }, 1000)
                // });

                cmdJS.executeGuide();
            }
        },
        {
            name: "Bot",
            onExecute: function(cmdJS, thisCommand) {
                
                cmdJS.inputPath("urban dic");

                cmdJS.newOutput("Search for something... I'll tell you about it.", function() {

                    

                    var search = function(readStr) {
                        var req = $.ajax({
                            type: "POST",
                            url: 'http://localhost:3979/api/restmessages/post',
                            data: {
                                "type": "message",
                                "text": readStr,
                                "from": {
                                    "id": "default-user",
                                    "name": "User"
                                },
                                "timestamp": "2017-01-14T23:29:46.049Z",
                                "channelData": {
                                    "clientActivityId": "1484436569505.8640883124168792.0"
                                },
                                "id": "a48im7ck08l2ejnjc",
                                "channelId": "emulator",
                                "recipient": {
                                    "id": "a7njh703e95hm02jc"
                                },
                                "conversation": {
                                    "id": "hfm69ng0a4ld8ek4l"
                                },
                                "serviceUrl": "http://localhost:51418"
                            }
                        });

                        req.done(function(response) {
                                                        
                            cmdJS.newOutput(response.text, function() {

                                cmdJS.newInput("", function(readStr) {
                                    search(readStr);
                                });

                            });
                        });

                        req.fail(function(err) {
                            
                            cmdJS.newOutput("error", function() {

                                cmdJS.newInput("", function(readStr) {
                                    search(readStr);
                                });

                            });

                        });

                        req.always(function() {
                            
                        });
                    }

                    cmdJS.newInput("", function(readStr) {
                        search(readStr);
                    });
                });


            }
        }
    ]
}

ko.options.deferUpdates = true;

var cmdJS = new CommandJS(cmdConfig);




