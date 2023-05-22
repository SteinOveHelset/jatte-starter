/**
 * Variables
 */

let chatName = ''
let chatRoomUuid = Math.random().toString(36).slice(2, 12);
let chatSocket = null
let chatWindowUrl = window.location.href


/**
 * Elements
 */

let chatElement = document.querySelector('#chat')
let chatOpenElement = document.querySelector('#chat_open')
let chatJoinElement = document.querySelector('#chat_join')
let chatIconElement = document.querySelector('#chat_icon')
let chatWelcomeElement = document.querySelector('#chat_welcome')
let chatRoomElement = document.querySelector('#chat_room')
let chatNameElement = document.querySelector('#chat_name')
let chatLogElement = document.querySelector('#chat_log')
let chatInputElement = document.querySelector('#chat_message_input')
let chatSubmitElement = document.querySelector('#chat_message_submit')


/**
 * Functions
 */

function getCookie(name) {
    var cookieValue = null

    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';')

        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim()

            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1))

                break
            }
        }
    }
    return cookieValue;
}


function scrollToBottom() {
    chatLogElement.scrollTop = chatLogElement.scrollHeight
}


function sendMessage() {
    chatSocket.send(JSON.stringify({
        'type': 'message',
        'message': chatInputElement.value,
        'name': chatName
    }));

    chatInputElement.value = '';
}


function onChatMessage(data) {
    console.log('onChatMessage', data, data.type)

    if (data.type == 'chat_message') {
        if (data.agent) {
            let tmpInfo = document.querySelector('.tmp-info')
            tmpInfo.remove()

            chatLogElement.innerHTML += `<div class="flex w-full mt-2 space-x-3 max-w-md ml-auto justify-end"><div><div class="bg-blue-600 text-white p-3 rounded-l-lg rounded-br-lg"><p class="text-sm">${data.message}</p></div><span class="text-xs text-gray-500 leading-none">${data.created_at} ago</span></div><div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2">${data.initials}</div></div>`
        } else {
            chatLogElement.innerHTML += `<div class="flex w-full mt-2 space-x-3 max-w-md"><div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2">${data.initials}</div><div><div class="bg-gray-300 p-3 rounded-l-lg rounded-br-lg"><p class="text-sm">${data.message}</p></div><span class="text-xs text-gray-500 leading-none">${data.created_at} ago</span></div></div>`
        }
    } else if (data.type == 'users_update') {
        chatLogElement.innerHTML += '<p class="mt-2">The admin/agent has joined the chat!</p>'
    } else if (data.type == 'writing_active') {
        if (data.agent) {
            let tmpInfo = document.querySelector('.tmp-info')

            if (tmpInfo) {
                tmpInfo.remove()
            }

            chatLogElement.innerHTML += `<div class="tmp-info flex w-full mt-2 space-x-3 max-w-md ml-auto justify-end"><div><div class="bg-blue-600 text-white p-3 rounded-l-lg rounded-br-lg"><p class="text-sm">${data.name} is writing a message...</p></div></div><div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2">${data.initials}</div></div>`
        }
    }

    scrollToBottom()
}


async function joinChatRoom() {
    chatName = chatNameElement.value
    chatWelcomeElement.classList.add('hidden')
    chatRoomElement.classList.remove('hidden')

    console.log('Join chat as:', chatName)
    console.log('Chat room:', chatRoomUuid)

    const data = new FormData()
    data.append('name', chatName)
    data.append('url', chatWindowUrl)
    
    await fetch(`/api/create-room/${chatRoomUuid}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: data
    })
    .then(function(res) { 
        return res.json(); 
    })
    .then(function(data) { 
        console.log(data)
    })

    chatSocket = new WebSocket(`ws://${window.location.host}/ws/chat/${chatRoomUuid}/`)

    chatSocket.onmessage = function(e) {
        onChatMessage(JSON.parse(e.data))
    };
    
    chatSocket.onclose = function(e) {
        console.error('Chat socket closed unexpectedly')
    };
}


/**
 * Event listeners
 */

chatInputElement.onkeyup = function(e) {
    if (e.keyCode === 13) {
        sendMessage()
    }
}


chatInputElement.onfocus = function(e) {
    chatSocket.send(JSON.stringify({
        'type': 'update',
        'message': 'writing_active',
        'name': chatName
    }))
}


chatSubmitElement.onclick = function(e) {
    sendMessage()
}


chatOpenElement.onclick = function(e) {
    e.preventDefault()

    chatIconElement.classList.add('hidden')
    chatWelcomeElement.classList.remove('hidden')

    return false
}


chatJoinElement.onclick = function(e) {
    e.preventDefault()

    joinChatRoom()

    return false
}