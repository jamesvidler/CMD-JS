
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
