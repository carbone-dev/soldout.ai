import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval

function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData(form)

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

    // to clear the textarea input 
    form.reset()

    // bot's chatstripe
    const uniqueId1 = generateUniqueId()
    const uniqueId2 = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId1)
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId2)

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv1 = document.getElementById(uniqueId1)
    const messageDiv2 = document.getElementById(uniqueId2)

    const response = await fetch('http://localhost:5000', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt'),
            n: 2 //add this to indicate that you want 2 responses
        })
    })

    clearInterval(loadInterval)
    messageDiv1.innerHTML = " "
    messageDiv2.innerHTML = " "

    if (response.ok) {
      const data = await response.json();
      for(let i=0; i<data.bot.length; i++) {
          const parsedData = data.bot[i].trim() // trims any trailing spaces/'\n' 
          if(i === 0) {
              typeText(messageDiv1, parsedData)
          } else {
              typeText(messageDiv2, parsedData)
          }
      }
  } else {
      const err = await response.text()

      messageDiv1.innerHTML = "Something went wrong"
      messageDiv2.innerHTML = "Something went wrong"
      alert(err)
  }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})