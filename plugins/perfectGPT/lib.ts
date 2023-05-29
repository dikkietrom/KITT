 


function WAIT() {
}
async function fetchTextStream(cllr) {
    const content = []

    const response = await fetch(cllr.path);

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const reader = response.body.getReader();

    return new ReadableStream({
        start(controller) {
            function read() {
                reader.read().then(({done, value})=>{
                    if (done) {
                        cllr.PROCEED(content)
                        controller.close();
                        return;
                    }

                    controller.enqueue(value);
                    read();
                    content.push(value)
                }
                ).catch((error)=>{
                    controller.error(error);
                }
                );
            }

            read();
        },
        cancel() {
            reader.cancel();
        }
    });
}
 function traverse(code, enter, leave) {
    let ast = code.indexOf ? esprima.parse(code) : code

    let traverser = new Controller()

    traverser.traverse(ast, {
        enter: function(node, parent) {
            enter.call(node, traverser);
        },
        leave: function(node, parent) {
            leave.call(node, traverser);
        }
    });
}

class AstCallBack {

    call(node, traverser) {
        console.log(node)
        let fn = this['on' + node.type]
        if (fn) {
            fn(node, traverser)
        }
    }
}


function updateProp(propInst,prop,val,propTextBox){
    propInst[prop] = val//////exec flow
    propTextBox.value = propInst[prop]   
    propTextBox.title = propInst[prop]   
    if(propInst._update){
        propInst._update()
    }

}
function updateFlow(start,end){

    const prop = end.jsProperty        
    const propInst = end.jsInst        
    const method = start.jsMethod         
    const methodInst = start.jsInst   

    const propTextBox = end.textBox        

    updateProp(propInst,prop,methodInst[method](),propTextBox)

    if (propInst[prop] === WAIT) {
      start.jsInst.PROCEED = (data) => {
        const textChunk=[]
        data.forEach((d)=>{
            textChunk.push(new TextDecoder('utf-8').decode(d));
          
        })

        updateProp(propInst,prop,textChunk.join(''),propTextBox)

      }
    }
    propTextBox.setAttribute( 'readonly','readonly')    

}
function updateFlows(jsInst){
    startWire.wires.forEach((w)=>{
        if(w.start.jsInst===jsInst){
            updateFlow(w.start,w.end)  
        }
    })
}

function execFlow(elem1,elem2){
    const start  = elem1.jsMethod ? elem1 : elem2
    const end  = elem1.jsMethod ? elem2 : elem1

    startWire.wires.push( {start : start , end : end })
    updateFlow(start,end)

}

function storeCode(node) {
 
    
    let found = -1
    let i=0
    implAst.body.forEach((b)=>{
        if (b.id.name===node.id.name) {
            found=i
        }
        i++
    })
    if (found==-1) {
        implAst.body.push(node)
    } else{
        implAst.body[found] = node
    }
    let js = generate(implAst)
    storeImpl(js)
}
function storeImpl(data){

  const url = 'http://localhost:3000/store';  
  
   
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/text'
    },
    body: data
  };
  
  fetch(url, options)
    .then(response => response.text())
    .then(data => {
      // Handle the response data
      console.log(data);
    })
    .catch(error => {
      // Handle any errors
      console.error(error);
    });

}