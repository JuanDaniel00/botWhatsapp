require('dotenv').config();

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const OpenAI = require('openai');  // Import the OpenAI SDK

// Initialize the OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY  // Use your API key from the environment variables
});

// Create an instance of WhatsApp Web
const client = new Client({
    authStrategy: new LocalAuth()
});

// Generate the QR code to scan
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Handle successful connection
client.on('ready', () => {
    console.log('Cliente de WhatsApp conectado');
});

// Set to track chats that have already received the initial response
const repliedChats = new Set();

// Handle incoming messages
client.on('message_create', async message => {
    // Obtener el chat del mensaje
    const chat = await message.getChat();

    const excludedContacts = ['Mami']

    // Verificar si el chat es un contacto excluido
    if (excludedContacts.includes(chat.name)) {
        console.log(`Mensaje recibido de "${chat.name}", no se responderá.`);
        return;
    }

    // Verificar si el chat es un grupo
    if (chat.isGroup) {
        // Verificar si el grupo está archivado
        if (chat.archived) {
            console.log('Mensaje recibido en un grupo archivado, no se responderá.');
            return;
        }

        // Verificar si el grupo es el específico que deseas excluir
        const excludedGroupName = 'ADSO 2711689'; // Cambia esto por el nombre del grupo que deseas excluir

        if (chat.name === excludedGroupName) {
            console.log(`Mensaje recibido en el grupo "${excludedGroupName}", no se responderá.`);
            return;
        }
    }

    // Verificar si el mensaje es el primero de la conversación
    if (!message.fromMe && !repliedChats.has(chat.id._serialized)) {
        // Marcar el chat como respondido
        repliedChats.add(chat.id._serialized);

        // Introducir un delay antes de responder al mensaje recibido
        await new Promise(resolve => setTimeout(resolve, 2000)); // Delay de 2 segundos
        await message.reply('Recibí tu mensaje. Te responderan en breve. att: Chatbot de Juancho, (Este mensaje es automático, si es importante llame.)');
    }

    // Verificar si el mensaje no es del cliente
    if (message.fromMe) {
        return;
    }



});

client.initialize();