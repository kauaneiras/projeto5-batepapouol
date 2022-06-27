//BARRA LATERAL COM OPÇÕES
function opentoolbar() {
    const toolbarshow = document.querySelector(".menu");
    toolbarshow.classList.remove("hidde");
  }
  function closetoolbar() {
    const toolbarshow = document.querySelector(".menu");
    toolbarshow.classList.add("hidde");
  }
//------------------------------------------------------------------------------------
//FORMATO NOME
let username
let connected = false
let namebox = {
    name: ""
}
let messagebox = {
    from: "",
    to: "",
    text: "",
}
//------------------------------------------------------------------------------------
//FAZER O LOGIN
function login(){
    const inputname = document.querySelector(".login input")
        if (inputname.value != "") {
            username = inputname.value;
            inputname.value = "";
            namebox.name = username;
            axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", namebox).then(toconnect).catch(connectERRO)
        }
}
// ABRIR TELA DE CARREGAMENTO POR 1 SEGUNDO, DEPOIS ABRIR O CHAT
function toconnect() {
    const loginClass = document.querySelector(".login")
    document.querySelector(".login .putyourname").remove()
    loginClass.innerHTML +=`
        <div class="loading">
            <img src="img/carregando.gif" alt="carregando">
            <h1>Entrando...</h1>
        </div>`
    setTimeout(() => {
    loginClass.classList.add("hidde")}, 1000)
    connected = true;
}
// CASO NÃO CONSIGA CONECTAR, APARECER A MENSAGEM DE ERRO
function connectERRO() {
    const ERROR = document.querySelector(".putyourname .hidde")
    ERROR.classList.remove("hidde")
    login()
}
//------------------------------------------------------------------------------------
// MANTER CONECTADO

setInterval(() => {
    keepconnected()
}, 5000)

function keepconnected() {
    if (connected == true) {
        namebox.name = username
        axios.post("https://mock-api.driven.com.br/api/v6/uol/status", namebox).then().catch(noconnected)
    }
}
// QUANDO PERDER A CONEXÃO
function noconnected() {
    location.reload()
}
//------------------------------------------------------------------------------------
// MENSAGENS
// PROCURAR MENSAGENS

function searchMessages() {
    let findmessages = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages")
    findmessages.then(putonscreen)
}

setInterval(() => {
    searchMessages()
}, 3000)
//-------------------------------------------------------------------------------------------------------------------------
// COLOCAR MENSAGENS NA TELA
let counter = 0
let loadmessages = true
let messageobjectbox = ""
let visibilitymessages = "message"
let receivedmessages = ""; // caixa onde vão ficar mensagens com o seu formato
function putonscreen(allmessages) {
    let messageslist = allmessages.data
    const messages = document.querySelector(".messages")
    if (loadmessages==false) {
        for (let i = (messageslist.length - 1); i; i--) {
            if (messageobjectbox == (messageslist[i].from + messageslist[i].text + messageslist[i].time)) {
                counter = i + 1;
                break;
            } else if (i == 0) {
                counter = i;
            }
        }
    }
    // formato mensagens
    for (let i = counter; i <= messageslist.length - 1; i++) {
        if (messageslist[i].type == "status") {
            messages.innerHTML +=`
            <div class="message status" data-identifier="message">
                <p><span class="hour">(${messageslist[i].time}) </span> <span class="username"><b> ${messageslist[i].from} </b></span>${messageslist[i].text}</p>
            </div>`
        } else if (messageslist[i].type == "message") {
            messages.innerHTML +=`
            <div class="message" data-identifier="message">
            <p><span class="hour">(${messageslist[i].time}) </span> <span class="username"><b>${messageslist[i].from}</b> </span> para <span class="username"> <b>${messageslist[i].to}</b>: </span> ${messageslist[i].text} </p>
            </div>`
        } else if (messageslist[i].type == "private_message" && (messageslist[i].to == username || messageslist[i].to == "Todos" || messageslist[i].from == username)) {
            messages.innerHTML +=`
            <div class="message private" data-identifier="message">
            <p><span class="hour"> (${messageslist[i].time}) </span> <span class="username"> <b>${messageslist[i].from} </b></span> reservadamente para <span class="username"> <b>${messageslist[i].to}</b>: </span> ${messageslist[i].text} </p>
            </div>`
        }
        messages.scrollIntoView({ block: "end", behavior: "smooth" })
    }
    loadmessages = false

    let lastmessage = messageslist.length - 1
    messageobjectbox = (messageslist[lastmessage].from + messageslist[lastmessage].text + messageslist[lastmessage].time)
}


let userselected = "Todos"

function sendmessage() {
    const valueInput = document.querySelector("footer input")
    valueInput.addEventListener('keydown', function (event) {
        if (event.keyCode == 13 && valueInput.value != "") {
            messagebox = {
                from: username,
                to: userselected,
                text: valueInput.value,
                type: visibilitymessages
            }
            valueInput.value = ""
            axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", messagebox).then(searchMessages).catch(noconnected)
        }
    })
    if (valueInput.value != "") {
        messagebox = {
            from: username,
            to: userselected,
            text: valueInput.value,
            type: visibilitymessages
        }
        valueInput.value = ""
        axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", messagebox).then(searchMessages).catch(noconnected)
    }
}
//CHECAR USUÁRIOS ONLINE A CADA 5 seg
function searchusers() {
    axios.get("https://mock-api.driven.com.br/api/v6/uol/participants").then(putusersontoolbar)
}

setInterval(() => {
    searchusers()
}, 5000);

// VER LISTA DE USUÁRIOS ONLINE
let userslist = []

function putusersontoolbar(users) {
    users = users.data
    const findusers = document.querySelector(".toolbar .users")
    const alluserson = [...findusers.querySelectorAll(".option")]
    let checkusersoff = putnewuserson(users, userslist)
    for (let i = 0; i < checkusersoff.length; i++) {
        for (let k = 0; k < alluserson.length; k++) {
            if (checkusersoff[i] == alluserson[k].id) {
                if (alluserson[k].querySelector(".selected"))
                    selecteduser("todos");
                alluserson[k].remove();
            }
        }
    }
    let usersonline = users.filter(filterusers)
    for (let i = 0; i < usersonline.length; ++i) {
        //colocar lista de usuários no menu lateral
        findusers.innerHTML +=`
                <div class="option" id="${usersonline[i].name}" data-identifier="participant">
                    <ion-icon name="person-circle" onclick="selecteduser(this)"></ion-icon>
                    <h1 onclick="selecteduser(this)">${usersonline[i].name}</h1>
                </div>`

    }
    userslist = users.slice()
}
function filterusers(users) {
    for (let i = 0; i < userslist.length; i++) {
        if (users.name == userslist[i].name)
            return false
    }
    return true
}
function putnewuserson(users, userslist) {
    let arrayUsers = []
    let arrayLog = []
    for (let i = 0; i < userslist.length; i++) {
        arrayUsers.push(userslist[i].name)
    }
    for (let i = 0; i < users.length; i++) {
        arrayLog.push(users[i].name)
    }
    let difference = arrayUsers.filter(x => !arrayLog.includes(x));
    return difference
}

//SELECIONAR USUÁRIO 

function selecteduser(element) {
    if (element == "todos") {
        document.querySelector(".users .todos").innerHTML +=`
        <div class="selected">
            <ion-icon name="checkmark-circle-outline"></ion-icon>
        </div>`

        document.querySelector("footer h1 span").innerHTML = "Todos"
        userselected = "Todos"
    }
    else {
        const findoption = element.parentNode
        const findusers = findoption.parentNode
        const username = findoption.querySelector("h1").innerHTML
        if (findusers.querySelector(".selected") != findoption && findusers.querySelector(".selected")) {
            findusers.querySelector(".selected").remove()
            findoption.innerHTML +=`
            <div class="selected">
                <ion-icon name="checkmark-circle-outline"></ion-icon>
            </div>`

        }
        document.querySelector("footer h1 span").innerHTML = username
        userselected = username
    }
}

login()
sendmessage()
searchMessages()
searchusers()