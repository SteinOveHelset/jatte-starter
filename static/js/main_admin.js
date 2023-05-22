/**
 * Variables
 */

const chatRoom = document.querySelector('#room_uuid').textContent.replaceAll('"', '')

let chatSocket = null


/**
 * Elements
 */

let chatLogElement = document.querySelector('#chat_log')
let chatInputElement = document.querySelector('#chat_message_input')
let chatSubmitElement = document.querySelector('#chat_message_submit')


/**
 * Functions
 */

function scrollToBottom() {
    chatLogElement.scrollTop = chatLogElement.scrollHeight
}


function sendMessage() {
    chatSocket.send(JSON.stringify({
        'type': 'message',
        'message': chatInputElement.value,
        'name': document.querySelector('#user_name').textContent.replaceAll('"', ''),
        'agent': document.querySelector('#user_id').textContent.replaceAll('"', '')
    }))
    
    chatInputElement.value = ''
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
    console.log('onfocus')

    chatSocket.send(JSON.stringify({
        'type': 'update',
        'message': 'writing_active',
        'name': document.querySelector('#user_name').textContent.replaceAll('"', ''),
        'agent': document.querySelector('#user_id').textContent.replaceAll('"', '')
    }))
}


chatSubmitElement.onclick = function(e) {
    sendMessage()
}


/**
 * Web socket
 */

chatSocket = new WebSocket(`ws://${window.location.host}/ws/chat/${chatRoom}/`)

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data)

    console.log('onChatMessage', data, data.message)

    if (data.type == 'chat_message') {
        if (data.agent) {
            chatLogElement.innerHTML += `<div class="flex w-full mt-2 space-x-3 max-w-md ml-auto justify-end"><div><div class="bg-blue-600 text-white p-3 rounded-l-lg rounded-br-lg"><p class="text-sm">${data.message}</p></div><span class="text-xs text-gray-500 leading-none">${data.created_at} ago</span></div><div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2">${data.initials}</div></div>`
        } else {
            chatLogElement.innerHTML += `<div class="flex w-full mt-2 space-x-3 max-w-md"><div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2">${data.initials}</div><div><div class="bg-gray-300 p-3 rounded-l-lg rounded-br-lg"><p class="text-sm">${data.message}</p></div><span class="text-xs text-gray-500 leading-none">${data.created_at} ago</span></div></div>`
        }
    } else if (data.type == 'writing_active') {
        if (!data.agent) {
            let tmpInfo = document.querySelector('.tmp-info')

            if (tmpInfo) {
                tmpInfo.remove()
            }

            chatLogElement.innerHTML += `<div class="tmp-info flex w-full mt-2 space-x-3 max-w-md"><div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2">${data.initials}</div><div><div class="bg-gray-300 p-3 rounded-l-lg rounded-br-lg"><p class="text-sm">${data.name} is writing a message...</p></div></div></div>`
        }
    }

    scrollToBottom()
}


chatSocket.onopen = function(e) {
    scrollToBottom()
}


chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
}