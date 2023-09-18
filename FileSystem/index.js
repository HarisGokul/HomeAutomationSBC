var config;
var templates;
var pins = {'0':false,'1':false,'2':false,'3':false,'4':false,'5':false,'A0':false,'A1':false,'A2':false,'A3':false}
var templateForm =  document.querySelector("#templateForm form")
var types = [];
var deviceName = document.querySelector("#deviceName");
var forms = document.querySelector("#forms");

for(let i in pins){
    let option = document.createElement('option');
    option.value = i;
    option.innerText = i;
    templateForm.querySelector("#pin").appendChild(option);
}

async function init(){
    await fetch('/config.json')
    .then( response => response.json())
    .then( json => config = json);
    
    await fetch('/templates.json')
    .then(response => response.json())
    .then(json => templates = json);
    
    for(let i in templates){
        types.push(i)
        let option = document.createElement('option');
        option.value = i;
        option.innerText = i;
        templateForm.querySelector("select#deviceType").appendChild(option);
    }
    deviceName.value=config["deviceID"];
    
    let devices = config.devices;
    for(let i in devices){
        add(devices[i].deviceType,devices[i].config.name,devices[i].pin)
    }


    document.querySelector("#addButton").disabled = false;
}

function add(type,name,pin){
    let form = templateForm.cloneNode(true);
    form.elements["deviceType"].value = type;
    form.elements["name"].value = name;
    form.elements["pin"].value = pin;
    pins[pin]=true;
    forms.appendChild(form);
}

function addEmpty(){
    let available = [];
    for(let i in pins){
        if(pins[i] != true) available.push(i);
    }
    if(available.length>0) add(types[0],"",available[0]);
    else return;
}

function getAvailable(select){
    for(let i of select.childNodes){
        i.hidden = pins[i.value]
    }
}

function unallocate(select){
    if(!select.__data_previous || select.__data_previous === select.value)
        return;
    pins[select.__data_previous]=false;
    pins[select.value]=true;
    select.__data_previous = select.value;
}

function remove(device){
    pins[device.elements.pin.value]=false;
    device.remove();
}

function submit(){
    let devices = {}
    for(let form of forms.querySelectorAll("form")){
        let name = form.elements.name.value;
        let deviceType = form.elements.deviceType.value;
        let pin = form.elements.pin.value;

        if(!name || !deviceType || !pin){
            alert("No Empty/Repeated Data Permitted!!");
            return;
        }
        
        let device = JSON.parse(JSON.stringify(templates[deviceType]));
        device.config.name = name;
        device.pin = pin;
        device.deviceType = deviceType;
        
        devices[name] = device;
    }


    let newConfig = JSON.stringify({
        "deviceID" : deviceName.value,
        "devices" : devices
    });

    fetch("/setConfig/"+newConfig);

}

init()
