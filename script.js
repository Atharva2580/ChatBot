document.addEventListener('DOMContentLoaded', function() {

    const ChatForm = document.getElementById('chat-form');
    const QuestionInput = document.getElementById('question-input');
    const submitButton = document.getElementById('submit-button');
    const chatMessages = document.getElementById('chat-messages');

    if (!ChatForm || !QuestionInput || !submitButton || !chatMessages) {
        console.error('One or more required DOM elements are missing.');
        return;
    }

    function addMessage(content, isUser = false, isError = false) {
        console.log('Adding message:', content, 'isUser:', isUser, 'isError:', isError);

        const messageDiv = document.createElement('div');

        if(isError) {
            messageDiv.className = 'error';
            messageDiv.textContent = content;
        }else{
            messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;
            messageDiv.textContent = content;
        }

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        console.log('Message added to chat');
    }

    function showLoading() {
        const LoadingDiv = document.createElement('div');
        LoadingDiv.className = 'loading';
        LoadingDiv.id = 'loadingMessage';
        LoadingDiv.textContent = 'Loading...';
        chatMessages.appendChild(LoadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function hideLoading() {
        const loadingMessage = document.getElementById('loadingMessage');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }

    function setFormEnabled(enabled){
        QuestionInput.disabled = !enabled;
        submitButton.disabled = !enabled;
        submitButton.textContent = enabled ? 'Send' : 'Sending...';
    }

    function clearWelcomeMessage() {
        const welcomeMessage = document.querySelector('.welcomeMessage');
        if (welcomeMessage) {
            welcomeMessage.style.display = 'none';
        }
    }

    async function sendQuestion(question) {
        try{
            console.log('Sending question:', question);
            setFormEnabled(false);
            showLoading();

            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question })
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            hideLoading();

            if(data.success) {
                console.log('Adding AI response:', data.message);
                addMessage(data.message, false);
            }else if(data.error) {
                console.log('Server error:', data.message);
                addMessage(data.message || 'Something went wrong.',false, true);
            }else{
                console.log('Unexpected response format:', data);
                addMessage('Unexpected response format.', false, true);
            }

        }catch(error) {
            hideLoading();
            console.error('Error sending question:', error);
            addMessage('Sorry, something went wrong. Please try again later.', false, true);
        } finally {
            setFormEnabled(true);
        }
    }

    ChatForm.addEventListener('submit', function(event){
        event.preventDefault();
        const question = QuestionInput.value.trim();

        if(!question) {
            addMessage('Please enter a question.', false, true);
            return;
        }

        clearWelcomeMessage();
        addMessage(question, true);
        QuestionInput.value = '';
        sendQuestion(question);
    });

    QuestionInput.focus();
});