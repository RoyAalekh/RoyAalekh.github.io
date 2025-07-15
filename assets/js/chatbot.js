document.addEventListener('DOMContentLoaded', () => {
  const chatbotBubble = document.getElementById('chatbot-bubble');
  const chatWindow = document.getElementById('chat-window');
  const closeChat = document.getElementById('close-chat');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  const chatMessages = document.getElementById('chat-messages');

  // Toggle chat window
  chatbotBubble.addEventListener('click', () => {
    chatWindow.classList.toggle('hidden');
  });

  closeChat.addEventListener('click', () => {
    chatWindow.classList.add('hidden');
  });

  // Handle sending messages
  chatSend.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  function sendMessage() {
    const message = chatInput.value.trim();
    if (message === '') return;

    appendMessage(message, 'user');
    chatInput.value = '';

    // Placeholder for bot response
    setTimeout(() => {
      appendMessage('This is a placeholder response.', 'bot');
    }, 1000);
  }

  function appendMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('flex', 'items-start', 'mb-4');

    if (sender === 'user') {
      messageElement.classList.add('justify-end');
      messageElement.innerHTML = `
        <div class="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
          <p class="text-sm">${message}</p>
        </div>
        <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center ml-3">
          <i class="fas fa-user text-white text-sm"></i>
        </div>
      `;
    } else {
      messageElement.innerHTML = `
        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
          <i class="fas fa-robot text-white text-sm"></i>
        </div>
        <div class="bg-gray-200 p-3 rounded-lg max-w-xs">
          <p class="text-sm text-gray-800">${message}</p>
        </div>
      `;
    }

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});
