class Gpt4apiHack extends Chat {
    constructor(arg) {
        super(arg)
        this.conversation = ''
    }
    listen(message, _container) {

        container = _container
    }
    speak() {

        try {
            //console.log('gpt4-api-hack',currentInp.value) 

            currentInput = currentInp.value.trim()
            this.webView.send('send-input', currentInput)
            chatReply('')

        } catch (error) {
            let m = `gpt4-api-hack Error: ${error.message}`

            console.log(m)
        }
    }
    config() {
        return {
            name: 'Gpt4ApiHack',
            description: 'Gpt4ApiHack',
            url: "https://chat.openai.com/"
        }
    }
    onBeforeSendHeaders(arg) {
       try {
            // Send input data to the renderer process
            // console.log('chat-gpt4-api-hack-reply arg : ', arg);

            let obj = arg
            let message = obj.input ? obj.input.trim() : ''
            console.log('onBeforeSendHeaders currentInput : ', currentInput);
            if (message && message != currentInput) {
                console.log('chat-gpt4-api-hack ipcRenderer', message)
                if (message.indexOf(currentInput) != -1) {
                    console.log('chat-gpt4-api-hack ipcRenderer', message)

                    message = message.substring(message.indexOf(currentInput) + currentInput.length)
                }
                let index = message.indexOf('```')
                let code = ''
                if (index != -1) {

                    while (index != -1) {
                        let d = document.createElement('span')
                        d.innerHTML = '[code return]'
                        container.appendChild(d)
                        code = message.substring(index + 3, message.indexOf('```', index + 3))
                        message = message.substring(0, index) + message.substring(message.indexOf('```', index + 3) + 3)
                        index = message.indexOf('```')
                        d.innerHTML += '<div onclick=eval(this.innerHTML) style=background-color:#fff7;padding:1em>'+code+'</div>'
                        code= code.trim()
                        if (code.indexOf('javascript') == 0) {
                            code = code.substring(10)
                        } else if (code.indexOf('js') == 0 ) {
                            code = code.substring(2)
                        } else if (code.indexOf('html') == 0 || code.indexOf('<!DOCTYPE') == 0) {
                            code = '1==true'
                        }else if (code.indexOf('bash') == 0) {
                            ipcRenderer.send('bash', code.substring(4))
                            return
                        }else if (code.indexOf('#!/bin/bash') == 0) {
                            ipcRenderer.send('bash', code)
                            return
                        }
                        try {
                            console.log('chat-gpt4-api-hack-reply eval : ', code);
                            //eval('try{x=0/0;' + code + '}catch(e){console.log(e);alert(e.message); window.currentInput.value = e.message}')
                            eval(code)
                        } catch (e) {
                            console.log(e)
                            currentInp.value = e.message
                            setTimeout('chat()', 500);
                        }
                    }
                } else {
                    let d = document.createElement('span')
                    d.innerHTML = message
                    container.appendChild(d)
                    //event.sender.send('chat-gpt4-api-hack-reply', message);
                    console.log('chat-gpt4-api-hack-reply selVal(\'voices\').value : ', selVal('voices'));
                    ipcRenderer.send('tts', {
                        txt: message,
                        voice: selVal('voices')
                    })
                }

            }
        } catch (error) {
            console.log(error)
        }

    }
}
let currentInput
let container
//bash-reply
ipcRenderer.on('bash-reply', (event,arg)=>{
    // Send input data to the renderer process
    console.log('bash-reply', arg)
    currentInp.value = arg
    //chat()

})
ipcRenderer.on('chat-gpt4-api-hack-front', (event,arg)=>{
    // Send input data to the renderer process
    console.log('chat-gpt4-api-hack-main ipcRenderer', arg)
    ipcRenderer.send('chat-reply', arg);
    //document.body.innerHTML+=arg

}
);

function exec(command) {
    alert(command)
}

let gpt4apiHack = new Gpt4apiHack()
